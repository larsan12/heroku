"use strict"
var randomID = require("random-id");

/**
		Object specification:
		Node in db.array {
			value: string
			index: number, порядковый номер в ветке родителя
			level: number, уровень вложенности
			numberOfChildren: number, колличество потомков
			branches: array of Obj, потомки
			parent: Obj, родитель
			id: string, вспомогательный уникальный в пределах БД id
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
		this.level = 0;
		//TODO уникальный id ораничивает размер ДБ до максимального значения number, можно заменить на random
		this.id = ++db.quantityNodes;
		//this.id = randomID(20,"aA0");
	}

	addBranch(node) {
		this.branches.push(node);
		node.parent = this;
		node.level = this.level + 1;
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

	//возвращяет всю иерархию текущего узла, включая сам узел
	iteratorForAllChilds(seniorNode) {
		return new (function (db, seniorNode) {
			this.seniorNode = seniorNode;
			this.current;
			
			this.next = function() {
				if (!this.current) {
					this.current = this.seniorNode;
					return this.current;
				}

				if (this.current.branches.length) {
					this.current = this.current.branches[0];
					return this.current;
				} else {
					var wanted;
					do {
						wanted = this.current.parent.nextChild(this.current.index);
						if (this.current.parent == this.seniorNode && !wanted) return;
						this.current = this.current.parent;
					} while (!wanted)
					this.current = wanted;
					return wanted;
				}
			}

		})(this, seniorNode);
	}

	move(id, cash) {
		var node = this.setSortId(id);
		var copy = {
			id: node.id,
			value: node.value,
			parent: node.parent ? node.parent.id : undefined,
			index: node.index,
			level: node.level,
			numberOfChildren: node.numberOfChildren,
			sortId: node.sortId
		}

		cash.addNode(copy);
	}

	/** Назначает полям id для сортировки так, чтобы кэш отображался максимально похоже с БД
		id узла будет назначаться из диапазона от 0 до 2^53 = 9007199254740992, так чтобы 
		расстояние до ее соседей или до границ диапазона было одинаковым, таким образом 
		гарантируемое число элементов в кэше без коллизий в сортировке - 53, 
		вероятное же колличество элементов без коллизий на порядок больше
	**/

	setSortId(id) {
		var node = this.getNode(id);

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

		} while (iteratorNode || !nextNode)

		if (prevNode && nextNode){
			node.sortId = parseInt((nextNode - prevNode)/2) + prevNode.sortId;
		}
		else if (!prevNode && !nextNode){
			node.sortId = Math.pow(2, 52)
		} else if (!prevNode) {
			node.sortId = parseInt(nextNode/2)
		} else {
			node.sortId = parseInt((Math.pow(2,53)-prevNode.sortId)/2) + prevNode.sortId;
		}

		this.cashNodes.add(node);

		return node;
	}
}

module.exports = {
	Node: Node,
	Db: Db
}