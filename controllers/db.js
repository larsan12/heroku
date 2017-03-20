"use strict"

class Node {
	constructor(value, db) {
		this.value = value;
		this.branches = [];

		db.array.push(this);
		this.id = "0";
		this.numberOfChildren = 0;
	}

	addBranch(node) {
		this.branches.push(node);
		node.parent = this.id;
		// преобразуем id к виду 00 00 00 где каждая пара цифр обозначает занимаемое место в i-й по глубине ветке

		if ((this.numberOfChildren + "").length == 1)
			node.id = this.id + "0" + (++this.numberOfChildren);
		else
			node.id = this.id + "" + (++this.numberOfChildren);
	}
}

class Db {
	constructor() {
		this.array = [];
		this.parentNode = new Node("Root", this);
	}

	applyChanges(cash) {
		var arrayCashCopy = JSON.parse(JSON.stringify(cash.array)); 

		cash.array.forEach(n => n.locked = true);
		cash.addNodes(this.array);
		cash.array.map(n => {
			n.parent = n._parent || n.parent;
		});

		cash.array.filter(n => n.deleted).forEach(n =>  {
			cash.recursionDelete(n.id)
		});
		//delete
		//cash.array = cash.array.filter(n => !n.deleted);

		cash.array.map(n => {
			n._parent = n._parent || n.parent;
			delete n.created;
			delete n.renamed;
			return n;
		});

		//удаляем в кэше необходимые элементы
		cash.array.filter(n => n.deleted).forEach(n => {
			var node = arrayCashCopy.find(node => node.id == n.id);
			if (node && !node.deleted) {
				node.deleted = true;
			}
		})

		cash.checkDependencies();
		cash.sortNodes();
		
		if (cash.nodes.length > 1) {
			console.log(JSON.stringify(cash.nodes));
			throw new Error("some troubles");

		} else {
			var arrayCopy = JSON.parse(JSON.stringify(cash.array));
			var nodesCopy = JSON.parse(JSON.stringify(cash.nodes));
			if (nodesCopy[0])
				this.parentNode = nodesCopy[0];
			else 
				this.parentNode = new Node("ROOT", this);

			arrayCopy.forEach(n => delete n._parent);
			this.array = arrayCopy;
			cash.array = arrayCashCopy;
			cash.checkDependencies();
			cash.sortNodes();
		}

		//TODO save object's relations in db
		/*
		//create
		cash.array.filter(n => n.created).forEach(node => {
			var newNode = new Node(node.value, this);

		})
		//rename
		*/

	}
}

module.exports = {
	Node: Node,
	Db: Db
}