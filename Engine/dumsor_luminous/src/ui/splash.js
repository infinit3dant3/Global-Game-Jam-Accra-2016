var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.splash = function(game) {}

LetiFramework.Ui.splash.prototype = {
	init: function() {
		LetiFramework.Analytics.trackPage("Splash");
		this.screenConfig = LetiFramework.GameController.bootConfig[LetiFramework.GameController.bootScreen];
    this.downloadCount = 0;
    this.downloadedCount = 0;
	},
	preload: function() {
		this.game.load.image(this.screenConfig.background, this.getScreenConfigImagePath(this.screenConfig.background)); 
	},
	create: function() {		
		this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, this.screenConfig.background);
    this.bg.anchor.set(0.5);
    this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);

    if(LetiFramework.App.isPhoneGap()) {
      var progressBar = this.screenConfig.progress.bar;
      this.preloadBar = this.game.add.graphics(progressBar.position.x, progressBar.position.y);
      this.preloadBar.lineStyle(progressBar.height, progressBar.color, progressBar.alpha);
      this.preloadBar.moveTo(0, 0);
      this.preloadBar.lineTo(progressBar.width, 0);        
      this.preloadBar.scale.x = 0; // set the bar to the beginning position

      var progressText = this.screenConfig.progress.text;
      this.preloadText = this.game.add.text(progressText.position.x, progressText.position.y, 
        "Downloading Content...", progressText.style);
      this.preloadText.anchor.set(0.5);
      this.preloadText.visible = false;
      
    	var storiesFile = LetiFramework.FileManager.getStoriesFilePath();
      this.startTime = new Date().getTime();
      var self = this;
      window.resolveLocalFileSystemURL(storiesFile, 
        function(fileEntry) {
          self.gotStoriesFile(fileEntry);
        }, 
        function() {
          self.downloadStoriesFile(); 
        });        	
    } else {  	
      var self = this;
      setTimeout(function() { 
        LetiFramework.GameController.bootScreen = self.screenConfig.next_screen;
        LetiFramework.GameController.bootSequence(); 
      }, 1500);
    }        
	},  
  downloadStoriesFile: function() {
    this.preloadText.visible = true;
    var self = this;
    var serverUrl = LetiFramework.NetworkManager.getStoriesURL();
    var localUrl = LetiFramework.FileManager.getStoriesFilePath();
    LetiFramework.NetworkManager.downloadFile(
      serverUrl, localUrl, 
      function(fileEntry) {
        self.gotStoriesFile(fileEntry); 
      }, 
      function() {
        self.preloadText.text = "Download aborted! Error downloading content.";
        self.preloadText.style = self.screenConfig.progress.text.err_style;
        self.preloadBar.scale.x = 0;
        LetiFramework.App.removeOnBackKeyDown();
      }, 
      function(progressEvent) {
        var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
        self.preloadText.text = "Downloading Content... " + perc + "%";
        self.preloadBar.scale.x = perc * 0.01;
      });
  },
  gotStoriesFile: function(fileEntry) {
    var self = this;

    jQuery.getJSON(fileEntry.toURL(), 
      function(data) {
        self.downloadCount = data.length;
        self.downloadedCount = 0;

        for(var i = 0; i < data.length; i++) {
          (function(story) {
            var id = story.id;
            var cover = story.cover;
            var episodes = story.episodes;
            var episodesCount = episodes.length;
            var storyCoverFile = LetiFramework.FileManager.getStoryCoverPath(id, cover);            

            self.downloadCount += episodesCount;

            window.resolveLocalFileSystemURL(storyCoverFile, 
              function(fileEntry) {
                setTimeout(function() { self.gotCoverImage(fileEntry); }, 200); 
              }, 
              function() { 
                var serverUrl = LetiFramework.NetworkManager.getStoryCoverURL(id);
                var localUrl = storyCoverFile;
                setTimeout(function() { self.downloadCoverImage(id, serverUrl, localUrl); }, 200);
              });  

            for(var j = 0; j < episodesCount; j++) {
              (function(episode) {
                var id = episode.id;
                var storyId = episode.storyId;
                var cover = episode.cover;
                var episodeCoverFile = LetiFramework.FileManager.getEpisodeCoverPath(storyId, id, cover);

                window.resolveLocalFileSystemURL(episodeCoverFile, 
                  function(fileEntry) {
                    setTimeout(function() { self.gotCoverImage(fileEntry); }, 200); 
                  }, 
                  function() {
                    var serverUrl = LetiFramework.NetworkManager.getEpisodeCoverURL(id);
                    var localUrl = episodeCoverFile;
                    setTimeout(function() { self.downloadCoverImage(id, serverUrl, localUrl); }, 200);
                  });
              })(episodes[j]);
            }
          })(data[i]);
        }
      }).error(function() { alert("Error initializing app!"); });
  },
  downloadCoverImage: function(id, serverUrl, localUrl) {
    this.preloadText.visible = true;
    var self = this;
    LetiFramework.NetworkManager.downloadFile(
      serverUrl, localUrl,
      function(fileEntry) {
        self.gotCoverImage(fileEntry);
      }, 
      function() {
        self.preloadText.text = "Download aborted! Error downloading content.";
        self.preloadText.style = self.screenConfig.progress.text.err_style;
        self.preloadBar.scale.x = 0;
        LetiFramework.App.removeOnBackKeyDown();
      },
      function(progressEvent) {
        var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
        self.preloadText.text = "Downloading Content (" + 
          (self.downloadedCount + 1) + "/" + self.downloadCount + ")... " + perc + "%";
        self.preloadBar.scale.x = perc * 0.01;
      });
  },
  gotCoverImage: function(fileEntry) {
    ++this.downloadedCount;
    if(this.downloadedCount == this.downloadCount) {
      var delay = 1500 - (new Date().getTime() - this.startTime);
      var self = this;
      setTimeout(function() { 
        LetiFramework.GameController.bootScreen = self.screenConfig.next_screen;
        LetiFramework.GameController.bootSequence();
      }, (delay > 0 ? delay : 0));
    }
  },
	shutdown: function() {
    this.bg.destroy();
	},
  getScreenConfigImagePath: function(name) {
		return "assets/img/" + name;
	}
}