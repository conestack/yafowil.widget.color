import $ from 'jquery';

export class ColorSwatch {

    constructor(widget, container, color, locked = false) {
        this.widget = widget;
        this.container = container;
        this.color = color;
        this.locked = locked;
        this.selected = false;

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
        this.destroy = this.destroy.bind(this);
        this.select = this.select.bind(this);
        this.elem.on('click', this.select);
    }

    get selected() {
        return this._selected;
    }

    set selected(selected) {
        if (selected) {
            $('div.color-swatch', this.widget.dropdown_elem).removeClass('selected');
            this.elem.addClass('selected');
            this.widget.picker.color.set(this.color);
        }
        this._selected = selected;
    }

    destroy() {
        if (this.locked) {
            return;
        }
        this.elem.off('click', this.select);
        this.elem.remove();
    }

    select(e) {
        if (this.widget.active_swatch !== this) {
            this.widget.active_swatch = this;
        }
    }
}


export class LockedSwatchesContainer {

    constructor (widget, swatches = []) {
        this.widget = widget;
        this.elem = $(`<div />`)
            .addClass('color-picker-recent')
            .appendTo(widget.dropdown_elem);

        this.swatches = [];
        this.init_swatches(swatches);
    }

    init_swatches(swatches) {
        if (!swatches || !swatches.length) {
            return;
        }
        if (swatches.length > 10) {
            swatches = swatches.slice(0, 10);
        }

        for (let swatch of swatches) {
            let color;
            if (swatch instanceof Array) {
                    color = {
                        r: swatch[0],
                        g: swatch[1],
                        b: swatch[2],
                        a: swatch[3] || 1
                }
            } else if (
                typeof swatch === 'string' || typeof swatch === 'object'
            ) {
                color = swatch;
            } else {
                console.log(`ERROR: not supported color format at ${swatch}`);
                return;
            }
            this.swatches.push(
                new ColorSwatch(
                    this.widget,
                    this.elem,
                    new iro.Color(color),
                    true
                )
            );
        }
        this.widget.active_swatch = this.swatches[0];
        this.elem.show();
    }
}

export class UserSwatchesContainer {

    constructor (widget) {
        this.widget = widget;
        this.elem = $(`<div />`)
            .addClass('color-picker-recent')
            .appendTo(widget.dropdown_elem);
        this.add_color_btn = $(`<button />`)
                .addClass('add_color')
                .text('+ Add');
        this.remove_color_btn = $(`<button />`)
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
        widget.elem.on('yafowil-colors:changed', this.init_swatches);
    }

    init_swatches(e) {
        let json_str = localStorage.getItem("color-swatches");

        for (let swatch of this.swatches) {
            swatch.destroy();
        }

        if (json_str) {
            this.swatches = [];
            this.elem.show();
            this.remove_color_btn.show();
            let colors = JSON.parse(json_str);
            for (let color of colors) {
                this.swatches.push(new ColorSwatch(
                    this.widget,
                    this.elem,
                    new iro.Color(color)
                ));
            }
            if (this.swatches.length > 10) {
                this.swatches[0].destroy();
                this.swatches.shift();
            }
            if (this.swatches.length && e && e.origin === this
                || this.swatches.length && !e) {
                    let active_swatch = this.swatches[this.swatches.length -1];
                    this.widget.active_swatch = active_swatch;
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
            this.widget.picker.color.clone()
        );
        this.swatches.push(swatch);
        this.set_swatches();
    }

    remove_swatch(e) {
        if (e && e.type === 'click') {
            e.preventDefault();
        }
        if (!this.widget.active_swatch) {
            this.widget.active_swatch = this.swatches[this.swatches.length -1];
        }
        this.widget.active_swatch.destroy();
        let index = this.swatches.indexOf(this.widget.active_swatch);
        this.swatches.splice(index, 1);

        if (!this.swatches.length) {
            if (this.widget.locked_swatches
                && this.widget.locked_swatches.swatches.length) {
                    let l_swatches = this.widget.locked_swatches.swatches;
                    this.widget.active_swatch = l_swatches[
                        l_swatches.length - 1
                    ];
                    this.widget.picker.color.set(this.widget.active_swatch.color);
            }
            this.elem.hide();
            this.remove_color_btn.hide();
            this.widget.picker.color.reset();
        } else {
            this.widget.active_swatch = this.swatches[
                this.swatches.length - 1
            ];
            this.widget.picker.color.set(this.widget.active_swatch.color);
        }
        this.set_swatches();

    }

    set_swatches() {
        let swatches = [];
        for (let swatch of this.swatches) {
            swatches.push(swatch.color.hsva);
        }
        if (swatches.length) {
            localStorage.setItem(`color-swatches`, JSON.stringify(swatches));
        } else {
            localStorage.removeItem("color-swatches");
        }
        let evt = new $.Event('yafowil-colors:changed', {origin: this});
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
