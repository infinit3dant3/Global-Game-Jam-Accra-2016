var LetiFramework = LetiFramework || {};

LetiFramework.DbEntities = LetiFramework.DbEntities || {};

LetiFramework.DbEntities.Scores = function(user_id, game_id, activity, score, max_score, completed) {
	this.id = new Date().getTime();
	this.user_id = user_id;
	this.game_id = game_id;
	this.activity = activity;
	this.score = score;
	this.max_score = max_score;
	this.completed = completed;
}