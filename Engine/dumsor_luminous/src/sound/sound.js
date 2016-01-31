var LetiFramework = LetiFramework || {};

LetiFramework.Sound = LetiFramework.Sound || {};

LetiFramework.Sound.SoundObject = function(src, loop) {
	this.src = src;
	this.loop = loop;
	this.mediaObj = null;
	this.paused = false;
	this.stopped = false;
}

LetiFramework.Sound.SoundObject.prototype = {
	play: function() {
		if(this.mediaObj == null) {
			this.mediaObj = new Media(this.getMediaURL(this.src), this.onSuccess, this.onError, this.loop ? this.loopSound : null);
			this.mediaObj.ctx = this;
		}		
		this.mediaObj.play();
	},
	pause: function() {
		if(this.mediaObj) {
			this.mediaObj.pause();
		}
	},
	stop: function() {	
		if(this.mediaObj) {
			this.stopped = true;
			this.mediaObj.stop();
		}
	},
	destroy: function() {
		if(this.mediaObj) {
			this.mediaObj.stop();
			this.mediaObj.release();
		}	
	},
	loopSound: function(status) {
		if (status === Media.MEDIA_STOPPED) { 
			if(!this.ctx.stopped) {
				this.play();
			}	    	
	    }	
	},
	getMediaURL: function(src) {	
		if(src.indexOf("file:") > -1) {
			// no change
		} else if(device.platform.toLowerCase() === "android") { 
			return "/android_asset/www/" + src;
		}
	    return src;
	},
	onSuccess: function() {
	    console.log("playAudio():Audio Success");
	},
	onError: function() {
	    console.log("playAudio():Audio Failed");
	}
}