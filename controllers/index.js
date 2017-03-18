"use strict"

var sessions = {};
var timer = {};
var Session = require("./session");

function addTimer(id) {
	// 15 минут сессия
	timer[id] = setTimeout(function() {
		delete sessions[id];
	}, 1000*60*15)
}

function refreshTimer(id) {
	clearTimeout(timer[id]);
	timer[id] = setTimeout(function() {
		delete sessions[id];
	}, 1000*60*15)
}

function reset(req, res) {
	delete sessions[req.body.session];
	var session = new Session();
	sessions[session.id]=session;
	addTimer(session.id);
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

function getSession(req, res) {
	// TODO fire session
	var session = new Session();
	sessions[session.id]=session;
	addTimer(session.id);
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
	var session = sessions[req.body.session];
	session.addNode(req, res);
}

function deleteNode(req, res) {
	var session = sessions[req.body.session];
	session.deleteNode(req, res);
}

function renameNode(req, res) {
	var session = sessions[req.body.session];
	session.renameNode(req, res);
}

function applyChanges(req, res) {
	var session = sessions[req.body.session];
	session.applyChanges(req, res);
}

module.exports = {
	getSession: getSession,
	move: move,
	add: addNode,
	delete: deleteNode,
	rename: renameNode,
	apply: applyChanges,
	reset: reset,
	refreshTimer: refreshTimer
}
