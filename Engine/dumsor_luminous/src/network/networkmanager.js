var LetiFramework = LetiFramework || {};

LetiFramework.NetworkManager = LetiFramework.NetworkManager || {};

LetiFramework.NetworkManager.serverURL = "http://luminous-in-vp-elb-eeutk9rlkkrj-1756174304.us-east-1.elb.amazonaws.com/luminous/";

LetiFramework.NetworkManager.appId = 2;

LetiFramework.NetworkManager.MODEL_TYPE_NONE = 0;
LetiFramework.NetworkManager.MODEL_TYPE_LOG = 1;
LetiFramework.NetworkManager.MODEL_TYPE_ADMIN = 2;    
LetiFramework.NetworkManager.MODEL_TYPE_USER = 3;    
LetiFramework.NetworkManager.MODEL_TYPE_STORY = 4;
LetiFramework.NetworkManager.MODEL_TYPE_EPISODE = 5;    
LetiFramework.NetworkManager.MODEL_TYPE_APP_BUILD = 6;
LetiFramework.NetworkManager.MODEL_TYPE_APP_BUILD_STORY = 7;
LetiFramework.NetworkManager.MODEL_TYPE_APP_BUILD_LOCK_CODE = 8;
LetiFramework.NetworkManager.MODEL_TYPE_PUSH_REGISTRATION = 9;

LetiFramework.NetworkManager.initialize = function() {
	// Nothing
}

LetiFramework.NetworkManager.getStoriesURL = function() {
	return this.serverURL + "GenerateStoriesJson?id=" + this.appId;
}

LetiFramework.NetworkManager.getStoryCoverURL = function(id) {
	return this.serverURL + "DownloadServlet?contentType=1&id=" + id;
}

LetiFramework.NetworkManager.getEpisodeCoverURL = function(id) {
	return this.serverURL + "DownloadServlet?contentType=2&id=" + id;
}

LetiFramework.NetworkManager.getEpisodeContentURL = function(id) {
	return this.serverURL + "DownloadServlet?contentType=3&id=" + id;
}

/*
 * Download file from url and save to device filePath
 */
LetiFramework.NetworkManager.downloadFile = function(url, filePath, success, error) {
	var ft = new FileTransfer();
	ft.download(encodeURI(url), filePath, success, error);
	return ft;
}

LetiFramework.NetworkManager.downloadFile = function(url, filePath, success, error, progress) {
	var ft = new FileTransfer();
	ft.onprogress = progress;
	ft.download(encodeURI(url), filePath, success, error);
	return ft;
}

LetiFramework.NetworkManager.postRequest = function(page, data, success, error) {
	$.post(this.serverURL + page, { nReq: JSON.stringify(data) }).done(success).fail(error);
}

LetiFramework.NetworkManager.getRequest = function(page, data, success, error) {
	$.get(this.serverURL + page + "?nReq=" + JSON.stringify(data)).done(success).fail(error);
}