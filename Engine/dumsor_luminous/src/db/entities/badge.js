var LetiFramework = LetiFramework || {};

LetiFramework.DbEntities = LetiFramework.DbEntities || {};

LetiFramework.DbEntities.Badge = function(user_id, badge_id, story_id, episode_id, badge_image, badge_text, badge_action, badge_message) {
	this.id = new Date().getTime();
	this.user_id = user_id;
	this.badge_id = badge_id;
	this.story_id = story_id;
	this.episode_id = episode_id;
	this.badge_image = badge_image;
	this.badge_text = badge_text;
	this.badge_action = badge_action;
	this.badge_message = badge_message;
}