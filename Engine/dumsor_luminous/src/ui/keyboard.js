var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.keyboard = function(game) {}

LetiFramework.Ui.keyboard.prototype = {
	init: function() {
		this.inputText = "";
		this.prevScreen = store.get("prevScreen");
		this.maxInputLength = store.get("maxLength");
		this.isNumber = store.get("number");
		store.remove("number");
		store.remove("maxLength");
		store.remove("prevScreen");
	},
	preload: function() {
		this.game.stage.backgroundColor = 0x4d4d4d;		
	},
	create: function() {
		var style = [{font: "40px Arial", fill: 'white'}, {color: 0x0000ff, border: {color: 0xffffff, thickness: 1}}];

		var startX = this.game.width - 300;
		var startY = this.game.height - 390;

		for (var i = 1, x = startX, y = startY; i < 11; i++, x += 93) {
			var keyCode = "" + (i < 10 ? i : 0);

			this.addInputTextKeyCode(keyCode.charCodeAt(0));

			var button = new LetiFramework.Ui.Button(this.game, x, y, 80, 80, 
	        	keyCode, style[0], style[1], function() { 
	        		LetiFramework.Renderer.currentState().appendInputText(this.getText());
	        	}, null);

			if(i % 3 == 0) {
				y += 93;
				x = startX - 93;
			}
		}

		var otherKeyCodes = [
			Phaser.Keyboard.SPACEBAR,
			Phaser.Keyboard.COLON,
			Phaser.Keyboard.BACKSPACE,
			Phaser.Keyboard.UNDERSCORE,
			Phaser.Keyboard.QUESTION_MARK,
			Phaser.Keyboard.QUOTES,
			Phaser.Keyboard.ENTER
		];

		for (var i = otherKeyCodes.length - 1; i >= 0; i--) {
			this.addInputTextKeyCode(otherKeyCodes[i]);
		};

		var alphabets = [
			"Q", 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 
			'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
			'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '?', 
			':', ';', '"', '\'', '!', '_', ' ' ];

		this.alphabetButtons = [];

		startX = 30;
		for (var i = 0, x = startX, y = startY; i < alphabets.length && !this.isNumber; i++, x += 93) {
			if(i + 1 == alphabets.length) {
				var button = new LetiFramework.Ui.Button(this.game, x, y, 173, 80, 
		        	"Caps On", style[0], style[1], function() { 
		        		var txt = this.getText();
    					this.text.text = txt == "Caps On" ? "Caps Off" : "Caps On";
    					var buttons = LetiFramework.Renderer.currentState().alphabetButtons;
    					for (var i = buttons.length - 1; i >= 0; i--) {
    						var buttonTxt = buttons[i].text;
    						buttonTxt.text = txt == "Caps On" ? buttonTxt.text.toLowerCase() : buttonTxt.text.toUpperCase();
    					}
		        	}, null);
				button = new LetiFramework.Ui.Button(this.game, x + 186, y, 266, 80, 
		        	"Space", style[0], style[1], function() { 
		        		LetiFramework.Renderer.currentState().appendInputText(" ");
		        	}, null);
				button = new LetiFramework.Ui.Button(this.game, this.game.width - 207, y, 173, 80, 
		        	"Enter", style[0], style[1], function() { 
		        		LetiFramework.Renderer.currentState().appendInputText("\n");
		        	}, null);
				break;
			}

			var keyCode = alphabets[i];

			this.addInputTextKeyCode(keyCode.charCodeAt(0));

			var button = new LetiFramework.Ui.Button(this.game, x, y, 80, 80, 
	        	keyCode, style[0], style[1], function() { 
	        		LetiFramework.Renderer.currentState().appendInputText(this.getText());
	        	}, null);

			if(i < 26) {
				this.alphabetButtons.push(button);
			}

			if((i + 1) % 10 == 0) {
				y += 93;
				x = -63;
			} 
		}

		startX = this.game.width - 300;	
		startY = 30;
		var fxns = ["Ok", "Cancel", "Clear", 'Delete'];
		style[1].color = 0xff0000;
		for (var i = 0; i < fxns.length; i++, startY += 68) {
			var button = new LetiFramework.Ui.Button(this.game, startX, startY, 266, 60, 
		        	fxns[i], style[0], style[1], function() { 
		        		switch(this.getText()) {
		        			case 'Delete':
		        				LetiFramework.Renderer.currentState().deleteInputText();
		        				break;
	        				case 'Clear':
	        					LetiFramework.Renderer.currentState().clearInputText();
		        				break;
	        				case 'Cancel':
	        					var prevScreen = LetiFramework.Renderer.currentState().prevScreen;
	        					LetiFramework.Renderer.render(prevScreen);
		        				break;
	        				case 'Ok':
	        					var prevScreen = LetiFramework.Renderer.currentState().prevScreen;
	        					var input = LetiFramework.Renderer.currentState().inputText;
	        					store.set("userInput", $.trim(input));	        					
	        					LetiFramework.Renderer.render(prevScreen);
		        				break;
	        				default:	        					
		        				break;
		        		}
		        	}, null);
			if(i == 1) {
				style[1].color = 0x217821;
				startY += 20;
			}
		}	

		this.textPanel = this.game.add.graphics(30, 30);
		this.textPanel.beginFill(0x000000, 1);
		this.textPanel.drawRect(0, 0, this.game.width - 360, (this.isNumber ? 660 : 287));
		this.textPanel.endFill();

		var textBoxStyle = { font: '33px Arial', fill: 'white', wordWrap: true, wordWrapWidth: this.textPanel.width - 20 };
		this.textBox = this.game.add.text(40, 40, this.inputText, textBoxStyle);

		this.caretShown = false;
		setInterval(this.caretAnim, 700);
  	},
  	addInputTextKeyCode: function(keyCode) {  		
  		var key = this.game.input.keyboard.addKey(keyCode);
    	key.onDown.add(function(){ 
    		if(this.keyCode == Phaser.Keyboard.BACKSPACE) {
    			this.ctx.deleteInputText();
    		} else {
    			this.ctx.appendInputText(String.fromCharCode(this.keyCode));
    		}    		
    	}, {ctx: this, keyCode: keyCode});
  	},
  	appendInputText: function(text) {  		
  		if(this.inputText.length < this.maxInputLength) {
  			this.inputText += text;
  			this.textBox.text = this.inputText;
  		} else {
  			alert("Maximum " + this.maxInputLength + " Characters allowed");
  		}  		
  	},
  	deleteInputText: function() {
  		if(this.inputText.length > 0) {
  			this.inputText  = this.inputText.substring(0, this.inputText.length - 1);
  			this.textBox.text = this.inputText;
  		}  		
  	},
  	clearInputText: function() {
  		this.inputText  = "";
  		this.textBox.text = this.inputText;
  	},
  	caretAnim: function() {
  		var thisInstance = LetiFramework.Renderer.currentState();
  		thisInstance.textBox.text = thisInstance.caretShown ? thisInstance.inputText : thisInstance.inputText + "_";
  		thisInstance.caretShown = !thisInstance.caretShown;
  	}
}