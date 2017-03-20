"use strict"

var randomID = require("random-id");
var Db = require("./db").Db;
var Node = require("./db").Node;
var Cash = require("./cash");

class Session {
	constructor() {
		this.id = randomID(20,"a");
		this.db = new Db();
		this.cash = new Cash();
		defaultTree(this.db.parentNode, this.db);
	}

	move(req, res) {
		if (req.body.node) {
			this.db.move(req.body.node, this.cash);
		};
		res.json({nodesCash:this.cash.nodes});
	};

	addNode(req, res) {
		var parent = req.body.parent;
		var value = req.body.value;
		var node = this.cash.createNode(value, parent);
		res.json({node: node});
	};

	deleteNode(req, res) {
		this.cash.deleteNode(req.body.id);
		res.json({nodesCash:this.cash.nodes});
	};

	renameNode(req, res) {
		var value = req.body.value;
		var id = req.body.id;

		var n = this.cash.getNode(id);
		n.renamed = true;
		n.value = value;
		res.status(200).send({});
	};

	applyChanges(req, res) {
		this.db.applyChanges(this.cash);
		var copyArray = this.db.array.map(node => {
			var copyNode = Object.assign({}, node);
			delete copyNode.branches;
			copyNode._parent = copyNode.parent;
			delete copyNode.parent;
			return copyNode;
		});
		res.json({
			id: this.id,
			tree: this.db.parentNode,
			array: copyArray,
			nodesCash: this.cash.nodes
		});
	};
}


function defaultTree(parent, db) {
	var n1 = new Node("node1", db);
	var n2 = new Node("node2", db);
	var n3 = new Node("node3", db);
	var n4 = new Node("node4", db);
	var n5 = new Node("node5", db);
	var n6 = new Node("node6", db);
	var n7 = new Node("node7", db);
	var n8 = new Node("node8", db);
	var n9 = new Node("node9", db);
	var n10 = new Node("node10", db);
	var n11 = new Node("node11", db);
	var n12 = new Node("node12", db);
	var n13 = new Node("node13", db);
	var n14 = new Node("node14", db);
	var n15 = new Node("node15", db);
	var n16 = new Node("node16", db);
	var n17 = new Node("node17", db);
	var n18 = new Node("node18", db);
	var n19 = new Node("node19", db);
	parent.addBranch(n1);
	parent.addBranch(n2);
	parent.addBranch(n3);
	parent.addBranch(n4);
	n2.addBranch(n5);
	n3.addBranch(n6);
	n3.addBranch(n7);
	n3.addBranch(n8);
	n7.addBranch(n9);
	n7.addBranch(n10);
	n7.addBranch(n11);
	n11.addBranch(n12);
	n11.addBranch(n13);
	n4.addBranch(n14);
	n4.addBranch(n15);
	n4.addBranch(n16);
	n15.addBranch(n17);
	n15.addBranch(n18);
	n15.addBranch(n19);
}

/*
function testDbIterator() {
	var session = new Session();
	var iterator = session.db.iterator();
	var nextNode;
	do {
		nextNode = iterator.next();
		var copy = Object.assign({}, nextNode);
		delete copy.parent;
		delete copy.branches;
		console.log(copy);
	} while (nextNode.value != "node11")
	
	var iterator2 = session.db.iterator();
	var nextNode2;
	do {
		nextNode2 = iterator2.next();
		var copy = Object.assign({}, nextNode2);
		delete copy.parent;
		delete copy.branches;
		console.log(copy);
	} while (nextNode2)
}

testDbIterator();


function testDbIteratorForAllChilds() {
	var session = new Session();
	var iterator = session.db.iteratorForAllChilds(session.db.getNodeByValue("node7"));
	var nextNode;
	do {
		nextNode = iterator.next();
		var copy = Object.assign({}, nextNode);
		delete copy.parent;
		delete copy.branches;
		console.log(copy);
	} while (nextNode)
}

testDbIteratorForAllChilds();


function testDbSortId() {
	var session = new Session();
	var node7 = session.db.getNodeByValue("node7");
	var node9 = session.db.getNodeByValue("node9");
	var node10 = session.db.getNodeByValue("node10");
	var node8 = session.db.getNodeByValue("node8");

	session.db.move(node8.id, session.cash);
	session.db.move(node10.id, session.cash);
	session.db.move(node9.id, session.cash);
	session.db.move(node7.id, session.cash);

	console.log(node7.sortId);
	console.log(node9.sortId);
	console.log(node10.sortId);
	console.log(node8.sortId);
}

testDbSortId();
*/
module.exports = Session;