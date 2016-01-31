var LetiFramework = LetiFramework || {};

LetiFramework.FileManager = LetiFramework.FileManager || {};

//File dir paths
LetiFramework.FileManager.appDirPath = null;
LetiFramework.FileManager.storiesDirPath = null;


LetiFramework.FileManager.initialize = function() {
	if(LetiFramework.App.isPhoneGap()) {
		this.appDirPath = cordova.file.externalDataDirectory;
		this.storiesDirPath = this.appDirPath + "stories/";
	}	
}

LetiFramework.FileManager.getStoriesDirPath = function() {
	return this.storiesDirPath;
}

LetiFramework.FileManager.getStoryDirPath = function(storyId) {
	return this.storiesDirPath +  storyId + "/";
}

LetiFramework.FileManager.getStoryDirCoverPath = function(storyId) {
	return this.getStoryDirPath(storyId) + "cover/";
}

LetiFramework.FileManager.getEpisodeDirPath = function(storyId, episodeId) {
	return this.getStoryDirPath(storyId) + "episodes/" + episodeId + "/";
}

LetiFramework.FileManager.getEpisodeDirContentPath = function(storyId, episodeId) {
	return this.getEpisodeDirPath(storyId, episodeId) + "content/";
}

LetiFramework.FileManager.getEpisodeDirCoverPath = function(storyId, episodeId) {
	return this.getEpisodeDirPath(storyId, episodeId) + "cover/";
}

LetiFramework.FileManager.getEpisodeDirContentAssetsPath = function(storyId, episodeId) {
	return this.getEpisodeDirContentPath(storyId, episodeId) + "assets/";
}

LetiFramework.FileManager.getEpisodeDirContentSoundPath = function(storyId, episodeId) {
	return this.getEpisodeDirContentPath(storyId, episodeId) + "sound/";
}

LetiFramework.FileManager.getEpisodeDirContentBubblesPath = function(storyId, episodeId) {
	return this.getEpisodeDirContentPath(storyId, episodeId) + "bubbles/";
}

LetiFramework.FileManager.getEpisodeDirContentCharactersPath = function(storyId, episodeId) {
	return this.getEpisodeDirContentPath(storyId, episodeId) + "characters/";
}

LetiFramework.FileManager.getEpisodeDirContentBadgesPath = function(storyId, episodeId) {
	return this.getEpisodeDirContentPath(storyId, episodeId) + "badges/";
}

LetiFramework.FileManager.getEpisodeDirContentVideoPath = function(storyId, episodeId) {
	return this.getEpisodeDirContentPath(storyId, episodeId) + "video/";
}

// get stories json file path
LetiFramework.FileManager.getStoriesFilePath = function() {
	return this.storiesDirPath + "stories.json";
}

// get story cover path
LetiFramework.FileManager.getStoryCoverPath = function(storyId, cover) {
	return this.getStoryDirCoverPath(storyId) + cover;
}

// get episode cover path
LetiFramework.FileManager.getEpisodeCoverPath = function(storyId, episodeId, cover) {
	return this.getEpisodeDirCoverPath(storyId, episodeId) + cover;
}

//get episode asset file path
LetiFramework.FileManager.getEpisodeAssetFilePath = function(storyId, episodeId, filePath) {	
	var path = this.getEpisodeDirContentAssetsPath(storyId, episodeId) + filePath;
	while(path.indexOf("/../") > -1) { path = this.removeDotPath(path); }
	return path;
}

// get episode sound file path
LetiFramework.FileManager.getEpisodeSoundFilePath = function(storyId, episodeId, filePath) {
	var path = this.getEpisodeDirContentSoundPath(storyId, episodeId) + filePath;
	return path;
}

// get episode bubble file path
LetiFramework.FileManager.getEpisodeBubbleFilePath = function(storyId, episodeId, filePath) {
	var path = this.getEpisodeDirContentBubblesPath(storyId, episodeId) + filePath;
	while(path.indexOf("/../") > -1) { path = this.removeDotPath(path); }
	return path;
}

// get episode character file path
LetiFramework.FileManager.getEpisodeCharacterFilePath = function(storyId, episodeId, filePath) {
	var path = this.getEpisodeDirContentCharactersPath(storyId, episodeId) + filePath;
	while(path.indexOf("/../") > -1) { path = this.removeDotPath(path); }
	return path;
}

// get episode badge file path
LetiFramework.FileManager.getEpisodeBadgeFilePath = function(storyId, episodeId, filePath) {
	var path = this.getEpisodeDirContentBadgesPath(storyId, episodeId) + filePath;
	while(path.indexOf("/../") > -1) { path = this.removeDotPath(path); }
	return path;
}

// get episode video file path
LetiFramework.FileManager.getEpisodeVideoFilePath = function(storyId, episodeId, filePath) {
	var path = this.getEpisodeDirContentVideoPath(storyId, episodeId) + filePath;
	return path;
}

// get episode json file path
LetiFramework.FileManager.getEpisodeDataFilePath = function(storyId, episodeId) {
	var path = this.getEpisodeDirContentPath(storyId, episodeId) + "story_data.json";
	return path;
}

// get episode components json file path
LetiFramework.FileManager.getEpisodeComponentsFilePath = function(storyId, episodeId) {
	var path = this.getEpisodeDirContentPath(storyId, episodeId) + "components.json";
	return path;
}

// get episode badges json file path
LetiFramework.FileManager.getEpisodeBadgesFilePath = function(storyId, episodeId) {
	var path = this.getEpisodeDirContentPath(storyId, episodeId) + "badges.json";
	return path;
}

// get episode quiz json file path
LetiFramework.FileManager.getEpisodeQuizFilePath = function(storyId, episodeId) {
	var path = this.getEpisodeDirContentPath(storyId, episodeId) + "quiz.json";
	return path;
}

LetiFramework.FileManager.removeDotPath = function(filePath) {
	var a = filePath.indexOf("/..");
	var b = filePath.lastIndexOf("/", a - 1);
	return filePath.substring(0, b + 1) + filePath.substring(a + 4);
}

LetiFramework.FileManager.loadImageToCache = function(game, key, filePath) {
	if(!game.cache.checkImageKey(key)) {
        var inCache = imageCache.containsKey(filePath);
        if(inCache) {
            var dataURI = imageCache.get(filePath);
            var data = new Image();
            data.src = dataURI;
            game.cache.addImage(key, dataURI, data);
        } else {
            //alert("Error loading image " + filePath.substring(filePath.indexOf("stories")));
        }
    }
}

LetiFramework.FileManager.loadSpriteSheetToCache = function(game, key, filePath, frameWidth, frameHeight) {
    if(!game.cache.checkImageKey(key)) {
        var inCache = imageCache.containsKey(filePath);        
        if(inCache) {
            var dataURI = imageCache.get(filePath);
            var data = new Image();
            data.src = dataURI;
            game.load.spritesheet(key, dataURI, frameWidth, frameHeight);  
        } else {
            //alert("Error loading spritesheet " + filePath.substring(filePath.indexOf("stories")));
        }
    }
}

LetiFramework.FileManager.deleteFile = function(filePath, onsuccess, onerror) {
	window.resolveLocalFileSystemURI(filePath, function(fileEntry) {
        fileEntry.remove(onsuccess || function(){/*success*/}, onerror || function(){/*error*/});      
    }, function() {/*file doesn't exist*/});
}

LetiFramework.FileManager.deleteDir = function(dirPath, onsuccess, onerror) {
	window.resolveLocalFileSystemURI(dirPath, function(dirEntry) {
        dirEntry.removeRecursively(onsuccess || function(){/*success*/}, onerror || function(){/*error*/});      
    }, function() {/*dir doesn't exist*/});
}