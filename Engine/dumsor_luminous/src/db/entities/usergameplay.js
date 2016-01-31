var LetiFramework = LetiFramework || {};

LetiFramework.DbEntities = LetiFramework.DbEntities || {};

LetiFramework.DbEntities.UserGamePlay = function(user_id, game_id, game_step, selection) {	
	this.id = new Date().getTime();
	this.user_id = user_id;
	this.game_id = game_id;
	this.game_step = game_step;	
	this.selection = selection;
}