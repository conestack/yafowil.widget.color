import $ from 'jquery';

export class ColorSwatch {

    constructor(widget, color, locked = false) {
        this.widget = widget;
        this.color = color;
        this.locked = locked;

        this.elem = $('<div />').addClass('color-swatch layer-transparent');

        this.color_layer = $('<div />')
            .addClass('layer-color')
            .css('background-color', this.color.rgbaString)
            .appendTo(this.elem);

        if (this.locked) {
            this.elem
                .addClass('locked')
                .appendTo(this.widget.locked_swatches_container);
        } else {
            this.elem.appendTo(this.widget.user_swatches_container);
        }

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

    constructor(widget, elem, color, format, temperature = {min: 1000, max:40000}) {
        this.widget = widget;
        this.elem = elem;
        this.format = format || 'hexString';
        if (this.format === 'hexString') {
            this.elem.attr('maxlength', 7);
        }
        this.temperature = temperature;
        this.color = color;
        this.update_color(color);

        this.on_input = this.on_input.bind(this);
        this.elem.on('input', this.on_input);
        this.update_color = this.update_color.bind(this);
    }

    on_input(e) {
        let val = this.elem.val();
        if (this.format === 'kelvin') {
            let str = val.toString();
            if (str.length < 4) {
                return;
            } else if (val < this.temperature.min) {
                val = this.temperature.min;
            } else if (val > this.temperature.max) {
                val = this.temperature.max;
            }
            this.widget.picker.color.kelvin = val;
        } else {
            this.widget.picker.color.set(val);
        }
        this.elem.val(val);
    }

    update_color(color) {
        if (this.format === 'kelvin') {
            this.elem.val(color.kelvin);
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
    wheel: 'wheel',
    r: 'red',
    g: 'green',
    b: 'blue',
    a: 'alpha',
    h: 'hue',
    s: 'saturation',
    v: 'value',
    k: 'kelvin'
}
