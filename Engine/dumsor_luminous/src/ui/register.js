var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.register = function(game) {}

LetiFramework.Ui.register.prototype = {
  	init: function() {
		LetiFramework.Analytics.trackPage("Register");
  	    this.screenConfig = LetiFramework.GameController.bootConfig[LetiFramework.GameController.bootScreen];
        this.otherRegisterFields = this.screenConfig.other_register_fields;
        this.hiddenRegisterFields = this.screenConfig.hidden_register_fields;
  	},
  	preload: function() {
  		this.game.load.image(this.screenConfig.background, this.getScreenConfigImagePath(this.screenConfig.background));

        if(!LetiFramework.App.isPhoneGap()) {
            this.game.load.audio(this.screenConfig.audio, this.getSoundPath(this.screenConfig.audio));
        }
        this.soundPath = this.getSoundPath(this.screenConfig.audio);

        if(this.screenConfig.cancel_button.type == "image") {
            this.game.load.image(this.screenConfig.cancel_button.image, this.getScreenConfigImagePath(this.screenConfig.cancel_button.image));           
        }

        if(this.screenConfig.register_button.type == "image") {
            this.game.load.image(this.screenConfig.register_button.image, this.getScreenConfigImagePath(this.screenConfig.register_button.image));           
        }

        for(var i in this.otherRegisterFields) {
            var field = this.otherRegisterFields[i];
            if(field.drop_down == true) {
                this.game.load.image(field.name + "drop_down", this.getScreenConfigImagePath(field.drop_down_bg));
            }
        }
  	},
  	create: function() {
  		this.bg = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, this.screenConfig.background);
        this.bg.anchor.set(0.5);
        this.bg.scale.setTo(LetiFramework.Renderer.width / this.bg.width, LetiFramework.Renderer.height / this.bg.height);

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

        var regFieldNameValues = {};
        for(var i = 0; i < this.otherRegisterFields.length; i++) {
            var regField = this.otherRegisterFields[i];
            var regFieldName = regField.name;
            var regFieldVal = store.get(regFieldName);

            if(!regFieldVal) {
              regFieldVal = regField.hint;
            }         

            if(inputType == regFieldName) {
              regFieldVal = input || regField.hint;
              if(input) store.set(regFieldName, input);
              else store.remove(regFieldName);
            }

            regFieldNameValues[regFieldName] = regFieldVal;
        }

      	var nicknameLblConfig = this.screenConfig.nickname_field;
        this.nicknameLbl = new LetiFramework.Ui.Button(this.game, nicknameLblConfig.position.x, nicknameLblConfig.position.y, 
            nicknameLblConfig.width, nicknameLblConfig.height, nickname, nicknameLblConfig.text_style, nicknameLblConfig.label_style, 
            this.nicknameHandler, this); 

        this.otherRegFieldLabels = [];
        for(var i = 0; i < this.otherRegisterFields.length; i++) {
            var regField = this.otherRegisterFields[i];
            var fieldLbl;
            if(regField.drop_down == true) {
                var dropDownBg = this.game.add.sprite(regField.position.x, regField.position.y, regField.name + "drop_down");
                dropDownBg.scale.setTo(regField.width / dropDownBg.width, regField.height / dropDownBg.height);
                dropDownBg.inputEnabled = true;  
                dropDownBg.input.useHandCursor = true;                

                fieldLbl = this.game.add.text(dropDownBg.x + 0.5 * dropDownBg.width, dropDownBg.y + 0.5 * dropDownBg.height, 
                    regFieldNameValues[regField.name],  regField.text_style);
                fieldLbl.anchor.set(0.5);
                fieldLbl.inputEnabled = true;  
                fieldLbl.input.useHandCursor = true;

                fieldLbl.events.onInputDown.add(this.fieldLabelHandler, { model: regField, field: fieldLbl });
                dropDownBg.events.onInputDown.add(this.fieldLabelHandler, { model: regField, field: fieldLbl });
            } else {
                fieldLbl = new LetiFramework.Ui.Button(this.game, regField.position.x, regField.position.y, 
                    regField.width, regField.height, regFieldNameValues[regField.name], regField.text_style, 
                    regField.label_style, this.fieldLabelHandler, regField);
            }            
            this.otherRegFieldLabels.push(fieldLbl);
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

        var cancelBtConfig = this.screenConfig.cancel_button;
        if(cancelBtConfig.type == "image") {
            var cancelBt = this.game.add.sprite(cancelBtConfig.position.x, cancelBtConfig.position.y, cancelBtConfig.image);
            cancelBt.scale.setTo(cancelBtConfig.width / cancelBt.width, cancelBtConfig.height / cancelBt.height);
            cancelBt.inputEnabled = true;  
            cancelBt.input.useHandCursor = true;
            cancelBt.events.onInputDown.add(this.cancelHandler, this);
        } else if(cancelBtConfig.type == "button") {
            var cancelBt = new LetiFramework.Ui.Button(this.game, cancelBtConfig.position.x, cancelBtConfig.position.y, cancelBtConfig.width, 
                  cancelBtConfig.height, cancelBtConfig.text, cancelBtConfig.text_style, cancelBtConfig.button_style, 
                  this.cancelHandler, this);
        }

        if(LetiFramework.App.isPhoneGap()) {
           this.music = LetiFramework.SoundManager.getSound(this.soundPath, false);
        } else {
           this.music = this.game.add.audio(this.screenConfig.audio);
        }

        if(LetiFramework.SoundManager.soundOn) {
          this.music.play();
        }

        this.listenSwipe(this.scrollDropDown);
  	},
  	nicknameHandler: function() {
        store.set("inputType", "nickname");
      	store.set("prevScreen", "Register");
        store.set("maxLength", this.screenConfig.nickname_field.max_length);
      	LetiFramework.Renderer.render("Keyboard");
    },
    fieldLabelHandler: function() {
        var state = LetiFramework.Renderer.currentState();
        if(state.dd) {
            state.dd.destroy();
            state.dd = null;
        }

        if(this.model) {
            var model = this.model;
            var field = this.field;

            var dividerHeight = model.drop_down_list_item_divider_height;
            var itemCount = model.drop_down_items.length;

            var game = LetiFramework.Renderer.game;

            state.dd = game.add.group();
            state.dd.x = model.position.x;            
            state.dd.y = model.position.y + model.height;            
            state.dd.width = model.width;
            state.dd.height = model.drop_down_list_height;
            state.dd.yOrigin = model.position.y + model.height;
            state.dd.yEnd = model.position.y + model.height + model.drop_down_list_height;
            state.dd.realHeight = itemCount * (dividerHeight + model.height) - dividerHeight;
            state.dd.hiddenHeight = state.dd.realHeight - model.drop_down_list_height;
            state.dd.noScroll = state.dd.realHeight <= model.drop_down_list_height;
            state.dd.model = model;
            state.dd.field = field;
            state.dd.show = true;

            var mask = game.add.graphics(0, 0);
            mask.beginFill(0xff0000);
            mask.drawRect(model.position.x, model.position.y + model.height, model.width, model.drop_down_list_height);
            state.dd.mask = mask;

            var ddBg = game.add.graphics(0, 0);
            ddBg.beginFill(model.drop_down_list_color, 1);
            ddBg.drawRect(0, 0, model.width, model.drop_down_list_height);
            ddBg.endFill();

            state.dd.add(ddBg);

            state.dd.container = game.add.group();
            state.dd.container.x = 0;            
            state.dd.container.y = 0;            
            state.dd.container.width = model.width;
            state.dd.container.height = model.drop_down_list_height;
            state.dd.add(state.dd.container);

            for(var i = 0; i < itemCount; i++) {
                (function(item) {
                    var optionBg = game.add.graphics(0, i * (model.height + (i > 0 ? dividerHeight : 0)));
                    optionBg.beginFill(model.drop_down_list_item_color, 1);
                    optionBg.drawRect(0, 0, model.width, model.height);
                    optionBg.endFill();
                    optionBg.inputEnabled = true;  
                    optionBg.input.useHandCursor = true;

                    var option = game.add.text(0.5 * model.width, (i + 0.5) * (model.height + (i > 0 ? dividerHeight : 0)), 
                        item,  model.drop_down_list_text_style);
                    option.anchor.set(0.5);
                    option.inputEnabled = true;  
                    option.input.useHandCursor = true;

                    var handle = function() {
                        state.dd.item = item;
                    };

                    option.events.onInputDown.add(handle, model);
                    optionBg.events.onInputDown.add(handle, model);

                    state.dd.container.add(optionBg);
                    state.dd.container.add(option);

                })(model.drop_down_items[i]);
            }
        } else {
            store.set("inputType", this.name);
            store.set("prevScreen", "Register");
            store.set("maxLength", this.max_length);
            if(this.validation.input_type && this.validation.input_type == "number") {
              store.set("number", true);
            }
            LetiFramework.Renderer.render("Keyboard");
        }    	
    },
    registerHandler: function() {
        LetiFramework.Analytics.trackEvent("Register", "Button Click", "Register", 0);
        var nickname = store.get("nickname");
        if(!nickname || $.trim(nickname).length == 0) {
            this.showError("Please enter Nickname");
        } else {
            var passedValidation = true;  
            var errMsg = "";

            for(var i = 0; i < this.otherRegisterFields.length; i++) {
                var regField = this.otherRegisterFields[i];
                var validation = regField.validation;
                var hint = regField.hint;
                var fieldName = regField.name;
                var fieldValue = store.get(fieldName);                
                if(!fieldValue) fieldValue = "";

                if($.trim(fieldValue).length == 0 && validation && validation.required) {
                    passedValidation = false;
                    errMsg = "Please enter " + hint;
                    break;
                }
                else if($.trim(fieldValue).length > 0 && validation && validation.input_type
                  && validation.input_type == "number"
                  && !(Math.floor(fieldValue) == fieldValue && $.isNumeric(fieldValue))) {
                    passedValidation = false;
                    errMsg = "Invalid " + hint;
                    break;
                }
                else if($.trim(fieldValue).length > 0 && validation && validation.input_allowed
                  && $.inArray(fieldValue, validation.input_allowed) == -1) {
                    passedValidation = false;
                    var allowed = "";
                    for(var j = 0; j < validation.input_allowed.length; j++) {
                        allowed += (j > 0 ? " or " : "") + validation.input_allowed[j];
                    }
                    errMsg = "Please enter either " + allowed + " for " + hint;
                    break;
                }
                else if(regField.confirm && store.get(regField.confirm) != fieldValue) {
                    passedValidation = false;
                    errMsg = hint + " doesn't match";
                }
            }

            if(passedValidation) {
                var users = LetiFramework.Db.readByKeyValue("users", "nickname", nickname);
                if(users.length > 0) {
                    this.showError("Nickname already exists!");
                } else {                  
                    var user = new LetiFramework.DbEntities.User(nickname);

                    var otherRegisterFields = {};

                    for(var j = 0; j < this.otherRegisterFields.length; j++) {
                        var regField = this.otherRegisterFields[j];

                        if(regField.confirm) continue;

                        var fieldName = regField.name;
                        var fieldValue = store.get(fieldName);

                        var validation = regField.validation;
                        if(validation && validation.input_type && validation.input_type == "number") {
                            fieldValue = Number(fieldValue);
                        }
                        
                        otherRegisterFields[fieldName] = fieldValue;
                    }

                    for(var j = 0; j < this.hiddenRegisterFields.length; j++) {
                        var regField = this.hiddenRegisterFields[j];
                        var fieldName = regField.name;
                        var fieldValue = regField.value;                        
                        otherRegisterFields[fieldName] = fieldValue;
                    }

                    user.otherRegisterFields = JSON.stringify(otherRegisterFields);
                    user.appBuildId = LetiFramework.NetworkManager.appId;

                    if(LetiFramework.App.isPhoneGap()) {
                        var self = this;
                        // register on server
                        LetiFramework.NetworkManager.postRequest("RegisterServlet",
                            user,
                            function(data) {
                                data = JSON.parse(data);
                                if(data.recordId > 0) {
                                  user.id = data.recordId;
                                  self.registerSuccessHandler(user);                                
                                } else {
                                  var message = data.message;
                                  alert(message);
                                }
                            }, 
                            function() {
                                alert("Registration failed! Please check your internet connection.");
                            });
                    } else {
                        user.id = new Date().getTime();
                        this.registerSuccessHandler(user);
                    }                                        
                }
            } else {
                this.showError(errMsg);
            }
        }
    },
    registerSuccessHandler: function(user) {
        LetiFramework.Analytics.trackEvent("Register", "Success", user, 0);                                
        LetiFramework.Db.create("users", user);
        store.set("session", user.nickname);
        this.clearFields();   
        LetiFramework.GameController.bootScreen = this.screenConfig.register_button.next_screen;
        LetiFramework.GameController.loginUser(user);
    },
    cancelHandler: function() {
        LetiFramework.Analytics.trackEvent("Register", "Button Click", "Cancel", 0);
        this.clearFields();		        		
        LetiFramework.GameController.bootScreen = this.screenConfig.cancel_button.next_screen;
        LetiFramework.GameController.bootSequence();
    },
  	clearFields: function() {
        store.remove("nickname");
        this.nicknameLbl.setText(this.screenConfig.nickname_field.hint);
        for(var i = 0; i < this.otherRegisterFields.length; i++) {
            var regField = this.otherRegisterFields[i];
            store.remove(regField.name);        
            this.otherRegFieldLabels[i].setText(regField.hint);
        }        
  	},
  	showError: function(msg) {
        LetiFramework.Analytics.trackEvent("Register", "Error", msg, 0);
  		  alert(msg);
  	},
  	shutdown: function() {
  		  this.music.destroy();
  	},
  	getScreenConfigImagePath: function(name) {
        return "assets/img/" + name;
    },
    getSoundPath: function(name) {
        return 'assets/sound/' + name;
    },
    scrollDropDown: function(direction, delta) {
        var state = LetiFramework.Renderer.currentState();

        if(state.dd == null || state.dd.noScroll) return;

        if(direction == "top" || direction == "bottom") {
            state.dd.container.y += delta;

            var listPositionY = state.dd.container.y
            var listBottom = listPositionY + state.dd.container.height;
            var reset = 0;

            if(listPositionY > 0) {
                state.dd.container.y = 0;
            } else if(listPositionY < -state.dd.hiddenHeight) {
                state.dd.container.y  = -state.dd.hiddenHeight;
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
            var delta = 0;

            var actionSwipe = dx > minimum.distance || dy > minimum.distance;

            if (eventDuration > minimum.duration && actionSwipe) {
                if(this.dd) this.dd.item = null;

                // Check direction
                if (endPoint.x - startPoint.x > minimum.distance) {
                    direction = 'right';
                    delta = dx;
                } else if (startPoint.x - endPoint.x > minimum.distance) {
                    direction = 'left';
                    delta = -dx;
                } else if (endPoint.y - startPoint.y > minimum.distance) {
                    direction = 'bottom';
                    delta = dy;
                } else if (startPoint.y - endPoint.y > minimum.distance) {
                    direction = 'top';
                    delta = -dy;
                }

                if (direction) {  
                    callback(direction, delta);
                }
            } else {
                if(this.dd) {
                    if(this.dd.item) {
                        store.set(this.dd.model.name, this.dd.item);
                        this.dd.field.text = this.dd.item;
                        // destroy
                        this.dd.destroy();
                        this.dd = null;
                    } else if(this.dd.show) {
                        this.dd.show = false;
                    } else {
                        // destroy
                        this.dd.destroy();
                        this.dd = null;
                    }
                }
            }
        }, this);
    }
}