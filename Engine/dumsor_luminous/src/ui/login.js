var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.login = function(game) {}

LetiFramework.Ui.login.prototype = {
    init: function() {
      LetiFramework.Analytics.trackPage("Login");
      this.screenConfig = LetiFramework.GameController.bootConfig[LetiFramework.GameController.bootScreen];
      this.otherLoginFields = this.screenConfig.other_login_fields;
    },
    preload: function() {
        this.game.load.image(this.screenConfig.background, this.getScreenConfigImagePath(this.screenConfig.background)); 
        this.game.load.image(this.screenConfig.exit_button.image, this.getScreenConfigImagePath(this.screenConfig.exit_button.image)); 

        if(!LetiFramework.App.isPhoneGap()) {
          this.game.load.audio(this.screenConfig.audio, this.getSoundPath(this.screenConfig.audio));  
        }
        this.soundPath = this.getSoundPath(this.screenConfig.audio);

        if(this.screenConfig.login_button.type == "image") {
          this.game.load.image(this.screenConfig.login_button.image, this.getScreenConfigImagePath(this.screenConfig.login_button.image));           
        }

        if(this.screenConfig.register_button.type == "image") {
          this.game.load.image(this.screenConfig.register_button.image, this.getScreenConfigImagePath(this.screenConfig.register_button.image));           
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

        var loginErr = store.get("loginErr");
        if(loginErr) {
          store.remove("loginErr");
          this.showError(loginErr);
        }

        var input = store.get("userInput");
        var inputType = store.get("inputType");
        store.remove("userInput");
        store.remove("inputType");

        var nickname = store.get("nickname");

        if(!nickname) {
            nickname = this.screenConfig.nickname_field.hint;
        }

        if(inputType == "nickname") {
            nickname = input || this.screenConfig.nickname_field.hint;
            if(input) store.set("nickname", input);
            else store.remove("nickname");
        }

        var loginFieldNameValues = {};
        for(var i = 0; i < this.otherLoginFields.length; i++) {
            var loginField = this.otherLoginFields[i];
            var loginFieldName = loginField.name;
            var loginFieldVal = store.get(loginFieldName);

            if(!loginFieldVal) {
                loginFieldVal = loginField.hint;
            }

            if(inputType == loginFieldName) {
                loginFieldVal = input || loginField.hint;
                if(input) store.set(loginFieldName, input);
                else store.remove(loginFieldName);
            }

            loginFieldNameValues[loginFieldName] = loginFieldVal;
        }

        var nicknameLblConfig = this.screenConfig.nickname_field;
        this.nicknameLbl = new LetiFramework.Ui.Button(this.game, nicknameLblConfig.position.x, nicknameLblConfig.position.y, 
          nicknameLblConfig.width, nicknameLblConfig.height, nickname, nicknameLblConfig.text_style, nicknameLblConfig.label_style, 
                this.nicknameHandler, this);   

        this.otherLoginFieldLabels = [];
        for(var i = 0; i < this.otherLoginFields.length; i++) {
            var loginField = this.otherLoginFields[i];
            var fieldLbl = new LetiFramework.Ui.Button(this.game, loginField.position.x, loginField.position.y, 
                loginField.width, loginField.height, loginFieldNameValues[loginField.name], loginField.text_style, 
                loginField.label_style, this.fieldLabelHandler, loginField);
            this.otherLoginFieldLabels.push(fieldLbl);
        }  

        var loginBtConfig = this.screenConfig.login_button;    
        if(loginBtConfig.type == "image") {
          var loginBt = this.game.add.sprite(loginBtConfig.position.x, loginBtConfig.position.y, loginBtConfig.image);
          loginBt.scale.setTo(loginBtConfig.width / loginBt.width, loginBtConfig.height / loginBt.height);
          loginBt.inputEnabled = true;  
          loginBt.input.useHandCursor = true;
          loginBt.events.onInputDown.add(this.loginHandler, this);
        } else if(loginBtConfig.type == "button") {
          var loginBt = new LetiFramework.Ui.Button(this.game, loginBtConfig.position.x, loginBtConfig.position.y, loginBtConfig.width, 
                loginBtConfig.height, loginBtConfig.text, loginBtConfig.text_style, loginBtConfig.button_style, 
                this.loginHandler, this);
        }       

        var regBtConfig = this.screenConfig.register_button;
        if(regBtConfig.type == "image") {
          var registerBt = this.game.add.sprite(regBtConfig.position.x, regBtConfig.position.y, regBtConfig.image);
          registerBt.scale.setTo(regBtConfig.width / registerBt.width, regBtConfig.height / registerBt.height);
          registerBt.inputEnabled = true;  
          registerBt.input.useHandCursor = true;
          registerBt.events.onInputDown.add(this.registerHandler, this);
        } else if(regBtConfig.type == "button") {
          var registerBt = new LetiFramework.Ui.Button(this.game, regBtConfig.position.x, regBtConfig.position.y, regBtConfig.width, 
                regBtConfig.height, regBtConfig.text, regBtConfig.text_style, regBtConfig.button_style, 
                this.registerHandler, this);         
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
    nicknameHandler: function() {
        store.set("inputType", "nickname");
        store.set("prevScreen", "Login");
        store.set("maxLength", this.screenConfig.nickname_field.max_length);
        LetiFramework.Renderer.render("Keyboard");
    },
    fieldLabelHandler: function() {
        store.set("inputType", this.name);
        store.set("prevScreen", "Login");
        store.set("maxLength", this.max_length);
        LetiFramework.Renderer.render("Keyboard");
    },
    loginHandler: function() {      
        LetiFramework.Analytics.trackEvent("Login", "Button Click", "Login", 0);

        var nickname = store.get("nickname");

        if(nickname && $.trim(nickname) != "") {
            if(LetiFramework.App.isPhoneGap()) {
                var self = this;
                var loginObj = { nickname: nickname };

                for(var i in this.otherLoginFields) {
                    var loginField = this.otherLoginFields[i];
                    loginObj[loginField.name] = store.get(loginField.name) || "";
                }

                // login on server
                LetiFramework.NetworkManager.postRequest("LoginServlet",
                    loginObj,
                    function(data) {
                        data = JSON.parse(data);                        
                        if(data.readRecords.length > 0) {
                            var user;
                            var users = LetiFramework.Db.readByKeyValue("users", "nickname", nickname);        
                            if(users.length > 0) {
                                user = users[0];
                            } else {
                                user = data.readRecords[0];
                                LetiFramework.Db.create("users", user);
                            }
                            self.clearFields();
                            store.set("session", nickname);   
                            LetiFramework.GameController.bootScreen = self.screenConfig.login_button.next_screen;
                            LetiFramework.GameController.loginUser(user);
                        } else {
                            var message = data.message.length > 0 ? data.message : "Login failed!";
                            alert(message);
                        }
                    }, 
                    function() {
                        alert("Login failed! Please check your internet connection.");
                    });
            } else {
                var users = LetiFramework.Db.readByKeyValue("users", "nickname", nickname);

                var authenticated = users.length > 0;

                if(authenticated) {  
                    var user = users[0];
                    var otherRegFields = JSON.parse(user.otherRegisterFields);

                    for(var i in this.otherLoginFields) {
                        var loginField = this.otherLoginFields[i];                        

                        if(otherRegFields && otherRegFields.hasOwnProperty(loginField.name)) {
                            authenticated &= store.get(loginField.name) == otherRegFields[loginField.name];
                        } else {
                            authenticated &= store.get(loginField.name) == undefined;
                            otherRegFields[loginField.name] = "";
                        }
                    }
                }

                if(authenticated) {      
                    this.clearFields();          
                    store.set("session", nickname);
                    LetiFramework.GameController.bootScreen = this.screenConfig.login_button.next_screen;
                    LetiFramework.GameController.loginUser(users[0]);
                } else {
                    this.showError("Login failed! One or more of the information provided is not correct.");
                }
            }             
        } else {
            this.showError("Please enter Nickname!");
        }
    },
    registerHandler: function() {
        LetiFramework.Analytics.trackEvent("Login","Button Click", "Sign Up", 0);
        this.clearFields();
        LetiFramework.GameController.bootScreen = this.screenConfig.register_button.next_screen;
        LetiFramework.GameController.bootSequence();
    },
    clearFields: function() {
        store.remove("nickname");
        for(var i in this.otherLoginFields) {
            store.remove(this.otherLoginFields[i].name);
            this.otherLoginFieldLabels[i].setText(this.otherLoginFields[i].hint);
        }
        this.nicknameLbl.setText(this.screenConfig.nickname_field.hint);
    },
    showError: function(msg) {
        LetiFramework.Analytics.trackEvent("Login", "Error", msg, 0);
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