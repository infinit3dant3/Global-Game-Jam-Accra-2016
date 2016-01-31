var LetiFramework = LetiFramework || {};

LetiFramework.Ui = LetiFramework.Ui || {};

LetiFramework.Ui.RoundButton = function(game, x, y, width, height, radius, text, textStyle, buttonStyle, callback, context) {
	var color = buttonStyle.color;
	var border = buttonStyle.border; //e.g { thickness: 0, color: 0xff0000 }

	if(border && border.thickness && border.color) {
		this.outer = game.add.graphics(x, y);
		this.outer.beginFill(border.color, 1);
		this.outer.drawRoundedRect(0, 0, width + (border.thickness * 2), height + (border.thickness * 2), radius);
		this.outer.endFill();
		x += border.thickness;
		y += border.thickness;
	}

	this.inner = game.add.graphics(x, y);
    this.inner.beginFill(color, 1);
    this.inner.drawRoundedRect(0, 0, width, height, radius);
    this.inner.endFill();
    this.inner.inputEnabled = true;
    this.inner.input.useHandCursor = true;
    this.inner.events.onInputDown.add(callback, context == null ? this : context);

    this.text = game.add.text(x + width / 2, y + height / 2, text, textStyle);
	this.text.anchor.set(0.5);
}

LetiFramework.Ui.RoundButton.prototype.alignText = function(alignment) {
	if(alignment == 'left') {
		this.text.x = this.inner.x + 10 + 0.5 * this.text.width;
	}
}

LetiFramework.Ui.RoundButton.prototype.getText = function() {
	return this.text.text;
}

LetiFramework.Ui.RoundButton.prototype.setText = function(txt) {
	this.text.text = txt;
}

LetiFramework.Ui.RoundButton.prototype.destroy = function() {
	if(this.outer) {
		this.outer.destroy();
	}	
	this.inner.destroy();
	this.text.destroy();
}