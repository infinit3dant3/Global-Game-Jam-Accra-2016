var LetiFramework = LetiFramework || {};

LetiFramework.NotificationService = LetiFramework.NotificationService || {};

LetiFramework.NotificationService.senderId = '969724924992';

LetiFramework.NotificationService.initialize = function() {
    if(LetiFramework.App.isPhoneGap()) {
        var registrationId = store.get("pushRegistrationId");
        if(registrationId) {
            // check if we need to update regId
            LetiFramework.NetworkManager.postRequest("ReadFieldServlet",
                {
                    modelType: LetiFramework.NetworkManager.MODEL_TYPE_PUSH_REGISTRATION, 
                    sortField: "createdDateTimeStamp",
                    sortDirection: 0,
                    startIndex: 0,
                    recordCount: 1,
                    fieldNames: ["registrationId"],
                    fieldValues: [registrationId]
                },
                function(data) {
                    data = JSON.parse(data);                    
                    if(data.readRecords.length > 0) {
                        var serverRegistrationId = data.readRecords[0].registrationId;
                        if(registrationId != serverRegistrationId) {
                            // update registrationId
                            store.set("pushRegistrationId", serverRegistrationId);
                        }
                    } else {
                        // was unregistered
                        store.remove("pushRegistrationId");
                    }
                }, 
                function(err) {
                    
                });  
        } else {
            // register for push
            var push = PushNotification.init({ "android": {"senderID": this.senderId} });
            push.on('registration', this.onRegistration);
            push.on('notification', this.onNotification);
            push.on('error', this.onError);
        }
    }   
}

LetiFramework.NotificationService.onRegistration = function(data) {
    var registrationId = data.registrationId;
    // send registrationId to server
    LetiFramework.NetworkManager.postRequest("CreateServlet",
        {
            modelType: LetiFramework.NetworkManager.MODEL_TYPE_PUSH_REGISTRATION, 
            model: { 
                registrationId: registrationId, 
                appBuildId: LetiFramework.NetworkManager.appId
            }
        },
        function(data) {
            data = JSON.parse(data);
            if(data.recordId > 0) {
                store.set("pushRegistrationId", registrationId);
            }
        }, 
        function(err) {
            
        });  
}

LetiFramework.NotificationService.onNotification = function(data) {
    // data.message,
    // data.title,
    // data.count,
    // data.sound,
    // data.image,
    // data.additionalData
    alert(JSON.stringify(data));
}

LetiFramework.NotificationService.onError = function(e) {
    alert(e.message);
}