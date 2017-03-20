"use strict"
var randomID = require("random-id");
/**
		Object specification:
		Node in cash.array {
			value: string
			index: number, порядковый номер в ветке родителя
			branches: array of Obj, потомки
			parent: parent.id, id родителя
			id: string, вспомогательный уникальный в пределах БД id
			connection: true, присутствует ли родитель в кэше
			deleted: true, если удален
			created: true, если создан
			renamed: true, если переименован
		}
**/


class Cash {
	constructor() {
		//список всех объектов
		this.array = [];
		// список объектов первого столбца (для которых нет родителя)
		this.nodes = []
	}

	getNode(id) {
		return this.array.find(n => n.id == id);
	}

	checkDependencies(node) {
		if (this.array.find(n => n.id == node.id)) return;
		node.branches = [];
		this.array.forEach(n => {
			if (n.parent == node.id){
				node.branches.push(n);
				this.sortBranches(node);
				n.connection = true;
			};
			if (node.parent == n.id) {
				n.branches.push(node);
				this.sortBranches(n);
				node.connection = true;
			} 
		});
		this.array.push(node);
		this.nodes = this.array.filter(n => !n.connection);
		this.nodes.forEach(n => this.recursionDelete(n));
		this.sortNodes();

	}

	sortBranches(node) {
		node.branches.sort(function(a, b) {
			return a.index - b.index;
		})
	}

	sortNodes() {
		this.nodes.sort(function(a, b) {
			return a.sortId - b.sortId;
		})
	}

	addNode(node) {
		this.checkDependencies(node);
	};

	deleteNode(id) {
		var node = this.getNode(id)
		node.deleted = true;
		this.recursionDelete(node, true);
	}

	recursionDelete(node, deleted) {
		node.branches.forEach(n => {
			if (deleted || node.deleted) n.deleted = true;
			this.recursionDelete(n, deleted || n.deleted)
		})
	}

	createNode(value, parent) {
		var nodeParent = this.getNode(parent);
		var node = {
			value: value,
			branches: [],
			index: ++nodeParent.numberOfChildren,
			parent: parent,
			id: randomID(20,"aA0"),
			numberOfChildren: 0,
			created: true
		};
		this.addNode(node);
		return node;
	}
}


module.exports = Cash;