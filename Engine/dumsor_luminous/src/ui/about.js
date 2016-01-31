var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.about = function(game) {}

LetiFramework.Ui.about.prototype = {
	init: function() {
		LetiFramework.Analytics.trackPage("About");
		this.currentUser = LetiFramework.GameController.currentUser;
		this.screenConfig = LetiFramework.GameController.screensConfig.about;
	},
	preload: function() {	
		this.game.load.image(this.screenConfig.background, this.getScreenConfigImagePath(this.screenConfig.background)); 
		this.game.load.image(this.screenConfig.home_button.image, this.getScreenConfigImagePath(this.screenConfig.home_button.image));	
		this.soundPath = this.getScreenConfigSoundPath(this.screenConfig.audio);
	},
	create: function() {	
		this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, this.screenConfig.background);
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);

		var homeBtPosition = this.screenConfig.home_button.position;
		this.homeBt = this.game.add.button(homeBtPosition.x, homeBtPosition.y, this.screenConfig.home_button.image, function() {
			LetiFramework.Analytics.trackEvent("About", "Button Click", "Home", 0);
			LetiFramework.Renderer.render("Menu");
		}, this, 2, 1, 0);
		this.homeBt.input.useHandCursor = true;

		var titleArea = this.screenConfig.title;
        var contentArea = this.screenConfig.content;	

        var panel1Width = contentArea.width;
        var panel1Height = contentArea.height;

        var panel1 = this.game.add.graphics(contentArea.position.x, contentArea.position.y);
        panel1.beginFill(contentArea.color, 1);
        panel1.alpha = contentArea.alpha;
        if(contentArea.shape == "round_rect") {
        	panel1.drawRoundedRect(0, 0, panel1Width, panel1Height, contentArea.radius);
        }
        else if(contentArea.shape == "rect") {
        	panel1.drawRect(0, 0, panel1Width, panel1Height);
        }
        panel1.endFill();

        var panel2Width = titleArea.background.width;
        var panel2Height = titleArea.background.height;

        var panel2 = this.game.add.graphics(titleArea.position.x, titleArea.position.y);
        panel2.beginFill(titleArea.background.color, 1);
        panel2.alpha = titleArea.background.alpha;
        if(titleArea.background.shape == "round_rect") {
        	panel2.drawRoundedRect(0, 0, panel2Width, panel2Height, titleArea.background.radius);
        }
        else if(titleArea.background.shape == "rect") {
        	panel2.drawRect(0, 0, panel2Width, panel2Height);
        }
        panel2.endFill();

        var title = this.game.add.text(this.game.world.centerX, panel2Height / 2 + panel2.y, 
        	titleArea.text, titleArea.text_style);
    	title.anchor.set(0.5);

    	var style = contentArea.text_style;
    	style.wordWrap = true;
        style.wordWrapWidth = panel1Width - 20;
        var infoText = this.game.add.text(this.game.world.centerX, 20 + panel1.y, contentArea.text, style);
    	infoText.anchor.set(0.5, 0);
    	infoText.lineSpacing = 10;

    	if(LetiFramework.App.isPhoneGap()) {
			this.music = LetiFramework.SoundManager.getSound(this.soundPath, false);
		} else {
			this.music = this.game.add.audio(this.screenConfig.audio);
		}

        if(LetiFramework.SoundManager.soundOn) {
			this.music.play();
		}
  	},
  	shutdown: function() {
		this.music.destroy();
	},
  	getScreenConfigSoundPath: function(name) {
		return "assets/sound/" + name;
	},
	getScreenConfigImagePath: function(name) {
		return "assets/img/" + name;
	}  	
}