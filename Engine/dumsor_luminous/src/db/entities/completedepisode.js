var LetiFramework = LetiFramework || {};

LetiFramework.DbEntities = LetiFramework.DbEntities || {};

LetiFramework.DbEntities.CompletedEpisode = function(userId, storyId, episodeId) {
	this.id = new Date().getTime();
	this.userId = userId;
	this.storyId = storyId;
	this.episodeId = episodeId;
}