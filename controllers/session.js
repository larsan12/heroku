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
		if (req.body.nodes && req.body.nodes.length) {
			this.cash.addNodes(req.body.nodes);
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
			array: copyArray
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

module.exports = Session;