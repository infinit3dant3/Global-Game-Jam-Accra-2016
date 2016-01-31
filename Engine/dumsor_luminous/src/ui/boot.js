var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.boot = function(game) {}

LetiFramework.Ui.boot.prototype = {
	init: function() {
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.scale.setScreenSize(true);

		//this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
	},
	preload: function() {	

	},
	create: function() {	
		var savedInstance = store.get("savedInstance");
		if(savedInstance) { 		
	  		// delete savedInstance and resume game
	  		store.remove("savedInstance");
	  		LetiFramework.GameController.resumeActivity();
	  	} else {
	  		if(LetiFramework.GameController.gup("page")) {				
				LetiFramework.GameController.fetchGames();
			} else {				
				LetiFramework.GameController.bootSequence();
			}
	  	}
  	}  	
}