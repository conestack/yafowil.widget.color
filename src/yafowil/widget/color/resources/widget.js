var yafowil_color = (function (exports, $) {
    'use strict';

    class ColorSwatch {
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
                $('div.color-swatch', this.widget.dropdown_elem)
                    .removeClass('selected');
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
    class LockedSwatchesContainer {
        constructor (widget, swatches = []) {
            this.widget = widget;
            this.elem = $('<div />')
                .addClass('color-picker-recent')
                .appendTo(widget.dropdown_elem);
            this.swatches = [];
            this.init_swatches(swatches);
        }
        init_swatches(swatches) {
            if (!swatches || !swatches.length) {
                this.elem.hide();
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
                this.elem.show();
            }
            this.widget.active_swatch = this.swatches[0];
        }
    }
    class UserSwatchesContainer {
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
                        this.widget.picker.color.set(
                            this.widget.active_swatch.color
                        );
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
                localStorage.setItem('yafowil-color-swatches', JSON.stringify(swatches));
            } else {
                localStorage.removeItem('yafowil-color-swatches');
            }
            let evt = new $.Event('yafowil-color-swatches:changed', {origin: this});
            $('input.color-picker').trigger(evt);
        }
    }
    class InputElement {
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
    class PreviewElement {
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
    const slider_components = {
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
    };

    class ColorWidget {
        static initialize(context) {
            $('input.color-picker', context).each(function() {
                let elem = $(this);
                let id = elem.attr('id');
                if (id && id.includes('TEMPLATE')) {
                    return;
                }
                let options = {
                    format: elem.data('format'),
                    preview_elem: elem.data('preview_elem'),
                    sliders: elem.data('sliders'),
                    box_width: elem.data('box_width'),
                    box_height: elem.data('box_height'),
                    slider_size: elem.data('slider_size'),
                    color: elem.data('color'),
                    locked_swatches: elem.data('locked_swatches'),
                    user_swatches: elem.data('user_swatches'),
                    temperature: elem.data('temperature'),
                    disabled: elem.data('disabled'),
                    show_inputs: elem.data('show_inputs'),
                    show_labels: elem.data('show_labels'),
                    slider_length: elem.data('slider_length'),
                    layout_direction: elem.data('layout_direction')
                };
                new ColorWidget(elem, options);
            });
        }
        constructor(elem, options) {
            elem.data('yafowil-color', this);
            elem.addClass('form-control');
            this.elem = elem;
            this.elem.attr('spellcheck', 'false');
            this.dropdown_elem = $('<div />')
                .addClass('color-picker-wrapper')
                .css('top', this.elem.outerHeight())
                .insertAfter(this.elem);
            this.picker_container = $('<div />')
                .addClass('color-picker-container')
                .appendTo(this.dropdown_elem);
            this.close_btn = $('<button />')
                .addClass('close-button')
                .text('✕')
                .appendTo(this.dropdown_elem);
            this.slider_size = options.slider_size;
            let iro_opts = this.init_opts(options);
            this.picker = new iro.ColorPicker(this.picker_container.get(0), iro_opts);
            let sliders = options.sliders;
            if (sliders && sliders.includes('box') && sliders.includes('wheel')) {
                if (sliders.indexOf('box') < sliders.indexOf('wheel')) {
                    $('div.IroWheel', this.picker_container).hide();
                } else {
                    $('div.IroBox', this.picker_container).hide();
                }
                this.switch_btn = $('<button />')
                    .addClass('iro-switch-toggle')
                    .append($('<i class="glyphicon glyphicon-refresh" />'))
                    .appendTo(this.dropdown_elem);
                this.switch_btn.on('click', (e) => {
                    e.preventDefault();
                    $('div.IroWheel', this.picker_container).toggle();
                    $('div.IroBox', this.picker_container).toggle();
                });
            } else if (!sliders) {
                this.picker_container.hide();
            }
            if (!options.locked_swatches && !options.user_swatches) {
                this.picker_container.css('margin-bottom', 0);
            }
            if (options.locked_swatches) {
                this.locked_swatches = new LockedSwatchesContainer(
                    this,
                    options.locked_swatches
                );
            }
            if (options.user_swatches) {
                this.user_swatches = new UserSwatchesContainer(this);
            }
            this.color = this.picker.color.clone();
            let temp = options.temperature || {min: 2000, max: 11000};
            this.input_elem = new InputElement(
                this, this.elem, this.color, options.format, temp
            );
            let prev_elem;
            if (options.preview_elem) {
                prev_elem = $(options.preview_elem)
                    .addClass('yafowil-color-picker-preview');
            } else {
                prev_elem = $('<span />')
                    .addClass('yafowil-color-picker-color layer-transparent');
            }
            this.preview = new PreviewElement(this, prev_elem, this.color);
            this.open = this.open.bind(this);
            this.elem.on('focus', this.open);
            this.update_color = this.update_color.bind(this);
            this.picker.on('color:change', this.update_color);
            this.close = this.close.bind(this);
            this.close_btn.on('click', this.close);
            this.on_keydown = this.on_keydown.bind(this);
            this.on_click = this.on_click.bind(this);
        }
        init_opts(opts) {
            let iro_opts = {
                color: opts.color,
                width: opts.box_width,
                boxHeight: opts.box_height || opts.box_width,
                layoutDirection: opts.layout_direction || 'vertical',
                layout: []
            };
            const sliders = opts.sliders || [];
            sliders.forEach(name => {
                let type = slider_components[name];
                if (type === 'box') {
                    iro_opts.layout.push({
                        component: iro.ui.Box,
                        options: {}
                    });
                } else if (type === 'wheel') {
                    iro_opts.layout.push({
                        component: iro.ui.Wheel,
                        options: {}
                    });
                } else {
                    iro_opts.layout.push({
                        component: iro.ui.Slider,
                        options: {
                            sliderType: type,
                            sliderSize: opts.slider_size,
                            sliderLength: opts.slider_length,
                            minTemperature: opts.temperature.min || undefined,
                            maxTemperature: opts.temperature.max || undefined,
                            disabled: opts.disabled,
                            showInput: opts.show_inputs,
                            showLabel: opts.show_labels
                        }
                    });
                }
            });
            return iro_opts;
        }
        get active_swatch() {
            return this._active_swatch;
        }
        set active_swatch(swatch) {
            if (swatch) {
                swatch.selected = true;
            }
            this._active_swatch = swatch;
        }
        update_color() {
            this.color = this.picker.color.clone();
            this.preview.color = this.color.rgbaString;
            this.input_elem.update_color(this.color);
        }
        open(evt) {
            if (this.dropdown_elem.css('display') === 'none') {
                this.dropdown_elem.show();
                $(window).on('keydown', this.on_keydown);
                $(window).on('mousedown', this.on_click);
            } else {
                this.close();
            }
        }
        on_keydown(e) {
            if (e.key === 'Enter' || e.key === 'Escape') {
                e.preventDefault();
                this.close();
            } else if (e.key === 'Delete') {
                e.preventDefault();
                if (this.user_swatches) {
                    this.user_swatches.remove_swatch();
                }
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                if (!this.locked_swatches && !this.user_swatches) {
                    return;
                }
                let swatch = this.active_swatch,
                    ctx = swatch.locked ? this.locked_swatches : this.user_swatches,
                    index = ctx.swatches.indexOf(swatch);
                index = e.key === 'ArrowLeft' ? index - 1 : index + 1;
                if (index < 0) {
                    if (!swatch.locked && this.locked_swatches) {
                        let swatches = this.locked_swatches.swatches;
                        this.active_swatch = swatches[swatches.length -1];
                    }
                } else if (index >= ctx.swatches.length) {
                    if (swatch.locked
                        && this.user_swatches
                        && this.user_swatches.swatches.length) {
                            let swatches = this.user_swatches.swatches;
                            this.active_swatch = swatches[0];
                    }
                } else {
                    this.active_swatch = ctx.swatches[index];
                }
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
                color.hsva.h === this.color.hsva.h &&
                color.hsva.s === this.color.hsva.s &&
                color.hsva.v === this.color.hsva.v &&
                color.hsva.a === this.color.hsva.a) {
                return true;
            }
        }
    }
    function color_on_array_add(inst, context) {
        ColorWidget.initialize(context);
    }
    function register_array_subscribers() {
        if (window.yafowil_array === undefined) {
            return;
        }
        window.yafowil_array.on_array_event('on_add', color_on_array_add);
    }

    $(function() {
        if (window.ts !== undefined) {
            ts.ajax.register(ColorWidget.initialize, true);
        } else if (window.bdajax !== undefined) {
            bdajax.register(ColorWidget.initialize, true);
        } else {
            ColorWidget.initialize();
        }
        register_array_subscribers();
    });

    exports.ColorWidget = ColorWidget;
    exports.register_array_subscribers = register_array_subscribers;

    Object.defineProperty(exports, '__esModule', { value: true });


    window.yafowil = window.yafowil || {};
    window.yafowil.color = exports;


    return exports;

})({}, jQuery);
