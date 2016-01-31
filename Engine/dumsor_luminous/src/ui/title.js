var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.storyTitle = function(game) {}

LetiFramework.Ui.storyTitle.prototype = {
	init: function() {
        LetiFramework.Analytics.trackPage("Title");        
        this.screenConfig = LetiFramework.GameController.screensConfig.title;
        this.playDialog = this.screenConfig.playDialog;
        this.newGameButton = this.playDialog.new_button;
        this.resumeGameButton = this.playDialog.resume_button;
        this.closePlayDialogButton = this.playDialog.close_button;
        this.currentUser = LetiFramework.GameController.currentUser;
		this.currentGame = LetiFramework.GameController.currentGame;
        this.downloadAvailable = this.currentGame.available;
        this.contentAvailable = false;
	},
	preload: function() {
		this.game.load.image(this.screenConfig.background, this.getScreenConfigImagePath(this.screenConfig.background)); 
        this.game.load.image(this.playDialog.background, this.getScreenConfigImagePath(this.playDialog.background)); 
		this.game.load.image(this.screenConfig.home_button.image, this.getScreenConfigImagePath(this.screenConfig.home_button.image)); 
        this.game.load.image(this.screenConfig.delete_button.image, this.getScreenConfigImagePath(this.screenConfig.delete_button.image)); 
		this.loadEpisodeCover(this.currentGame.storyId, this.currentGame.id, this.currentGame.cover, this.getCoverImageKey());
		
        if(this.newGameButton.type == "image") {
            this.game.load.image(this.newGameButton.image, this.getScreenConfigImagePath(this.newGameButton.image)); 
        }

        if(this.resumeGameButton.type == "image") {
            this.game.load.image(this.resumeGameButton.image, this.getScreenConfigImagePath(this.resumeGameButton.image)); 
        }

        if(this.closePlayDialogButton.type == "image") {
            this.game.load.image(this.closePlayDialogButton.image, this.getScreenConfigImagePath(this.closePlayDialogButton.image)); 
        }

        if(!LetiFramework.App.isPhoneGap()) {
			this.game.load.audio(this.screenConfig.audio, this.getSoundPath(this.screenConfig.audio)); 	
		}
		this.bgSoundPath = this.getSoundPath(this.screenConfig.audio);
	},
	create: function() {
        this.createModals();

        this.scene = this.game.add.group();

		this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, this.screenConfig.background);
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);

        var titleArea = this.screenConfig.title;
        var contentArea = this.screenConfig.content;	

        var panel1Width = contentArea.background.width;
        var panel1Height = contentArea.background.height;

        var panel1 = this.game.add.graphics(this.game.world.centerX - 0.5 * panel1Width, this.game.world.centerY - 0.5 * panel1Height);
        panel1.beginFill(contentArea.background.color, 1);
        panel1.alpha = contentArea.background.alpha;
        panel1.drawRoundedRect(0, 0, panel1Width, panel1Height, 20);
        panel1.endFill();

        var panel2Width = titleArea.background.width;
        var panel2Height = titleArea.background.height;

        var panel2 = this.game.add.graphics(this.game.world.centerX - 0.5 * panel2Width, panel1.y - panel2Height / 2);
        panel2.beginFill(titleArea.background.color, 1);
        panel2.alpha = titleArea.background.alpha;
        panel2.drawRoundedRect(0, 0, panel2Width, panel2Height, 20);
        panel2.endFill();

        var title = this.game.add.text(this.game.world.centerX, panel2Height / 2 + panel2.y, this.currentGame.name,  
            titleArea.text_style);
    	title.anchor.set(0.5);

    	var style = contentArea.text_style;
    	style.wordWrap = true;
        style.wordWrapWidth = panel1Width / 2 - 20;
        var infoText = this.game.add.text(this.game.world.centerX + 0.25 * panel1Width, panel1Height * 0.20 + panel1.y, 
            this.currentGame.description, style);
    	infoText.anchor.set(0.5, 0);
    	infoText.lineSpacing = 10;

    	this.storyCover = this.game.add.sprite(0, 0, this.getCoverImageKey());
        this.storyCover.scale.setTo(this.screenConfig.cover_width / this.storyCover.width, 
            this.screenConfig.cover_height / this.storyCover.height);
        this.storyCover.anchor.set(0.5);
        this.storyCover.x = panel1.x + panel1Width * 0.25;
        this.storyCover.y = this.game.world.centerY;

        var readBt = this.screenConfig.read_button;
        this.readBt = new LetiFramework.Ui.Button(this.game, this.game.world.centerX + 0.25 * panel1Width - 100, 
        	this.game.world.centerY + panel1Height * 0.25, 200, 50, 
	        	this.screenConfig.read_button.text.read, readBt.text_style, readBt.button_style, 
                function() {
                    if(this.downloadAvailable) {
                        if(LetiFramework.App.isPhoneGap()) {
                            if(this.contentAvailable) {
                                this.readStory();
                            } else {                            
                                this.downloadEpisode();                            
                            }
                        } else {
                            this.readStory();
                        }
                    } else {
                        alert("Not yet available!");
                    }                                                          		
	        	}, this);
        
        if(LetiFramework.App.isPhoneGap()) {
            this.readBt.hide();
            var episodeDataFile = LetiFramework.FileManager.getEpisodeDataFilePath(
                this.currentGame.storyId, this.currentGame.id);
            var self = this;
            window.resolveLocalFileSystemURI(episodeDataFile, 
                function() {                      
                    self.contentAvailable = true; 
                    self.readBt.show();
                    self.deleteBt.visible = true;
                }, 
                function(){
                    self.readBt.setText(self.screenConfig.read_button.text.download);
                    self.readBt.show();                                
                });
        }        

        var homeBt = this.screenConfig.home_button;
    	this.homeBt = this.game.add.button(homeBt.position.x, homeBt.position.y, this.screenConfig.home_button.image, 
            function(){ 
                if(this.downloadingStory) { this.downloadFileTransfer.abort(); }
                LetiFramework.Analytics.trackEvent("Title", "Button Click", "Home", 0);
                if(LetiFramework.GameController.games.length > 1) {
                    LetiFramework.Renderer.render("SubMenu");
                } else {
                    LetiFramework.Renderer.render("Menu");
                }                
            }, this, 2, 1, 0);
        this.homeBt.scale.setTo(homeBt.width / this.homeBt.width, homeBt.height / this.homeBt.height);
        this.homeBt.input.useHandCursor = true;

        var deleteBt = this.screenConfig.delete_button;
        this.deleteBt = this.game.add.button(deleteBt.position.x, deleteBt.position.y, this.screenConfig.delete_button.image, 
            function() { 
                var self = this;
                LetiFramework.Analytics.trackEvent("Title", "Button Click", "Delete", 0);
                LetiFramework.FileManager.deleteDir(
                    LetiFramework.FileManager.getEpisodeDirContentPath(
                        this.currentGame.storyId, this.currentGame.id),
                    function() {
                        self.contentAvailable = false; 
                        self.readBt.setText(self.screenConfig.read_button.text.download);
                        self.deleteBt.visible = false;
                    });
            }, this, 2, 1, 0);
        this.deleteBt.scale.setTo(deleteBt.width / this.deleteBt.width, deleteBt.height / this.deleteBt.height);
        this.deleteBt.input.useHandCursor = true;
        this.deleteBt.visible = false;

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

        if(LetiFramework.App.isPhoneGap()) {
            this.bgSound = LetiFramework.SoundManager.getSound(this.bgSoundPath, false);
        } else {
            this.bgSound = this.game.add.audio(this.screenConfig.audio);
        }   

        if(LetiFramework.SoundManager.soundOn) {
            this.bgSound.play();
        }
  	},
    readStory: function() {
        LetiFramework.Analytics.trackEvent("Title", "Button Click", "Read Episode - " + this.currentGame.name, 0);
        var pageParam = LetiFramework.GameController.gup("page");
        if(pageParam || LetiFramework.GameController.currentUserGameLocation == null) {
            LetiFramework.GameController.fetchGameSteps();            
        } else {
            this.modals.showModal("playGameModal");
        }
    },
    downloadEpisode: function() {
        this.readBt.hide();
        this.downloadingStory = true;
        this.preloadText.visible = true;
        this.preloadText.style = this.screenConfig.progress.text.style;
        var self = this;

        var serverUrl = LetiFramework.NetworkManager.getEpisodeContentURL(this.currentGame.id);
        var localUrl = LetiFramework.FileManager.getEpisodeDirPath(
            this.currentGame.storyId, this.currentGame.id) + "content.zip";
        this.downloadFileTransfer = LetiFramework.NetworkManager.downloadFile(
            serverUrl, localUrl, 
            function() {
                self.homeBt.visible = false;
                self.unzipDownload();
                self.downloadingStory = false;
            },
            function() {
                self.preloadText.text = "Download failed! Error downloading content.";
                self.preloadText.style = self.screenConfig.progress.text.err_style;
                self.preloadBar.scale.x = 0;
                self.readBt.show();
                self.downloadingStory = false;
            }, 
            function(progressEvent) {
                var perc = Math.floor(progressEvent.loaded / progressEvent.total * 50);
                self.preloadText.text = "Downloading Content... " + perc + "%"; 
                self.preloadBar.scale.x = perc * 0.01;
            });
    },
    unzipDownload: function() {       
        var episodeDirPath = LetiFramework.FileManager.getEpisodeDirPath(
            this.currentGame.storyId, this.currentGame.id);
        var src = episodeDirPath + "content.zip";
        var dest = episodeDirPath;
        self = this;
        zip.unzip(
            src, dest, 
            function(code) {
                if(code == 0) {
                    self.preloadText.visible = false;
                    self.preloadBar.scale.x = 0;
                    self.readBt.setText(self.screenConfig.read_button.text.read);
                    self.contentAvailable = true;
                    self.readBt.show();
                    self.homeBt.visible = true;
                    LetiFramework.FileManager.deleteFile(src);
                } else {
                    self.preloadText.text = "Download failed! Error downloading content.";
                    self.preloadText.style = self.screenConfig.progress.text.err_style;
                    self.preloadBar.scale.x = 0;
                    self.readBt.show();
                    self.homeBt.visible = true;
                    LetiFramework.FileManager.deleteFile(src);
                    LetiFramework.FileManager.deleteDir(episodeDirPath + "content/");
                }
            }, 
            function(progressEvent) {
                var perc = Math.floor(progressEvent.loaded / progressEvent.total * 50) + 50;
                self.preloadText.text = "Downloading Content... " + perc + "%";
                self.preloadBar.scale.x = perc * 0.01;
            });
    },
    loadEpisodeCover: function(storyId, episodeId, cover, key) {
        if(LetiFramework.App.isPhoneGap()) {            
            var url = LetiFramework.FileManager.getEpisodeCoverPath(storyId, episodeId, cover);
            this.game.load.image(key, url); 
        } else {
            var url = 'assets/stories/' + storyId +  '/episodes/' + episodeId + '/cover/' + cover;
            this.game.load.image(key, url); 
        }
    },
    getCoverImageKey: function() {
        return this.currentGame.cover + "_" + this.currentGame.id;
    },
    getScreenConfigImagePath: function(name) {
        return "assets/img/" + name;
    },
    getSoundPath: function(name) {
        return 'assets/sound/' + name;
    },
    shutdown: function() {
        this.scene.destroy();
        this.readBt.destroy();
        this.bgSound.destroy();
    },
    createModals: function() {
        this.modals = new gameModal(this.game);

        var self = this;

        var newGameBt = this.createDialogButton(this.newGameButton);
        newGameBt.callback = function () {
            LetiFramework.Analytics.trackEvent("Title", "Button Click", "New Game", 0);
            self.modals.hideModal("playGameModal");
            LetiFramework.GameController.fetchGameSteps();            
        }

        var resumeGameBt = this.createDialogButton(this.resumeGameButton);
        resumeGameBt.callback = function() {
            LetiFramework.Analytics.trackEvent("Title", "Button Click", "Resume Game", 0);
            self.modals.hideModal("playGameModal");
            LetiFramework.GameController.resume = true;
            LetiFramework.GameController.fetchGameSteps();
        }

        var closeBt = this.createDialogButton(this.closePlayDialogButton);
        closeBt.callback = function() {
            LetiFramework.Analytics.trackEvent("Title", "Button Click", "Close Dialog", 0);
            self.modals.hideModal("playGameModal");
        }

        //// Exit Game modal ////
        this.modals.createModal({
            type:"playGameModal",
            includeBackground: true,
            modalCloseOnInput: true,
            itemsArr: [
                {
                    type: "image",
                    content: this.playDialog.background,
                    offsetY: this.playDialog.offsetY,
                    offsetX: this.playDialog.offsetX,
                    contentScale: this.playDialog.bg_scale
                },
                resumeGameBt,
                newGameBt,
                closeBt
            ]
        });
    },
    createDialogButton: function(buttonConfig) {
        var dialogBt = null;
        if(buttonConfig.type == "text") {
            var btTextStyle = buttonConfig.text_style;
            dialogBt = {
                type: "text",
                content: buttonConfig.text,
                fontSize: btTextStyle.fontSize,
                fontFamily: btTextStyle.fontFamily,
                color: btTextStyle.color,
                stroke: btTextStyle.stroke,
                strokeThickness: btTextStyle.strokeThickness                
            };
        }
        else if(buttonConfig.type == "image") {
            dialogBt = {
                type: "image",
                content: buttonConfig.image,
                contentScale: buttonConfig.image_scale
            };
        }

        dialogBt.offsetX = buttonConfig.offsetX;
        dialogBt.offsetY = buttonConfig.offsetY;

        return dialogBt;
    }
}