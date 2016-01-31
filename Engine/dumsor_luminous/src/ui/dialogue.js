var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.dialogue = function(game) {}

LetiFramework.Ui.dialogue.prototype = {
	init: function() {
		LetiFramework.Analytics.trackPage("Dialogue");
		this.screenConfig = LetiFramework.GameController.screensConfig.dialogue;
		this.hud = LetiFramework.GameController.screensConfig.hud;
		this.animScale = LetiFramework.Renderer.animScale;
		this.currentUser = LetiFramework.GameController.currentUser;
		this.currentGame = LetiFramework.GameController.currentGame;
		this.currentGamePage = LetiFramework.GameController.currentGamePage;
		this.currentGamePageData = LetiFramework.GameController.currentGamePageData;
		this.badge = this.currentGamePageData.badge;
		this.textBg = this.currentGamePageData.text_background;
		this.narrNextBt = this.currentGamePageData.next_button;
		this.dialogues = this.currentGamePageData.dialogues;
		this.characters = this.currentGamePageData.characters;
		this.dialogueIdx = -1;
		this.pageComponents = [];
		this.soundObjects = [];
		this.pageSprites = {};
		this.dialogueComponents = {};
		this.universalComponents = LetiFramework.GameController.currentStoryComponents.universal_components || [];
		this.charSprites = [];
		this.charSpritesFramesData = [];
		this.duration = this.currentGamePageData.intro_duration || 5;
		this.auto_read_mode_disabled = this.currentGamePageData.auto_read_mode_disabled == true;

		if(this.currentUser.dialogueReadMode == null) {
			var readModeBtConfig = this.screenConfig.read_mode_button;
			var readMode = readModeBtConfig.default_mode == "auto" ? 1 : 0;
			if(this.currentGamePageData.read_mode) {
				readMode = this.currentGamePageData.read_mode == "auto" ? 1 : 0;
			}
			this.currentUser.dialogueReadMode = readMode;
			LetiFramework.Db.update("users", this.currentUser);
		}

		if(this.currentGamePageData.components) {
			this.pageComponents = LetiFramework.GameController.currentStoryComponents[
				this.currentGamePageData.components];
		}
		for(var i = 0; i < this.dialogues.length; i++) {
			var dialogue = this.dialogues[i];
			if(dialogue.components) {
				var moreComponents = LetiFramework.GameController.currentStoryComponents[dialogue.components];
				this.dialogueComponents[dialogue.components] = moreComponents;
			}
		}

		if(this.currentGamePageData.points) {
            var rs = LetiFramework.Db.readByKeysAndValues("scores", ["user_id", "game_id", "activity"],
                        [this.currentUser.id, this.currentGame.id, this.currentGamePage]);

            if(rs.length == 0) {  
                this.currentUser.points += this.currentGamePageData.points;
                LetiFramework.Db.update("users", this.currentUser);

                var log = {"user": this.currentUser.nickname, "story": this.currentGame.name, 
                                "page": this.currentGamePage,  "points": this.currentGamePageData.points};
                LetiFramework.Analytics.trackEvent("Dialogue", "Points Score", log, 0);                

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
		this.loadImageFile(this.narrNextBt.image);
		if(nextPageBtConfig && nextPageBtConfig.image) {			
			this.loadImageFile(nextPageBtConfig.image);
		}
		if(prevPageBtConfig && prevPageBtConfig.image) {
			this.loadImageFile(prevPageBtConfig.image);
		}

		var readModeBtConfig = this.screenConfig.read_mode_button;
		if(readModeBtConfig.type == "image") {
			var readModeBtImg = readModeBtConfig.image;
			this.game.load.image(readModeBtImg.auto, this.getScreenConfigImagePath(readModeBtImg.auto));
			this.game.load.image(readModeBtImg.manual, this.getScreenConfigImagePath(readModeBtImg.manual));
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

		for(var i = 0; i < this.characters.length; i++) {
			var character = this.characters[i];
			this.loadCharacterFile(character.char_pic, character.frames.width, character.frames.height);
		}

		for(var i = 0; i < this.dialogues.length; i++) {
			var dialogue = this.dialogues[i];

			if(dialogue.pic.length > 0) {
				this.loadImageFile(dialogue.pic);
			}

			if(dialogue.char_pic.length > 0) {
				this.loadCharacterFile(dialogue.char_pic, dialogue.frames.width, dialogue.frames.height);
			}

			if(dialogue.sound.length > 0 && !LetiFramework.App.isPhoneGap()) {
				this.game.load.audio(dialogue.sound, this.getSoundPath(dialogue.sound));
			}

			if(dialogue.components) {
				var moreComponents = this.dialogueComponents[dialogue.components];
				for(var j = 0; j < moreComponents.length; j++) {
					var cmp = moreComponents[j];
					if(cmp.image) {
						if(cmp.type == 'spritesheet') {
							this.loadSpriteSheetFile(cmp.image, cmp.width, cmp.height);
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
			}

			this.loadBubbleFile(dialogue.bubble.image);
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
		}		

		this.bgSoundPath = this.getSoundPath(this.currentGamePageData.audio);		
	},
	create: function() {
		this.scene = this.game.add.group();

		this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, this.bgKey);
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);

        this.scene.add(this.bg);

        this.addComponents(this.pageComponents);

        var optionsBt = this.screenConfig.options_button;
        var optionsDropDown = optionsBt.children;
        var optionsHomeBt = optionsDropDown.home_button;
        var optionsSoundBt = optionsDropDown.sound_button;
        var optionsMusicBt = optionsDropDown.music_button;
		var optionsBtPosition = this.screenConfig.options_button.position;

		this.homeBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y, optionsDropDown.home_button.image, 
			function() {
				LetiFramework.Analytics.trackEvent("Dialogue", "Button Click", "Home", 0);
				LetiFramework.Renderer.render("Menu");
			}, this, 2, 1, 0);
		this.homeBt.input.useHandCursor = true;
		this.homeBt.alpha = 0;

		this.soundBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y, 
			LetiFramework.SoundManager.narrationOn ? optionsSoundBt.on_image : optionsSoundBt.off_image, 
			function() {
				LetiFramework.SoundManager.narrationOn = !LetiFramework.SoundManager.narrationOn;
	        	if(LetiFramework.SoundManager.narrationOn) {
	        		LetiFramework.Analytics.trackEvent("Dialogue", "Button Click", "Sound On", 0);
	        		this.soundBt.loadTexture(this.screenConfig.options_button.children.sound_button.on_image);
	        		var dialogueSound = this.dialogueSounds[this.dialogueIdx];
	        		dialogueSound && (dialogueSound.paused ? dialogueSound.resume() : dialogueSound.play());
	        	} else {
	        		LetiFramework.Analytics.trackEvent("Dialogue", "Button Click", "Sound Off", 0);
	        		this.soundBt.loadTexture(this.screenConfig.options_button.children.sound_button.off_image);
	        		var dialogueSound = this.dialogueSounds[this.dialogueIdx];
	        		dialogueSound && dialogueSound.stop();
	        	}
			}, this, 2, 1, 0);
		this.soundBt.input.useHandCursor = true;
		this.soundBt.alpha = 0;

		this.musicBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y, 
			LetiFramework.SoundManager.soundOn ? optionsMusicBt.on_image : optionsMusicBt.off_image, 
			function() {
				LetiFramework.SoundManager.soundOn = !LetiFramework.SoundManager.soundOn;
	    		if(LetiFramework.SoundManager.soundOn) {
	    			LetiFramework.Analytics.trackEvent("Dialogue", "Button Click", "Music On", 0);
	    			this.musicBt.loadTexture(this.screenConfig.options_button.children.music_button.on_image);
	    			this.bgSound.paused ? this.bgSound.resume() : this.bgSound.play();					
				} else {
					LetiFramework.Analytics.trackEvent("Dialogue", "Button Click", "Music Off", 0);
					this.musicBt.loadTexture(this.screenConfig.options_button.children.music_button.off_image);
					this.bgSound.pause();
				}
			}, this, 2, 1, 0);
		this.musicBt.input.useHandCursor = true;
		this.musicBt.alpha = 0;
		
		this.optionsBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y, optionsBt.image, 
			function() {
				LetiFramework.Analytics.trackEvent("Dialogue", "Button Click", "Options", 0);

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
				LetiFramework.Analytics.trackEvent("Dialogue", "Button Click", "Previous Page", 0);
				LetiFramework.GameController.previousPage();
			}, this, 2, 1, 0);
		this.prevBt.input.useHandCursor = true;
		this.prevBt.visible = false;

		var nextBtPosition = this.screenConfig.next_button.position;
		this.nextBt = this.game.add.button(nextBtPosition.x, nextBtPosition.y, this.screenConfig.next_button.image, 
			function() {
				LetiFramework.Analytics.trackEvent("Dialogue", "Button Click", "Next Page", 0);
				LetiFramework.GameController.nextPage();			
			}, this, 2, 1, 0);
		this.nextBt.input.useHandCursor = true;
		if(!this.currentGamePageData.skippable) {
			this.nextBt.visible = false;
		}

		this.customizePageNavigationButtons();

		this.dialogueSounds = [];
		for (var i = 0; i < this.dialogues.length; i++) {
			var dialogue = this.dialogues[i];		
			
			if(LetiFramework.App.isPhoneGap()) {
				this.dialogueSounds.push(dialogue.sound.length > 0 && LetiFramework.SoundManager.soundOn ? 
					LetiFramework.SoundManager.getSound(this.getSoundPath(dialogue.sound)) : null);
			}
			else {
				this.dialogueSounds.push(dialogue.sound.length > 0 && LetiFramework.SoundManager.soundOn ? 
					this.game.add.audio(dialogue.sound) : null);
			}				
		}

		this.narrNext = this.game.add.button(this.narrNextBt.position.x, this.narrNextBt.position.y, this.getAssetPath(this.narrNextBt.image), function() {
			LetiFramework.Analytics.trackEvent("Dialogue", "Button Click", "Next", 0);			
			this.nextDialogue();
		}, this, 2, 1, 0);
		this.narrNext.scale.setTo(this.narrNextBt.width / this.narrNext.width, this.narrNextBt.height / this.narrNext.height);
		this.narrNext.input.useHandCursor = true;

		if(this.currentGamePageData.text.length > 0) {
			this.narrTextBg = this.getImageOrShapeBg(this.textBg);
			this.narrTextBg.alpha = this.textBg.alpha;

			var style = this.currentGamePageData.text_style;
			style.wordWrap = true;
			style.wordWrapWidth = this.textBg.width - this.textBg.padding;
			this.narrText = this.game.add.text(this.narrTextBg.x + this.narrTextBg.width / 2, this.narrTextBg.y + this.narrTextBg.height / 2, this.currentGamePageData.text, style);
			this.narrText.anchor.set(0.5);
		} else {
			this.nextDialogue();
		}		

		var readModeBtConfig = this.screenConfig.read_mode_button;    
        if(readModeBtConfig.type == "image") {
        	var readModeImg = this.currentUser.dialogueReadMode == 0 ? readModeBtConfig.image.manual : readModeBtConfig.image.auto;
          	this.readModeBt = this.game.add.sprite(readModeBtConfig.position.x, readModeBtConfig.position.y, readModeImg);
          	this.readModeBt.scale.setTo(readModeBtConfig.width / this.readModeBt.width, readModeBtConfig.height / this.readModeBt.height);
          	this.readModeBt.inputEnabled = true;  
          	this.readModeBt.input.useHandCursor = true;
          	this.readModeBt.events.onInputDown.add(this.readModeHandler, this);
        } else if(readModeBtConfig.type == "button") {
        	var readModeTxt = this.currentUser.dialogueReadMode == 0 ? "Manual" : "Auto";
        	this.readModeBt = new LetiFramework.Ui.Button(this.game, readModeBtConfig.position.x, readModeBtConfig.position.y, readModeBtConfig.width, 
                readModeBtConfig.height, readModeTxt, readModeBtConfig.text_style, readModeBtConfig.button_style, 
                this.readModeHandler, this);
        }    

		if(LetiFramework.App.isPhoneGap()) {
            this.bgSound = LetiFramework.SoundManager.getSound(this.bgSoundPath, false);
        } else {
            this.bgSound = this.game.add.audio(this.currentGamePageData.audio);
        }   

        this.soundObjects.push(this.bgSound);

        if(LetiFramework.SoundManager.soundOn) {
            this.bgSound.play();
        }

        this.addHud();

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
		
		if(this.currentUser.dialogueReadMode == 1 && !this.auto_read_mode_disabled) {
			this.narrNext.visible = false;
  			var self = this;
			this.dialogueTimeout = setTimeout(function() {
				self.autoNextDialogue();
			}, this.duration * 1000);
		}
  	},
  	readModeHandler: function() {
  		this.currentUser.dialogueReadMode = this.currentUser.dialogueReadMode == 0 ? 1 : 0;
  		LetiFramework.Db.update("users", this.currentUser);

  		var readModeBtConfig = this.screenConfig.read_mode_button;
  		if(readModeBtConfig.type == "button") {
  			var readModeTxt = this.currentUser.dialogueReadMode == 0 ? "Manual" : "Auto";
  			this.readModeBt.setText(readModeTxt);
  		} else {
  			var readModeBtImg = readModeBtConfig.image;
  			this.readModeBt.loadTexture(this.currentUser.dialogueReadMode == 0 ? 
  				readModeBtImg.manual : readModeBtImg.auto);
  		}

  		if(this.auto_read_mode_disabled == true) return;

  		if(this.currentUser.dialogueReadMode == 0) {
  			this.narrNext.visible = true;
  			if(this.dialogueTimeout) {
  				clearTimeout(this.dialogueTimeout);
  			}
  		} else {
  			this.narrNext.visible = false;
  			var self = this;
			this.dialogueTimeout = setTimeout(function() {
				self.autoNextDialogue();
			}, this.duration * 1000);
  		}
  	},
  	autoNextDialogue: function() {  
  		this.nextDialogue();
  		var self = this;
		this.dialogueTimeout = setTimeout(function() {
			self.autoNextDialogue();
		}, this.duration * 1000);		
  	},
  	addHud: function() {
  		if(this.hud.visible) {
  			if(this.hudGroup) this.hudGroup.destroy();
  			
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
  	},
  	createCharSprites: function() {
  		for(var i = 0; i < this.characters.length; i++) {
			var character = this.characters[i];
			var charSprite = this.game.add.sprite(character.position.x, character.position.y, this.getCharacterPicPath(character.char_pic));
			charSprite.scale.setTo(character.char_scale);
			var frames = [];
            for(var j = character.frames.start_pos; j <= character.frames.stop_pos; j++) {
                frames.push(j);
            }
            charSprite.animations.add("char_anim" + i, frames);
			this.charSprites.push(charSprite);
			this.charSpritesFramesData.push(character.frames);
		}
  	},
  	nextDialogue: function() {
  		if(this.dialogueIdx == -1) {
  			if(this.narrText) {
  				this.narrText.destroy();
				this.narrTextBg.destroy();
  			}			
			this.createCharSprites();
		}

  		this.dialogueIdx++;		

		if(this.dialogueIdx < this.dialogues.length) {
			var dialogue = this.dialogues[this.dialogueIdx];

			this.duration = dialogue.duration || 5;

			if(this.dialogueTextGrp) {
				this.dialogueTextGrp.destroy();
			}

			if(dialogue.pic.length > 0) {
				this.bg.loadTexture(this.getAssetPath(dialogue.pic));					
			}

			if(dialogue.components != null) {
				if(dialogue.components.length == 0) {
					this.addComponents(this.universalComponents);
				} else {
					var componentsToAdd = this.dialogueComponents[dialogue.components];
					this.addComponents(componentsToAdd);
					this.addHud();
				}
			}

			var idx = dialogue.character - 1;
			var charSprite = this.charSprites[idx];
			var fps = this.charSpritesFramesData[idx].fps;
			var loop = this.charSpritesFramesData[idx].loop;
			if(dialogue.char_pic.length > 0) {
				charSprite.destroy();
				charSprite = this.game.add.sprite(dialogue.position.x, dialogue.position.y, this.getCharacterPicPath(dialogue.char_pic));					
				fps = dialogue.frames.fps;
				loop = dialogue.frames.loop;
				this.charSprites[idx] = charSprite;
				this.charSpritesFramesData[idx] = dialogue.frames;
				var frames = [];
                for(var j = dialogue.frames.start_pos; j <= dialogue.frames.stop_pos; j++) {
                    frames.push(j);
                }
                charSprite.animations.add("char_anim" + idx, frames);			
			}
			charSprite.animations.stop("char_anim" + idx, true);
			//charSprite.x = dialogue.position.x;
			//charSprite.y = dialogue.position.y;
			charSprite.scale.setTo(dialogue.char_scale);
			var charSpriteAnim = charSprite.animations.play("char_anim" + idx, fps, loop != 0);
			if(loop > 0) {
				charSpriteAnim.onLoop.add(function(sprite, animation) {
					if(animation.loopCount === this.loop) {
				        animation.loop = false;
				    }
				}, this.charSpritesFramesData[idx]);
				charSpriteAnim.onComplete.add(function(sprite, animation) {
					sprite.frame = this.start_pos;
				}, this.charSpritesFramesData[idx]);
			}

			this.dialogueTextGrp = this.game.add.group();
			this.dialogueTextGrp.x = dialogue.bubble.position.x;
			this.dialogueTextGrp.y = dialogue.bubble.position.y;
			this.dialogueTextGrp.width = dialogue.bubble.width;
			this.dialogueTextGrp.height = dialogue.bubble.height;

			this.speechBubble = this.game.add.sprite(0, 0, this.getBubblePicPath(dialogue.bubble.image));			

			var style = dialogue.text_style;
			style.wordWrap = true;

			if(style.width) {
				style.padding = style.padding || [0,0,0,0];
				var pL = style.padding[0];
				var pT = style.padding[1];
				var pR = style.padding[2];
				var pB = style.padding[3];
				style.wordWrapWidth = style.width;
				this.speechText = this.game.add.text(0, 0, dialogue.text, style);
				this.speechBubble.scale.setTo((style.width + pL + pR) / this.speechBubble.width,
					(this.speechText.height + pT + pB) / this.speechBubble.height);
				this.speechBubble.x = 0;
				this.speechBubble.y = 0;
				this.speechText.x += pL;
				this.speechText.y += pT;
			} else {
				this.speechBubble.scale.setTo(
					dialogue.bubble.width / this.speechBubble.width, dialogue.bubble.height / this.speechBubble.height);
				style.wordWrapWidth = this.speechBubble.width - dialogue.bubble.padding;
				this.speechText = this.game.add.text(this.speechBubble.x + this.speechBubble.width / 2, 
					this.speechBubble.y + dialogue.bubble.padding, dialogue.text, style);
				this.speechText.anchor.set(0.5, 0);	
			}

			this.dialogueTextGrp.add(this.speechBubble);			
			this.dialogueTextGrp.add(this.speechText);
			this.dialogueTextGrp.scale.setTo(dialogue.bubble_text_scale);

			if(dialogue.bubble.animation) {
				var anim = dialogue.bubble.animation;
				if(anim.type == "fadeIn") {
					this.game.add.tween(this.dialogueTextGrp).from(
						{alpha: 0}, anim.duration * this.animScale, Phaser.Easing.Linear.None, true);
				}
				else if(anim.type == "translateFrom") {
					this.game.add.tween(this.dialogueTextGrp).from(
						anim.position, anim.duration * this.animScale, Phaser.Easing.Linear.None, true);
				}				
			}

			if(LetiFramework.SoundManager.narrationOn) {
				var dialogueSound = this.dialogueSounds[this.dialogueIdx];
	        	var prevDialogueSound = this.dialogueIdx > 0 ? this.dialogueSounds[this.dialogueIdx - 1] : null;

	        	dialogueSound && dialogueSound.play();
	        	prevDialogueSound && prevDialogueSound.stop();
			}				

			if(this.dialogueIdx == this.dialogues.length - 1) {
				this.narrNext.destroy();				
				var autoTransition = this.currentGamePageData.auto_transition;
				if(this.currentUser.dialogueReadMode == 0 || this.auto_read_mode_disabled == true || (autoTransition && autoTransition == false)) {
					this.nextBt.visible = true;
				} else {
					setTimeout(function() {
						LetiFramework.GameController.nextPage(); }, this.duration * 1000);					
				}				
			}
		}
  	},
	shutdown: function() {
		this.scene.destroy();
		if(this.dialogueTimeout) {
			clearTimeout(this.dialogueTimeout);
		}
		for(var i = 0; i < this.soundObjects.length; i++) {
			this.soundObjects[i].destroy();
		}
		for (var i = this.dialogueSounds.length - 1; i >= 0; i--) {
            var dialogueSound = this.dialogueSounds[i];
            dialogueSound && dialogueSound.destroy();  
        }
	},
	pause: function() {
		if(LetiFramework.SoundManager.soundOn) {
			this.bgSound.pause();
		}

		if(LetiFramework.SoundManager.narrationOn) {
			var dialogueSound = this.dialogueSounds[this.dialogueIdx];
			dialogueSound && dialogueSound.pause();
		}
	},
	resume: function() {
		if(LetiFramework.SoundManager.soundOn) {
			this.bgSound.paused ? this.bgSound.resume() : this.bgSound.play();
		}

		if(LetiFramework.SoundManager.narrationOn) {
			var dialogueSound = this.dialogueSounds[this.dialogueIdx];
			dialogueSound && (this.dialogueSound.paused ? this.dialogueSound.resume() : this.dialogueSound.play());
		}		
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
  	addComponents: function(componentsToAdd) {
  		if(this.componentsGroup) {
  			this.componentsGroup.destroy();
  		}
  		this.componentsGroup = this.game.add.group();

  		var components;
  		if(componentsToAdd == this.universalComponents) {
  			components = componentsToAdd;
  		} else {
  			components = componentsToAdd.concat(this.universalComponents);  			
  		}
  		
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
				this.componentsGroup.add(cmp);
        	}
        	else if(asset.type == "text") {
        		cmp = this.game.add.text(
        			position.x, position.y, asset.text, asset.style);
        		this.componentsGroup.add(cmp);
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
        		this.componentsGroup.add(cmp);
        	}
        	else if(asset.type == "spritesheet") {
        		cmp = this.game.add.sprite(position.x, position.y, this.getAssetPath(asset.image));
        		if(asset.hidden) cmp.visible = false;
        		this.pageSprites[asset.image] = cmp;
        		cmp.scale.setTo(asset.width / asset.frame_width, asset.height / asset.frame_height);
        		cmp.x += cmp.width * 0.5;
        		cmp.y += cmp.height * 0.5;
        		cmp.anchor.set(0.5);
        		this.componentsGroup.add(cmp);

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
                        LetiFramework.Analytics.trackEvent("Dialogue", "Interactivity", log, 0);

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
                        LetiFramework.Analytics.trackEvent("Dialogue", "Interactivity", log, 0);

        				var animations = this.asset.interactivity.animation;
        				var audio = this.asset.interactivity.audio;
        				var toggle = this.asset.interactivity.toggle;
        				var nav = this.asset.interactivity.navigate;
        				var nav_to = this.asset.interactivity.navigate_to_page;
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
        this.scene.add(this.componentsGroup);
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
	getScreenConfigImagePath: function(name) {
		return "assets/img/" + name;
	},
  	getAssetPath: function(name) {
        return 'assets/stories/' + this.currentGame.storyId +  '/episodes/' + this.currentGame.id + '/content/assets/' + this.currentGamePage + '/' + name;
    },
    getBadgePath: function(name) {
        return 'assets/stories/' + this.currentGame.storyId +  '/episodes/' + this.currentGame.id + '/content/badges/' + name;
    },
  	getBubblePicPath: function(name) {
  		return 'assets/stories/' + this.currentGame.storyId +  '/episodes/' + this.currentGame.id + '/content/bubbles/' + name;
  	},
  	getCharacterPicPath: function(name) {
  		return 'assets/stories/' + this.currentGame.storyId +  '/episodes/' + this.currentGame.id + '/content/characters/' + name;
  	},
  	getSoundPath: function(name) {
  		if(LetiFramework.App.isPhoneGap()) {
  			return LetiFramework.FileManager.getEpisodeSoundFilePath(this.currentGame.storyId, this.currentGame.id, name);
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
    },
    loadBubbleFile: function(fileName) {    	
    	var key = this.getBubblePicPath(fileName);
        if(LetiFramework.App.isPhoneGap()) {
            var url = LetiFramework.FileManager.getEpisodeBubbleFilePath(
                this.currentGame.storyId, this.currentGame.id, fileName);
            this.game.load.image(key, url);          
        } else {            
            this.game.load.image(key, key); 
        }     
        return key; 
    },
    loadCharacterFile: function(fileName, frameWidth, frameHeight) {
  		var key = this.getCharacterPicPath(fileName);
        if(LetiFramework.App.isPhoneGap()) {
            var url = LetiFramework.FileManager.getEpisodeCharacterFilePath(
                this.currentGame.storyId, this.currentGame.id, fileName);
            this.game.load.spritesheet(key, url, frameWidth, frameHeight);
        } else {
            this.game.load.spritesheet(key, key, frameWidth, frameHeight);
        }  
        return key;    
    } 	
}