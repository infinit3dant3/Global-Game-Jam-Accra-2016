var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.narration2 = function(game) {}

LetiFramework.Ui.narration2.prototype = {
	init: function() {
		LetiFramework.Analytics.trackPage("Narration");

		this.screenConfig = LetiFramework.GameController.screensConfig.narration2;
		this.hud = LetiFramework.GameController.screensConfig.hud;
		this.animScale = LetiFramework.Renderer.animScale;
		this.currentUser = LetiFramework.GameController.currentUser;
		this.currentGame = LetiFramework.GameController.currentGame;
		this.currentGamePage = LetiFramework.GameController.currentGamePage;
		this.currentGamePageData = LetiFramework.GameController.currentGamePageData;
		this.badge = this.currentGamePageData.badge;
		this.textBg = this.currentGamePageData.text_background;
		this.narrNextBt = this.currentGamePageData.next_button;
		this.pageComponents = [];
		this.soundObjects = [];
		this.pageSprites = {};
		if(this.currentGamePageData.components) {
			this.pageComponents = LetiFramework.GameController.currentStoryComponents[
				this.currentGamePageData.components];
		}
		this.universalComponents = LetiFramework.GameController.currentStoryComponents.universal_components || [];
		this.narrations = this.currentGamePageData.narration.text;
		this.narrationIdx = 0;

		if(this.currentGamePageData.points) {
            var rs = LetiFramework.Db.readByKeysAndValues("scores", ["user_id", "game_id", "activity"],
                        [this.currentUser.id, this.currentGame.id, this.currentGamePage]);

            if(rs.length == 0) {  
                this.currentUser.points += this.currentGamePageData.points;
                LetiFramework.Db.update("users", this.currentUser);

                var log = {"user": this.currentUser.nickname, "story": this.currentGame.name, 
                                "page": this.currentGamePage,  "points": this.currentGamePageData.points};
                LetiFramework.Analytics.trackEvent("Narration", "Points Score", log, 0);                

                var userScore = new LetiFramework.DbEntities.Scores(this.currentUser.id, this.currentGame.id, 
                    this.currentGamePage, this.currentGamePageData.points, this.currentGamePageData.points, true);
                LetiFramework.Db.create("scores", userScore);
            }            
        }
	},
	preload: function() {
		if(this.currentGamePageData.background_if) {
            var pg = this.currentGamePageData.background_if.page;
            var rs = LetiFramework.Db.readByKeysAndValues(
                    "user_game_play",
                    ["user_id", "game_id", "game_step"],
                    [this.currentUser.id, this.currentGame.id, pg]);
            if(rs.length > 0) {
                var selection = rs[rs.length - 1].selection[0];
                this.bgKey = this.loadImageFile(this.currentGamePageData.background_if[selection]);
            }
        } else {
        	this.bgKey = this.loadImageFile(this.currentGamePageData.background);
        }

		var optionsBt = this.screenConfig.options_button;
		var nextBt = this.screenConfig.next_button;
		var prevBt = this.screenConfig.prev_button;
		var optionsDropDown = optionsBt.children;
		var optionsHomeBt = optionsDropDown.home_button;
        var optionsSoundBt = optionsDropDown.sound_button;
        var optionsMusicBt = optionsDropDown.music_button;
        var prevPageBtConfig = this.currentGamePageData.prev_page_button;
        var nextPageBtConfig = this.currentGamePageData.next_page_button;

		this.game.load.image(optionsHomeBt.image, this.getScreenConfigImagePath(optionsHomeBt.image));
		this.game.load.image(optionsSoundBt.on_image, this.getScreenConfigImagePath(optionsSoundBt.on_image));
		this.game.load.image(optionsSoundBt.off_image, this.getScreenConfigImagePath(optionsSoundBt.off_image));
		this.game.load.image(optionsMusicBt.on_image, this.getScreenConfigImagePath(optionsMusicBt.on_image));
		this.game.load.image(optionsMusicBt.off_image, this.getScreenConfigImagePath(optionsMusicBt.off_image));	
		this.game.load.image(optionsBt.image, this.getScreenConfigImagePath(optionsBt.image));	
		this.game.load.image(nextBt.image, this.getScreenConfigImagePath(nextBt.image));
		this.game.load.image(prevBt.image, this.getScreenConfigImagePath(prevBt.image));
		if(this.textBg.type == "image") {
			this.loadImageFile(this.textBg.image);
		}
		if(this.narrNextBt)	{
			this.loadImageFile(this.narrNextBt.image);
		}
		if(nextPageBtConfig && nextPageBtConfig.image) {			
			this.loadImageFile(nextPageBtConfig.image);
		}
		if(prevPageBtConfig && prevPageBtConfig.image) {
			this.loadImageFile(prevPageBtConfig.image);
		}

		var components = this.universalComponents.concat(this.pageComponents);
		for(var i = 0; i < components.length; i++) {
			var cmp = components[i];
			if(cmp.image) {
				if(cmp.type == 'spritesheet') {
					this.loadSpriteSheetFile(cmp.image, cmp.frame_width, cmp.frame_height);
				} else {
					this.loadImageFile(cmp.image);
				}				
			}

			if(cmp.interactivity && cmp.interactivity.audio) {
				if(!LetiFramework.App.isPhoneGap()) {
					this.game.load.audio(cmp.interactivity.audio, this.getSoundPath(cmp.interactivity.audio));					
				}
			}
		}

		var componentsOverride = this.currentGamePageData.components_override;
		for(var k in componentsOverride) {
			var cmp = componentsOverride[k];
			if(cmp.type == "image") {
				this.loadImageFile(cmp.image);
			} else if(cmp.type == "spritesheet") {
				var frame_width = cmp.frame_width;
				var frame_height = cmp.frame_height;
				if(frame_width == undefined || frame_height == undefined) {
					for(var j in this.pageComponents) {
						var pageCmp = this.pageComponents[j];
						if(pageCmp.name == k) {
							frame_width = frame_width || pageCmp.frame_width;
							frame_height = frame_height || pageCmp.frame_height;
						}
					}
				}
				this.loadSpriteSheetFile(cmp.image, frame_width, frame_height);
			}
		}

		var progressComponent = LetiFramework.GameController.currentStoryComponents.progress_component;
		if(progressComponent && this.currentGamePageData.progress_component) {
			this.loadImageFile(progressComponent.progress_image.image);
			if(progressComponent.background && progressComponent.background.type == "image") {
				this.loadImageFile(progressComponent.background.image);
			}
		}

		if(this.badge) {
			var alreadyEarnedBadge = LetiFramework.Db.readByKeysAndValues("badges", ["user_id", "badge_id"], 
				[this.currentUser.id, this.badge.id]).length > 0;

			var awardBadge = this.badge.metric == "visit" || 
					(this.badge.metric == "points" && this.currentUser.points >= this.badge.value);

			if(!alreadyEarnedBadge && awardBadge) {
				var rs = jsonsql.query("select * from LetiFramework.GameController.currentStoryBadges where (id==" + 
					this.badge.id + ")", LetiFramework.GameController.currentStoryBadges);

                if(rs.length > 0) {
                    var badge = rs[0];
                    this.badge.image = badge.image;
                    this.badge.text = badge.text;
                    this.badge.message = badge.message;

                    var badgeStyle = LetiFramework.GameController.screensConfig.badge_dialog_styles[this.badge.style];

                    this.loadBadgeFile(badge.image);
                    this.game.load.image(badgeStyle.background, this.getScreenConfigImagePath(badgeStyle.background));

                    if(badgeStyle.title.type == "image") {
                    	this.game.load.image(badgeStyle.title.image, 
                    		this.getScreenConfigImagePath(badgeStyle.title.image));
                    }

                    if(badgeStyle.close_button.type == "image") {
                    	this.game.load.image(badgeStyle.close_button.image, 
                    		this.getScreenConfigImagePath(badgeStyle.close_button.image));
                    }

                    var model = new LetiFramework.DbEntities.Badge(this.currentUser.id, badge.id, 
                    	this.currentGame.storyId, this.currentGame.id, 
                    	badge.image, badge.text, badge.action, badge.message);
	                LetiFramework.Db.create("badges", model);

	                LetiFramework.Analytics.trackEvent("Narration", "Badge Earned", 
                        {"user": this.currentUser.nickname, "story": this.currentGame.name,
                            "page": this.currentGamePage, "badge": badge}, 0);

	                this.showBadge = true;
                }
			}
		}

		if(this.hud.visible) {
			var badges = LetiFramework.Db.readByKeysAndValues("badges", ["user_id", "story_id"], 
				[this.currentUser.id, this.currentGame.id]);
			if(badges.length > 0) {
				this.currentBadge = badges[badges.length - 1];
				this.loadBadgeFile(this.currentBadge.badge_image);
			}
		}

		if(!LetiFramework.App.isPhoneGap()) {
			this.game.load.audio(this.currentGamePageData.audio, this.getSoundPath(this.currentGamePageData.audio));
			this.game.load.audio(this.currentGamePageData.narration.audio, this.getSoundPath(this.currentGamePageData.narration.audio));
		}		

		this.bgSoundPath = this.getSoundPath(this.currentGamePageData.audio);
		this.narrationSoundPath = this.getSoundPath(this.currentGamePageData.narration.audio);
	},
	create: function() {	
		this.scene = this.game.add.group();

		this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, this.bgKey);
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);
        this.scene.add(this.bg);
        
        this.addComponents();        

		var optionsBt = this.screenConfig.options_button;
        var optionsDropDown = optionsBt.children;
        var optionsHomeBt = optionsDropDown.home_button;
        var optionsSoundBt = optionsDropDown.sound_button;
        var optionsMusicBt = optionsDropDown.music_button;
		var optionsBtPosition = this.screenConfig.options_button.position;

		this.homeBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y, optionsDropDown.home_button.image, 
			function() {
				LetiFramework.Analytics.trackEvent("Narration", "Button Click", "Home", 0);
				LetiFramework.Renderer.render("Menu");
			}, this, 2, 1, 0);
		this.homeBt.input.useHandCursor = true;
		this.homeBt.alpha = 0;

		this.soundBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y, 
			LetiFramework.SoundManager.narrationOn ? optionsSoundBt.on_image : optionsSoundBt.off_image, 
			function() {
				LetiFramework.SoundManager.narrationOn = !LetiFramework.SoundManager.narrationOn;
	        	if(LetiFramework.SoundManager.narrationOn) {
	        		LetiFramework.Analytics.trackEvent("Narration", "Button Click", "Sound On", 0);
	        		this.soundBt.loadTexture(this.screenConfig.options_button.children.sound_button.on_image);
	        		this.narrationSound.paused ? this.narrationSound.resume() : this.narrationSound.play();
	        	} else {
	        		LetiFramework.Analytics.trackEvent("Narration", "Button Click", "Sound Off", 0);
	        		this.soundBt.loadTexture(this.screenConfig.options_button.children.sound_button.off_image);
	        		this.narrationSound.pause();
	        	}
			}, this, 2, 1, 0);
		this.soundBt.input.useHandCursor = true;
		this.soundBt.alpha = 0;

		this.musicBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y, 
			LetiFramework.SoundManager.soundOn ? optionsMusicBt.on_image : optionsMusicBt.off_image, 
			function(){
				LetiFramework.SoundManager.soundOn = !LetiFramework.SoundManager.soundOn;
	    		if(LetiFramework.SoundManager.soundOn) {
	    			LetiFramework.Analytics.trackEvent("Narration", "Button Click", "Music On", 0);
	    			this.musicBt.loadTexture(this.screenConfig.options_button.children.music_button.on_image);
					this.bgSound.paused ? this.bgSound.resume() : this.bgSound.play();
				} else {
					LetiFramework.Analytics.trackEvent("Narration", "Button Click", "Music Off", 0);
					this.musicBt.loadTexture(this.screenConfig.options_button.children.music_button.off_image);
					this.bgSound.pause();
				}
			}, this, 2, 1, 0);
		this.musicBt.input.useHandCursor = true;
		this.musicBt.alpha = 0;
		
		this.optionsBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y, optionsBt.image, 
			function() {
				LetiFramework.Analytics.trackEvent("Narration", "Button Click", "Options", 0);

				var homeTween = this.game.add.tween(this.homeBt);
				var soundTween = this.game.add.tween(this.soundBt);
	        	var musicTween = this.game.add.tween(this.musicBt);

	        	if(this.soundBt.alpha == 1) {
	        		var optionsBtPosition = {y: this.screenConfig.options_button.position.y};

	        		homeTween.to(optionsBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(
	        			function(){
		        			this.homeBt.alpha = 0;
		        		}, this);
	        		soundTween.to(optionsBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(
	        			function(){
		        			this.soundBt.alpha = 0;
		        		}, this);
		        	musicTween.to(optionsBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(
		        		function(){
		        			this.musicBt.alpha = 0;
		        		}, this);        		
	        	} else {
	        		this.homeBt.alpha = 1;
	        		this.soundBt.alpha = 1;
	        		this.musicBt.alpha = 1;

	        		var optionsDropDown = this.screenConfig.options_button.children;
		        	var homePos = {y: optionsDropDown.home_button.position.y};
		        	var soundPos = {y: optionsDropDown.sound_button.position.y};
		        	var musicPos = {y: optionsDropDown.music_button.position.y};

		        	homeTween.to(homePos, 750 * this.animScale, Phaser.Easing.Elastic.Out, true);
		        	soundTween.to(soundPos, 750 * this.animScale, Phaser.Easing.Elastic.Out, true);
		        	musicTween.to(musicPos, 750 * this.animScale, Phaser.Easing.Elastic.Out, true);
	        	}
			}, this, 2, 1, 0);
		this.optionsBt.input.useHandCursor = true;	

		var prevBtPosition = this.screenConfig.prev_button.position;
		this.prevBt = this.game.add.button(prevBtPosition.x, prevBtPosition.y, this.screenConfig.prev_button.image, 
			function() {
				LetiFramework.Analytics.trackEvent("Narration", "Button Click", "Previous Page", 0);
				LetiFramework.GameController.previousPage();
			}, this, 2, 1, 0);
		this.prevBt.input.useHandCursor = true;
		this.prevBt.visible = false;

		if(this.currentGamePageData.transition.transition_type == "auto") {
			setTimeout(function() { LetiFramework.GameController.nextPage(); }, 
				this.currentGamePageData.transition.duration);
		} else {
			var nextBtPosition = this.screenConfig.next_button.position;
			this.nextBt = this.game.add.button(nextBtPosition.x, nextBtPosition.y, this.screenConfig.next_button.image, 
				function() {
					LetiFramework.Analytics.trackEvent("Narration", "Button Click", "Next Page", 0);
					LetiFramework.GameController.nextPage();			
				}, this, 2, 1, 0);
			this.nextBt.input.useHandCursor = true;
		}

		this.customizePageNavigationButtons();

		if(this.narrations.length > 0) {
			this.narrTextBg = this.getImageOrShapeBg(this.textBg);
			this.narrTextBg.alpha = this.textBg.alpha;

			var style = this.currentGamePageData.text_style;
			style.wordWrap = true;
			style.wordWrapWidth = this.textBg.width - this.textBg.padding;
			this.narrText = this.game.add.text(this.narrTextBg.x + this.narrTextBg.width / 2, this.narrTextBg.y + this.narrTextBg.height / 2, 
				this.narrations[this.narrationIdx], style);
			this.narrText.anchor.set(0.5);

	    	this.scene.add(this.narrTextBg);
	    	this.scene.add(this.narrText);

	    	if(this.narrations.length > 1) {
				this.narrNext = this.game.add.button(this.narrNextBt.position.x, this.narrNextBt.position.y, 
					this.getAssetPath(this.narrNextBt.image), 
					function() {
						LetiFramework.Analytics.trackEvent("Narration", "Button Click", "Next", 0);
						if(++this.narrationIdx < this.narrations.length) {
							this.narrText.text = this.narrations[this.narrationIdx];

							if(this.narrationIdx + 1 == this.narrations.length) {
								this.narrNext.destroy();
							}
						}
					}, this, 2, 1, 0);
				this.narrNext.scale.setTo(this.narrNextBt.width / this.narrNext.width, 
					this.narrNextBt.height / this.narrNext.height);
				this.narrNext.input.useHandCursor = true;		
		    	this.scene.add(this.narrNext);
			}
		}

		if(LetiFramework.App.isPhoneGap()) {
			this.bgSound = LetiFramework.SoundManager.getSound(this.bgSoundPath, false);
			this.narrationSound = LetiFramework.SoundManager.getSound(this.narrationSoundPath, false);
		} else {
			this.bgSound = this.game.add.audio(this.currentGamePageData.audio);
			this.narrationSound = this.game.add.audio(this.currentGamePageData.narration.audio);
		}	

		this.soundObjects.push(this.bgSound);
		this.soundObjects.push(this.narrationSound);

        if(LetiFramework.SoundManager.soundOn) {
			this.bgSound.play();
		}

		if(LetiFramework.SoundManager.narrationOn) {
			this.narrationSound.play();
		}	

		if(this.currentGamePageData.background_pan) {
			this.game.add.tween(this.bg.scale).to({x: this.bg.scale.x + 0.2, y: this.bg.scale.y + 0.2}, 3000 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(
            function() {
                this.game.add.tween(this.bg).to({x: this.bg.x + 50}, 3000 * this.animScale, Phaser.Easing.Linear.None, true, 0, 0, true).onComplete.add(
		            function(){
		                this.game.add.tween(this.bg.scale).to({x: this.bg.scale.x - 0.2, y: this.bg.scale.y - 0.2}, 3500 * this.animScale, Phaser.Easing.Linear.None, true)
		            }, this)
	        }, this);
		}	

		if(this.hud.visible) {
			this.hudGroup = this.game.add.group();
			this.hudGroup.x = this.hud.position.x;
			this.hudGroup.y = this.hud.position.y;
			this.hudGroup.width = this.hud.width;
			this.hudGroup.height = this.hud.height;

			var scoreLabel = this.game.add.text(0, 0, "Score:",  this.hud.label_style);
			var scoreText = this.game.add.text(scoreLabel.width + 10, 0, "" + this.currentUser.points,  this.hud.text_style);

			this.hudGroup.add(scoreLabel);
			this.hudGroup.add(scoreText);

			if(this.currentBadge) {
				var badgeLabel = this.game.add.text(scoreText.x + scoreText.width + 20, 0, "Current Badge:",  this.hud.label_style);
				var badge = this.game.add.sprite(badgeLabel.x + badgeLabel.width + 10, 0, this.getBadgePath(this.currentBadge.badge_image));
				badge.scale.setTo(48 / badge.width, 48 / badge.height);

				this.hudGroup.add(badgeLabel);
				this.hudGroup.add(badge);
			}

			this.scene.add(this.hudGroup);
		}

		var progressComponent = LetiFramework.GameController.currentStoryComponents.progress_component;
		if(progressComponent && this.currentGamePageData.progress_component) {
			var progressComponentBg = progressComponent.background;
			var progressImage = progressComponent.progress_image;
			var progressPages = progressComponent.progress_pages;

			if(progressComponentBg) {
				if(progressComponentBg.type == "image") {
					var pcBg = this.game.add.sprite(progressComponentBg.position.x, progressComponentBg.position.y, 
						this.getAssetPath(progressComponentBg.image));
					pcBg.scale.setTo(progressComponentBg.width / pcBg.width, progressComponentBg.height / pcBg.height);
					this.scene.add(pcBg);
				} else if(progressComponentBg.type == "shape") {
					var pcBg = this.game.add.graphics(progressComponentBg.position.x, progressComponentBg.position.y);
	        		pcBg.beginFill(progressComponentBg.color, 1);
	        		pcBg.alpha = progressComponentBg.alpha;
	        		if(progressComponentBg.shape == "round_rect") {
	        			pcBg.drawRoundedRect(0, 0, progressComponentBg.width, progressComponentBg.height, progressComponentBg.radius);
	        		} else if(progressComponentBg.shape == "rect") {
	        			pcBg.drawRect(0, 0, progressComponentBg.width, progressComponentBg.height);
	        		}				
					pcBg.endFill();
					this.scene.add(pcBg);
				}
			}

			var pc = this.game.add.sprite(progressImage.position.x, progressImage.position.y, 
				this.getAssetPath(progressImage.image));
			pc.scale.setTo(progressImage.width / pc.width, progressImage.height / pc.height);
			pc.alpha = progressImage.alpha;
			this.scene.add(pc);

			//	A mask is a Graphics object
		    var mask = this.game.add.graphics(0, 0);
		    this.scene.add(mask);

		    //	Shapes drawn to the Graphics object must be filled.
		    mask.beginFill(0xffffff);

		    var pcValue = 0;

		    for(var i = progressPages.length - 1; i >= 0; i--) {
		    	var pg = progressPages[i];

		    	var currentUserLoc = LetiFramework.GameController.currentUserGameLocation;
		    	if(currentUserLoc.play_history.indexOf(pg) > -1) {
		    		pcValue = (i + 1) / progressPages.length;
		    		break;
		    	}
		    }

		    //	Here we'll draw a shape for the progress
		    mask.drawRect(progressImage.position.x, progressImage.position.y, 
		    	pcValue * progressImage.width + progressComponent.initial_value, progressImage.height);

		    //	And apply it to the Sprite
		    pc.mask = mask;
		}

		if(this.showBadge) {
			this.badgeDialog = new LetiFramework.Ui.BadgeDialog(this.game, this.badge);
			this.badgeDialog.show();
		}
  	},
  	getImageOrShapeBg: function(bg) {
        var theBg = null;
        if(bg.type == "image") {
            theBg = this.game.add.sprite(bg.position.x, bg.position.y, this.getAssetPath(bg.image));
            theBg.scale.setTo(bg.width / theBg.width, bg.height / theBg.height);
        } else if(bg.type == "shape") {
            theBg = this.game.add.graphics(bg.position.x, bg.position.y);
            theBg.beginFill(bg.color, 1);
            if(bg.shape == "round_rect") {
                theBg.drawRoundedRect(0, 0, bg.width, bg.height, bg.radius);
            } else if(bg.shape == "rect") {
                theBg.drawRect(0, 0, bg.width, bg.height);
            }           
            theBg.endFill();
        }
        return theBg;
    },
    customizePageNavigationButtons: function() {
        var prevPageBtConfig = this.currentGamePageData.prev_page_button;
        if(prevPageBtConfig && prevPageBtConfig.enabled) {
            this.prevBt.visible = true;         
            if(prevPageBtConfig.image) {
                this.prevBt.loadTexture(this.getAssetPath(prevPageBtConfig.image));
            }
            if(prevPageBtConfig.position) {
                this.prevBt.position.x = prevPageBtConfig.position.x;
                this.prevBt.position.y = prevPageBtConfig.position.y;
            }
        }

        var nextPageBtConfig = this.currentGamePageData.next_page_button;
        if(nextPageBtConfig && this.nextBt) {
            if(nextPageBtConfig.enabled == false) this.nextBt.visible = false;
            if(nextPageBtConfig.image) {
                this.nextBt.loadTexture(this.getAssetPath(nextPageBtConfig.image));
            }
            if(nextPageBtConfig.position) {
                this.nextBt.position.x = nextPageBtConfig.position.x;
                this.nextBt.position.y = nextPageBtConfig.position.y;
            }
        }
    },
  	addComponents: function() {
  		var components = this.pageComponents.concat(this.universalComponents);
        for(var i = 0; i < components.length; i++) {
            var asset = components[i];

            var componentsOverride = this.currentGamePageData.components_override;
            if(asset.name && componentsOverride && componentsOverride[asset.name]) {
                if(componentsOverride[asset.name].hidden == true) continue;
                var assetOverride = {};
                for(var k in asset) {
                    assetOverride[k] = asset[k];
                }
                for(var k in componentsOverride[asset.name]) {
                    if(k == "animation") {
                        var val = componentsOverride[asset.name][k];
                        if(typeof val === 'string') {
                            assetOverride[k] = LetiFramework.GameController.currentStoryComponents[val];
                        } else {
                            assetOverride[k] = val;
                        }
                    } else {
                        assetOverride[k] = componentsOverride[asset.name][k];
                    }                    
                }
                asset = assetOverride;
            }

        	var position = asset.position;
        	var animations = asset.animation;
        	var interactivity = asset.interactivity;
        	var cmp = null;       	

        	if(asset.type == "shape") {        		
        		cmp = this.game.add.graphics(position.x, position.y);
        		cmp.beginFill(asset.color, 1);
        		cmp.alpha = asset.alpha;
        		if(asset.shape == "round_rect") {
        			cmp.drawRoundedRect(0, 0, asset.width, asset.height, asset.radius);
        		} else if(asset.shape == "rect") {
        			cmp.drawRect(0, 0, asset.width, asset.height);
        		}				
				cmp.endFill();
				this.scene.add(cmp);
        	}
        	else if(asset.type == "text") {
        		cmp = this.game.add.text(
        			position.x, position.y, asset.text, asset.style);
        		this.scene.add(cmp);
        	}
        	else if(asset.type == "image") {
        		cmp = this.game.add.sprite(position.x, position.y, this.getAssetPath(asset.image));
        		if(asset.hidden) cmp.visible = false;
        		this.pageSprites[asset.image] = cmp;
        		if(asset.width && asset.height) {
        			cmp.scale.setTo(asset.width / cmp.width, asset.height / cmp.height);
        		}
        		cmp.x += cmp.width * 0.5;
        		cmp.y += cmp.height * 0.5;
        		cmp.anchor.set(0.5);
        		this.scene.add(cmp);
        	}
        	else if(asset.type == "spritesheet") {
        		cmp = this.game.add.sprite(position.x, position.y, this.getAssetPath(asset.image));
        		if(asset.hidden) cmp.visible = false;
        		this.pageSprites[asset.image] = cmp;
        		cmp.scale.setTo(asset.width / asset.frame_width, asset.height / asset.frame_height);
        		cmp.x += cmp.width * 0.5;
        		cmp.y += cmp.height * 0.5;
        		cmp.anchor.set(0.5);
        		this.scene.add(cmp);

        		if(asset.frames_1) {
                    cmp.animations.add(asset.anim_name, asset.frames_1);
                } else {
                    var frames = [];
                    for(var j = asset.start_pos; j <= asset.stop_pos; j++) {
                        frames.push(j);
                    }
                    cmp.animations.add(asset.anim_name, frames);
                }
                
        		if(asset.frames_2){
        			//inverse animation
        			cmp.animations.add(asset.anim_name + "_inv", asset.frames_2);
        		}

        		if(asset.start == "auto"){
        			var anim = cmp.animations.play(asset.anim_name, asset.fps, asset.loop != 0);
        			if(asset.loop > 0) {
        				anim.onLoop.add(function(sprite, animation) {
    						if(animation.loopCount === this.loop) {
						        animation.loop = false;
						    }
    					}, asset);
    					anim.onComplete.add(function(sprite, animation) {
    						sprite.frame = this.start_pos;
    					}, asset);
        			}
        		} else if(asset.start == "click") {
        			cmp.inputEnabled = true;    			
        			cmp.events.onInputDown.add(function(src) {
        				var _this = LetiFramework.Renderer.currentState();
                        var log = {"user": _this.currentUser.nickname, "story": _this.currentGame.name, 
                            "page": _this.currentGamePage,  "asset": this.image};
                        LetiFramework.Analytics.trackEvent("Narration", "Interactivity", log, 0);

        				var anim = src.animations.play(this.anim_name, this.fps, this.loop != 0);
        				if(this.loop > 0) {
        					anim.onLoop.add(function(sprite, animation) {
        						if(animation.loopCount === this.loop) {
							        animation.loop = false;
							    }
        					}, this);
        					anim.onComplete.add(function(sprite, animation) {
        						sprite.frame = this.start_pos;
        					}, this);
        				}
    				}, asset);
        		}    			
        	}

        	if(cmp && asset.link) {
                cmp.inputEnabled = true;
                cmp.input.useHandCursor = true
                cmp.events.onInputDown.add(function() {
                    if(LetiFramework.App.isPhoneGap()) {
                        window.open(this.link, '_system');
                    } else {
                        window.open(this.link);
                    }                   
                }, asset);
            }

        	if(animations && cmp) {
        		for(var j = 0; j < animations.length; j++) {
        			var animation = animations[j];
        			if(animation.anim_type == "scale") {
	        			var scaleBy = animation.scale_value;
	        			var duration = animation.duration * this.animScale;
	        			var delay = animation.delay;
	        			this.game.add.tween(cmp.scale).to({x: scaleBy, y: scaleBy}, duration, 
	                		Phaser.Easing.Linear.None, true, delay, animation.loop, animation.yoyo);
	        		}
	        		else if(animation.anim_type == "translate"){
	        			var location = animation.location;
	        			var duration = animation.duration * this.animScale;
	        			var delay = animation.delay;
	        			var tween = this.game.add.tween(cmp).to(location, duration, 
	                		Phaser.Easing.Linear.None, true, delay, animation.loop, animation.yoyo);
	        			if(asset.stop_on_anim_end) {
	        				tween.onComplete.add(function(sprite, tween) {
	        					sprite.animations.stop();
	        					sprite.frame = this.stop_pos;
		        			}, asset);
	        			}	
	        			if(asset.type == "spritesheet" && asset.frames_2 && animation.yoyo) {
	        				tween.onLoop.add(function(sprite, tween) {
	        					var name = sprite.animations.name == this.anim_name ?
	        						this.anim_name + "_inv" : this.anim_name;
	        					var anim = sprite.animations.play(name, asset.fps, asset.loop != 0);
	        				}, asset);
	        			}
	        		}
        		}        		
        	}

        	if(interactivity && cmp) {
        		if(interactivity.action == "click") {
        			cmp.inputEnabled = true;    	
        			cmp.input.useHandCursor = true;
        			cmp.events.onInputDown.add(function(src) {
        				var _this = LetiFramework.Renderer.currentState();
                        var log = {"user": _this.currentUser.nickname, "story": _this.currentGame.name, 
                            "page": _this.currentGamePage,  "asset": this.asset.image};
                        LetiFramework.Analytics.trackEvent("Narration", "Interactivity", log, 0);

        				var animations = this.asset.interactivity.animation;
        				var audio = this.asset.interactivity.audio;
        				var toggle = this.asset.interactivity.toggle;
        				var nav = this.asset.interactivity.navigate;
        				var nav_to = this.asset.interactivity.navigate_to_page;
        				var choice = this.asset.interactivity.choice;

        				if(choice == true) {
        					this.ctx.saveUserGamePlay([this.asset.name]);
        				}

        				if(animations) {
        					for(var j = 0; j < animations.length; j++) {
			        			var animation = animations[j];
			        			if(animation.anim_type == "translate") {
			        				var duration = animation.duration * this.ctx.animScale;
			        				var delay = animation.delay;
			        				this.ctx.game.add.tween(src)
			        					.to(animation.location, duration, Phaser.Easing.Linear.None, false, delay)
			        					.to(this.position, duration, Phaser.Easing.Linear.None).start();
				        		}
			        		}
        				}
        				if(audio) {
        					if(LetiFramework.SoundManager.soundOn) {
        						_this.componentSound = _this.componentSound || {};
                                var snd = _this.componentSound[audio];
                                if(!snd) {
                                    if(LetiFramework.App.isPhoneGap()) {
                                        var soundPath = _this.getSoundPath(audio);
                                        snd = LetiFramework.SoundManager.getSound(soundPath, false);
                                    } else {
                                        snd = _this.game.add.audio(audio);
                                    }
                                    _this.componentSound[audio] = snd;
                                    _this.soundObjects.push(snd);
                                }                                
                                snd.play();
        					}			
        				}
        				if(toggle) {
        					for(var j = 0; j < toggle.length; j++) {
        						var cmp = _this.pageSprites[toggle[j]];
        						cmp.visible = !cmp.visible;
        					}
        				}
        				if(nav) {
        					LetiFramework.GameController.nextPage();
        				} else if(nav_to) {
        					LetiFramework.GameController.nextGamePage = nav_to;
        					LetiFramework.GameController.nextPage();
        				}
        			}, {asset: asset, index: i, position: {x: cmp.x, y: cmp.y}, ctx: this});
        		}
        	}
        } // end for i
  	},
  	saveUserGamePlay: function(selection) {
        if(selection) {
            var ugp = new LetiFramework.DbEntities.UserGamePlay(this.currentUser.id, this.currentGame.id, 
                this.currentGamePage, selection);
            LetiFramework.Db.create("user_game_play", ugp);
        }
    },
	shutdown: function() {
		this.scene.destroy();
		for(var i = 0; i < this.soundObjects.length; i++) {
			this.soundObjects[i].destroy();
		}
	},
	pause: function() {
		if(LetiFramework.SoundManager.soundOn) {
			this.bgSound.pause();
		}

		if(LetiFramework.SoundManager.narrationOn) {
			this.narrationSound.pause();
		}
	},
	resume: function() {
		if(LetiFramework.SoundManager.soundOn) {
			this.bgSound.paused ? this.bgSound.resume() : this.bgSound.play();
		}

		if(LetiFramework.SoundManager.narrationOn) {
			this.narrationSound.paused ? this.narrationSound.resume() : this.narrationSound.play();
		}		
	},
	getScreenConfigImagePath: function(name) {
		return "assets/img/" + name;
	},
  	getAssetPath: function(name) {
        return 'assets/stories/' + this.currentGame.storyId +  '/episodes/' + this.currentGame.id + '/content/assets/' + this.currentGamePage + '/' + name;
    },
    getBadgePath: function(name) {
        return 'assets/stories/' + this.currentGame.storyId +  '/episodes/' + this.currentGame.id + '/content/badges/' + name;
    },
    getSoundPath: function(name) {
        if(LetiFramework.App.isPhoneGap()) {
            return LetiFramework.FileManager.getEpisodeSoundFilePath(
                this.currentGame.storyId, this.currentGame.id, name);
        }
        return 'assets/stories/' + this.currentGame.storyId +  '/episodes/' + this.currentGame.id + '/content/sound/' + name;
    },
    loadImageFile: function(fileName) {
        var key = this.getAssetPath(fileName);
        if(LetiFramework.App.isPhoneGap()) {
            var url = LetiFramework.FileManager.getEpisodeAssetFilePath(
                this.currentGame.storyId, this.currentGame.id, this.currentGamePage + '/' + fileName);
            this.game.load.image(key, url);
        } else {
            this.game.load.image(key, key);
        }  
        return key;    
    },
    loadSpriteSheetFile: function(fileName, frameWidth, frameHeight) {
        var key = this.getAssetPath(fileName);
        if(LetiFramework.App.isPhoneGap()) {
            var url = LetiFramework.FileManager.getEpisodeAssetFilePath(
                this.currentGame.storyId, this.currentGame.id, this.currentGamePage + '/' + fileName);
            this.game.load.spritesheet(key, url, frameWidth, frameHeight);
        } else {
            this.game.load.spritesheet(key, key, frameWidth, frameHeight);
        }  
        return key;    
    },
    loadBadgeFile: function(fileName) {     
        var key = this.getBadgePath(fileName);
        if(LetiFramework.App.isPhoneGap()) {
            var url = LetiFramework.FileManager.getEpisodeBadgeFilePath(
                this.currentGame.storyId, this.currentGame.id, fileName);
            this.game.load.image(key, url);         
        } else {            
            this.game.load.image(key, key); 
        }     
        return key; 
    }
}