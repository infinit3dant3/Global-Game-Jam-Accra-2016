var LetiFramework = LetiFramework || {};

LetiFramework.Renderer = {};

LetiFramework.Renderer.width = 1280;

LetiFramework.Renderer.height = 720;

LetiFramework.Renderer.game = null;

LetiFramework.Renderer.animScale = 1;

LetiFramework.Renderer.initialize = function() {
	// Initialize game
	this.game = new Phaser.Game(this.width, this.height, Phaser.CANVAS, '');

	// Add game states
	this.game.state.add("Boot", LetiFramework.Ui.boot);
	this.game.state.add("Splash", LetiFramework.Ui.splash);
	this.game.state.add("Generic", LetiFramework.Ui.generic);
	this.game.state.add("Menu", LetiFramework.Ui.menu);
	this.game.state.add("SubMenu", LetiFramework.Ui.submenu);
	this.game.state.add("About", LetiFramework.Ui.about);
	this.game.state.add("Keyboard", LetiFramework.Ui.keyboard);
	this.game.state.add("Login", LetiFramework.Ui.login);
	this.game.state.add("Register", LetiFramework.Ui.register);
	this.game.state.add("SplashVideo", LetiFramework.Ui.splashvideo);
	this.game.state.add("Title", LetiFramework.Ui.storyTitle);
	this.game.state.add("Achievement", LetiFramework.Ui.achievement);
	this.game.state.add("Unlock", LetiFramework.Ui.unlock);

	this.animScale = LetiFramework.App.isPhoneGap() ? 3/8 : 1;
}

LetiFramework.Renderer.configTransitionAnim = function(anim) {
	var properties = null;
	var duration = 0;

	if(anim == "fade") {
		properties = {alpha: 0};
		duration = 1;
	} else if(anim == "fadeGrow") {
		properties = {alpha: 0, scale: {x: 1.4, y: 1.4}};
		duration = 1;
	} else if(anim == "fadeShrink") {
		properties = {alpha: 0, scale: {x: 0, y: 0}};
		duration = 1;
	} else if(anim == "left") {
		properties = {x: -this.width * 2};
		duration = 3;
	} else if(anim == "right") {
		properties = {x: this.width * 2};
		duration = 3;
	} else if(anim == "up") {
		properties = {y: -this.height * 2};
		duration = 3;
	} else if(anim == "down") {
		properties = {y: this.height * 2};
		duration = 3;
	} 

	if(properties) {
		if(!this.game.stateTransition) {
			this.game.stateTransition = this.game.plugins.add(Phaser.Plugin.StateTransition);
		}		
		this.game.stateTransition.configure({
			duration: Phaser.Timer.SECOND * duration * (LetiFramework.Renderer.animScale * 0.8),
			ease: Phaser.Easing.Linear.None,
			properties: properties
		});
	}
}

LetiFramework.Renderer.addState = function(idx, state) {
	this.game.state.add("GameState" + idx, state);
}

LetiFramework.Renderer.removeState = function(idx) {
	this.game.state.remove("GameState" + idx);
}

LetiFramework.Renderer.render = function(view) {
	this.game.state.start(view);
}

LetiFramework.Renderer.transitionRender = function(view) {
	if(this.game.stateTransition) {
		this.game.stateTransition.to(view);
	} else {
		this.render(view);
	}	
}

LetiFramework.Renderer.currentState = function() {
	if(this.game) {
		return this.game.state.getCurrentState();
	} else {
		return null;
	}
}