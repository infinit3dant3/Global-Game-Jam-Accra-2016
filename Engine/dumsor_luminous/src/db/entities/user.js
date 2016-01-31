var LetiFramework = LetiFramework || {};

LetiFramework.DbEntities = LetiFramework.DbEntities || {};

LetiFramework.DbEntities.User = function(nickname) {
	this.id = 0;
	this.nickname = nickname;
	this.points = 0;
}