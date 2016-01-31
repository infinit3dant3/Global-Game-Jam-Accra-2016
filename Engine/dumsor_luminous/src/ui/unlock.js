var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.unlock = function(game) {}

LetiFramework.Ui.unlock.prototype = {
    init: function() {
      LetiFramework.Analytics.trackPage("Unlock");
      this.screenConfig = LetiFramework.GameController.bootConfig[LetiFramework.GameController.bootScreen];
    },
    preload: function() {
        this.game.load.image(this.screenConfig.background, this.getScreenConfigImagePath(this.screenConfig.background)); 
        this.game.load.image(this.screenConfig.exit_button.image, this.getScreenConfigImagePath(this.screenConfig.exit_button.image)); 

        if(!LetiFramework.App.isPhoneGap()) {
          this.game.load.audio(this.screenConfig.audio, this.getSoundPath(this.screenConfig.audio));  
        }
        this.soundPath = this.getSoundPath(this.screenConfig.audio);

        if(this.screenConfig.unlock_button.type == "image") {
          this.game.load.image(this.screenConfig.unlock_button.image, this.getScreenConfigImagePath(this.screenConfig.unlock_button.image));           
        }
    },
    create: function() {
        this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, this.screenConfig.background);
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);

        var exitBt = this.screenConfig.exit_button;
        this.exitBt = this.game.add.button(exitBt.position.x, exitBt.position.y, this.screenConfig.exit_button.image, 
            function(){ 
                LetiFramework.Analytics.trackEvent("Login", "Button Click", "Exit", 0);
                LetiFramework.App.isPhoneGap() && (navigator.app ? navigator.app.exitApp() : navigator.device && navigator.device.exitApp());
            }, this, 2, 1, 0);
        this.exitBt.scale.setTo(exitBt.width / this.exitBt.width, exitBt.height / this.exitBt.height);
        this.exitBt.input.useHandCursor = true;
        this.exitBt.visible = exitBt.visible;

        var contentFrame = this.screenConfig.content_frame;
        var panel1 = this.game.add.graphics(contentFrame.position.x, contentFrame.position.y);
        panel1.beginFill(contentFrame.color, 1);
        panel1.alpha = contentFrame.alpha;
        if(contentFrame.shape == "round_rect") {
          panel1.drawRoundedRect(0, 0, contentFrame.width, contentFrame.height, contentFrame.radius);
        } else if(contentFrame.shape == "rect") {
          panel1.drawRect(0, 0, contentFrame.width, contentFrame.height);
        }        
        panel1.endFill();

        var titleConfig = this.screenConfig.title;
        var title = this.game.add.text(titleConfig.position.x, titleConfig.position.y, titleConfig.text,  titleConfig.text_style);
        title.anchor.set(0.5);

        var unlockCode = store.get("unlockCode");

        if(!unlockCode) {
          unlockCode = this.screenConfig.unlock_code_label.hint;
        }

        var input = store.get("userInput");
        store.remove("userInput");

        if(input) {
            unlockCode = input;
            store.set("unlockCode", input);
        }

        var unlockCodeLblConfig = this.screenConfig.unlock_code_label;
        this.unlockCodeLbl = new LetiFramework.Ui.Button(this.game, unlockCodeLblConfig.position.x, unlockCodeLblConfig.position.y, 
          unlockCodeLblConfig.width, unlockCodeLblConfig.height, unlockCode, unlockCodeLblConfig.text_style, unlockCodeLblConfig.label_style, 
                this.unlockCodeHandler, this);   

        var unlockCodeBtConfig = this.screenConfig.unlock_button;    
        if(unlockCodeBtConfig.type == "image") {
          var unlockCodeBt = this.game.add.sprite(unlockCodeBtConfig.position.x, unlockCodeBtConfig.position.y, unlockCodeBtConfig.image);
          unlockCodeBt.scale.setTo(unlockCodeBtConfig.width / unlockCodeBt.width, unlockCodeBtConfig.height / unlockCodeBt.height);
          unlockCodeBt.inputEnabled = true;  
          unlockCodeBt.input.useHandCursor = true;
          unlockCodeBt.events.onInputDown.add(this.unlockHandler, this);
        } else if(unlockCodeBtConfig.type == "button") {
          var unlockCodeBt = new LetiFramework.Ui.Button(this.game, unlockCodeBtConfig.position.x, unlockCodeBtConfig.position.y, unlockCodeBtConfig.width, 
                unlockCodeBtConfig.height, unlockCodeBtConfig.text, unlockCodeBtConfig.text_style, unlockCodeBtConfig.button_style, 
                this.unlockHandler, this);
        }       

        if(LetiFramework.App.isPhoneGap()) {
           this.music = LetiFramework.SoundManager.getSound(this.soundPath, false);
        } else {
           this.music = this.game.add.audio(this.screenConfig.audio);
        } 

        if(LetiFramework.SoundManager.soundOn) {
          this.music.play();
        }
    },
    unlockCodeHandler: function() {
        store.set("prevScreen", "Unlock");
        store.set("maxLength", this.screenConfig.unlock_code_label.max_length);
        LetiFramework.Renderer.render("Keyboard");
    },
    unlockHandler: function() {      
        LetiFramework.Analytics.trackEvent("Unlock", "Button Click", "Unlock", 0);

        var unlockCode = store.get("unlockCode");          

        this.clearFields();    

        if(unlockCode && $.trim(unlockCode) != "") {
            var self = this;
            // login on server
            LetiFramework.NetworkManager.postRequest("UnlockServlet", 
                { appBuildId: LetiFramework.NetworkManager.appId, lockCode: unlockCode }, 
                function(data) {
                    data = JSON.parse(data);
                    if(data.recordId > 0) {
                        LetiFramework.GameController.bootScreen = self.screenConfig.next_screen;
                        LetiFramework.GameController.bootSequence();
                    } else {
                        var message = data.message;
                        alert(message);
                    }
                }, 
                function() {
                    alert("Unlock failed! Please check your internet connection.");
                });            
        } else {
            this.showError("Please enter code to unlock!");
        }
    },
    clearFields: function() {
        store.remove("unlockCode");
        this.unlockCodeLbl.setText(this.screenConfig.unlock_code_label.hint);
    },
    showError: function(msg) {
        LetiFramework.Analytics.trackEvent("Unlock", "Error", msg, 0);
        alert(msg);
    },
    showMsg: function(msg) {
        alert(msg);
    },
    shutdown: function() {
        this.music.stop();
    },
    getScreenConfigImagePath: function(name) {
        return "assets/img/" + name;
    },
    getSoundPath: function(name) {
        return 'assets/sound/' + name;
    }
}