var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.BadgeDialog = function(game, badge) {
	this.game = game;
	this.badge = badge.constructor === Array ? badge[0] : badge;
	this.badgeStyle = LetiFramework.GameController.screensConfig.badge_dialog_styles[this.badge.style];
	if(this.badge.animation) {
		this.badgeStyle.animation = this.badge.animation;
	}
	this.modals = new gameModal(this.game);

	var dialogBg = this.createDialogImage(this.badgeStyle.background, this.badgeStyle.bg_scale);
	dialogBg.offsetX = this.badgeStyle.bg_offset.x;
	dialogBg.offsetY = this.badgeStyle.bg_offset.y;

	var title = this.createDialogItem(this.badgeStyle.title);

	var badgeImage = this.createDialogImage(LetiFramework.Renderer.currentState().getBadgePath(this.badge.image), 
		this.badgeStyle.image_scale);
	badgeImage.offsetX = this.badgeStyle.image_offset.x;
	badgeImage.offsetY = this.badgeStyle.image_offset.y;

	var badgeText = this.createDialogText(this.badge.text, this.badgeStyle.name_style);
	badgeText.offsetX = this.badgeStyle.name_offset.x;
	badgeText.offsetY = this.badgeStyle.name_offset.y;

	var badgeMsg = this.createDialogText(this.badge.message, this.badgeStyle.message_style);
	badgeMsg.offsetX = this.badgeStyle.message_offset.x;
	badgeMsg.offsetY = this.badgeStyle.message_offset.y;

    var closeBt = null;
    if(this.badgeStyle.close_button.hidden != true) {
    	closeBt = this.createDialogItem(this.badgeStyle.close_button);
	    closeBt.callback = function() {
	    	LetiFramework.Analytics.trackEvent("Badge Dialog", "Button Click", "Close Dialog", 0);
	    	LetiFramework.Renderer.currentState().badgeDialog.close();
	    	LetiFramework.Renderer.currentState().onBadgeDialogClosed();
	    }
    } 

    var itemsArr = [dialogBg, title, badgeImage, badgeText, badgeMsg];
    if(closeBt) itemsArr.push(closeBt);

    //// Badge modal ////
    this.modals.createModal({
        type:"badgeModal",
        includeBackground: false,
        modalCloseOnInput: true,
        itemsArr: itemsArr
    });
}

LetiFramework.Ui.BadgeDialog.prototype.show = function() {
	this.modals.showModal("badgeModal");

	var item = this.game.modals["badgeModal"];

	var animProps = null;
	var anim = this.badgeStyle.animation;
	if(anim.type == "fadeIn") {
		animProps = {alpha: 0};
	}
	else if(anim.type == "slideDown") {
		animProps = {y: -720};
	}
	else if(anim.type == "slideUp") {
		animProps = {y: 1440};
	}

	if(animProps) {
		this.game.add.tween(item).from(animProps, anim.duration, Phaser.Easing.Linear.None, true, anim.delay);
	}
}

LetiFramework.Ui.BadgeDialog.prototype.close = function() {
	var item = this.game.modals["badgeModal"];

	var animProps = null;
	var anim = this.badgeStyle.animation;
	if(anim.type == "fadeIn") {
		animProps = {alpha: 0};
	}
	else if(anim.type == "slideDown") {
		animProps = {y: -720};
	}
	else if(anim.type == "slideUp") {
		animProps = {y: 1440};
	}

	if(animProps) {
		this.game.add.tween(item).to(animProps, anim.duration, 
			Phaser.Easing.Linear.None, true, 0).onComplete.add(
    			function(){
        			this.modals.hideModal("badgeModal");
					this.modals.destroyModal("badgeModal");
        		}, this);
	} else {
		this.modals.hideModal("badgeModal");
		this.modals.destroyModal("badgeModal");
	}	
}

LetiFramework.Ui.BadgeDialog.prototype.createDialogText = function(text, textStyle) {
	return {
        type: "text",
        content: text,
        fontSize: textStyle.fontSize,
        fontFamily: textStyle.fontFamily,
        color: textStyle.color,
        stroke: textStyle.stroke,
        strokeThickness: textStyle.strokeThickness,
        wordWrap: textStyle.wordWrap,
        wordWrapWidth: textStyle.wordWrapWidth                
    };
}

LetiFramework.Ui.BadgeDialog.prototype.createDialogImage = function(image, imageScale) {
	return {
        type: "image",
        content: image,
        contentScale: imageScale
    };
}

LetiFramework.Ui.BadgeDialog.prototype.createDialogItem = function(itemConfig) {
    var dialogItem = null;

    if(itemConfig.type == "text") {
    	dialogItem = this.createDialogText(itemConfig.text, itemConfig.text_style);
    }
    else if(itemConfig.type == "image") {
    	dialogItem = this.createDialogImage(itemConfig.image, itemConfig.image_scale);
    }

    dialogItem.offsetX = itemConfig.offset.x;
    dialogItem.offsetY = itemConfig.offset.y;

    return dialogItem;
}