var LetiFramework = LetiFramework || {};

LetiFramework.Db = LetiFramework.Db || {};

LetiFramework.Db.tableNames = [
	"users", "user_game_play", "user_game_location", "scores", "badges", "completed_episode"
];

LetiFramework.Db.initialize = function() {
	for (var i = 0; i < this.tableNames.length; i++) {
		var tableName = this.tableNames[i];
		if(store.get(tableName) == null){
			store.set(tableName, []);
		}
	}
}

LetiFramework.Db.printDb = function() {
	var db = [];
	for (var i =  0; i < this.tableNames.length; i++) {
		db.push({table: this.tableNames[i], records: this.readAll(this.tableNames[i])});
	}
	dump(db);
}

LetiFramework.Db.create = function(tableName, record) {
	var table = store.get(tableName);
	if(table != null && this.read(tableName, record.id) == null) {	
		table.push(record);
		store.set(tableName, table);
	}
}

LetiFramework.Db.createAll = function(tableName, records) {
	var table = store.get(tableName);
	if(table != null) {
		for (var i =  0; i < records.length; i++) {
			if(this.read(tableName, records[i].id) == null) {
				table.push(records[i]);
			}			
		}
		store.set(tableName, table);
	}
}

LetiFramework.Db.read = function(tableName, id) {
	var table = store.get(tableName);
	if(table != null) {
		for (var i = 0; i < table.length; i++) {
			if(table[i]["id"] == id) {
				return table[i];
			}
		}
	}	
	return null;
}

LetiFramework.Db.readByKeyValue = function(tableName, key, value) {
	var result = [];
	var table = store.get(tableName);
	if(table != null) {
		for (var i = 0; i < table.length; i++) {
			if(table[i][key] == value) {
				result.push(table[i]);
			}
		}
	}	
	return result;
}

LetiFramework.Db.readByKeysAndValues = function(tableName, keys, values) {
	var result = [];
	var table = store.get(tableName);
	if(table != null) {
		for (var i = 0; i < table.length; i++) {
			var found = true;
			for (var k = 0; k < keys.length; k++) {
				found &= table[i][keys[k]] == values[k];
			}
			if(found) {
				result.push(table[i]);
			}
		}
	}	
	return result;
}

LetiFramework.Db.readAll = function(tableName) {
	return store.get(tableName);
}

LetiFramework.Db.update = function(tableName, record) {
	var table = store.get(tableName);
	if(table != null) {
		for (var i = 0; i < table.length; i++) {
			if(table[i]["id"] == record.id) {
				table[i] = record;
				store.set(tableName, table);
				break;
			}
		}
	}	
}

LetiFramework.Db.updateUsingFields = function(tableName, record, fields) {
	var table = store.get(tableName);
	if(table != null) {
		for (var i = 0; i < table.length; i++) {
			var found = true;
			for (var k = 0; k < fields.length; k++) {
				found &= table[i][fields[k]] == record[fields[k]];
			}
			if(found) {
				table[i] = record;
				store.set(tableName, table);
				break;
			}
		}
	}	
}

LetiFramework.Db.deleteById = function(tableName, id) {
	this.deleteByKeyValue(tableName, "id", id);
}

LetiFramework.Db.deleteByKeyValue = function(tableName, key, value) {
	var table = store.get(tableName);
	var updatedTable = [];
	if(table != null) {
		for (var i = 0; i < table.length; i++) {
			if(table[i][key] == value) {
				continue;
			} else {
				updatedTable.push(table[i]);
			}
		}
		store.set(tableName, updatedTable);
	}
}

LetiFramework.Db.deleteByKeysAndValues = function(tableName, keys, values) {
	var table = store.get(tableName);
	var updatedTable = [];
	if(table != null) {
		for (var i = 0; i < table.length; i++) {
			var found = true;
			for (var k = 0; k < keys.length; k++) {
				found &= table[i][keys[k]] == values[k];
			}
			if(found) {
				continue;
			} else {
				updatedTable.push(table[i]);
			}			
		}
		store.set(tableName, updatedTable);
	}
}

LetiFramework.Db.deleteAll = function(tableName) {
	store.set(tableName, []);
}

LetiFramework.Db.clear = function() {
	store.clear();
	for (var i = 0; i < this.tableNames.length; i++) {
		this.deleteAll(this.tableNames[i]);
	}
}