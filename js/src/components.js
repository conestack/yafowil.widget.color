import $ from 'jquery';

export class ColorSwatch {

    constructor(widget, container, color, kelvin = false, locked = false) {
        this.widget = widget;
        this.container = container;
        this.color = color;
        this.locked = locked;
        this.selected = false;
        this.kelvin = kelvin;
        this.destroy = this.destroy.bind(this);

        if (kelvin && !this.widget.type_kelvin || 
            this.widget.type_kelvin && !kelvin || 
            !this.widget.type_alpha && color.alpha < 1) {
                this.invalid = true;
                return;
        }

        this.elem = $('<div />')
            .addClass('color-swatch layer-transparent')
            .appendTo(this.container);

        this.color_layer = $('<div />')
            .addClass('layer-color')
            .css('background-color', this.color.rgbaString)
            .appendTo(this.elem);

        if (locked) {
            this.elem
                .addClass('locked')
                .append($('<div class="swatch-mark" />'));
        }
        this.select = this.select.bind(this);
        this.elem.on('click', this.select);
    }

    get selected() {
        return this._selected;
    }

    set selected(selected) {
        if (selected) {
            $('div.color-swatch', this.widget.dropdown_elem)
            .removeClass('selected');
            this.elem.addClass('selected');
            this.widget.picker.color.set(this.color);
        } else if (this.elem) {
            this.elem.removeClass('selected');
        }
        this._selected = selected;
    }

    destroy() {
        this.widget.active_swatch = null;
        if (this.locked || this.invalid) {
            return;
        }
        this.elem.off('click', this.select);
        this.elem.remove();
    }

    select(e) {
        if (this.widget.active_swatch !== this) {
            let previous = this.widget.picker.color.clone();
            this.previous_color = previous.rgbaString;
            this.widget.active_swatch = this;
        } else if (this.widget.active_swatch == this) {
            this.widget.active_swatch = null;
            this.selected = false;
            this.widget.picker.color.set(this.previous_color);
        }
    }
}

export class LockedSwatchesContainer {

    constructor (widget, swatches = []) {
        this.widget = widget;
        this.elem = $('<div />')
            .addClass('color-picker-recent')
            .appendTo(widget.dropdown_elem);
        this.swatches = [];
        this.init_swatches(swatches);
    }

    parse_swatch(swatch) {
        let color,
            kelvin = false,
            valid_type = typeof swatch === 'string' || typeof swatch === 'object';

        if (swatch instanceof Array) {
            color = {
                r: swatch[0],
                g: swatch[1],
                b: swatch[2]
            }
            if (swatch[3]) {
                color.a = swatch[3];
            }
        } else if (is_kelvin(swatch)) {
            color = iro.Color.kelvinToRgb(swatch.toString());
            kelvin = true;
        } else if (valid_type) {
            color = swatch;
        } else {
            console.log(`ERROR: not supported color format at ${swatch}`);
            return;
        }
        return {'color': new iro.Color(color), 'kelvin': kelvin};
    }

    init_swatches(swatches) {
        if (!swatches || !swatches.length) {
            this.elem.hide();
            return;
        }
        for (let swatch of swatches) {
            let swatch_color = this.parse_swatch(swatch);
            this.swatches.push(
                new ColorSwatch(
                    this.widget,
                    this.elem,
                    swatch_color.color,
                    swatch_color.kelvin,
                    true
                )
            );
            this.elem.show();
        }
    }
}

export class UserSwatchesContainer {

    constructor (widget) {
        this.widget = widget;
        this.elem = $('<div />')
            .addClass('color-picker-recent')
            .appendTo(widget.dropdown_elem);
        this.add_color_btn = $('<button />')
            .addClass('add_color')
            .text('+ Add');
        this.remove_color_btn = $('<button />')
            .addClass('remove_color')
            .text('- Remove')
            .hide();
        this.buttons = $('<div />')
            .addClass('buttons')
            .append(this.add_color_btn)
            .append(this.remove_color_btn)
            .appendTo(widget.dropdown_elem);

        this.swatches = [];
        this.init_swatches();

        this.create_swatch = this.create_swatch.bind(this);
        this.add_color_btn.on('click', this.create_swatch);
        this.remove_swatch = this.remove_swatch.bind(this);
        this.remove_color_btn.on('click', this.remove_swatch);
        this.init_swatches = this.init_swatches.bind(this);
        widget.elem.on('yafowil-color-swatches:changed', this.init_swatches);
    }

    init_swatches(e) {
        let json_str = localStorage.getItem('yafowil-color-swatches');

        for (let swatch of this.swatches) {
            swatch.destroy();
        }
        this.swatches = [];
        if (json_str) {
            this.elem.show();
            this.remove_color_btn.show();
            let colors = JSON.parse(json_str);

            for (let color_elem of colors) {
                let iro_color = new iro.Color(color_elem.color);
                this.swatches.push(new ColorSwatch(
                    this.widget,
                    this.elem,
                    iro_color,
                    color_elem.kelvin
                ));
            }
            if (this.swatches.length > 10) {
                this.swatches[0].destroy();
                this.swatches.shift();
            }
        } else {
            this.remove_color_btn.hide();
        }
    }

    create_swatch(e) {
        if (e && e.type === 'click') {
            e.preventDefault();
        }
        if (this.widget.locked_swatches) {
            for (let swatch of this.widget.locked_swatches.swatches) {
                if (this.widget.color_equals(swatch.color)) {
                    return;
                }
            }
        }
        for (let swatch of this.swatches) {
            if (this.widget.color_equals(swatch.color)) {
                return;
            }
        }
        let swatch = new ColorSwatch(
            this.widget,
            this.elem,
            this.widget.picker.color.clone(),
            this.widget.type_kelvin
        );
        this.swatches.push(swatch);
        this.set_swatches();
    }

    remove_swatch(e) {
        if (e && e.type === 'click') {
            e.preventDefault();
        }
        if (!this.widget.active_swatch || this.widget.active_swatch.locked) {
            return;
        }
        let index = this.swatches.indexOf(this.widget.active_swatch);
        this.widget.active_swatch.destroy();
        this.swatches.splice(index, 1);

        if (!this.swatches.length) {
            this.elem.hide();
            this.remove_color_btn.hide();
            this.widget.picker.color.reset();
        }

        this.elem.hide();
        this.remove_color_btn.hide();
        this.widget.picker.color.reset();
        this.set_swatches();
    }

    set_swatches() {
        let swatches = [];
        for (let swatch of this.swatches) {
            swatches.push({color: swatch.color.hsva, kelvin: swatch.kelvin});
        }
        if (swatches.length) {
            localStorage.setItem('yafowil-color-swatches', JSON.stringify(swatches));
        } else {
            localStorage.removeItem('yafowil-color-swatches');
        }
        let evt = new $.Event('yafowil-color-swatches:changed', {origin: this});
        $('input.color-picker').trigger(evt);
    }
}

export class InputElement {

    constructor(widget, elem, color, format, temperature = {min: 1000, max:40000}) {
        this.widget = widget;
        this.elem = elem;
        this.format = format || 'hexString';
        if (this.format === 'hexString') {
            this.elem.attr('maxlength', 7);
        } else if (this.format === 'hex8String') {
            this.elem.attr('maxlength', 9);
        }
        this.temperature = temperature;
        this.color = color;
        if (this.color) {
            this.update_color(color);
        }

        this.on_input = this.on_input.bind(this);
        this.elem.on('input', this.on_input);
        this.on_focusout = this.on_focusout.bind(this);
        this.elem.on('focusout', this.on_focusout);
        this.update_color = this.update_color.bind(this);
    }

    on_input(e) {
        let val = this.elem.val();
        this._color = val;
    }

    on_focusout() {
        let color = this._color;
        if (color) {
            if (this.format === 'kelvin') {
                if (parseInt(color) < this.temperature.min) {
                    color = this.temperature.min;
                } else if (parseInt(color) > this.temperature.max) {
                    color = this.temperature.max;
                }
                this.widget.picker.color.kelvin = color;
                this.elem.val(color);
            } else {
                this.widget.picker.color.set(color);
            }
            this._color = null;
        }
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
        this.color = color ? color.rgbaString : undefined;
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

export function is_kelvin(value) {
    return ((typeof value === 'string' && !value.startsWith('#') &&
            parseInt(value) == value) || (typeof value == 'number'));
}
