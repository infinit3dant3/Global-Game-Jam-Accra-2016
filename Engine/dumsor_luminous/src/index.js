var LetiFramework = LetiFramework || {};

LetiFramework.App = LetiFramework.App || {};

LetiFramework.App.scaled = 1;

LetiFramework.App.initialize = function() {    
    if (this.isPhoneGap()) {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("pause", this.onPause, false);
        document.addEventListener("resume", this.onResume, false);
        document.addEventListener("backbutton", this.onBackKeyDown, false);
    } else {       
        this.onDeviceReady();
    }
}

LetiFramework.App.isPhoneGap = function() {
    return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone)/);
}

LetiFramework.App.onBackKeyDown = function(e) {
    e.preventDefault();
}

LetiFramework.App.removeOnBackKeyDown = function(e) {
    document.removeEventListener("backbutton", this.onBackKeyDown, false);
}

LetiFramework.App.onPause = function() {
    var state = LetiFramework.Renderer.currentState();
    if(state) {
        state.pause();
    }
}

LetiFramework.App.onResume = function() {
    var state = LetiFramework.Renderer.currentState();
    if(state) {
        state.resume();
    }
}

LetiFramework.App.onDeviceReady = function() {
    if (LetiFramework.App.isPhoneGap()) {
        screen.lockOrientation('landscape');
    }
    LetiFramework.App.initializeFramework();
}

LetiFramework.App.initializeFramework = function() {
    if(LetiFramework.App.isPhoneGap()) {
        // get GA Tracking Id
        LetiFramework.NetworkManager.postRequest("ReadServlet",
                {
                    modelType: LetiFramework.NetworkManager.MODEL_TYPE_APP_BUILD, 
                    id: LetiFramework.NetworkManager.appId
                },
                function(data) {
                    data = JSON.parse(data);                    
                    if(data.readRecords.length > 0) {
                        var app = data.readRecords[0];
                        var trackingId = app.analyticsTrackingId;
                        if(trackingId.length > 0) {
                            store.set("analyticsTrackingId", trackingId);
                            LetiFramework.Analytics.initialize(trackingId);
                        }                            
                    }
                }, 
                function(err) {
                    
                });        
    }
    //LetiFramework.NotificationService.initialize();
    LetiFramework.FileManager.initialize();
    LetiFramework.NetworkManager.initialize();
    LetiFramework.Db.initialize();    
    //LetiFramework.Db.clear();
    //LetiFramework.Db.printDb();
    LetiFramework.SoundManager.initialize();
    LetiFramework.Renderer.initialize();
    LetiFramework.GameController.initialize();
}

LetiFramework.App.initialize();