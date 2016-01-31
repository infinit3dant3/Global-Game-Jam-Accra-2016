var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.quiz = function(game) {}

LetiFramework.Ui.quiz.prototype = {
	init: function() {
		LetiFramework.Analytics.trackPage("Quiz");

		this.screenConfig = LetiFramework.GameController.screensConfig.quiz;	
		this.hud = LetiFramework.GameController.screensConfig.hud;	
		this.animScale = LetiFramework.Renderer.animScale;
		this.currentGame = LetiFramework.GameController.currentGame;
		this.currentGamePage = LetiFramework.GameController.currentGamePage;
		this.currentGamePageData = LetiFramework.GameController.currentGamePageData;
		this.quizComponents = LetiFramework.GameController.currentStoryQuiz[this.currentGamePageData.quiz];
		this.badges = this.currentGamePageData.badges;
		this.pageComponents = this.currentGamePageData.components ? 
			LetiFramework.GameController.currentStoryComponents[this.currentGamePageData.components] : [];
		this.universalComponents = LetiFramework.GameController.currentStoryComponents.universal_components || [];
		this.soundObjects = [];
		this.pageSprites = {};

		this.evaluated = false;
		this.questionItems = [];
		this.choiceHighlightComponents = [];
		this.quizPos = 0;
		this.correctCount = 0;
		this.score = 0;
		this.currentUser = LetiFramework.GameController.currentUser;
		this.userId = this.currentUser.id;
		this.userScore = new LetiFramework.DbEntities.Scores(
			this.userId, this.currentGame.id, this.currentGamePageData.quiz, 
			0, this.currentGamePageData.total_score, false);
		LetiFramework.Db.create("scores", this.userScore);
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

		var optionsDropDown = this.screenConfig.options_button.children;
		var prevPageBtConfig = this.currentGamePageData.prev_page_button;
        var nextPageBtConfig = this.currentGamePageData.next_page_button;

		this.game.load.image("homeBt", this.getScreenConfigImagePath(optionsDropDown.home_button.image));	
		this.game.load.image("soundOn", this.getScreenConfigImagePath(optionsDropDown.sound_button.on_image));	
		this.game.load.image("soundOff", this.getScreenConfigImagePath(optionsDropDown.sound_button.off_image));	
		this.game.load.image("musicOn", this.getScreenConfigImagePath(optionsDropDown.music_button.on_image));	
		this.game.load.image("musicOff", this.getScreenConfigImagePath(optionsDropDown.music_button.off_image));	
		this.game.load.image("optionsBt", this.getScreenConfigImagePath(this.screenConfig.options_button.image));
		this.game.load.image("nextBt", this.getScreenConfigImagePath(this.screenConfig.next_button.image));
		this.game.load.image("prevBt", this.getScreenConfigImagePath(this.screenConfig.prev_button.image));
		if(nextPageBtConfig && nextPageBtConfig.image) {			
			this.loadImageFile(nextPageBtConfig.image);
		}
		if(prevPageBtConfig && prevPageBtConfig.image) {
			this.loadImageFile(prevPageBtConfig.image);
		}

		if(this.currentGamePageData.result && this.currentGamePageData.result.background.type == "image") {
			this.loadImageFile(this.currentGamePageData.result.background.image);
		}

		if(this.badges) {
			for(var i = 0; i < this.badges.length; i++) {
				var badge = this.badges[i];
				var rs = jsonsql.query("select * from LetiFramework.GameController.currentStoryBadges where (id==" + badge.badge_id + ")", LetiFramework.GameController.currentStoryBadges);
				if(rs.length > 0) {
					badge = rs[0];
					this.loadBadgeFile(badge.image);
				}
			}
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
					this.game.load.audio(this.getAssetInteractiveSoundKey(i), this.getSoundPath(cmp.interactivity.audio));					
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

		for(var i = 0; i < this.quizComponents.length; i++) {
			var cmp = this.quizComponents[i];

			if(cmp.question.type == "image") {
				this.loadImageFile(cmp.question.image);
			}

			if(cmp.choice.type == "image") {
				for(var j = 0; j < cmp.choice.images.length; j++) {
					this.loadImageFile(cmp.choice.images[j].image);
				}
			}

			if(cmp.result.type == "image") {
				this.loadImageFile(cmp.result.correct_image);
				this.loadImageFile(cmp.result.wrong_image);
			}

			if(cmp.background.type == "image") {
				this.loadImageFile(cmp.background.image);
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
			this.game.load.audio(this.getPageBgSoundKey("start"), this.getSoundPath(this.currentGamePageData.audio_start));			
			this.game.load.audio(this.getPageBgSoundKey("end"), this.getSoundPath(this.currentGamePageData.audio_end));
		}

		this.bgStartSoundPath = this.getSoundPath(this.currentGamePageData.audio_start);
		this.bgEndSoundPath = this.getSoundPath(this.currentGamePageData.audio_end);
	},
	create: function() {
		this.scene = this.game.add.group();

		this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, this.bgKey);
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);

        this.scene.add(this.bg);

        this.addComponents();

        var optionsDropDown = this.screenConfig.options_button.children;
		var optionsBtPosition = this.screenConfig.options_button.position;

		this.homeBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y, "homeBt", 
			function() {
				LetiFramework.Analytics.trackEvent("Quiz", "Button Click", "Home", 0);
				LetiFramework.Renderer.render("Menu");
			}, this, 2, 1, 0);
		this.homeBt.input.useHandCursor = true;
		this.homeBt.alpha = 0;

		this.soundBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y, 
			LetiFramework.SoundManager.narrationOn ? "soundOn" : "soundOff", 
			function() {
				LetiFramework.SoundManager.narrationOn = !LetiFramework.SoundManager.narrationOn;
	        	if(LetiFramework.SoundManager.narrationOn) {
	        		LetiFramework.Analytics.trackEvent("Quiz", "Button Click", "Sound On", 0);
	        		this.soundBt.loadTexture('soundOn');
	        	} else {
	        		LetiFramework.Analytics.trackEvent("Quiz", "Button Click", "Sound Off", 0);
	        		this.soundBt.loadTexture('soundOff');
	        	}
			}, this, 2, 1, 0);
		this.soundBt.input.useHandCursor = true;
		this.soundBt.alpha = 0;

		this.musicBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y, 
			LetiFramework.SoundManager.soundOn ? "musicOn" : "musicOff", 
			function() {
				LetiFramework.SoundManager.soundOn = !LetiFramework.SoundManager.soundOn;
	    		if(LetiFramework.SoundManager.soundOn) {
	    			LetiFramework.Analytics.trackEvent("Quiz", "Button Click", "Music On", 0);
	    			this.musicBt.loadTexture('musicOn');
	    			if(this.userScore.completed) {
	    				this.bgEndSound.paused ? this.bgEndSound.resume() : this.bgEndSound.play();
	    			} else {
	    				this.bgStartSound.paused ? this.bgStartSound.resume() : this.bgStartSound.play();
	    			}					
				} else {
					LetiFramework.Analytics.trackEvent("Quiz", "Button Click", "Music Off", 0);
					this.musicBt.loadTexture('musicOff');
					if(this.userScore.completed) {
						this.bgEndSound.pause();
	    			} else {
	    				this.bgStartSound.pause();
	    			}
				}
			}, this, 2, 1, 0);
		this.musicBt.input.useHandCursor = true;
		this.musicBt.alpha = 0;
		
		this.optionsBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y, "optionsBt", 
			function() {
				LetiFramework.Analytics.trackEvent("Quiz", "Button Click", "Options", 0);

				var homeTween = this.game.add.tween(this.homeBt);
				var soundTween = this.game.add.tween(this.soundBt);
	        	var musicTween = this.game.add.tween(this.musicBt);

	        	if(this.soundBt.alpha == 1) {
	        		var optionsBtPosition = {y: this.screenConfig.options_button.position.y};

	        		homeTween.to(optionsBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(function(){
	        			this.homeBt.alpha = 0;
	        		}, this);
	        		soundTween.to(optionsBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(function(){
	        			this.soundBt.alpha = 0;
	        		}, this);
		        	musicTween.to(optionsBtPosition, 300 * this.animScale, Phaser.Easing.Linear.None, true).onComplete.add(function(){
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
		this.prevBt = this.game.add.button(prevBtPosition.x, prevBtPosition.y, "prevBt", function() {
			LetiFramework.Analytics.trackEvent("Quiz", "Button Click", "Previous Page", 0);
			LetiFramework.GameController.previousPage();
		}, this, 2, 1, 0);
		this.prevBt.input.useHandCursor = true;
		this.prevBt.visible = false;

		var nextBtPosition = this.screenConfig.next_button.position;
		this.nextBt = this.game.add.button(nextBtPosition.x, nextBtPosition.y, "nextBt", function() {
			LetiFramework.Analytics.trackEvent("Quiz", "Button Click", "Next Page", 0);
			LetiFramework.GameController.nextPage();
		}, this, 2, 1, 0);
		this.nextBt.input.useHandCursor = true;
		this.nextBt.visible = false;

		this.customizePageNavigationButtons();

		this.showQuestion();

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

        if(LetiFramework.App.isPhoneGap()) {
			this.bgStartSound = LetiFramework.SoundManager.getSound(this.bgStartSoundPath, false);
			this.bgEndSound = LetiFramework.SoundManager.getSound(this.bgEndSoundPath, false);
		} else {
			this.bgStartSound = this.game.add.audio(this.getPageBgSoundKey("start"));
			this.bgEndSound = this.game.add.audio(this.getPageBgSoundKey("end"));
		}

		this.soundObjects.push(this.bgStartSound);
		this.soundObjects.push(this.bgEndSound);

		if(LetiFramework.SoundManager.soundOn) {
			this.bgStartSound.play();
		}
	},
	onBadgeDialogClosed: function() {
		LetiFramework.GameController.nextPage();
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

        		cmp.animations.add(asset.anim_name, asset.frames_1 || null);
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
                        LetiFramework.Analytics.trackEvent("Quiz", "Interactivity", log, 0);

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
                        LetiFramework.Analytics.trackEvent("Quiz", "Interactivity", log, 0);

        				var animations = this.asset.interactivity.animation;
        				var audio = this.asset.interactivity.audio;
        				var toggle = this.asset.interactivity.toggle;
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
        			}, {asset: asset, index: i, position: {x: cmp.x, y: cmp.y}, ctx: this});
        		}
        	}
        } // end for i
  	},
	destroyQuestionItems: function() {
		for (var i = this.questionItems.length - 1; i >= 0; i--) {
			this.questionItems[i].destroy();
		}
		this.questionItems = [];
		this.choiceHighlightComponents = [];
		this.result = null;
	},
	nextQuestion: function() {
		this.evaluated = false;
		this.quizPos++;
		if(this.quizComponents.length > this.quizPos) {
			this.showQuestion();
		} else {
			LetiFramework.Analytics.trackEvent("Quiz", "Game Score", 
                {"user": this.currentUser.nickname, "story": this.currentGame.name,
                	"quiz": this.currentGamePageData.quiz, "score": this.score}, 0);

			this.userScore.completed = true;
			LetiFramework.Db.update("scores", this.userScore);

			if(!this.currentGamePageData.result) {
				var badgesEarned = this.awardBadge();
				if(badgesEarned.length > 0) {
					this.badgeDialog = new LetiFramework.Ui.BadgeDialog(this.game, badgesEarned);
					this.badgeDialog.show();
				} else {
					LetiFramework.GameController.nextPage();
				}
			} else {
				this.destroyQuestionItems();

				this.bgStartSound.stop();
				if(LetiFramework.SoundManager.soundOn) {
	            	this.bgEndSound.play();
	            }

				this.nextBt.visible = true;

				var result = [
					"You have completed the quiz!",
					"Total questions: " + this.quizComponents.length,
					"Correct answers: " + this.correctCount,
					"Total points: " + this.currentGamePageData.total_score,
					"Points earned: " + this.score
				];

				var resultBg = this.currentGamePageData.result.background;

				if(resultBg.type == "shape") {
					var bg = this.game.add.graphics(resultBg.position.x, resultBg.position.y);
		    		bg.beginFill(resultBg.color, 1);
		    		bg.alpha = resultBg.alpha;
		    		if(resultBg.shape == "round_rect") {
		    			bg.drawRoundedRect(0, 0, resultBg.width, resultBg.height, resultBg.radius);
		    		} else if(resultBg.shape == "rect") {
		    			bg.drawRect(0, 0, resultBg.width, resultBg.height);
		    		}			
					bg.endFill();
					this.scene.add(bg);
				} else if(resultBg.type == "image") {
					var bg = this.game.add.sprite(
						resultBg.position.x, resultBg.position.y, this.getAssetPath(resultBg.image));
					bg.scale.setTo(resultBg.width / bg.width, resultBg.height / bg.height);
					this.scene.add(bg);
				}			

				var style = this.currentGamePageData.result.text_style;

				var startY = resultBg.position.y + 50;
				var tweenStart = startY + result.length * 50;

				for (var i = 0; i < result.length; i++) {
		            var token = result[i];
		            var txt = this.game.add.text(this.game.world.centerX, startY + i * 50, token, style);
		            txt.anchor.set(0.5);
		            var delay = 500;
		            var tween = this.game.add.tween(txt).from({alpha: 0, y: tweenStart}, delay, 
		            	Phaser.Easing.Linear.None, true, delay * i);
		            if(i + 1 == result.length)
		            {
		            	tween.onComplete.add(function(text, tween){
		            		this.showBadgesEarned(this.awardBadge(), text.y + text.height + 10);           
	    	            }, this);
		            }
		        }
			}			
		}
	},
	awardBadge: function() {
		var badgesEarned = [];

		if(this.badges) {
			for(var i = 0; i < this.badges.length; i++) {
				var earnedBadge = false;

				var badge = this.badges[i];
				
				if(badge.metric == "score") {
					var operator = badge.condition;
					if(operator) {
						earnedBadge = 
							(operator == "<=" && (this.score < badge.value || this.score == badge.value)) || 
							((operator == "==" || operator == "=") && this.score == badge.value) || 
							(operator == ">=" && (this.score > badge.value || this.score == badge.value)) || 
							(operator == "<" && this.score < badge.value) || 
							(operator == ">" && this.score > badge.value);
					} else {
						earnedBadge = this.score >= badge.value;
					}					
				} else if(badge.metric == "completed") {
					var completed = LetiFramework.Db.readByKeysAndValues(
						"scores",
						["user_id", "game_id", "activity", "completed"],
						[this.userScore.user_id, this.userScore.game_id, 
							this.userScore.activity, true]).length;
					earnedBadge = completed == badge.value;
				}

				if(earnedBadge) {
					var alreadyEarned = LetiFramework.Db.readByKeysAndValues(
						"badges",
						["user_id", "badge_id"],
						[this.userScore.user_id, badge.badge_id]).length > 0;
					if(!alreadyEarned) {
						var rs = jsonsql.query("select * from LetiFramework.GameController.currentStoryBadges where (id==" + badge.badge_id + ")", LetiFramework.GameController.currentStoryBadges);
						if(rs.length > 0) {
							badge = rs[0];		

							var model = new LetiFramework.DbEntities.Badge(
								this.userScore.user_id, badge.id, this.currentGame.storyId, 
								this.currentGame.id, badge.image, badge.text, badge.action, badge.message);
							LetiFramework.Db.create("badges", model);

							LetiFramework.Analytics.trackEvent("Quiz", "Badge Earned", 
                                {"user": this.currentUser.nickname, "story": this.currentGame.name,
                                    "quiz": this.currentGamePageData.quiz, "badge": badge}, 0);

							badge.style = this.badges[i].style;
							if(this.badges[i].animation) {
								badge.style.animation = this.badges[i].animation;
							}
							badgesEarned.push(badge);
						}	            						
					}	            					
				}
			}									
		}

		return badgesEarned;
	},
	showBadgesEarned: function(badgesEarned, yPos) {
		if(badgesEarned.length > 0) {
			var txt = this.game.add.text(this.game.world.centerX, yPos, 
					"Badge(s) Earned:", {font: "bold 28px Arial", fill: "#000000"});
			txt.anchor.set(0.5, 0);

			var badgesGroup = this.game.add.group();
			badgesGroup.x = this.game.world.centerX;
			badgesGroup.y = txt.y + txt.height + 20;

			var startX = 0;

			for(var i = 0; i < badgesEarned.length; i++) {
				var badge = badgesEarned[i];	        

				var badgeGroup = this.game.add.group();	           
				badgeGroup.x =  (i > 0 ? startX : 0);
				badgeGroup.y = 	0;				    					

				var badgeSprite = this.game.add.sprite(0, 0, this.getBadgePath(badge.image));
				badgeGroup.add(badgeSprite);

    			var badgeText = this.game.add.text(badgeSprite.x + badgeSprite.width * 0.5, 
                    badgeSprite.y + badgeSprite.height, badge.text, {font: "20px Arial", fill: "#000000"});
                badgeText.anchor.set(0.5, 0);
    			badgeGroup.add(badgeText);   

    			var badgeMsg = this.game.add.text(badgeSprite.x + badgeSprite.width * 0.5, 
                    badgeText.y + badgeText.height, badge.message, {font: "16px Arial", fill: "#000000", wordWrap: true, wordWrapWidth: 200});
                badgeMsg.anchor.set(0.5, 0);
                if(badgeMsg.x < badgeGroup.x) badgeGroup.x += 0.5 * badgeMsg.width;
    			badgeGroup.add(badgeMsg);  

    			startX += badgeGroup.width + (i + 1 < badgesEarned.length ? 50 : 0);
    			badgesGroup.add(badgeGroup);
			}	  

			badgesGroup.x = this.game.world.centerX - 0.5 * badgesGroup.width;          				
		}
	},
	showQuestion: function() {		
		this.destroyQuestionItems();

		var background = this.quizComponents[this.quizPos].background;
		var question = this.quizComponents[this.quizPos].question;
		var choiceType = this.quizComponents[this.quizPos].choice.type;
		var result = this.quizComponents[this.quizPos].result;

		if(background) {
			if(background.type == "shape") {
				var bg = this.game.add.graphics(background.position.x, background.position.y);
	    		bg.beginFill(background.color, 1);
	    		bg.alpha = background.alpha;
	    		if(background.shape == "round_rect") {
	    			bg.drawRoundedRect(0, 0, background.width, background.height, background.radius);
	    		} else if(background.shape == "rect") {
	    			bg.drawRect(0, 0, background.width, background.height);
	    		}			
				bg.endFill();
				this.scene.add(bg);
				this.questionItems.push(bg);
			} else if(background.type == "image") {
				var bg = this.game.add.sprite(background.position.x, background.position.y, 
					this.getAssetPath(background.image));
				bg.scale.setTo(background.width / bg.width, background.height / bg.height);
				this.scene.add(bg);
		    	this.questionItems.push(bg);
			}			
		}

		if(question.type == "text") {
	    	var questionBg = question.background;
	    	if(questionBg) {
	    		if(questionBg.type == "shape") {
	    			var bg = this.game.add.graphics(question.position.x, question.position.y);
		    		bg.beginFill(questionBg.color, 1);
		    		bg.alpha = questionBg.alpha;
		    		if(questionBg.shape == "round_rect") {
		    			bg.drawRoundedRect(0, 0, questionBg.width, questionBg.height, questionBg.radius);
		    		} else if(questionBg.shape == "rect") {
		    			bg.drawRect(0, 0, questionBg.width, questionBg.height);
		    		}
					bg.endFill();
					this.scene.add(bg);
					this.questionItems.push(bg);
	    		}
	    	}

	    	var questionText = this.game.add.text(
				question.position.x, question.position.y, question.text, question.text_style);
			this.scene.add(questionText);
	    	this.questionItems.push(questionText);
	    	if(questionBg) {
	    		questionText.x += (0.5 * (questionBg.width - questionText.width));
	    		questionText.y += (0.5 * (questionBg.height - questionText.height));
	    	}
		} else if(question.type == "image") {
			var questionImage = this.game.add.sprite(question.position.x, question.position.y, 
					this.getAssetPath(question.image));
			questionImage.scale.setTo(question.width / questionImage.width, question.height / questionImage.height);
			this.scene.add(questionImage);
	    	this.questionItems.push(questionImage);
		}

		if(choiceType == "text") {
			var choices = this.quizComponents[this.quizPos].choice.texts;
			var choiceTextStyle = this.quizComponents[this.quizPos].choice.text_style;			

			for(var i = 0; i < choices.length; i++) {	
				var choice = choices[i];

		    	var choiceBg = choice.background;
		    	if(choiceBg) {
		    		if(choiceBg.type == "shape") {		    			
		    			var hBg = this.game.add.graphics(choice.position.x - 5, choice.position.y - 5);
			    		hBg.beginFill(this.quizComponents[this.quizPos].choice.highlight || "0xffffff", 1);
			    		hBg.alpha = 0;
			    		hBg.drawRoundedRect(0, 0, choiceBg.width + 10, choiceBg.height + 10, 20);			
						hBg.endFill();
						this.scene.add(hBg);
						this.questionItems.push(hBg);
						this.choiceHighlightComponents.push(hBg);

		    			var bg = this.game.add.graphics(choice.position.x, choice.position.y);
			    		bg.beginFill(choiceBg.color, 1);
			    		bg.alpha = choiceBg.alpha;
			    		if(choiceBg.shape == "round_rect") {
			    			bg.drawRoundedRect(0, 0, choiceBg.width, choiceBg.height, choiceBg.radius);
			    		} else if(choiceBg.shape == "rect") {
			    			bg.drawRect(0, 0, choiceBg.width, choiceBg.height);
			    		}			
						bg.endFill();
						this.scene.add(bg);
						this.questionItems.push(bg);						

						bg.inputEnabled = true;
						bg.input.useHandCursor = true;
						bg.events.onInputDown.add(function() {	
							if(!this.evaluated)	{
								this.ctx.evaluated = true;
								this.ctx.evaluateAnswer(this.idx);
							}
						}, {ctx: this, idx: i});
		    		}
		    	}

		    	var choiceText = this.game.add.text(
					choice.position.x, choice.position.y, choice.text, choiceTextStyle);
				choiceText.inputEnabled = true;
				choiceText.input.useHandCursor = true;
				choiceText.events.onInputDown.add(function() {
					if(!this.evaluated)	{
						this.ctx.evaluated = true;
						this.ctx.evaluateAnswer(this.idx);
					}
				}, {ctx: this, idx: i});
				this.scene.add(choiceText);
		    	this.questionItems.push(choiceText);
		    	if(choiceBg) {
		    		choiceText.x += (0.5 * (choiceBg.width - choiceText.width));
		    		choiceText.y += (0.5 * (choiceBg.height - choiceText.height));
		    	}
			}
		} else if(choiceType == "image") {
			var choices = this.quizComponents[this.quizPos].choice.images;			

			for(var i = 0; i < choices.length; i++) {	
				var bg = this.game.add.graphics(choice.position.x - 5, choice.position.y - 5);
	    		bg.beginFill(this.quizComponents[this.quizPos].choice.highlight || "0xffffff", 1);
	    		bg.alpha = 0;
	    		bg.drawRoundedRect(0, 0, choice.width + 10, choice.height + 10, 20);
				bg.endFill();
				this.scene.add(bg);
				this.questionItems.push(bg);
				this.choiceHighlightComponents.push(bg);

				var choice = choices[i];
				var choiceImage = this.game.add.sprite(choice.position.x, choice.position.y, 
					this.getAssetPath(choice.image));
				choiceImage.scale.setTo(choice.width / choiceImage.width, choice.height / choiceImage.height);
				choiceImage.inputEnabled = true;
				choiceImage.input.useHandCursor = true;
				choiceImage.events.onInputDown.add(function() {	
					if(!this.evaluated)	{
						this.ctx.evaluated = true;
						this.ctx.evaluateAnswer(this.idx);
					}
				}, {ctx: this, idx: i});
				this.scene.add(choiceImage);
		    	this.questionItems.push(choiceImage);
			}
		}

		if(result.type == "image") {
			this.result = this.game.add.sprite(result.position.x, result.position.y, 
				this.getAssetPath(result.correct_image));
			this.result.visible = false;
			this.scene.add(this.result);
	    	this.questionItems.push(this.result);
		} else if(result.type == "text") {
			this.result = this.game.add.text(
					result.position.x, result.position.y, 
					result.correct_text.text, result.correct_text.text_style);
			this.result.anchor.set(0.5);
			this.result.visible = false;
			this.scene.add(this.result);
	    	this.questionItems.push(this.result);
		}
	},
	evaluateAnswer: function(idx) {	
		var choice = "";
		var choiceType = this.quizComponents[this.quizPos].choice.type;
		this.choiceHighlightComponents[idx].alpha = 0.8;

		if(choiceType == "text") {
			choice = this.quizComponents[this.quizPos].choice.texts[idx].text;			
		} else if(choiceType == "image") {
			choice = this.quizComponents[this.quizPos].choice.images[idx].image;
		}

		var correct = false, done = false;

		if(this.currentGamePageData.answers[this.quizPos].constructor === Array) {
			this.answeredChoice = this.answeredChoice || [];
			this.answeredCount = this.answeredCount || 0;
			this.answeredCorrectCount = this.answeredCorrectCount || 0;

			if(this.answeredChoice.indexOf(choice) == -1) {
				this.answeredChoice.push(choice);
				this.answeredCount++;
			} else {
				return;
			}			
			
			if(this.currentGamePageData.answers[this.quizPos].indexOf(idx) > -1) {
				this.answeredCorrectCount++;
			}

			if(this.answeredCount == this.currentGamePageData.answers[this.quizPos].length) {
				correct = this.answeredCorrectCount == this.answeredCount;

				var q = this.quizComponents[this.quizPos].question;
				q = q.text || q.image;

				LetiFramework.Analytics.trackEvent("Quiz", "Answer", 
		        	{"user": this.currentUser.nickname, "quiz": this.currentGamePageData.quiz, 
		        	"question": q, "choice": this.answeredChoice, "correct": correct}, 0);
		        			
		        delete this.answeredChoice;
		        delete this.answeredCount;
		        delete this.answeredCorrectCount;

		        done = true;
			}
		} else {
			correct = idx == this.currentGamePageData.answers[this.quizPos];

			var q = this.quizComponents[this.quizPos].question;
			q = q.text || q.image;

	        LetiFramework.Analytics.trackEvent("Quiz", "Answer", 
	        	{"user": this.currentUser.nickname, "quiz": this.currentGamePageData.quiz, 
	        	"question": q, "choice": choice, "correct": correct}, 0);

	        done = true;
		}

		if(done) {
			if(correct) {
				this.result.visible = true;
				this.correctCount++;
				var points = this.currentGamePageData.points[this.quizPos];
				this.score += points;
				this.currentUser.points += points;
	            LetiFramework.Db.update("users", this.currentUser);

				//update user's score record
				this.userScore.score = this.score;
				LetiFramework.Db.update("scores", this.userScore);
			} else {
				this.result.visible = true;
				var result = this.quizComponents[this.quizPos].result;
				if(result.type == "image") {				
					this.result.loadTexture(this.getAssetPath(result.wrong_image));
				} else if(result.type == "text") {
					this.result.text = result.wrong_text.text;
					this.result.setStyle(result.wrong_text.text_style);
				}			
			}
			
			setTimeout(function() { LetiFramework.Renderer.currentState().nextQuestion(); }, 2000);
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
            this.bgStartSound.pause();
            this.bgEndSound.pause();
        }
    },
    resume: function() {
        if(LetiFramework.SoundManager.soundOn) {            
            if(this.userScore.completed) {
                this.bgEndSound.paused ? this.bgEndSound.resume() : this.bgEndSound.play();
            } else {
                this.bgStartSound.paused ? this.bgStartSound.resume() : this.bgStartSound.play();
            }
        }
    },
	getScreenConfigImagePath: function(name) {
		return "assets/img/" + name;
	},
  	getNarrationSoundKey: function() {
  		return "narrationSound" + this.currentGamePage;
  	},
  	getAssetInteractiveSoundKey: function(idx) {
  		return "assetInteractiveSound" + idx + "page" + this.currentGamePage;
  	},
  	getPageBgSoundKey: function(tag) {
  		return "pageBgSound" + this.currentGamePage + "_" + tag;
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