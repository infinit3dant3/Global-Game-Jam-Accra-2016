var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.Button = function(game, x, y, width, height, text, textStyle, buttonStyle, callback, context) {
	var color = buttonStyle.color;
	var border = buttonStyle.border; //e.g { thickness: 0, color: 0xff0000 }

	this.buttonGroup = game.add.group();	

	if(border && border.thickness && border.color) {
		this.outer = game.add.graphics(x, y);
		this.outer.beginFill(border.color, 1);
		this.outer.drawRect(0, 0, width + (border.thickness * 2), height + (border.thickness * 2));
		this.outer.endFill();
		x += border.thickness;
		y += border.thickness;
		this.buttonGroup.add(this.outer);
	}

	this.inner = game.add.graphics(x, y);
    this.inner.beginFill(color, 1);
    this.inner.drawRect(0, 0, width, height);
    this.inner.endFill();
    this.inner.inputEnabled = true;
    this.inner.input.useHandCursor = true;
    this.inner.events.onInputDown.add(callback, context == null ? this : context);
    this.buttonGroup.add(this.inner);

    this.text = game.add.text(x + width / 2, y + height / 2, text, textStyle);
	this.text.anchor.set(0.5);
	this.buttonGroup.add(this.text);
}

LetiFramework.Ui.Button.prototype.hide = function() {
	this.buttonGroup.visible = false;
}

LetiFramework.Ui.Button.prototype.show = function() {
	this.buttonGroup.visible = true;
}

LetiFramework.Ui.Button.prototype.alignText = function(alignment) {
	if(alignment == 'left') {
		this.text.x = this.inner.x + 10 + 0.5 * this.text.width;
	}
}

LetiFramework.Ui.Button.prototype.getText = function() {
	return this.text.text;
}

LetiFramework.Ui.Button.prototype.setText = function(txt) {
	this.text.text = txt;
}

LetiFramework.Ui.Button.prototype.destroy = function() {
	this.buttonGroup.destroy();
}