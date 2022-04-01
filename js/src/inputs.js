let targets = {
    hue: 'hsl',
    saturation: 'hsl',
    value: 'hsl',
    alpha: '',
    kelvin: 'kelvin',
    red: 'rgb',
    green: 'rgb',
    blue: 'rgb'
}

export class SliderInput {

    static component(type, size) {
        return {
            component: iro.ui.Slider,
            options: {
                sliderType: type,
                sliderSize: size
            }
        }
    }

    constructor(widget, type, target, i) {
        this.type = type;
        this.index = i;
        this.widget = widget;

        this.control_elem = $('<div />')
            .addClass(`control ${type}`)
            .appendTo(target);
        this.label_elem = $(`<span />`)
            .appendTo(this.control_elem);
        this.input_elem = $('<input />')
            .addClass('control-input')
            .appendTo(this.control_elem);
    }
}

export class HueSliderInput extends SliderInput {

    constructor(widget, color, type, i) {
        super(widget, type, i);
        this.input_elem.attr({type: 'numeric', min: 0, max:360, maxlength:3});
        this.input_elem.val(color.hsl.h);
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
        let clr = this.widget.picker.color.hsl;
        clr.h = this.value;
        if (clr.h >= 360) {
            clr.h = 360;
        }
        this.widget.picker.color.set(clr);
    }

    update(color) {
        this.value = color.hsl.h;
    }
}

export class SaturationSliderInput extends SliderInput {

    constructor(widget, color, type, i) {
        super(widget, type, i);
        this.input_elem.attr({type: 'numeric', min: 0, max:100, maxlength:3});
        this.input_elem.val(color.hsl.s);
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
        let clr = this.widget.picker.color.hsl;
        clr.h = this.value;
        if (clr.s >= 100) {
            clr.s = 100;
        }
        this.widget.picker.color.set(clr);
    }

    update(color) {
        this.value = color.hsl.s;
    }
}

export class ValueSliderInput extends SliderInput {

    constructor(widget, color, type, i) {
        super(widget, type, i);
        this.input_elem.attr({type: 'numeric', min: 0, max:100, maxlength:3});
        this.input_elem.val(color.hsl.l);
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
        let clr = this.widget.picker.color.hsl;
        clr.l = this.value;
        if (clr.l >= 100) {
            clr.l = 100;
        }
        this.widget.picker.color.set(clr);
    }

    update(color) {
        this.value = color.hsl.l;
    }
}

export class AlphaSliderInput extends SliderInput {

    constructor(widget, color, type, i) {
        super(widget, type, i);
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

    constructor(widget, color, type, i) {
        super(widget, type, i);
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
        this.value = color.kelvin;
    }
}

export class RedSliderInput extends SliderInput {

    constructor(widget, color, type, i) {
        super(widget, type, i);
        this.input_elem.attr({type: 'numeric'});
        this.input_elem.val(color.rgb.r);
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
        this.widget.picker.color.setChannel('rgb', 'r', val);
    }

    update(color) {
        this.value = color.rgb.r;
    }
}

export class GreenSliderInput extends SliderInput {

    constructor(widget, color, type, i) {
        super(widget, type, i);
        this.input_elem.attr({type: 'numeric'});
        this.input_elem.val(color.rgb.g);
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
        this.widget.picker.color.setChannel('rgb', 'g', val);
    }

    update(color) {
        this.value = color.rgb.g;
    }
}

export class BlueSliderInput extends SliderInput {

    constructor(widget, color, type, i) {
        super(widget, type, i);
        this.input_elem.attr({type: 'numeric'});
        this.input_elem.val(color.rgb.b);
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
        this.widget.picker.color.setChannel('rgb', 'b', val);
    }

    update(color) {
        this.value = color.rgb.b;
    }
}

export let factories = {
    hue: HueSliderInput,
    saturation: SaturationSliderInput,
    value: ValueSliderInput,
    alpha: AlphaSliderInput,
    kelvin: KelvinSliderInput,
    red: RedSliderInput,
    green: GreenSliderInput,
    blue: BlueSliderInput
}
