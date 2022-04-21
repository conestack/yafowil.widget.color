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

export class InputElement {

    constructor(widget, elem, color, format) {
        this.widget = widget;
        this.elem = elem;
        if (this.format === 'hexString') {
            this.elem.attr('maxlength', 7);
        }
        this.format = format;
        this.color = color;

        this.update_color(color);

        this.on_input = this.on_input.bind(this);
        this.elem.on('input', this.on_input);
        this.update_color = this.update_color.bind(this);
    }

    on_input(e) {
        let val = this.elem.val();
        if (this.type === 'hexString' && val.length === 0) {
            this.elem.val('#');
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

export class SliderInput {

    static types = {
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

    static component(type, opts) {
        return {
            component: iro.ui.Slider,
            options: {
                sliderType: type,
                sliderSize: opts.size,
                sliderLength: opts.length,
                minTemperature: opts.temp ? opts.temp.min : undefined,
                maxTemperature: opts.temp ? opts.temp.max : undefined,
                disabled: opts.disabled,
                showInput: opts.showInput
            }
        }
    }

    constructor(widget, type) {
        this.type = type;
        this.widget = widget;

        this.control_elem = $('<div />')
            .addClass(`control ${type}`)
            .appendTo(widget.input_container);
        this.label_elem = $(`<span />`)
            .appendTo(this.control_elem);
        this.input_elem = $('<input />')
            .addClass('control-input')
            .appendTo(this.control_elem);
    }
}
