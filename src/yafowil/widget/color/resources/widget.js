(function (exports, $) {
    'use strict';

    class ColorSwatch {
        constructor(widget, hex, hsl) {
            this.widget = widget;
            this.elem = $('<div />').addClass('color-swatch').attr('id', hex.substr(1))
                .css('background', hex).appendTo(this.widget.swatches_container);
            this.color = {
                hex: hex,
                hsl: hsl
            };
            this.destroy = this.destroy.bind(this);
            this.select = this.select.bind(this);
            this.select();
            this.elem.on('click', this.select);
        }
        find_match(hsl) {
            if (hsl.h === this.color.hsl.h &&
                hsl.s === this.color.hsl.s &&
                hsl.l === this.color.hsl.l) {
                return true;
            } else {
                return false;
            }
        }
        destroy() {
            this.elem.off('click', this.select);
            this.elem.remove();
        }
        select(e) {
            $('div.color-swatch').removeClass('selected');
            this.elem.addClass('selected');
            this.widget.active_swatch = this;
            this.widget.hex = this.color.hex;
            this.widget.hsl = this.color.hsl;
        }
    }
    class ColorHSLInput {
        constructor(widget, hsl) {
            this.widget = widget;
            this.elem = $(`<div />`).addClass('hsl-display').appendTo(widget.dropdown_elem);
            let hue_elem = $('<div />').addClass('hue').text('H:').appendTo(this.elem);
            let saturation_elem = $('<div />').addClass('saturation').text('S:')
                .appendTo(this.elem);
            let lightness_elem = $('<div />').addClass('lightness').text('L:')
                .appendTo(this.elem);
            this.hue_input = $('<input />').addClass('h')
                            .attr({type: 'number', min: 0, max:360}).val(hsl.h)
                            .appendTo(hue_elem);
            this.saturation_input = $('<input />').addClass('s')
                            .attr({type: 'number', min: 0, max:100}).val(hsl.s)
                            .appendTo(saturation_elem);
            this.lightness_input = $('<input />').addClass('l')
                            .attr({type: 'number', min: 0, max:100}).val(hsl.l)
                            .appendTo(lightness_elem);
            this.update = this.update.bind(this);
            this.hue_input.add(this.saturation_input).add(this.lightness_input)
                          .on('input', this.update);
        }
        get hsl() {
            return {
                h: parseInt(this.hue_input.val()),
                s: parseInt(this.saturation_input.val()),
                l: parseInt(this.lightness_input.val())
            }
        }
        set hsl(hsl) {
            this.hue_input.val(hsl.h);
            this.saturation_input.val(hsl.s);
            this.lightness_input.val(hsl.l);
        }
        update(e) {
            this.widget.hsl = this.hsl;
        }
    }
    class ColorHexInput {
        constructor(widget, hex) {
            this.widget = widget;
            this.elem = $('<div />').addClass('hex-display').text('HEX:')
                .appendTo(widget.dropdown_elem);
            this.hex_input = $('<input />').val(hex)
                .attr({spellcheck: false, maxlength: 7}).appendTo(this.elem);
            this.update = this.update.bind(this);
            this.hex_input.on('input', this.update);
        }
        get hex() {
            return this.hex_input.val();
        }
        set hex(hex) {
            this.hex_input.val(hex);
        }
        update() {
            if (this.hex.length === 0) {
                this.hex_input.val('#');
            } else if (this.widget.parse_hex(this.hex_input.val())) {
                this.widget.hex = this.hex;
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
            this.elem.data('color_widget', this)
                     .attr('spellcheck', "false")
                     .attr('maxlength', 7);
            this.dropdown_elem = $(`<div />`).addClass('color-picker-wrapper');
            this.picker_container = $('<div />').addClass('color-picker-container')
                .appendTo(this.dropdown_elem);
            this.close_btn = $(`<button />`).addClass('close-button').text('✕')
                .appendTo(this.dropdown_elem);        this.add_color_btn = $(`<button />`).addClass('add_color').text('+ Add');
            this.remove_color_btn = $(`<button />`).addClass('remove_color').text('- Remove');
            this.buttons = $('<div />').addClass('buttons')
                .append(this.add_color_btn)
                .append(this.remove_color_btn)
                .appendTo(this.dropdown_elem);        this.swatches_container = $(`<div />`).addClass('color-picker-recent')
                .appendTo(this.dropdown_elem);        this.picker = new iro.ColorPicker(this.picker_container.get(0), {
                color: this.color,
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
            this.init_options(options);
            let json_str = localStorage.getItem("color-swatches");
            if (json_str) {
                this.swatches_container.show();
                let color_swatches = JSON.parse(json_str);
                for (let swatch of color_swatches) {
                    this.color_swatches.push(new ColorSwatch(this, swatch.hex, swatch.hsl));
                }
                let active_swatch = this.color_swatches[this.color_swatches.length -1];
                active_swatch.select();
                this.hex = this.active_swatch.color.hex;
                this.hsl = this.active_swatch.color.hsl;
            } else {
                this.hex = "#ffffff";
                this.hsl = {h:0, s:0, l:100};
            }
            this.elem.val(this.hex);
            this.preview_elem.css('background', this.hex);
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
                } else if (this.parse_hex(hex)) {
                    this.hex = hex;
                }
            });
            this.update_color = this.update_color.bind(this);
            this.picker.on('color:change', this.update_color);
            this.hide_elem = this.hide_elem.bind(this);
            this.close_btn.on('click', this.hide_elem);
            this.handle_keypress = this.handle_keypress.bind(this);
            this.handle_click = this.handle_click.bind(this);
        }
        get hex() {
            return this._hex;
        }
        set hex(hex) {
            if (this.parse_hex(hex)) {
                this._hex = hex;
                this.picker.color.hexString = hex;
                this.elem.val(hex);
                if (this.hex_display) {
                    this.hex_display.hex = hex;
                }
            }
        }
        get hsl() {
            return this._hsl;
        }
        set hsl(hsl) {
            this.picker.color.hsl = hsl;
            if (this.hsl_display) {
                this.hsl_display.hsl = hsl;
            }
            this._hsl = hsl;
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
        parse_hex(hex) {
            if (typeof hex === 'string'
                && hex[0] === '#'
                && hex.length === 7
                && !isNaN(Number('0x' + hex.substring(1,7))))
            {
                return true;
            } else {
                return false;
            }
        }
        update_color() {
            this.hex = this.picker.color.hexString;
            this.hsl = this.picker.color.hsl;
            this.preview_elem.css('background', this.hex);
            this.elem.val(this.hex);
        }
        trigger_handle(evt) {
            if (this.dropdown_elem.css('display') === "none") {
                this.dropdown_elem.show();
                $(window).on('keydown', this.handle_keypress);
                $(window).on('mousedown', this.handle_click);
            } else {
                this.hide_elem();
            }
        }
        handle_keypress(e) {
            if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                this.hide_elem();
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
                this.hide_elem();
            }
        }
        hide_elem(e) {
            if (e) {
                e.preventDefault();
            }
            this.dropdown_elem.hide();
            this.elem.blur();
            $(window).off('keydown', this.handle_keypress);
            $(window).off('mousedown', this.handle_click);
        }
        create_swatch(e) {
            if (e) {
                e.preventDefault();
                this.swatches_container.show();
            }
            let hsl = this.picker.color.hsl;
            let hex = this.picker.color.hexString;
            for (let swatch of this.color_swatches) {
                if (swatch.find_match(hsl)) {return}        }
            let current_swatch = new ColorSwatch(this, hex, hsl);
            this.color_swatches.push(current_swatch);
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
            let last_color = this.color_swatches[this.color_swatches.length - 1];
            if (this.color_swatches.length === 0) {
                this.picker.color.hsl = {h: 0, s: 0, l: 100};
                this.hex = '#ffffff';
                localStorage.removeItem('color-swatches');
                return;
            }
            last_color.select();
            this.picker.color.hsl = last_color.color.hsl;
            this.hex = last_color.color.hex;
            this.set_swatches();
        }
        set_swatches() {
            let swatches = [];
            for (let swatch of this.color_swatches) {
                swatches.push(swatch.color);
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
