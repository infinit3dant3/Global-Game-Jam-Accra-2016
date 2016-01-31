var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.splashvideo = function(game) {}

LetiFramework.Ui.splashvideo.prototype = {
	init: function() {
		LetiFramework.Analytics.trackPage("SplashVideo");
		this.screenConfig = LetiFramework.GameController.bootConfig[LetiFramework.GameController.bootScreen];
	},
	preload: function() {
		this.game.load.image(this.screenConfig.image, this.getScreenConfigImagePath(this.screenConfig.image)); 			
	},
	create: function() {
   		if(this.screenConfig.video_off || 
   			(LetiFramework.App.isPhoneGap() && device.platform == 'Android' && device.version.charAt(0) == '2')) {
   			this.showImage();
   		} else 
   		{
   			this.game.canvas.style.display = "none";

   			var v = '<video id="video-item" width="auto" height="auto" preload="auto"><source src="assets/vid/' + this.screenConfig.video + '" type="video/mp4" /></video>';
		
			var vPanel = document.createElement('div');		
			vPanel.setAttribute('id','video-panel');
			vPanel.innerHTML = v;
			
			document.body.appendChild(vPanel);	

			var videoItem = document.getElementById('video-item');
			videoItem.addEventListener('ended', this.videoEnded, false);

			if(LetiFramework.App.isPhoneGap()) {
				var myFilename = this.screenConfig.video;
				var myUrl = cordova.file.applicationDirectory + "www/assets/vid/" + myFilename;
				var filePath = cordova.file.dataDirectory + myFilename;

				var success = function(entry) {
				  var vid = document.getElementById("video-item");
				  vid.src = entry.nativeURL;
				  vid.onerror = function() {
				  	LetiFramework.Renderer.currentState().showImage();
				  }
				  vid.play();
				}

				var error = function(error) {
					LetiFramework.Renderer.currentState().showImage();
				}

				LetiFramework.NetworkManager.downloadFile(myUrl, filePath, success, error);
			} else {			
				videoItem.play();			
			}			
   		}		
  	},
  	shutdown: function() {
  		if(this.bg) {
  			this.bg.destroy();
  		}
	},
	showImage: function() {
		$('#video-panel').remove();        
        var this_ = LetiFramework.Renderer.currentState();
        this_.game.canvas.style.display = "block";

		this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, this.screenConfig.image);
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);

        setTimeout(function() {			
			LetiFramework.GameController.bootScreen = this_.screenConfig.next_screen;
        	LetiFramework.GameController.bootSequence();
		}, 1500);
	},
  	videoEnded: function(e) {
  		if(!e) { e = window.event; }
        $('#video-panel').remove();        
        var this_ = LetiFramework.Renderer.currentState();
        this_.game.canvas.style.display = "block";

        LetiFramework.GameController.bootScreen = this.screenConfig.next_screen;
        LetiFramework.GameController.bootSequence();
  	},
  	getScreenConfigImagePath: function(name) {
		return "assets/img/" + name;
	}
}