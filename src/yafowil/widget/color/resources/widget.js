var yafowil_color = (function (exports, $$1) {
    'use strict';

    class ColorSwatch {
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
    class PreviewElement {
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

    class Slider {
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
    class HueSlider extends Slider {
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
    class SaturationSlider extends Slider {
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
    class ValueSlider extends Slider {
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
    class AlphaSlider extends Slider {
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
    class KelvinSlider extends Slider {
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
    class RedSlider extends Slider {
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
    class GreenSlider extends Slider {
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
    class BlueSlider extends Slider {
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
    let factories = {
        hue: HueSlider,
        saturation: SaturationSlider,
        value: ValueSlider,
        alpha: AlphaSlider,
        kelvin: KelvinSlider,
        red: RedSlider,
        green: GreenSlider,
        blue: BlueSlider
    };

    class ColorWidget {
        static initialize(context) {
            $('input.color-picker', context).each(function(index) {
                let elem = $(this);
                let options = {
                    preview_elem: elem.data('preview_elem'),
                    elements: elem.data('elements'),
                    sliders: elem.data('sliders'),
                    box_width: elem.data('box_width'),
                    box_height: elem.data('box_height'),
                    slider_size: elem.data('slider_size'),
                    color: elem.data('color'),
                    swatches: elem.data('swatches')
                };
                new ColorWidget(elem, options, index);
            });
        }
        constructor(elem, options, index) {
            this.elem = elem;
            this.elem
                .data('color_widget', this)
                .attr('spellcheck', "false")
                .attr('maxlength', 7);
            this.dropdown_elem = $(`<div />`)
                .addClass('color-picker-wrapper')
                .css('top', this.elem.outerHeight())
                .insertAfter(this.elem);
            this.picker_container = $('<div />')
                .addClass('color-picker-container')
                .appendTo(this.dropdown_elem);
            this.close_btn = $(`<button />`)
                .addClass('close-button')
                .text('✕')
                .appendTo(this.dropdown_elem);        this.add_color_btn = $(`<button />`)
                .addClass('add_color')
                .text('+ Add');
            this.remove_color_btn = $(`<button />`)
                .addClass('remove_color')
                .text('- Remove');
            this.buttons = $('<div />')
                .addClass('buttons')
                .append(this.add_color_btn)
                .append(this.remove_color_btn)
                .appendTo(this.dropdown_elem);        this.swatches_container = $(`<div />`)
                .addClass('color-picker-recent')
                .appendTo(this.dropdown_elem);
            this.input_container = $(`<div />`)
                .addClass('color-picker-inputs')
                .insertBefore(this.buttons);
            this.rgb_container = $(`<div />`)
                .addClass('color-picker-rgb')
                .appendTo(this.input_container);
            this.hsl_container = $(`<div />`)
                .addClass('color-picker-hsl')
                .appendTo(this.input_container);
            this.index = index;
            this.slider_size = options.slider_size;
            let prev_elem = options.preview_elem ? $(options.preview_elem) :
                $(`<span />`).addClass('color-picker-color');
            this.preview = new PreviewElement(this, prev_elem);
            let iro_opts = this.init_opts(options);
            this.picker = new iro.ColorPicker(this.picker_container.get(0), iro_opts);
            this.swatches = [];
            this.fixed_swatches = [];
            this.fix_swatches(options.swatches);
            this.parse_json();
            this.color = this.picker.color.clone();
            this.elem.val(this.color.hexString);
            if (this.preview) {
                this.preview.color = this.color.rgbaString;
            }
            this.elem.on('input', () => {
                let hex = this.elem.val();
                if (hex.length === 0) {
                    this.elem.val('#');
                } else {
                    this.picker.color.set(hex);
                }
            });
            this.on_resize = this.on_resize.bind(this);
            this.on_resize();
            $(window).on('resize', this.on_resize);
            this.create_swatch = this.create_swatch.bind(this);
            this.add_color_btn.on('click', this.create_swatch);
            this.remove_swatch = this.remove_swatch.bind(this);
            this.remove_color_btn.on('click', this.remove_swatch);
            this.open = this.open.bind(this);
            this.elem.on('focus', this.open);
            this.update_color = this.update_color.bind(this);
            this.picker.on('color:change', this.update_color);
            this.close = this.close.bind(this);
            this.close_btn.on('click', this.close);
            this.on_keydown = this.on_keydown.bind(this);
            this.on_click = this.on_click.bind(this);
        }
        parse_json() {
            let json_str = localStorage.getItem(`color-swatches-${this.index}`);
            if (json_str) {
                let colors = JSON.parse(json_str);
                this.swatches_container.show();
                for (let color of colors) {
                    this.swatches.push(new ColorSwatch(this, new iro.Color(color)));
                }
                let active_swatch = this.swatches[this.swatches.length -1];
                active_swatch.select();
            }
        }
        init_opts(opts) {
            let iro_opts = {
                color: opts.color,
                width: opts.box_width,
                layout: []
            };
            if (opts.elements.includes('box')) {
                iro_opts.layout.push({
                    component: iro.ui.Box,
                    options: {}
                });
            }
            let clr = new iro.Color(opts.color);
            this.sliders = {};
            opts.sliders.forEach((type, i) => {
                iro_opts.layout.push(Slider.component(type, opts.slider_size));
                let factory = factories[type];
                let target = this.input_container;
                if (type === 'hue' || type === 'saturation' || type === 'value') {
                    target = this.hsl_container;
                    target.css('display', 'flex');
                } else if (type === 'red' || type === 'green' || type === 'blue') {
                    target = this.rgb_container;
                    target.css('display', 'flex');
                } else {
                    target = $(`<div />`)
                        .addClass(`color-picker-${type}`)
                        .appendTo(this.input_container);
                }
                this.sliders[type] = new factory(this, clr, type, target, i);
            });
            return iro_opts;
        }
        on_resize(e) {
            if ($(window).width() <= 450) {
                if (!this.dropdown_elem.hasClass('mobile')) {
                    this.dropdown_elem.addClass('mobile');
                    this.picker.state.layoutDirection = 'horizontal';
                }
                if (this.box_dimensions.height) {
                    this.picker.state.boxHeight = null;
                }
                let calc_width = $(window).width() * 0.3;
                this.picker.resize(calc_width);
            } else
            if ($(window).width() > 450 && this.dropdown_elem.hasClass('mobile')) {
                this.dropdown_elem.removeClass('mobile');
                this.picker.state.layoutDirection = 'vertical';
                if (this.box_dimensions.height) {
                    this.picker.state.boxHeight = this.box_dimensions.height;
                }
                this.picker.resize(this.box_dimensions.width);
            }
        }
        update_color() {
            this.color = this.picker.color.clone();
            this.preview.color = this.color.rgbaString;
            this.elem.val(this.color.hexString);
            for (let type in this.sliders) {
                this.sliders[type].update(this.color);
            }
        }
        open(evt) {
            if (this.dropdown_elem.css('display') === "none") {
                this.dropdown_elem.show();
                $(window).on('keydown', this.on_keydown);
                $(window).on('mousedown', this.on_click);
            } else {
                this.close();
            }
        }
        on_keydown(e) {
            if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                this.close();
            } else if (e.key === "Delete") {
                e.preventDefault();
                this.remove_swatch();
            }
        }
        on_click(e) {
            let target = this.dropdown_elem;
            if (!target.is(e.target) &&
                target.has(e.target).length === 0 &&
                !this.preview.elem.is(e.target) &&
                target.css('display') === 'block')
            {
                this.close();
            }
        }
        close(e) {
            if (e) {
                e.preventDefault();
            }
            this.dropdown_elem.hide();
            this.elem.blur();
            $(window).off('keydown', this.on_keydown);
            $(window).off('mousedown', this.on_click);
        }
        color_equals(color) {
            if (color instanceof iro.Color &&
                color.hsla.h === this.color.hsla.h &&
                color.hsla.s === this.color.hsla.s &&
                color.hsla.l === this.color.hsla.l &&
                color.hsla.a === this.color.hsla.a) {
                return true;
            }
        }
        fix_swatches(swatches) {
            if (!swatches || !swatches.length) {
                return;
            }
            for (let swatch of swatches) {
                let color;
                if (swatch instanceof Array) {
                        color = {
                            r: swatch[0],
                            g: swatch[1],
                            b: swatch[2],
                            a: swatch[3] || 1
                    };
                } else if (typeof swatch === 'string' || typeof swatch === 'object') {
                    color = swatch;
                } else {
                    console.log(`ERROR: not supported color format at ${swatch}`);
                }
                this.fixed_swatches.push(
                    new ColorSwatch(this, new iro.Color(color), true)
                );
            }
            this.swatches_container.show();
        }
        create_swatch(e) {
            if (e) {
                e.preventDefault();
                this.swatches_container.show();
            }
            for (let swatch of this.fixed_swatches) {
                if (this.color_equals(swatch.color)) {
                    return;
                }
            }
            for (let swatch of this.swatches) {
                if (this.color_equals(swatch.color)) {
                    return;
                }
            }
            let swatch = new ColorSwatch(this, this.picker.color.clone());
            this.swatches.push(swatch);
            swatch.select();
            if (this.swatches.length > 10 - this.fixed_swatches.length) {
                this.swatches[0].destroy();
                this.swatches.shift();
            }
            this.set_swatches();
        }
        remove_swatch(e) {
            if (e) {
                e.preventDefault();
            }
            if (this.active_swatch.fixed) {
                return;
            }
            this.active_swatch.destroy();
            let index = this.swatches.indexOf(this.active_swatch);
            this.swatches.splice(index, 1);
            if (!this.swatches.length) {
                if (this.fixed_swatches.length) {
                    this.active_swatch = this.fixed_swatches[this.fixed_swatches.length - 1];
                    this.active_swatch.select();
                    this.picker.color.set(this.active_swatch.color);
                } else {
                    this.swatches_container.hide();
                    this.picker.color.reset();
                }
                localStorage.removeItem(`color-swatches-${this.index}`);
            } else {
                this.active_swatch = this.swatches[this.swatches.length - 1];
                this.active_swatch.select();
                this.picker.color.set(this.active_swatch.color);
                this.set_swatches();
            }
        }
        set_swatches() {
            let swatches = [];
            for (let swatch of this.swatches) {
                swatches.push(swatch.color.hsla);
            }
            localStorage.setItem(`color-swatches-${this.index}`, JSON.stringify(swatches));
        }
    }

    $$1(function() {
        if (window.ts !== undefined) {
            ts.ajax.register(ColorWidget.initialize, true);
        } else {
            ColorWidget.initialize();
        }
    });

    exports.ColorWidget = ColorWidget;

    Object.defineProperty(exports, '__esModule', { value: true });


    if (window.yafowil === undefined) {
        window.yafowil = {};
    }
    window.yafowil.color = exports;


    return exports;

})({}, jQuery);
