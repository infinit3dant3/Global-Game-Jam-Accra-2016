var LetiFramework = LetiFramework || {};

LetiFramework.DbTest = LetiFramework.DbTest || {};

LetiFramework.DbTest.testCreate = function(tableName, record) {
	LetiFramework.Db.create(tableName, record);	
}

LetiFramework.DbTest.testUpdate = function(tableName, record) {
	LetiFramework.Db.update(tableName, record);	
}

LetiFramework.DbTest.testDelete = function(tableName, id) {
	LetiFramework.Db.deleteById(tableName, id);	
}

LetiFramework.DbTest.testReadByKeyValue = function(tableName, key, value) {
	return LetiFramework.Db.readByKeyValue(tableName, key, value);	
}

LetiFramework.DbTest.testDeleteByKeyValue = function(tableName, key, value) {
	LetiFramework.Db.deleteByKeyValue(tableName, key, value);
}

LetiFramework.DbTest.testReadByKeysAndValues = function(tableName, keys, values) {
	return LetiFramework.Db.readByKeysAndValues(tableName, keys, values);	
}

LetiFramework.DbTest.testUpdateUsingFields = function(tableName, record, fields) {
	LetiFramework.Db.updateUsingFields(tableName, record, fields);	
}

LetiFramework.DbTest.testClear = function() {
	LetiFramework.Db.clear();	
}

LetiFramework.DbTest.testDb = function() {
	this.testCreate("users", {id:3, nickname: "wuzu"});
	this.testCreate("users", {id:4, nickname: "wuzu"});
	this.testUpdate("users", {id:3, nickname: "mutembaz"});
	this.testUpdateUsingFields("users", {id:4, nickname: "guru"}, ["nickname"]);
	//this.testDelete("users", null);
	//dump(this.testReadByKeysAndValues("users", ["nickname", "id"], ["devkim", 0]));
	//this.testDeleteByKeyValue("users", "nickname", "mutembaz");	
	//this.testClear();
	dump(LetiFramework.Db.readAll("users"));
}