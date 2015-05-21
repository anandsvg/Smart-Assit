define([
	'app'
], function(app) {
	app.register.factory('Items', function() {
		var mainItems = [];

		function setItems(items) {
			mainItems = items;
		}

		function findItem(parent, conds) {
			var i;

			_.each(parent.items, function(item, key) {
				isValid = false;
				_.each(conds, function(v, k) {
					if (item[k] == v) {
						isValid = true;
					}
				});
				if (isValid) {
					i = [parent, key];
				} else if (item.items && item.items.length > 0) {
					var x = findItem(item, conds);
					if (x) {
						i = x;
					}
				}
			});

			return i || false;
		};

		function findItems(parent, conds) {
			var i = [];

			_.each(parent.items, function(item, key) {
				var valid = true;
				_.each(conds, function(v, k) {
					if (item[k] != v) {
						valid = false;
					}
				});
				if (valid) {
					i.push([parent, key]);
				}

				is = findItems(item, conds);
				_.each(is, function(s) {
					i.push(s);
				});
			});

			return i;
		};

		function getItem(id) {
			var found = findItem(mainItems, {
				id: id
			});
			if (found) {
				return found[0].items[found[1]];
			} else {
				return false;
			}
		};

		function getActions() {
			var actions = findItems(mainItems, {
				type: 'action'
			});

			return actions;
		};

		function findParent(id) {
			var i;
			parent = mainItems;

			_.each(parent.items, function(item, key) {
				if (item.id == id) {
					i = parent;
				} else if (item.items.length > 0) {
					var x = findItem(item, {
						id: id
					});
					if (x) {
						i = x;
					}
				}
			});

			return i || false;
		};

		function getAll() {
			return mainItems;
		};

		function removeItem(parentId, id) {
			var parent = getItem(parentId),
				found = findItem(parent, {
					id: id
				});
			if (parent && found) {
				// LOOK FOR ANY COPY ID
				if (!parent.items[found[1]].copyId) { // Is not a copy
					var copies = findItems(mainItems, {
						copyId: id
					});
					_.each(copies, function(pp) {
						pp[0].items.splice(pp[1], 1);
					});
				}

				parent.items.splice(found[1], 1);

				return true;
			} else {
				console.log('not found');
				return false;
			}
		};

		return {
			setItems: setItems,
			findItem: findItem,
			findItems: findItems,
			getItem: getItem,
			getActions: getActions,
			findParent: findParent,
			getAll: getAll,
			removeItem: removeItem
		}
	});
});