(function (exports, $) {
    'use strict';

    class ColorWidget {
        static initialize(context) {
            $('input.color-picker', context).each(function() {
                let options = {
                    hsl_display: false,
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
            this.picker_elem = $(`
            <div class="color-picker-wrapper" />
        `);
            this.picker_container = $('<div class="color-picker-container" />');
            this.close_btn = $(`<button class="close-button">✕</button>`);
            let add_color_btn = this.add_color_btn = $(`
            <button class="add_color">
            + Add
            </button>
        `);
            let remove_color_btn = this.remove_color_btn = $(`
            <button class="remove_color">
            - Remove
            </button>
        `);
            this.buttons = $('<div class="buttons"/>')
                .append(add_color_btn)
                .append(remove_color_btn);
            this.swatches_container = $(`<div class="color-picker-recent" />`);
            this.picker_elem
                .append(this.picker_container)
                .append(this.close_btn)
                .append(this.buttons)
                .append(this.swatches_container);
            this.picker = new iro.ColorPicker(this.picker_container.get(0), {
                color: this.color,
                layout: [
                    {
                        component: iro.ui.Box,
                        options: {}
                    },
                    {
                        component: iro.ui.Slider,
                        options: {
                            sliderType: 'hue'
                        }
                    }
                ]
            });
            this.resize_handle = this.resize_handle.bind(this);
            this.resize_handle();
            $(window).on('resize', this.resize_handle);
            this.create_swatch = this.create_swatch.bind(this);
            this.add_color_btn.on('click', this.create_swatch);
            this.remove_swatch = this.remove_swatch.bind(this);
            this.remove_color_btn.on('click', this.remove_swatch);
            this.init_options(options);
            this.color_swatches = [];
            let json_str = localStorage.getItem("color-swatches");
            if (json_str) {
                this.swatches_container.show();
                let color_swatches = JSON.parse(json_str);
                for (let swatch of color_swatches) {
                    this.color_swatches.push(new ColorSwatch(this, swatch.hex, swatch.hsl));
                }
                this.active_swatch = this.color_swatches[this.color_swatches.length -1];
                this.active_swatch.select();
                this.hex = this.active_swatch.hex;
                this.hsl = this.active_swatch.hsl;
            } else {
                this.hex = "#ffffff";
                this.hsl = {h:0, s:0, l:100};
            }
            this.elem.val(this.hex);
            this.preview_elem.css('background', this.hex);
            this.trigger_handle = this.trigger_handle.bind(this);
            this.elem.on('focus', this.trigger_handle);
            this.preview_elem.on('click', this.trigger_handle);
            this.elem.on('input', () => {
                let hex = this.elem.val();
                if (hex.length === 0) {
                    this.elem.val('#');
                }
                this.hex = hex;
            });
            this.update_color = this.update_color.bind(this);
            this.picker.on('color:change', this.update_color);
            this.hide_elem = this.hide_elem.bind(this);
            this.close_btn.on('click', this.hide_elem);
            this.handle_keypress = this.handle_keypress.bind(this);
            this.handle_click = this.handle_click.bind(this);
        }
        init_options(options) {
            let preview_elem = options.preview_elem;
            let hsl_display = options.hsl_display;
            let hex_display = options.hex_display;
            if (preview_elem) {
                this.preview_elem = options.preview_elem;
                this.elem.after(this.picker_elem);
            } else {
                this.preview_elem = $(`
                <span class="color-picker-color" />
            `);
                this.elem.after(this.preview_elem);
                this.preview_elem.after(this.picker_elem);
            }
            if (hsl_display) {
                let hsl = this.picker.color.hsl;
                this.hsl_display = $(`
                <div class="hsl-display">
                  <div>
                    H:
                    <input class="h" type="number" value="${hsl.h}"
                        min="0", max="360" />
                  </div>
                  <div>
                    S:
                    <input class="s" type="number" value="${hsl.s}"
                        min="0", max="100" />
                  </div>
                  <div>
                    L:
                    <input class="l" type="number" value="${hsl.l}"
                        min="0", max="100" />
                  </div>
                </div>
            `);
                this.picker_elem.append(this.hsl_display);
                this.handle_hsl_input = this.handle_hsl_input.bind(this);
                $('input', this.hsl_display).on('input', this.handle_hsl_input);
            } else {
                this.buttons.addClass('hsl-false');
            }
            if (hex_display) {
                let hex_display = this.hex_display = $(`
                <div class="hex-display">
                  HEX:
                  <input value="${this.picker.color.hexString}"
                    spellcheck="false" maxlength="7" />
                </div>
            `);
                this.picker_elem.append(hex_display);
                let hex = this.picker.color.hexString;
                this.hex_display.val(hex);
                this.handle_hex_input = this.handle_hex_input.bind(this);
                $('input', this.hex_display).on('input', this.handle_hex_input);
            }
        }
        get hex() {
            return this._hex;
        }
        set hex(hex) {
            if (typeof hex === 'string'
                && hex[0] === '#'
                && hex.length === 7
                && !isNaN(Number('0x' + hex.substring(1,7)))
            ){
                this._hex = hex;
                this.picker.color.hexString = hex;
                this.elem.val(hex);
                if (this.hex_display) {
                    $('input', this.hex_display).val(hex);
                }
            }
        }
        get hsl() {
            return this._hsl;
        }
        set hsl(hsl) {
            if (this.hsl_display) {
                $('input.h', this.hsl_display).val(hsl.h);
                $('input.s', this.hsl_display).val(hsl.s);
                $('input.l', this.hsl_display).val(hsl.l);
            }
            this.picker.color.hsl = hsl;
            this._hsl = hsl;
        }
        resize_handle(e) {
            if ($(window).width() <= 450) {
                if (!this.picker_elem.hasClass('mobile')) {
                    this.picker_elem.addClass('mobile');
                    this.picker.state.layoutDirection = 'horizontal';
                }
                let calc_width = $(window).width() * 0.3;
                this.picker.resize(calc_width);
            }
            else if ($(window).width() > 450) {
                if (this.picker_elem.hasClass('mobile')) {
                    this.picker_elem.removeClass('mobile');
                    this.picker.state.layoutDirection = 'vertical';
                    this.picker.resize(300);
                }
            }
        }
        handle_hsl_input(e) {
            e.preventDefault();
            let target = $(e.target);
            let hsl = this.picker.color.hsl;
            switch (target.attr('class')) {
                case 'h':
                    hsl.h = target.val();
                    break;
                case 's':
                    hsl.s = target.val();
                    break;
                case 'l':
                    hsl.l = target.val();
                    break;
            }
            this.picker.color.hsl = hsl;
        }
        handle_hex_input(e) {
            let hex = $(e.currentTarget).val();
            if (hex.length === 0) {
                $(e.currentTarget).val('#');
            }
            this.hex = hex;
        }
        update_color() {
            this.hex = this.picker.color.hexString;
            this.hsl = this.picker.color.hsl;
            this.preview_elem.css('background', this.hex);
            this.elem.val(this.hex);
        }
        trigger_handle(evt) {
            if (this.picker_elem.css('display') === "none") {
                this.picker_elem.show();
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
            let target = this.picker_elem;
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
            this.picker_elem.hide();
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
                if (hsl.h === swatch.hsl.h &&
                    hsl.s === swatch.hsl.s &&
                    hsl.l === swatch.hsl.l) {
                        return;
                }
            }
            let current_swatch = new ColorSwatch(this, hex, hsl);
            this.color_swatches.push(current_swatch);
            current_swatch.select();
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
                this.color = '#ffffff';
                localStorage.removeItem('color-swatches');
                return;
            }
            last_color.select();
            this.picker.color.hsl = last_color.hsl;
            this.color = last_color.hex;
            this.set_swatches();
        }
        set_swatches() {
            let swatches = [];
            for (let swatch of this.color_swatches) {
                swatches.push({
                    hex: swatch.hex,
                    hsl: swatch.hsl
                });
            }
            localStorage.setItem("color-swatches", JSON.stringify(swatches));
        }
    }
    class ColorSwatch {
        constructor(widget, hex, hsl) {
            this.elem = $(`
            <div class="color-swatch"
                id="${hex.substr(1)}"
                style="background:${hex}"
            />
        `);
            this.widget = widget;
            this.widget.swatches_container.append(this.elem);
            this.hex = hex;
            this.hsl = hsl;
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
            this.widget.hex = this.hex;
            this.widget.hsl = this.hsl;
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
