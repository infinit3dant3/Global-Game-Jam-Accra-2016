var LetiFramework = LetiFramework || {};

LetiFramework.SoundManager = LetiFramework.SoundManager || {};

LetiFramework.SoundManager.soundOn = true; // for sfx and bg
LetiFramework.SoundManager.narrationOn = true;

LetiFramework.SoundManager.initialize = function() {
	
}

LetiFramework.SoundManager.getSound = function(src, loop) {
	return new LetiFramework.Sound.SoundObject(src, loop);
}