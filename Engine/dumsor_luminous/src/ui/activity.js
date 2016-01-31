var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.activity = function(game) {}

LetiFramework.Ui.activity.prototype = {
	init: function() {
		LetiFramework.Analytics.trackPage("Activity");
		this.screenConfig = LetiFramework.GameController.screensConfig.activity;
        this.hud = LetiFramework.GameController.screensConfig.hud;
        this.animScale = LetiFramework.Renderer.animScale;
        this.currentGame = LetiFramework.GameController.currentGame;
        this.currentGamePage = LetiFramework.GameController.currentGamePage;
        this.currentGamePageData = LetiFramework.GameController.currentGamePageData;
        this.badges = this.currentGamePageData.badges;
        this.titleText = this.currentGamePageData.text_start;
        this.infoText = this.currentGamePageData.info_start;        
        this.pageComponents = [];
        this.soundObjects = [];
        this.pageSprites = {};
        if(this.currentGamePageData.components) {
            this.pageComponents = LetiFramework.GameController.currentStoryComponents[
                this.currentGamePageData.components];
        }
        this.universalComponents = LetiFramework.GameController.currentStoryComponents.universal_components || [];
        this.currentUser = LetiFramework.GameController.currentUser;
        this.userId = this.currentUser.id;        
        this.gameResult = store.get("extGameResult");
        this.replay = false;
        if(this.gameResult) {            
            store.remove("extGameResult");
            this.titleText = this.currentGamePageData.text_end;
            var skippable = this.currentGamePageData.skippable;
            var score = this.gameResult.score;
            var expectedScore = this.currentGamePageData.expected_score;

            this.currentUser.points += score;
            LetiFramework.Db.update("users", this.currentUser);

            this.userScore = new LetiFramework.DbEntities.Scores(this.userId, this.currentGame.id, 
                this.currentGamePageData.activity, score, 0, false);
            LetiFramework.Db.create("scores", this.userScore);

            LetiFramework.Analytics.trackEvent("Activity", "Game Score", 
                {"user": this.currentUser.nickname, "story": this.currentGame.name,
                    "activity": this.currentGamePageData.activity, "score": score}, 0);

            if(expectedScore > 0) {
                if(score >= expectedScore) {    
                    this.infoText = [ "Congrats! You passed the " + expectedScore + " mark" ];
                    for(var i = 0; i < this.currentGamePageData.info_end.length; i++) {
                        this.infoText.push(this.currentGamePageData.info_end[i]);
                    }         
                    this.infoText.push("Your score is " + score);           
                } else if(skippable) {
                    this.infoText = this.currentGamePageData.info_skip;
                } else {
                    this.infoText = this.currentGamePageData.info_replay;
                    this.replay = true;
                }
            } else {
                this.infoText = this.currentGamePageData.info_end;
                this.infoText += "\n" + "Your score is " + score;
                // Do something with score perhaps e.g award marks
            }

            if(this.badges) {
                this.badgesEarned = [];

                for(var i = 0; i < this.badges.length; i++) {
                    var earnedBadge = false;

                    var badge = this.badges[i];
                    
                    if(badge.metric == "score") {
                        var operator = badge.condition;
                        if(operator) {
                            earnedBadge = 
                                (operator == "<=" && (score < badge.value || score == badge.value)) || 
                                ((operator == "==" || operator == "=") && score == badge.value) || 
                                (operator == ">=" && (score > badge.value || score == badge.value)) || 
                                (operator == "<" && score < badge.value) || 
                                (operator == ">" && score > badge.value);
                        } else {
                            earnedBadge = score >= badge.value;
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
                                this.badgesEarned.push(badge);
                                var model = new LetiFramework.DbEntities.Badge(
                                    this.userScore.user_id, badge.id, this.currentGame.storyId,
                                    this.currentGame.id, badge.image, badge.text, badge.action, badge.message);
                                LetiFramework.Db.create("badges", model);

                                LetiFramework.Analytics.trackEvent("Activity", "Badge Earned", 
                                    {"user": this.currentUser.nickname, "story": this.currentGame.name,
                                        "activity": this.currentGamePageData.activity, "badge": badge}, 0);
                            }                                       
                        }                                   
                    }
                }
            }
        }
	},
	preload: function() {	
        if(this.gameResult && this.currentGamePageData.skip_results == true) return;

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

        if(this.hud.visible) {
            var badges = LetiFramework.Db.readByKeysAndValues("badges", ["user_id", "story_id"], 
                [this.currentUser.id, this.currentGame.id]);
            if(badges.length > 0) {
                this.currentBadge = badges[badges.length - 1];
                this.loadBadgeFile(this.currentBadge.badge_image);
            }
        }

        if(this.currentGamePageData.start_button.type == "image") {
          this.game.load.image(this.screenConfig.start_button.image, this.getScreenConfigImagePath(this.screenConfig.start_button.image));           
        }

        if(!LetiFramework.App.isPhoneGap()) {
            this.game.load.audio(this.currentGamePageData.audio, this.getSoundPath(this.currentGamePageData.audio));
            this.game.load.audio(this.currentGamePageData.audio_end, this.getSoundPath(this.currentGamePageData.audio_end));
        }       

        this.bgSoundPath = this.getSoundPath(this.currentGamePageData.audio);
        this.bgEndSoundPath = this.getSoundPath(this.currentGamePageData.audio_end);		
	},
	create: function() {		
        if(this.gameResult && this.currentGamePageData.skip_results == true) {
            LetiFramework.GameController.nextPage();
            return;
        }

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
                LetiFramework.Analytics.trackEvent("Activity","Button Click", "Home", 0);
                LetiFramework.Renderer.render("Menu");
            }, this, 2, 1, 0);
        this.homeBt.input.useHandCursor = true;
        this.homeBt.alpha = 0;

        this.soundBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y, 
            LetiFramework.SoundManager.narrationOn ? optionsSoundBt.on_image : optionsSoundBt.off_image, 
            function() {
                LetiFramework.SoundManager.narrationOn = !LetiFramework.SoundManager.narrationOn;
                if(LetiFramework.SoundManager.narrationOn) {
                    LetiFramework.Analytics.trackEvent("Activity","Button Click", "Sound On", 0);
                    this.soundBt.loadTexture(this.screenConfig.options_button.children.sound_button.on_image);
                } else {
                    LetiFramework.Analytics.trackEvent("Activity","Button Click", "Sound Off", 0);
                    this.soundBt.loadTexture(this.screenConfig.options_button.children.sound_button.off_image);
                }
            }, this, 2, 1, 0);
        this.soundBt.input.useHandCursor = true;
        this.soundBt.alpha = 0;

        this.musicBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y, 
            LetiFramework.SoundManager.soundOn ? optionsMusicBt.on_image : optionsMusicBt.off_image, 
            function() {
                LetiFramework.SoundManager.soundOn = !LetiFramework.SoundManager.soundOn;
                if(LetiFramework.SoundManager.soundOn) {
                    LetiFramework.Analytics.trackEvent("Activity","Button Click", "Music On", 0);
                    this.musicBt.loadTexture(this.screenConfig.options_button.children.music_button.on_image);
                    this.bgSound.paused ? this.bgSound.resume() : this.bgSound.play();                  
                } else {
                    LetiFramework.Analytics.trackEvent("Activity","Button Click", "Music Off", 0);
                    this.musicBt.loadTexture(this.screenConfig.options_button.children.music_button.off_image);
                    this.bgSound.pause();
                }
            }, this, 2, 1, 0);
        this.musicBt.input.useHandCursor = true;
        this.musicBt.alpha = 0;
        
        this.optionsBt = this.game.add.button(optionsBtPosition.x, optionsBtPosition.y, optionsBt.image, 
            function() {
                LetiFramework.Analytics.trackEvent("Activity","Button Click", "Options", 0);

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
                LetiFramework.Analytics.trackEvent("Activity","Button Click", "Previous Page", 0);
                LetiFramework.GameController.previousPage();
            }, this, 2, 1, 0);
        this.prevBt.input.useHandCursor = true;
        this.prevBt.visible = false;

        var nextBtPosition = this.screenConfig.next_button.position;
        this.nextBt = this.game.add.button(nextBtPosition.x, nextBtPosition.y, this.screenConfig.next_button.image, 
            function() {
                LetiFramework.Analytics.trackEvent("Activity","Button Click", "Next Page", 0);
                if(this.replay) {
                    LetiFramework.GameController.resumeActivity();
                } else {
                    LetiFramework.GameController.nextPage();
                }                           
            }, this, 2, 1, 0);
        this.nextBt.input.useHandCursor = true;
        this.nextBt.visible = false;
        if(this.gameResult) {
            this.nextBt.visible = true;
        }        

        this.customizePageNavigationButtons();

        var titleArea = this.currentGamePageData.title;
        var contentArea = this.currentGamePageData.content;

        var panel1Width = contentArea.background.width;
        var panel1Height = contentArea.background.height;
        var panel1X = this.game.world.centerX - 0.5 * panel1Width;
        var panel1Y = this.game.world.centerY - 0.5 * panel1Height;
        if(contentArea.position) {
            panel1X = contentArea.position.x;
            panel1Y = contentArea.position.y;
        }

        var panel1 = this.game.add.graphics(panel1X, panel1Y);
        panel1.beginFill(contentArea.background.color, 1);
        panel1.alpha = contentArea.background.alpha;
        panel1.drawRoundedRect(0, 0, panel1Width, panel1Height, 20);
        panel1.endFill();

        var panel2Width = titleArea.background.width;
        var panel2Height = titleArea.background.height;

        var panel2 = this.game.add.graphics(titleArea.position.x, titleArea.position.y);
        panel2.beginFill(titleArea.background.color, 1);
        panel2.alpha = titleArea.background.alpha;
        panel2.drawRoundedRect(0, 0, panel2Width, panel2Height, 20);
        panel2.endFill();

        var title = this.game.add.text(panel2Width / 2 + panel2.x, panel2Height / 2 + panel2.y, this.titleText,  
            titleArea.text_style);
        title.anchor.set(0.5);  

        var style = contentArea.text_style;
        style.wordWrap = true;
        style.wordWrapWidth = panel1Width - 20;
        var margin = contentArea.line_spacing || 0;
        var yPos =  (contentArea.line_start || 50) + panel1.y;
        for (var i = 0; i < this.infoText.length; i++) {
            var token = this.infoText[i];
            var infoText = this.game.add.text(contentArea.position ? panel1X : this.game.world.centerX, yPos, token, style);
            yPos = infoText.y + infoText.height + margin;
            infoText.anchor.set(0.5, 0);            
            var delay = 500;
            var tween = this.game.add.tween(infoText).from({alpha: 0, y: panel1.y + panel1Height}, delay, Phaser.Easing.Linear.None, true, delay * i);
            if(i + 1 == this.infoText.length) {
                if(this.gameResult) {
                    tween.onComplete.add(function(text, tween) {
                        if(this.badgesEarned.length > 0) {
                            var txt = this.game.add.text(this.game.world.centerX, text.y + text.height + 10, 
                                    "Badge(s) Earned:", {font: "bold 28px Arial", fill: "#000000"});
                            txt.anchor.set(0.5, 0);

                            var badgesGroup = this.game.add.group();
                            badgesGroup.x = this.game.world.centerX;
                            badgesGroup.y = txt.y + txt.height + 20;

                            var startX = 0;

                            for(var i = 0; i < this.badgesEarned.length; i++) {
                                var badge = this.badgesEarned[i];            

                                var badgeGroup = this.game.add.group();            
                                badgeGroup.x =  (i > 0 ? startX : 0);
                                badgeGroup.y =  0;                                      

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

                                startX += badgeGroup.width + (i + 1 < this.badgesEarned.length ? 50 : 0);
                                badgesGroup.add(badgeGroup);
                            }     

                            badgesGroup.x = this.game.world.centerX - 0.5 * badgesGroup.width;                                 
                        }
                    }, this);
                }                              
            }        
        }

        if(!this.gameResult) {
            var startBtConfig = this.currentGamePageData.start_button;    
            if(startBtConfig.type == "image") {
              var startBt = this.game.add.sprite(startBtConfig.position.x, startBtConfig.position.y, startBtConfig.image);
              startBt.scale.setTo(startBtConfig.width / startBt.width, startBtConfig.height / startBt.height);
              startBt.inputEnabled = true;  
              startBt.input.useHandCursor = true;
              startBt.events.onInputDown.add(this.startActivityHandler, this);
            } else if(startBtConfig.type == "button") {
              var startBt = new LetiFramework.Ui.Button(this.game, startBtConfig.position.x, startBtConfig.position.y, startBtConfig.width, 
                    startBtConfig.height, startBtConfig.text, startBtConfig.text_style, startBtConfig.button_style, 
                    this.startActivityHandler, this);
            }
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

            //  A mask is a Graphics object
            var mask = this.game.add.graphics(0, 0);
            this.scene.add(mask);

            //  Shapes drawn to the Graphics object must be filled.
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

            //  Here we'll draw a shape for the progress
            mask.drawRect(progressImage.position.x, progressImage.position.y, 
                pcValue * progressImage.width + progressComponent.initial_value, progressImage.height);

            //  And apply it to the Sprite
            pc.mask = mask;
        }

        if(LetiFramework.App.isPhoneGap()) {
            this.bgSound = LetiFramework.SoundManager.getSound(this.bgSoundPath, false);
            this.bgEndSound = LetiFramework.SoundManager.getSound(this.bgEndSoundPath, false);
        } else {
            this.bgSound = this.game.add.audio(this.currentGamePageData.audio);
            this.bgEndSound = this.game.add.audio(this.currentGamePageData.audio_end);
        }   

        this.soundObjects.push(this.bgSound);
        this.soundObjects.push(this.bgEndSound);

        if(LetiFramework.SoundManager.soundOn) {
            if(this.gameResult) {
                this.bgEndSound.play();
            } else {
                this.bgSound.play();
            }            
        }	
  	},
	shutdown: function() {
        if(this.scene) this.scene.destroy();
		for(var i = 0; i < this.soundObjects.length; i++) {
            this.soundObjects[i].destroy();
        }
	},
    pause: function() {
        if(LetiFramework.SoundManager.soundOn) {
            this.bgSound.pause();
            this.bgEndSound.pause();
        }
    },
    resume: function() {
        if(LetiFramework.SoundManager.soundOn) {            
            if(this.gameResult) {
                this.bgEndSound.paused ? this.bgEndSound.resume() : this.bgEndSound.play();
            } else {
                this.bgSound.paused ? this.bgSound.resume() : this.bgSound.play();
            }
        }
    },
    startActivityHandler: function() {
        LetiFramework.Analytics.trackEvent("Activity", "Button Click", "Go", 0);
        store.set("extGameData", {
            expectedScore: this.currentGamePageData.expected_score, 
            returnUrl: this.currentGamePageData.return_url,
            additional_data: this.currentGamePageData.additional_data
        });
        var url = this.currentGamePageData.game_url;        
        if(url.length > 0) {
            LetiFramework.GameController.saveInstance(); // Leaving game, therefore save game state
            var orientation = this.currentGamePageData.orientation;
            if(orientation && orientation == "portrait" && LetiFramework.App.isPhoneGap()) {
                screen.lockOrientation('portrait');
            }
            window.location.replace(url);
        } else {
            alert("Unable to launch game!");
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
                        LetiFramework.Analytics.trackEvent("Activity", "Interactivity", log, 0);
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
                        LetiFramework.Analytics.trackEvent("Activity", "Interactivity", log, 0);

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