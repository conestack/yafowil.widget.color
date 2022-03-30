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
    class ColorHSLInput {
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
    class ColorRGBInput {
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
            };
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
                this.inputs[name].attr({type: 'number', min: 0, max:255});
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
    class ColorHexInput {
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
    class ColorKelvinInput {
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

    class ColorWidget {
        static initialize(context) {
            $$1('input.color-picker', context).each(function(index) {
                let elem = $$1(this);
                let options = {
                    preview_elem: elem.data('preview_elem'),
                    format: elem.data('format'),
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
            this.dropdown_elem = $$1(`<div />`)
                .addClass('color-picker-wrapper')
                .css('top', this.elem.outerHeight())
                .insertAfter(this.elem);
            this.picker_container = $$1('<div />')
                .addClass('color-picker-container')
                .appendTo(this.dropdown_elem);
            this.close_btn = $$1(`<button />`)
                .addClass('close-button')
                .text('✕')
                .appendTo(this.dropdown_elem);        this.add_color_btn = $$1(`<button />`)
                .addClass('add_color')
                .text('+ Add');
            this.remove_color_btn = $$1(`<button />`)
                .addClass('remove_color')
                .text('- Remove');
            this.buttons = $$1('<div />')
                .addClass('buttons')
                .append(this.add_color_btn)
                .append(this.remove_color_btn)
                .appendTo(this.dropdown_elem);        this.swatches_container = $$1(`<div />`)
                .addClass('color-picker-recent')
                .appendTo(this.dropdown_elem);
            this.index = index;
            this.slider_size = options.slider_size;
            let iro_opts = {
                color: options.color,
                width: options.box_width,
                layout: [{
                    component: iro.ui.Box,
                    options: {}
                }]
            };
            iro_opts.layout.push(this.create_slider('hue'));
            if (options.format.includes('kelvin')) {
                iro_opts.layout.push(this.create_slider('kelvin'));
            }
            if (options.format.includes('rgba')) {
                iro_opts.layout.push(this.create_slider('alpha'));
            }
            if (options.box_height) {
                iro_opts.boxHeight = options.box_height;
            }
            this.picker = new iro.ColorPicker(this.picker_container.get(0), iro_opts);
            this.swatches = [];
            this.fixed_swatches = [];
            this.fix_swatches(options.swatches);
            this.parse_json();
            this.init_options(options);
            this.color = this.picker.color.clone();
            this.elem.val(this.color.hexString);
            this.preview.color = this.color.rgbaString;
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
            $$1(window).on('resize', this.on_resize);
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
        init_options(options) {
            let prev_elem = options.preview_elem ? $$1(options.preview_elem) :
                $$1(`<span />`).addClass('color-picker-color');
            this.preview = new PreviewElement(this, prev_elem);
            this.box_dimensions = {
                width: options.box_width || null,
                height: options.box_height || null
            };
            let clr = this.picker.color;
            this.displays = {};
            if (options.format.includes('hsl')) {
                this.displays.hsl = new ColorHSLInput(this, clr.hsl);
            } else {
                this.buttons.addClass('hsl-false');
            }
            if (options.format.includes('rgba')) {
                this.displays.rgb = new ColorRGBInput(this, clr.rgba);
            } else if (options.format.includes('rgb')) {
                this.displays.rgb = new ColorRGBInput(this, clr.rgb);
            }
            if (options.format.includes('hex')) {
                this.displays.hex = new ColorHexInput(this, clr.hexString);
            }
            if (options.format.includes('kelvin')) {
                this.displays.kelvin = new ColorKelvinInput(this, clr.kelvin);
            }
        }
        create_slider(type) {
            return {
                component: iro.ui.Slider,
                options: {
                    sliderType: type,
                    sliderSize: this.slider_size
                }
            }
        }
        on_resize(e) {
            if ($$1(window).width() <= 450) {
                if (!this.dropdown_elem.hasClass('mobile')) {
                    this.dropdown_elem.addClass('mobile');
                    this.picker.state.layoutDirection = 'horizontal';
                }
                if (this.box_dimensions.height) {
                    this.picker.state.boxHeight = null;
                }
                let calc_width = $$1(window).width() * 0.3;
                this.picker.resize(calc_width);
            } else
            if ($$1(window).width() > 450 && this.dropdown_elem.hasClass('mobile')) {
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
            for (let opt in this.displays) {
                this.displays[opt].update(this.color);
            }
        }
        open(evt) {
            if (this.dropdown_elem.css('display') === "none") {
                this.dropdown_elem.show();
                $$1(window).on('keydown', this.on_keydown);
                $$1(window).on('mousedown', this.on_click);
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
            $$1(window).off('keydown', this.on_keydown);
            $$1(window).off('mousedown', this.on_click);
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
