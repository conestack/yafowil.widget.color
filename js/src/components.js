export class ColorSwatch {

    constructor(widget, color, fixed = false) {
        this.widget = widget;
        this.color = color;
        this.fixed = fixed;

        this.elem = $('<div />')
            .addClass('color-swatch layer-transparent')
            .appendTo(this.widget.swatches_container);

        this.color_layer = $('<div />')
            .addClass('layer-color')
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

export class InputElement {

    constructor(widget, elem, color, format) {
        this.widget = widget;
        this.elem = elem;
        this.format = format || 'hexString';
        if (this.format === 'hexString') {
            this.elem.attr('maxlength', 7);
        }
        this.color = color;
        this.update_color(color);

        this.on_input = this.on_input.bind(this);
        this.elem.on('input', this.on_input);
        this.update_color = this.update_color.bind(this);
    }

    on_input(e) {
        let val = this.elem.val();
        if (this.format === 'kelvin') {
            this.widget.picker.color.kelvin = parseInt(val);
        } else {
            this.widget.picker.color.set(val);
        }
    }

    update_color(color) {
        if (this.format === 'kelvin') {
            this.elem.val(parseInt(color.kelvin));
        } else {
            this.elem.val(color[this.format]);
        }
    }
}

export class PreviewElement {

    constructor(widget, elem, color) {
        this.widget = widget;
        this.layer = $('<div />')
            .addClass('layer-color');
        this.elem = elem
            .addClass('layer-transparent')
            .append(this.layer)
            .insertAfter(this.widget.elem);
        this.color = color.rgbaString;
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

export const slider_components = {
    box: 'box',
    r: 'red',
    g: 'green',
    b: 'blue',
    a: 'alpha',
    h: 'hue',
    s: 'saturation',
    v: 'value',
    k: 'kelvin'
}
