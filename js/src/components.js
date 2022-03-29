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
}

export class ColorRGBInput {

    constructor(widget, rgb, alpha = false) {
        this.widget = widget;

        this.elem = $(`<div />`)
            .addClass('rgb-display')
            .appendTo(widget.dropdown_elem);
        let r_elem = $('<div />')
            .addClass('r').text('R:')
            .appendTo(this.elem);
        let g_elem = $('<div />')
            .addClass('g')
            .text('G:')
            .appendTo(this.elem);
        let b_elem = $('<div />')
            .addClass('b')
            .text('B:')
            .appendTo(this.elem);
        let a_elem = $('<div />')
            .addClass('a')
            .text('A:')
            .appendTo(this.elem);

        this.r_input = $('<input />')
            .addClass('r')
            .attr({type: 'number', min: 0, max:255})
            .val(rgb.r)
            .appendTo(r_elem);
        this.g_input = $('<input />')
            .addClass('g')
            .attr({type: 'number', min: 0, max:255})
            .val(rgb.g)
            .appendTo(g_elem);
        this.b_input = $('<input />')
            .addClass('b')
            .attr({type: 'number', min: 0, max:255})
            .val(rgb.b)
            .appendTo(b_elem);
        this.a_input = $('<input />')
            .addClass('r')
            .attr({type: 'number', min: 0, max:1})
            .val(rgb.a || 1)
            .appendTo(a_elem);

        if (!alpha) {
            a_elem.hide();
        }

        this.on_input = this.on_input.bind(this);
        this.r_input
            .add(this.g_input)
            .add(this.b_input)
            .add(this.a_input)
            .on('input', this.on_input);
    }

    get rgb() {
        return {
            r: parseInt(this.r_input.val()),
            g: parseInt(this.g_input.val()),
            b: parseInt(this.b_input.val())
        }
    }

    get rgba() {
        return {
            r: parseInt(this.r_input.val()),
            g: parseInt(this.g_input.val()),
            b: parseInt(this.b_input.val()),
            a: parseFloat(this.a_input.val()),
        }
    }

    set rgb(rgb) {
        this.r_input.val(rgb.r);
        this.g_input.val(rgb.g);
        this.b_input.val(rgb.b);
    }

    set rgba(rgba) {
        this.r_input.val(rgba.r);
        this.g_input.val(rgba.g);
        this.b_input.val(rgba.b);
        this.a_input.val(rgba.a);
    }

    on_input(e) {
        if (this.a_input) {
            this.widget.picker.color.set(this.rgba);
        } else {
            this.widget.picker.color.set(this.rgb);
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
}
