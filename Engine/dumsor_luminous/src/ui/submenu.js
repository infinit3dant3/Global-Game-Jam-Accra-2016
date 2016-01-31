var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.submenu = function(game) {}

LetiFramework.Ui.submenu.prototype = {
	init: function() {
		LetiFramework.Analytics.trackPage("SubMenu");

        LetiFramework.GameController.gameStarted = false;
        this.currentUser = LetiFramework.GameController.currentUser;
		this.screenConfig = LetiFramework.GameController.menuConfig.submenu;
		this.backButton = this.screenConfig.back_button;		
		this.currentStory = LetiFramework.GameController.currentStory;
        this.games = this.currentStory.episodes;
		this.focusedItem = 0;
		this.menuItems = [];
		this.focusedItemScale = 1.4;
        this.menuItemWidth = this.screenConfig.menu_item_width;
        this.menuItemHeight = this.screenConfig.menu_item_height;
		this.animScale = LetiFramework.Renderer.animScale;
		this.pageComponents = [];
        this.soundObjects = [];
        this.pageSprites = {};
		if(LetiFramework.GameController.screenComponents && this.screenConfig.components) {
			this.pageComponents = LetiFramework.GameController.screenComponents[
				this.screenConfig.components];
		}
	},
	preload: function() {
		this.game.load.image(this.screenConfig.background, this.getScreenConfigImagePath(this.screenConfig.background)); 
		this.game.load.image(this.screenConfig.back_button.image, 
			this.getScreenConfigImagePath(this.screenConfig.back_button.image));

		for(var i = 0; i < this.pageComponents.length; i++) {
			var cmp = this.pageComponents[i];
			if(cmp.image) {
				if(cmp.type == 'spritesheet') {
					this.game.load.spritesheet(cmp.image, this.getScreenConfigImagePath(cmp.image), cmp.frame_width, cmp.frame_height);
				} else {
					this.game.load.image(cmp.image, this.getScreenConfigImagePath(cmp.image));
				}				
			}

			if(cmp.interactivity && cmp.interactivity.audio) {
				if(!LetiFramework.App.isPhoneGap()) {
					this.game.load.audio(cmp.interactivity.audio, this.getSoundPath(cmp.interactivity.audio));					
				}
			}
		}
        
        for(var i = 0; i < this.games.length; i++) {
            var game = this.games[i];
            this.loadEpisodeCover(game.storyId, game.id, game.cover, this.getCoverImageKey(game));
        }

		if(!LetiFramework.App.isPhoneGap()) {
			this.game.load.audio(this.screenConfig.audio, this.getSoundPath(this.screenConfig.audio));
		}

		this.soundPath = this.getSoundPath(this.screenConfig.audio);
	},
	create: function() {
        this.scene = this.game.add.group();

		this.listenSwipe(this.scrollMenuItems);

		this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, this.screenConfig.background);
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);  
        this.addToScene(this.bg);

        this.addComponents();

    	this.backBt = this.game.add.button(this.backButton.position.x, this.backButton.position.y, 
            this.backButton.image, function() {
    		LetiFramework.Analytics.trackEvent("SubMenu", "Button Click", "Back", 0);
            LetiFramework.GameController.showView("Menu");
    	}, this, 2, 1, 0);
    	this.backBt.input.useHandCursor = true;
        this.addToScene(this.backBt);

        this.scrollContainer = this.game.add.group();
        this.addToScene(this.scrollContainer);

        var margin = 0;

        if(this.games.length >  0) {
            var game = this.games[0];
        	var menuItem = this.game.add.sprite(0, 0, this.getCoverImageKey(game));    
            menuItem.scale.setTo(this.menuItemWidth / menuItem.width, this.menuItemHeight / menuItem.height);
	        menuItem.anchor.set(0, 0.5);
	    	this.menuItems.push(menuItem);
	    	this.scrollContainer.add(menuItem);    	

	    	margin = (this.game.width % (this.menuItemWidth * 3)) / 4;
	    	this.itemsMargin = margin;
	    	menuItem.x = margin;
            menuItem.y = this.game.world.centerY;
        }

        for(var i = 1; i < this.games.length; i++) {
            var game = this.games[i];
        	menuItem = this.game.add.sprite(0, 0, this.getCoverImageKey(game));   
            menuItem.scale.setTo(this.menuItemWidth / menuItem.width, this.menuItemHeight / menuItem.height);
            menuItem.anchor.set(0, 0.5);     	
        	menuItem.x = margin + i * (margin + menuItem.width);
            menuItem.y = this.game.world.centerY;
        	
        	if(menuItem.x + 0.5 * menuItem.width == this.game.world.centerX) {
        		menuItem.scale.multiply(this.focusedItemScale, this.focusedItemScale);
        		menuItem.x = this.game.world.centerX - menuItem.width * 0.5;
        		this.focusedItem = i;
        	}
        	this.menuItems.push(menuItem);
        	this.scrollContainer.add(menuItem);
        }

        if(this.menuItems.length == 1) {
            this.menuItems[0].scale.multiply(this.focusedItemScale, this.focusedItemScale);
        	this.menuItems[0].x = this.game.world.centerX - menuItem.width * 0.5;        	    	
        } else {
        	this.focusedItem--;
			this.scrollMenuItems("right");
        }

        this.addMenuItemClickHandler();

        if(LetiFramework.App.isPhoneGap()) {
			this.music = LetiFramework.SoundManager.getSound(this.soundPath, false);
		} else {
			this.music = this.game.add.audio(this.screenConfig.audio);
		}	

        this.soundObjects.push(this.music);

        if(LetiFramework.SoundManager.soundOn) {
			this.music.play();
		}
  	},  	
  	addComponents: function() {
  		for(var i = 0; i < this.pageComponents.length; i++) {
        	var asset = this.pageComponents[i];
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
        	}
        	else if(asset.type == "text") {
        		cmp = this.game.add.text(position.x, position.y, asset.text, asset.style);
        	}
        	else if(asset.type == "image") {
        		cmp = this.game.add.sprite(position.x, position.y, asset.image);
                if(asset.hidden) cmp.visible = false;
                this.pageSprites[asset.image] = cmp;
        		if(asset.width && asset.height) {
        			cmp.scale.setTo(asset.width / cmp.width, asset.height / cmp.height);
        		}   
        		cmp.x += cmp.width * 0.5;
        		cmp.y += cmp.height * 0.5;
        		cmp.anchor.set(0.5);
        	}
        	else if(asset.type == "spritesheet") {
        		cmp = this.game.add.sprite(position.x, position.y, asset.image);
                if(asset.hidden) cmp.visible = false;
                this.pageSprites[asset.image] = cmp;
                cmp.scale.setTo(asset.width / asset.frame_width, asset.height / asset.frame_height);
        		cmp.x += cmp.width * 0.5;
        		cmp.y += cmp.height * 0.5;
        		cmp.anchor.set(0.5);

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
                        var log = {"user": _this.currentUser.nickname, "asset": this.image};
                        LetiFramework.Analytics.trackEvent("Main", "Interactivity", log, 0);

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

            if(cmp) {
                this.addToScene(cmp);

                if(asset.link) {
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

                if(animations) {
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

                if(interactivity) {
                    if(interactivity.action == "click") {      
                        cmp.inputEnabled = true;                
                        cmp.events.onInputDown.add(function(src) {
                            var _this = LetiFramework.Renderer.currentState();
                            var log = {"user": _this.currentUser.nickname, "asset": this.asset.image};
                            LetiFramework.Analytics.trackEvent("Main", "Interactivity", log, 0);

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
            }            
        } // end for i
  	},
    addToScene: function(item) {
        this.scene.add(item);
    },
	shutdown: function() {
        this.scene.destroy();
		for(var i = 0; i < this.soundObjects.length; i++) {
            this.soundObjects[i].destroy();
        }
	},	
    pause: function() {
        if(LetiFramework.SoundManager.soundOn) {
            this.music.pause();
        }
    },
    resume: function() {
        if(LetiFramework.SoundManager.soundOn) {
            this.music.paused ? this.music.resume() : this.music.play();
        }
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
    getCoverImageKey: function(game) {
        return game.cover + "_" + game.id;
    },
	getScreenConfigImagePath: function(name) {
		return "assets/img/" + name;
	},
  	getSoundPath: function(name) {
  		return 'assets/sound/' + name;
  	},
	addMenuItemClickHandler: function() {
		for(var i = 0; i < this.games.length; i++) {
        	this.menuItems[i].inputEnabled = true;  
	        this.menuItems[i].input.useHandCursor = true;
	        this.menuItems[i].events.onInputDown.add(this.clickedMenuItem, this);
        }
	},
  	clickedMenuItem: function(src) {
  		this.clickedItem = src;  		
  	},
  	scrollMenuItems: function(direction) {
  		if(direction == 'left' || direction == 'right') {
			var this_ = LetiFramework.Renderer.currentState();
			var count = this_.menuItems.length;
			var sign = direction == 'left' ? -1 : 1;

			for(var i = 0; i < count; i++) {
				var menuItem = this_.menuItems[i];
				var menuItemTween = this_.game.add.tween(menuItem);

				if(menuItem.x + 0.5 * menuItem.width == this_.game.world.centerX) {
	        		menuItem.scale.setTo(1);
                    menuItem.scale.setTo(this_.menuItemWidth / menuItem.width, this_.menuItemHeight / menuItem.height);
	        		menuItem.x = this_.game.world.centerX - menuItem.width * 0.5;
	        	}
				
				menuItemTween.to({
					x: menuItem.x + sign * (this_.itemsMargin + menuItem.width)
				}, 100, Phaser.Easing.Linear.None, true).onComplete.add(function(){
					if(this.menuItem.x + 0.5 * this.menuItem.width == this.ctx.game.world.centerX) {
                        this.menuItem.scale.multiply(this.ctx.focusedItemScale, this.ctx.focusedItemScale);
		        		this.menuItem.x = this.ctx.game.world.centerX - this.menuItem.width * 0.5;
		        	}
				}, {menuItem: menuItem, ctx: this_});					
			}
		}
  	},
  	listenSwipe: function(callback) {
  		var eventDuration;
		var startPoint = {};
		var endPoint = {};
		var direction;
		var minimum = {
			duration: 30,
			distance: 100
		}

		this.game.input.onDown.add(function(pointer) {
			startPoint.x = pointer.clientX;
			startPoint.y = pointer.clientY;
		}, this);

		this.game.input.onUp.add(function(pointer) {
			direction = '';
			eventDuration = this.game.input.activePointer.duration;

			endPoint.x = pointer.clientX;
			endPoint.y = pointer.clientY;

			var dx = Math.abs(endPoint.x - startPoint.x);
			var dy = Math.abs(endPoint.y - startPoint.y);

			var actionSwipe = dx > minimum.distance || dy > minimum.distance;

			if (eventDuration > minimum.duration && actionSwipe) {
				this.clickedItem = null;
				var sign = 0;
				var animateEnd = false;

				// Check direction
				if (endPoint.x - startPoint.x > minimum.distance) {
					direction = 'right';
					if(this.focusedItem > 0) {
						this.focusedItem--;
					} else {
						sign = 1;
						animateEnd = true;
						direction = null;
					}					
				} else if (startPoint.x - endPoint.x > minimum.distance) {
					direction = 'left';
					if(this.focusedItem < this.games.length - 1) {
						this.focusedItem++;
					} else {
						sign = -1;
						animateEnd = true;
						direction = null;
					}
				} else if (endPoint.y - startPoint.y > minimum.distance) {
					direction = 'bottom';
				} else if (startPoint.y - endPoint.y > minimum.distance) {
					direction = 'top';
				}

				if (direction) {  
					callback(direction);
				}

				if(animateEnd) {
					for(var i = 0; i < this.menuItems.length; i++) {
						var menuItem = this.menuItems[i];
						var menuItemTween = this.game.add.tween(menuItem);
						menuItemTween.to({
							x: menuItem.x + sign * 50
						}, 100, Phaser.Easing.Bounce.Out, true, 0, 0, true);	
					}
				}
			} else {
				var src = this.clickedItem;	
				if(src) {
					this.clickedItem = null;
					for(var i = 0; i < this.menuItems.length; i++) {                         
			  			if(src == this.menuItems[i]) {
			  				if(i == this.focusedItem) {
                                var game = this.games[i];
                                // clicked an episode item
                                LetiFramework.Analytics.trackEvent(
                                    "Menu", "Episode Selection", this.games[i].name, 0);  
                                LetiFramework.GameController.initializeGame(this.games[i]);
			  				} else {
			  					var direction = i < this.focusedItem ? "right" : "left";
			  					this.focusedItem += direction == "right" ? -1 : 1;
			  					this.scrollMenuItems(direction);
			  				}  				
			  				break;
			  			}
			  		}
				}				
			}
		}, this);
  	}
}