"use strict"
var randomID = require("random-id");

var sessions = [];

//элем
class Node {
	constructor(value) {
		this.value = value;
		this.branches = [];
		this.id = randomID(10,"0");
	}

	addBranch(node) {
		this.branches.push(node);
		node.parent = this.id;
	}
}

class Cash {
	constructor() {
		this.nodes = [];
	}

	checkDependencies() {
		//TODO
	}
}

class Db {
	constructor(){
		this.parentNode = new Node("Root");
		defaultTree(this.parentNode);
		this.cash = new Cash();
	}
}

function Session() {
	this.id = randomID(20,"a");
	this.db = new Db();
	this.cash = this.db.cash;
}


function getSession(req, res) {
	// TODO check session
	var session = new Session();
	sessions.push(session);
	res.json({
		id: session.id,
		tree: session.db.parentNode
	});
	/*res.send(JSON.stringify({
		id: session.id,
		tree: session.db.parentNode
	}));
	*/
}



module.exports = {
	getSession: getSession
}





function defaultTree(parent) {
	var n1 = new Node("node1");
	var n2 = new Node("node2");
	var n3 = new Node("node3");
	var n4 = new Node("node4");
	var n5 = new Node("node5");
	var n6 = new Node("node6");
	var n7 = new Node("node7");
	var n8 = new Node("node8");
	var n9 = new Node("node9");
	var n10 = new Node("node10");
	var n11 = new Node("node11");
	var n12 = new Node("node12");
	var n13 = new Node("node13");
	var n14 = new Node("node14");
	var n15 = new Node("node15");
	var n16 = new Node("node16");
	var n17 = new Node("node17");
	var n18 = new Node("node18");
	var n19 = new Node("node19");
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