"use strict"
var randomID = require("random-id");

/**
		Object specification:
		Node in db.array {
			value: string
			index: number, порядковый номер в ветке родителя
			numberOfChildren: number, колличество потомков
			branches: array of Obj, потомки
			parent: Obj, родитель
			id: string, вспомогательный уникальный в пределах БД id
			locked: true - если элемент находится в кэше
			sortId: number - для сортировки в условиях неопределённых связей
		}
**/


// обязательное условие - все объекты Node должны быть вложены через addBranch
class Node {
	constructor(value, db) {
		this.value = value;
		this.branches = [];

		db.array.push(this);
		this.index = 0;
		this.numberOfChildren = 0;
		//TODO уникальный id ораничивает размер ДБ до максимального значения number, можно заменить на random
		this.id = ++db.quantityNodes;
		//this.id = randomID(20,"aA0");
	}

	addBranch(node) {
		this.branches.push(node);
		node.parent = this;
		//index - порядковый номер в ветке родителя, для сортировки
		node.index = ++this.numberOfChildren;
	}

	getChild(index) {
		return this.branches.find(node => node.index == index);
	}

	nextChild(index) {
		return this.getChild(++index);
	}
}


class Db {
	constructor() {
		this.quantityNodes = 0;
		this.array = [];
		this.parentNode = new Node("Root", this);
		//node's отправленные в кэш
		this.cashNodes = new Set();
	}

	applyChanges(cash) {
	
	}

	getNode(id) {
		return this.array.find(node => node.id == id); 
	}

	//только для тестов
	getNodeByValue(value) {
		return this.array.find(node => node.value == value);
	}

	//проходит всю базу данных построчно т.е. в том порядке, в котором она будет отображаться
	iterator() {
		return new (function (db) {

			this.current;
			
			this.next = function() {
				if (!this.current) {
					this.current = db.parentNode;
					return this.current;
				}

				if (this.current.branches.length) {
					this.current = this.current.branches[0];
					return this.current;
				} else {
					var wanted;
					do {
						wanted = this.current.parent.nextChild(this.current.index);
						if (this.current.parent == db.parentNode && !wanted) return;
						this.current = this.current.parent;
					} while (!wanted)
					this.current = wanted;
					return wanted;
				}
			}

		})(this);
	}

	getCopyOfNode(node) {
		return {
			id: node.id,
			value: node.value,
			parent: node.parent ? node.parent.id : undefined,
			index: node.index,
			numberOfChildren: node.numberOfChildren,
			sortId: node.sortId
		}
	}

	getCopyArray() {
		var arr = [];
		this.array.forEach(node => arr.push(this.getCopyOfNode(node)));
		return arr;
	}

	getCopyTree() {
		//delete circular structure
		this.array.forEach(n => n.parent ? n.parent = n.parent.id : null);
		var treeCopy = JSON.parse(JSON.stringify(this.parentNode));
		this.recursionSetParent(this.parentNode);
		return treeCopy;
	}

	recursionSetParent(node){
		if (node.branches.length){
			node.branches.forEach(n => {
				n.parent = node;
				this.recursionSetParent(n);
			})
		}
	}

	move(id, cash) {
		var node = this.getNode(id);
		if (!node) return;
		var copy = this.getCopyOfNode(node);
		node.locked = true;
		cash.addNode(copy);
	}

	/*
		новый метод назначает абсолюто всем узлам порядковый номер, а не только перемещаемым
		ограничивает размер БД до 2^53 узлов
	*/
	setSortId() {
		var iterator = this.iterator();
		var iteratorNode;
		var sortId = 0;
		do {
			iteratorNode = iterator.next();
			if (iteratorNode)
				iteratorNode.sortId = ++sortId;
		} while (iteratorNode)
	}

/*
	/** Назначает полям id для сортировки так, чтобы кэш отображался максимально похоже с БД
		id узла будет назначаться из диапазона от 0 до 2^53 = 9007199254740992, так чтобы 
		расстояние до ее соседей или до границ диапазона было одинаковым, таким образом 
		гарантируемое число элементов в кэше без коллизий в сортировке - 53, 
		вероятное же колличество элементов без коллизий на порядок больше
	*

	setSortId(id) {
		var node = this.getNode(id);
		if (this.cashNodes.has(node) && !node)
			return;
		var iterator = this.iterator();
		var found = false;
		var prevNode;
		var nextNode;
		var iteratorNode;
		do {
			iteratorNode = iterator.next();
			if (iteratorNode == node) found = true;
			if (this.cashNodes.has(iteratorNode)){
				if (found) 
					nextNode = iteratorNode;
				else 
					prevNode = iteratorNode;
			}
		} while (iteratorNode && !nextNode)

		if (prevNode && nextNode){
			node.sortId = parseInt((nextNode.sortId - prevNode.sortId)/2) + prevNode.sortId;
		} else if (!prevNode && !nextNode){
			node.sortId = Math.pow(2, 52)
		} else if (!prevNode) {
			node.sortId = parseInt(nextNode.sortId/2)
		} else {
			node.sortId = parseInt((Math.pow(2,53)-prevNode.sortId)/2) + prevNode.sortId;
		}

		this.cashNodes.add(node);

		return node;
	}
*/
	applyChanges(cash) {
		cash.nodes.forEach(n => this.recursionCheckChanges(n));
		this.recursionDelete(this.parentNode);
		cash.nodes.forEach(n => this.recursionCheckDeletedInCash(n));
	}

	recursionCheckChanges(node) {
		if (node.created) {
			var parent = this.getNode(node.parent);
			var newNode = new Node(node.value, this);
			parent.addBranch(newNode);
			node.id = newNode.id;
			node.index = newNode.index;
			newNode.locked = true;
			node.branches.forEach(n => n.parent = node.id);
			delete node.created;
		}

		if (node.renamed) {
			this.getNode(node.id).value = node.value;
			delete node.renamed;
		}

		if (node.deleted) {
			this.getNode(node.id).deleted = true;
		}

		node.branches.forEach(n => this.recursionCheckChanges(n));
	}

	//на тот случай, если в БД удаляться новые элементы иерархии
	recursionCheckDeletedInCash(node) {
		var dbNode = this.getNode(node.id);
		if (dbNode.deleted && !node.deleted) node.deleted = true;
		node.branches.forEach(n => this.recursionCheckDeletedInCash(n));
	}

	recursionDelete(node, deleted) {
		node.branches.forEach(n => {
			if (deleted || node.deleted) n.deleted = true;
			this.recursionDelete(n, deleted || n.deleted)
		})
	}
}

module.exports = {
	Node: Node,
	Db: Db
}