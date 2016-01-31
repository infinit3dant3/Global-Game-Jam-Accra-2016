var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.List = function(game, x, y, width, height, background, orientation, spacing) {
	this.game = game;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.background = background;
	this.orientation = orientation;
	this.spacing = spacing;
	this.group = this.game.add.group();
	this.group.x = x;
	this.group.y = y;
	this.group.width = width;
	this.group.height = height;
	this.newItemPos = {x: 0, y: 0};

	if(background.type == "shape") {
		var bg = game.add.graphics(0, 0);
		bg.beginFill(background.color, 1);
		bg.alpha = background.alpha;
		if(background.shape == "round_rect") {
			bg.drawRoundedRect(0, 0, width, height, background.radius);
		} else if(background.shape == "rect") {
			bg.drawRect(0, 0, width, height);
		}			
		bg.endFill();
		this.group.add(bg);
	}	
}

LetiFramework.Ui.List.prototype.add = function() {
	var group = this.game.add.group();

	var txt = this.game.add.text(0, -10, "List Item 1", {font: "28px Arial", fill: "#000000"});

	group.add(txt);

	group.width = txt.width;
	group.height = txt.height;

	this.group.add(group);
}