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

export class ColorHSLInput {

    constructor(widget, hsl) {
        this.widget = widget;

        this.elem = $(`<div />`)
            .addClass('hsl-display')
            .appendTo(widget.dropdown_elem);
        let hue_elem = $('<div />')
            .addClass('hue').text('H:')
            .appendTo(this.elem);
        let saturation_elem = $('<div />')
            .addClass('saturation')
            .text('S:')
            .appendTo(this.elem);
        let lightness_elem = $('<div />')
            .addClass('lightness')
            .text('L:')
            .appendTo(this.elem);

        this.hue_input = $('<input />')
            .addClass('h')
            .attr({type: 'number', min: 0, max:360})
            .val(hsl.h)
            .appendTo(hue_elem);
        this.saturation_input = $('<input />')
            .addClass('s')
            .attr({type: 'number', min: 0, max:100})
            .val(hsl.s)
            .appendTo(saturation_elem);
        this.lightness_input = $('<input />')
            .addClass('l')
            .attr({type: 'number', min: 0, max:100})
            .val(hsl.l)
            .appendTo(lightness_elem);

        this.on_input = this.on_input.bind(this);
        this.hue_input
            .add(this.saturation_input)
            .add(this.lightness_input)
            .on('input', this.on_input);
    }

    get value() {
        return {
            h: parseInt(this.hue_input.val()),
            s: parseInt(this.saturation_input.val()),
            l: parseInt(this.lightness_input.val())
        }
    }

    set value(hsl) {
        this.hue_input.val(hsl.h);
        this.saturation_input.val(hsl.s);
        this.lightness_input.val(hsl.l);
    }

    on_input(e) {
        this.widget.picker.color.set(this.value);
    }

    update(color) {
        this.value = color.hsl;
    }
}

export class ColorRGBInput {

    constructor(widget, color) {
        this.widget = widget;

        this.elem = $(`<div />`)
            .addClass('rgb-display')
            .appendTo(widget.dropdown_elem);

        this.inputs = {};
        this.color = color;
        ['r', 'g', 'b'].forEach(name => {
            this.create_input(name);
        });
        if (color.a) {
            this.create_input('a');
        }

        this.on_input = this.on_input.bind(this);
        for (let input in this.inputs) {
            this.inputs[input].on('input', this.on_input);
        }
    }

    get value() {
        let color = {
            r: parseInt(this.inputs.r.val()),
            g: parseInt(this.inputs.g.val()),
            b: parseInt(this.inputs.b.val())
        }
        if (this.inputs.a) {
            color.a = parseFloat(this.inputs.a.val());
        }
        return color;
    }

    set value(color) {
        this.inputs.r.val(color.r);
        this.inputs.g.val(color.g);
        this.inputs.b.val(color.b);
        if (color.a) {
            this.inputs.a.val(color.a);
        }
    }

    create_input(name) {
        let elem = $('<div />')
            .addClass(name)
            .text(name.toUpperCase() + ':')
            .appendTo(this.elem);

        this.inputs[name] = $('<input />')
            .addClass(name)
            .val(this.color[name])
            .appendTo(elem);

        if (name === 'a') {
            this.inputs[name].attr({type: 'number', step: 0.1, min: 0, max:1});
        } else {
            this.inputs[name].attr({type: 'number', min: 0, max:255})
        }
    }

    on_input(e) {
        this.widget.picker.color.set(this.value);
    }

    update(color) {
        if (this.inputs.a) {
            this.value = color.rgba;
        } else {
            this.value = color.rgb;
        }
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

export class ColorKelvinInput {

    constructor(widget, kelvin) {
        this.widget = widget;
        this.elem = $('<div />')
            .addClass('kelvin-display')
            .text('K:')
            .appendTo(widget.dropdown_elem);
        this.input = $('<input readonly />')
            .val(kelvin)
            .attr({type: 'number'})
            .appendTo(this.elem);

        this.on_input = this.on_input.bind(this);
        this.input.on('input', this.on_input);
    }

    get value() {
        return this.input.val();
    }

    set value(kelvin) {
        this.input.val(parseFloat(kelvin).toFixed(2));
    }

    on_input() {
        this.widget.picker.color.set(this.value);
    }

    update(color) {
        this.value = color.kelvin;
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
