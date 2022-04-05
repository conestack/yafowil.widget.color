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

    static component(type, size, temp) {
        return {
            component: iro.ui.Slider,
            options: {
                sliderType: type,
                sliderSize: size,
                minTemperature: temp ? temp.min : undefined,
                maxTemperature: temp ? temp.max : undefined
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

export class HueSliderInput extends SliderInput {

    constructor(widget, color, type) {
        super(widget, type);
        this.input_elem.attr({type: 'numeric', min: 0, max:360, maxlength:3});
        this.input_elem.val(color.hsla.h);
        this.label_elem.text(`H: `);

        this.on_input = this.on_input.bind(this);
        this.input_elem.on('input', this.on_input);
    }

    get value() {
        return parseInt(this.input_elem.val());
    }

    set value(value) {
        this.input_elem.val(value);
    }

    on_input() {
        let clr = this.widget.picker.color.hsla;
        clr.h = this.value;
        if (clr.h >= 360) {
            clr.h = 360;
        }
        this.widget.picker.color.set(clr);
    }

    update(color) {
        this.value = color.hsla.h;
    }
}

export class SaturationSliderInput extends SliderInput {

    constructor(widget, color, type) {
        super(widget, type);
        this.input_elem.attr({type: 'numeric', min: 0, max:100, maxlength:3});
        this.input_elem.val(color.hsla.s);
        this.label_elem.text(`S: `);

        this.on_input = this.on_input.bind(this);
        this.input_elem.on('input', this.on_input);
    }

    get value() {
        return parseInt(this.input_elem.val());
    }

    set value(value) {
        this.input_elem.val(value);
    }

    on_input() {
        let clr = this.widget.picker.color.hsla;
        clr.h = this.value;
        if (clr.s >= 100) {
            clr.s = 100;
        }
        this.widget.picker.color.set(clr);
    }

    update(color) {
        this.value = color.hsla.s;
    }
}

export class ValueSliderInput extends SliderInput {

    constructor(widget, color, type) {
        super(widget, type);
        this.input_elem.attr({type: 'numeric', min: 0, max:100, maxlength:3});
        this.input_elem.val(color.hsla.l);
        this.label_elem.text(`L: `);

        this.on_input = this.on_input.bind(this);
        this.input_elem.on('input', this.on_input);
    }

    get value() {
        return parseInt(this.input_elem.val());
    }

    set value(value) {
        this.input_elem.val(value);
    }

    on_input() {
        let clr = this.widget.picker.color.hsla;
        clr.l = this.value;
        if (clr.l >= 100) {
            clr.l = 100;
        }
        this.widget.picker.color.set(clr);
    }

    update(color) {
        this.value = color.hsla.l;
    }
}

export class AlphaSliderInput extends SliderInput {

    constructor(widget, color, type) {
        super(widget, type);
        this.input_elem.attr({type:'number', step:0.1, min:0, max:1});
        this.input_elem.val(color.hsla.a);
        this.label_elem.text(`A: `);

        this.on_input = this.on_input.bind(this);
        this.input_elem.on('input', this.on_input);
    }

    get value() {
        return parseFloat(this.input_elem.val());
    }

    set value(value) {
        this.input_elem.val(value);
    }

    on_input() {
        let clr = this.widget.picker.color.hsla;
        if (this.value >= 1) {
            this.value = 1;
        }
        clr.a = this.value;
        this.widget.picker.color.set(clr);
    }

    update(color) {
        this.value = color.hsla.a;
    }
}

export class KelvinSliderInput extends SliderInput {

    constructor(widget, color, type) {
        super(widget, type);
        this.input_elem.attr({type: 'numeric'});
        this.input_elem.val(color.kelvin);
        this.label_elem.text(`K: `);

        this.on_input = this.on_input.bind(this);
        this.input_elem.on('input', this.on_input);
    }

    get value() {
        return parseInt(this.input_elem.val());
    }

    set value(value) {
        this.input_elem.val(value);
    }

    on_input() {
        this.widget.picker.color.set(this.value);
    }

    update(color) {
        this.value = parseInt(color.kelvin);
    }
}

export class RedSliderInput extends SliderInput {

    constructor(widget, color, type) {
        super(widget, type);
        this.input_elem.attr({type: 'numeric'});
        this.input_elem.val(color.rgba.r);
        this.label_elem.text(`R: `);

        this.on_input = this.on_input.bind(this);
        this.input_elem.on('input', this.on_input);
    }

    get value() {
        return this.input_elem.val();
    }

    set value(value) {
        this.input_elem.val(value);
    }

    on_input() {
        let val = this.input_elem.val();
        if (val >= 255) {
            val = 255;
        } else if (val <=0 || NaN) {
            val = 0;
        }
        this.input_elem.val(val);
        this.widget.picker.color.setChannel('rgba', 'r', val);
    }

    update(color) {
        this.value = color.rgba.r;
    }
}

export class GreenSliderInput extends SliderInput {

    constructor(widget, color, type) {
        super(widget, type);
        this.input_elem.attr({type: 'numeric'});
        this.input_elem.val(color.rgba.g);
        this.label_elem.text(`G: `);

        this.on_input = this.on_input.bind(this);
        this.input_elem.on('input', this.on_input);
    }

    get value() {
        return this.input_elem.val();
    }

    set value(value) {
        this.input_elem.val(value);
    }

    on_input() {
        let val = this.input_elem.val();
        if (val >= 255) {
            val = 255;
        } else if (val <=0 || NaN) {
            val = 0;
        }
        this.input_elem.val(val);
        this.widget.picker.color.setChannel('rgba', 'g', val);
    }

    update(color) {
        this.value = color.rgba.g;
    }
}

export class BlueSliderInput extends SliderInput {

    constructor(widget, color, type) {
        super(widget, type);
        this.input_elem.attr({type: 'numeric'});
        this.input_elem.val(color.rgba.b);
        this.label_elem.text(`B: `);

        this.on_input = this.on_input.bind(this);
        this.input_elem.on('input', this.on_input);
    }

    get value() {
        return this.input_elem.val();
    }

    set value(value) {
        this.input_elem.val(value);
    }

    on_input() {
        let val = this.input_elem.val();
        if (val >= 255) {
            val = 255;
        } else if (val <=0 || NaN) {
            val = 0;
        }
        this.input_elem.val(val);
        this.widget.picker.color.setChannel('rgba', 'b', val);
    }

    update(color) {
        this.value = color.rgba.b;
    }
}

export class HexSliderInput extends SliderInput {

    constructor(widget, color, type) {
        super(widget, type);
        this.input_elem
            .attr({type: 'text', spellcheck: false, maxlength: 7})
            .css('width', '65px')
            .val(color.hexString);
        this.label_elem.text(`HEX: `);

        this.on_input = this.on_input.bind(this);
        this.input_elem.on('input', this.on_input);
    }

    get value() {
        return this.input_elem.val();
    }

    set value(hex) {
        this.input_elem.val(hex);
    }

    on_input() {
        if (this.value.length === 0) {
            this.input_elem.val('#');
        } else {
            this.widget.picker.color.set(this.value);
        }
    }

    update(color) {
        this.value = color.hexString;
    }
}


export let input_factories = {
    h: HueSliderInput,
    s: SaturationSliderInput,
    v: ValueSliderInput,
    a: AlphaSliderInput,
    k: KelvinSliderInput,
    r: RedSliderInput,
    g: GreenSliderInput,
    b: BlueSliderInput,
    hex: HexSliderInput
}
