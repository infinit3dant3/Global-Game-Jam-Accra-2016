var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.video = function(game) {}

LetiFramework.Ui.video.prototype = {
	init: function() {
		LetiFramework.Analytics.trackPage("Video");

		this.animScale = LetiFramework.Renderer.animScale;
		this.currentUser = LetiFramework.GameController.currentUser;
		this.currentGame = LetiFramework.GameController.currentGame;
		this.currentGamePage = LetiFramework.GameController.currentGamePage;
		this.currentGamePageData = LetiFramework.GameController.currentGamePageData;		
   		this.isOnlineVideo = this.currentGamePageData.video.substr(0, 7) == "http://";
   		if(!this.isOnlineVideo) {
   			this.videoPath = this.getVideoPath();
   		}

		if(this.currentGamePageData.points) {
            var rs = LetiFramework.Db.readByKeysAndValues("scores", ["user_id", "game_id", "activity"],
                        [this.currentUser.id, this.currentGame.id, this.currentGamePage]);

            if(rs.length == 0) {  
                this.currentUser.points += this.currentGamePageData.points;
                LetiFramework.Db.update("users", this.currentUser);

                var log = {"user": this.currentUser.nickname, "story": this.currentGame.name, 
                                "page": this.currentGamePage,  "points": this.currentGamePageData.points};
                LetiFramework.Analytics.trackEvent("Video", "Points Score", log, 0);                

                var userScore = new LetiFramework.DbEntities.Scores(this.currentUser.id, this.currentGame.id, 
                    this.currentGamePage, this.currentGamePageData.points, this.currentGamePageData.points, true);
                LetiFramework.Db.create("scores", userScore);
            }            
        }
	},
	preload: function() {
			
	},
	create: function() {
		if(this.isOnlineVideo) {
			if(LetiFramework.App.isPhoneGap()) {
                window.open(this.currentGamePageData.video, '_system');
            } else {
                window.open(this.currentGamePageData.video);
            } 
            LetiFramework.GameController.nextPage();
		} else {
			if(LetiFramework.App.isPhoneGap() && device.platform == 'Android' && device.version.charAt(0) == '2') {
   			LetiFramework.GameController.nextPage();
   		} else 
   		{
   			this.game.canvas.style.display = "none";

   			var v = '<video id="video-item" width="auto" height="auto" preload="auto"><source src="' + this.videoPath + '" type="video/mp4" /></video>';
			
				var vPanel = document.createElement('div');		
				vPanel.setAttribute('id','video-panel');
				vPanel.innerHTML = v;
				
				document.body.appendChild(vPanel);	

				var videoItem = document.getElementById('video-item');				
				videoItem.addEventListener('ended', this.videoEnded, false);
				videoItem.addEventListener('error', this.videoEnded, false);

				videoItem.play();
   		}
		}   				
	},
	videoEnded: function(e) {
		if(!e) { e = window.event; }
    $('#video-panel').remove();        
    var this_ = LetiFramework.Renderer.currentState();
    this_.game.canvas.style.display = "block";

    LetiFramework.GameController.nextPage();
	},
	getVideoPath: function() {
		if(LetiFramework.App.isPhoneGap()) {
			return LetiFramework.FileManager.getEpisodeVideoFilePath(
        this.currentGame.storyId, this.currentGame.id, this.currentGamePageData.video);
		} else {
			return "assets/stories/" + this.currentGame.storyId +  '/episodes/' + this.currentGame.id + "/content/video/" + this.currentGamePageData.video;
		}
	}
}