var LetiFramework = LetiFramework || {};

LetiFramework.Analytics = LetiFramework.Analytics || {};

/*
 * Initialize analytics
 * where trackingId is your Google Analytics Mobile App property
 */
LetiFramework.Analytics.initialize = function(trackingId) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.startTrackerWithId(trackingId);
	}	
}

/*
 * To track a Screen (PageView):
 */
LetiFramework.Analytics.trackPage = function(page) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.trackView(page);
	}	
}

/*
 * To track an Event:
 * Label and Value are optional, Value is numeric
 */
LetiFramework.Analytics.trackEvent = function(category, action, label, value) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.trackEvent(category, action, label, value);
	}
}

/*
 * To track an Exception:
 * where fatal is boolean
 */
LetiFramework.Analytics.trackException = function(description, fatal) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.trackException(description, fatal);
	}
}

/*
 * To track User Timing (App Speed):
 * where intervalInMilliseconds is numeric
 */
LetiFramework.Analytics.trackTiming = function(category, intervalInMilliseconds, variable, label) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.trackTiming(category, intervalInMilliseconds, variable, label);
	}
}

/*
 * To add a Transaction (Ecommerce)
 * where Revenue, Tax, and Shipping are numeric
 */
LetiFramework.Analytics.addTransaction = function(id, affiliation, revenue, tax, shipping, currencyCode) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.addTransaction(id, affiliation, revenue, tax, shipping, currencyCode);
	}
}

/*
 * To add a Transaction Item (Ecommerce)
 * where Price and Quantity are numeric
 */
LetiFramework.Analytics.addTransactionItem = function(id, name, sku, category, price, quantity, currencyCode) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.addTransactionItem(id, name, sku, category, price, quantity, currencyCode);
	}
}

/*
 * To add a Custom Dimension
 */
LetiFramework.Analytics.addCustomDimension = function(key, value) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.addCustomDimension(key, value, this.onSuccess, this.onError);
	}
}

/*
 * To set a UserId:
 */
LetiFramework.Analytics.setUserId = function(userId) {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.setUserId(userId);
	}
}

/*
 * To enable verbose logging:
 */
LetiFramework.Analytics.debugMode = function() {
	if(LetiFramework.App.isPhoneGap()) {
		window.analytics.debugMode();
	}
}

LetiFramework.Analytics.onSuccess = function() {
	
}

LetiFramework.Analytics.onError = function() {
	
}