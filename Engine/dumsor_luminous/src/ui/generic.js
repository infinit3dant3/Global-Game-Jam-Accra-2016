var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.generic = function(game) {}

LetiFramework.Ui.generic.prototype = {
	init: function() {
		LetiFramework.Analytics.trackPage("Generic");
		this.screenConfig = LetiFramework.GameController.bootConfig[LetiFramework.GameController.bootScreen];
		this.buttons = this.screenConfig.buttons;
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

		for(var i in this.buttons) {
			var button = this.buttons[i];
			this.game.load.image(button.image, this.getScreenConfigImagePath(button.image)); 
		}

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

		if(!LetiFramework.App.isPhoneGap()) {
          	this.game.load.audio(this.screenConfig.audio, this.getSoundPath(this.screenConfig.audio));  
        }
        this.soundPath = this.getSoundPath(this.screenConfig.audio);
	},
	create: function() {
		this.scene = this.game.add.group();

		this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, this.screenConfig.background);
	    this.bg.anchor.set(0.5);
	    this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);
	    this.scene.add(this.bg);

	    this.addComponents();

	    for(var i in this.buttons) {
			var button = this.buttons[i];

			var img = this.game.add.sprite(button.position.x, button.position.y, button.image);
		    img.scale.setTo(button.width / img.width, button.height / img.height);
		    img.inputEnabled = true;
		    img.input.useHandCursor = true;
		    img.events.onInputDown.add(function(src) {
		    	LetiFramework.GameController.bootScreen = this.next_screen;
                LetiFramework.GameController.bootSequence();
			}, button);

			this.scene.add(img);
		}

		if(LetiFramework.App.isPhoneGap()) {
           	this.bgSound = LetiFramework.SoundManager.getSound(this.soundPath, false);
        } else {
           	this.bgSound = this.game.add.audio(this.screenConfig.audio);
        } 

        this.soundObjects.push(this.bgSound);

        if(LetiFramework.SoundManager.soundOn) {
          	this.bgSound.play();
        }

        if(this.screenConfig.transition_delay) {
            var self = this;
            setTimeout(function() { 
                LetiFramework.GameController.bootScreen = self.screenConfig.next_screen;
                LetiFramework.GameController.bootSequence(); 
            }, this.screenConfig.transition_delay);
        }
  	},
  	shutdown: function() {
    	this.scene.destroy();
    	for(var i = 0; i < this.soundObjects.length; i++) {
            this.soundObjects[i].destroy();
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
                this.scene.add(cmp);

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
  	getScreenConfigImagePath: function(name) {
		return "assets/img/" + name;
	},
	getSoundPath: function(name) {
        return 'assets/sound/' + name;
    }  	
}