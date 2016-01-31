var LetiFramework = LetiFramework || {};

LetiFramework.Cache = LetiFramework.Cache || {};

LetiFramework.Cache.ImageCache = function() {}

LetiFramework.Cache.ImageCache.prototype = {
	cache: {},
	size: 0,
	get: function(key) {
		return this.cache[key];
	},
	put: function(key, imageUri) {
		this.cache[key] = imageUri;
		this.size++;
	},
	containsKey: function(key) {
		return this.cache.hasOwnProperty(key);
	},
	remove: function(key) {
		if(this.cache.hasOwnProperty(key)) {
			delete this.cache[key];
			this.size--;
		}		
	},
	clear: function() {
		for(var key in this.cache) {
			this.remove(key);
		}
	}
}

var imageCache = new LetiFramework.Cache.ImageCache();