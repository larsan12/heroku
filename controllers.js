"use strict"
var randomID = require("random-id");

var sessions = {};

//элем
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

class Cash {
	constructor() {
		this.nodes = [];
	}

	checkDependencies() {
		//TODO
	}

	addNodes(nodes) {
		nodes.forEach(node => {
			if (!this.nodes.find(n => n.id == node.id))
				this.nodes.push(node);
			this.nodes.sort(function(a, b) {
				var aId = a.id;
				var bId= b.id;
				var maxLength = Math.max(aId.length, bId.length);
				aId = aId + "0".repeat(maxLength - aId.length);
				bId = bId + "0".repeat(maxLength - bId.length);
				return parseInt(aId) - parseInt(bId);

			})
		});
	}
}

class Db {
	constructor() {
		this.array = [];
		this.deepestLevel = 0;
		this.parentNode = new Node("Root", this);
	}
}

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
		
	};

	deleteNode(req, res) {
		
	};

	renameNode(req, res) {
		
	};

	apply(req, res) {
		
	};

	reset(req, res) {
		
	};
}


function getSession(req, res) {
	// TODO fire session
	var session = new Session();
	sessions[session.id]=session;
	var copyArray = session.db.array.map(node => {
		var copyNode = Object.assign({}, node);
		delete copyNode.branches;
		copyNode._parent = copyNode.parent;
		delete copyNode.parent;
		return copyNode;
	});
	res.json({
		id: session.id,
		tree: session.db.parentNode,
		array: copyArray
	});
}


function move(req, res) {
	var session = sessions[req.body.session];
	session.move(req, res);
}

function addNode(req, res) {
	var session = sessions[req.session];
	session.addNode(req, res);
}

function deleteNode(req, res) {
	var session = sessions[req.session];
	session.deleteNode(req, res);
}

function renameNode(req, res) {
	var session = sessions[req.session];
	session.renameNode(req, res);
}

function apply(req, res) {
	var session = sessions[req.session];
	session.apply(req, res);
}

function reset(req, res) {
	var session = sessions[req.session];
	session.reset(req, res);
}

module.exports = {
	getSession: getSession,
	move: move,
	add: addNode,
	delete: deleteNode,
	rename: renameNode,
	apply: apply,
	reset: reset
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