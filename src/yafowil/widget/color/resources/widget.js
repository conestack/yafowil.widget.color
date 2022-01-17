(function (exports, $) {
    'use strict';

    class ColorSwatch {
        constructor(widget, color) {
            this.widget = widget;
            this.color = color;
            this.elem = $('<div />')
                .addClass('color-swatch')
                .css('background-color', this.color.hexString)
                .appendTo(this.widget.swatches_container);
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
            this.update = this.update.bind(this);
            this.hue_input
                .add(this.saturation_input)
                .add(this.lightness_input)
                .on('input', this.update);
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
        update(e) {
            this.widget.picker.color.set(this.value);
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
            this.update = this.update.bind(this);
            this.input.on('input', this.update);
        }
        get value() {
            return this.input.val();
        }
        set value(hex) {
            this.input.val(hex);
        }
        update() {
            if (this.value.length === 0) {
                this.input.val('#');
            } else {
                this.widget.picker.color.set(this.value);
            }
        }
    }
    class ColorWidget {
        static initialize(context) {
            $('input.color-picker', context).each(function() {
                let options = {
                    hsl_display: true,
                    hex_display: true
                };
                new ColorWidget($(this), options);
            });
        }
        constructor(elem, options) {
            this.elem = elem;
            this.elem
                .data('color_widget', this)
                .attr('spellcheck', "false")
                .attr('maxlength', 7);
            this.dropdown_elem = $(`<div />`)
                .addClass('color-picker-wrapper');
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
                .appendTo(this.dropdown_elem);        this.picker = new iro.ColorPicker(this.picker_container.get(0), {
                color: '#ffffff',
                layout: [{
                    component: iro.ui.Box,
                    options: {}
                }, {
                    component: iro.ui.Slider,
                    options: {
                        sliderType: 'hue'
                    }
                }]
            });
            this.color_swatches = [];
            let json_str = localStorage.getItem("color-swatches");
            if (json_str) {
                let colors = JSON.parse(json_str);
                this.swatches_container.show();
                for (let color of colors) {
                    this.color_swatches.push(new ColorSwatch(this, new iro.Color(color)));
                }
                let active_swatch = this.color_swatches[this.color_swatches.length -1];
                active_swatch.select();
            }
            this.init_options(options);
            this.color = this.picker.color.clone();
            this.elem.val(this.color.hexString);
            this.preview_elem.css('background-color', this.color.hexString);
            this.resize_handle = this.resize_handle.bind(this);
            this.resize_handle();
            $(window).on('resize', this.resize_handle);
            this.create_swatch = this.create_swatch.bind(this);
            this.add_color_btn.on('click', this.create_swatch);
            this.remove_swatch = this.remove_swatch.bind(this);
            this.remove_color_btn.on('click', this.remove_swatch);
            this.trigger_handle = this.trigger_handle.bind(this);
            this.elem.on('focus', this.trigger_handle);
            this.preview_elem.on('click', this.trigger_handle);
            this.elem.on('input', () => {
                let hex = this.elem.val();
                if (hex.length === 0) {
                    this.elem.val('#');
                } else {
                    this.picker.color.set(hex);
                }
            });
            this.update_color = this.update_color.bind(this);
            this.picker.on('color:change', this.update_color);
            this.close = this.close.bind(this);
            this.close_btn.on('click', this.close);
            this.handle_keypress = this.handle_keypress.bind(this);
            this.handle_click = this.handle_click.bind(this);
        }
        init_options(options) {
            if (options && options.preview_elem) {
                this.preview_elem = options.preview_elem;
                this.elem.after(this.dropdown_elem);
            } else {
                this.preview_elem = $(`<span />`).addClass('color-picker-color');
                this.elem.after(this.preview_elem);
                this.preview_elem.after(this.dropdown_elem);
            }
            if (options && options.hsl_display) {
                this.hsl_display = new ColorHSLInput(this, this.picker.color.hsl);
            } else {
                this.buttons.addClass('hsl-false');
            }
            if (options && options.hex_display) {
                this.hex_display = new ColorHexInput(this, this.picker.color.hexString);
            }
        }
        resize_handle(e) {
            if ($(window).width() <= 450) {
                if (!this.dropdown_elem.hasClass('mobile')) {
                    this.dropdown_elem.addClass('mobile');
                    this.picker.state.layoutDirection = 'horizontal';
                }
                let calc_width = $(window).width() * 0.3;
                this.picker.resize(calc_width);
            } else
            if ($(window).width() > 450 && this.dropdown_elem.hasClass('mobile')) {
                this.dropdown_elem.removeClass('mobile');
                this.picker.state.layoutDirection = 'vertical';
                this.picker.resize(300);
            }
        }
        update_color() {
            this.color = this.picker.color.clone();
            this.preview_elem.css('background-color', this.color.hexString);
            this.elem.val(this.color.hexString);
            if (this.hsl_display) {
                this.hsl_display.value = this.color.hsl;
            }
            this.elem.val(this.color.hexString);
            if (this.hex_display) {
                this.hex_display.value = this.color.hexString;
            }
        }
        trigger_handle(evt) {
            if (this.dropdown_elem.css('display') === "none") {
                this.dropdown_elem.show();
                $(window).on('keydown', this.handle_keypress);
                $(window).on('mousedown', this.handle_click);
            } else {
                this.close();
            }
        }
        handle_keypress(e) {
            if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                this.close();
            } else if (e.key === "Delete") {
                e.preventDefault();
                this.remove_swatch();
            }
        }
        handle_click(e) {
            let target = this.dropdown_elem;
            if (!target.is(e.target) &&
                target.has(e.target).length === 0 &&
                !this.preview_elem.is(e.target) &&
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
            $(window).off('keydown', this.handle_keypress);
            $(window).off('mousedown', this.handle_click);
        }
        color_equals(color) {
            if (color instanceof iro.Color &&
                color.hsl.h === this.color.hsl.h &&
                color.hsl.s === this.color.hsl.s &&
                color.hsl.l === this.color.hsl.l) {
                return true;
            }
        }
        create_swatch(e) {
            if (e) {
                e.preventDefault();
                this.swatches_container.show();
            }
            for (let swatch of this.color_swatches) {
                if (this.color_equals(swatch.color)) {
                    return;
                }
            }
            let swatch = new ColorSwatch(this, this.picker.color.clone());
            this.color_swatches.push(swatch);
            swatch.select();
            if (this.color_swatches.length > 12) {
                this.color_swatches[0].destroy();
                this.color_swatches.shift();
            }
            this.set_swatches();
        }
        remove_swatch(e) {
            if (e) {
                e.preventDefault();
            }
            this.active_swatch.destroy();
            let index = this.color_swatches.indexOf(this.active_swatch);
            this.color_swatches.splice(index, 1);
            if (this.color_swatches.length === 0) {
                this.picker.color.reset();
                localStorage.removeItem('color-swatches');
            } else {
                this.active_swatch = this.color_swatches[this.color_swatches.length - 1];
                this.active_swatch.select();
                this.picker.color.set(this.active_swatch.color);
                this.set_swatches();
            }
        }
        set_swatches() {
            let swatches = [];
            for (let swatch of this.color_swatches) {
                swatches.push(swatch.color.hsl);
            }
            localStorage.setItem("color-swatches", JSON.stringify(swatches));
        }
    }

    $(function() {
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
//# sourceMappingURL=widget.js.map
