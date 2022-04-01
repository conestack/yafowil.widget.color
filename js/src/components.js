export class ColorSwatch {

    constructor(widget, color, fixed = false) {
        this.widget = widget;
        this.color = color;
        this.fixed = fixed;

        this.elem = $('<div />')
            .addClass('color-swatch')
            .appendTo(this.widget.swatches_container);

        this.color_layer = $('<div />')
            .addClass('swatch-color-layer')
            .css('background-color', this.color.rgbaString)
            .appendTo(this.elem);

        this.destroy = this.destroy.bind(this);
        this.select = this.select.bind(this);
        this.elem.on('click', this.select);
    }

    destroy() {
        this.elem.off('click', this.select);
        this.elem.remove();
    }

    select(e) {
        $('div.color-swatch').removeClass('selected');
        this.elem.addClass('selected');
        this.widget.active_swatch = this;
        this.widget.picker.color.set(this.color);
    }
}

export class ColorHexInput {

    constructor(widget, hex) {
        this.widget = widget;
        this.elem = $('<div />')
            .addClass('hex-display')
            .text('HEX:')
            .appendTo(widget.dropdown_elem);
        this.input = $('<input />')
            .val(hex)
            .attr({spellcheck: false, maxlength: 7})
            .appendTo(this.elem);

        this.on_input = this.on_input.bind(this);
        this.input.on('input', this.on_input);
    }

    get value() {
        return this.input.val();
    }

    set value(hex) {
        this.input.val(hex);
    }

    on_input() {
        if (this.value.length === 0) {
            this.input.val('#');
        } else {
            this.widget.picker.color.set(this.value);
        }
    }

    update(color) {
        this.value = color.hexString;
    }
}

export class PreviewElement {

    constructor(widget, elem) {
        this.widget = widget;
        this.layer = $('<div />')
            .addClass('preview-color-layer');
        this.elem = elem
            .addClass('transparent')
            .append(this.layer)
            .insertAfter(this.widget.elem);

        this.on_click = this.on_click.bind(this);
        this.elem.on('click', this.on_click);
    }

    get color() {
        return this._color;
    }

    set color(color) {
        this.layer.css('background-color', color);
        this._color = color;
    }

    on_click() {
        this.widget.open();
    }
}
