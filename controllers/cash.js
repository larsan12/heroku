"use strict"

class Cash {
	constructor() {
		this.array = [];
		this.nodes = []
	}

	getNode(id) {
		return this.array.find(n => n.id == id);
	}

	deleteNode(id) {
		this.recursionDelete(id);
		this.checkDependencies();
		this.sortNodes();
	}

	recursionDelete(id) {
		this.array.find(n => n.id == id).deleted = true;
		this.array.filter(n => n.parent == id).forEach(n => this.recursionDelete(n.id));
	}

	checkDependencies() {
		this.nodes = JSON.parse(JSON.stringify(this.array));
		var idsToDelete = [];

		this.nodes.sort(function(a, b) {
			var aId = a.id;
			var bId= b.id;
			return parseInt(bId) - parseInt(aId);
		});

		for (var i = 0; i < this.nodes.length; i++) {
			for (var j = i + 1; j < this.nodes.length; j++) {
				if (this.nodes[i]._parent == this.nodes[j].id) {
					this.nodes[i].parent = this.nodes[i]._parent;
					if (!this.nodes[j].branches)
						this.nodes[j].branches = [];
					if (this.nodes[j].deleted && !this.nodes[i].deleted) 
						idsToDelete.push(this.nodes[i].id)
					this.nodes[j].branches.unshift(this.nodes[i]);
					delete this.nodes[i];
					break;
				}
			}
		}

		//TODO

		if (idsToDelete.length) {
			idsToDelete.forEach(id => this.recursionDelete(id))
			this.checkDependencies();
		}

		this.nodes = this.nodes.filter(n => n);	
	};

	addNodes(nodes) {
		nodes.forEach(node => {
			if (!this.array.find(n => n.id == node.id)) {
				if (node.branches) delete node.branches;
				this.array.push(node);
			}
		});
		
		this.checkDependencies();
		this.sortNodes();
	};

	sortNodes() {
		this.nodes.sort(function(a, b) {
			var aId = a.id;
			var bId= b.id;
			var maxLength = Math.max(aId.length, bId.length);
			aId = aId + "0".repeat(maxLength - aId.length);
			bId = bId + "0".repeat(maxLength - bId.length);
			return parseInt(aId) - parseInt(bId);
		})
	}

	//TODO рассинхрон если одновременно работают несколько пользователей

	createNode(value, parent) {
		var node = {};
		node.parent = node._parent = parent;
		node.value = value;
		node.created = true;
		var parentNode = this.array.find(n => n.id == parent);
		parentNode.numberOfChildren = parseInt(parentNode.numberOfChildren);
		if ((parentNode.numberOfChildren + "").length == 1)
			node.id = parentNode.id + "0" + (++parentNode.numberOfChildren);
		else
			node.id = parentNode.id + "" + (++parentNode.numberOfChildren);
		node.numberOfChildren = 0;
		this.array.push(node);
		return node;
	}
}


module.exports = Cash;