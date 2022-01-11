(function (exports, $) {
    'use strict';

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
            this.picker_elem = $(`
            <div class="color-picker-wrapper" />
        `);
            this.picker_container = $('<div class="color-picker-container" />');
            this.close_btn = $(`
            <button class="close-button">✕</button>
        `);
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
            this.buttons = $('<div class="buttons"/>').append(add_color_btn).append(remove_color_btn);
            this.swatches_container = $(`<div class="color-picker-recent" />`);
            this.picker_elem
                .append(this.picker_container)
                .append(this.close_btn)
                .append(this.buttons)
                .append(this.swatches_container);
            this.resize_handle = this.resize_handle.bind(this);
            this.resize_handle();
            $(window).on('resize', this.resize_handle);
            this.create_swatch = this.create_swatch.bind(this);
            this.add_color_btn.on('click', this.create_swatch);
            this.remove_swatch = this.remove_swatch.bind(this);
            this.remove_color_btn.on('click', this.remove_swatch);
            this.init_options(options);
            this.init_swatches();
            this.color = "#ffffff";
            this.color_swatches = [];
            this.elem.val(this.color);
            this.preview_elem.css('background', this.color);
            this.trigger_handle = this.trigger_handle.bind(this);
            this.elem.on('focus', this.trigger_handle);
            this.preview_elem.on('click', this.trigger_handle);
            this.elem.on('input', () => {
                let hex = this.elem.val();
                if (hex.length === 0) {
                    this.elem.val('#');
                }
                this.update_hex_value(hex);
            });
            this.update_color = this.update_color.bind(this);
            this.picker.on('color:change', this.update_color);
            this.hide_elem = this.hide_elem.bind(this);
            this.close_btn.on('click', this.hide_elem);
            this.handle_keypress = this.handle_keypress.bind(this);
            this.handle_click = this.handle_click.bind(this);
        }
        init_options(options) {
            if (options && options.preview_elem) {
                this.preview_elem = options.preview_elem;
                this.elem.after(this.picker_elem);
            } else {
                this.preview_elem = $(`
                <span class="color-picker-color" />
            `);
                this.elem.after(this.preview_elem);
                this.preview_elem.after(this.picker_elem);
            }
            if (options && options.hsl_display) {
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
                $('input', this.hsl_display).on('input',
                    this.update_hsl_value.bind(this));
            } else {
                this.buttons.addClass('hsl-false');
            }
            if (options && options.hex_display) {
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
                $('input', this.hex_display).on('input', (e) => {
                    let hex = $(e.currentTarget).val();
                    if (hex.length === 0) {
                        $(e.currentTarget).val('#');
                    }
                    this.update_hex_value(hex);
                });
            }
        }
        init_swatches() {
            let json_str = localStorage.getItem("color-swatches");
            if (json_str) {
                this.swatches_container.show();
                this.color_swatches = JSON.parse(json_str);
                for (let swatch of this.color_swatches) {
                    let elem_id = swatch.hex.substr(1);
                    let current_color_swatch = $(`
                    <div class="color-swatch"
                         id="${elem_id}"
                         style="background:${swatch.hex}"/>
                `);
                    this.swatches_container.append(current_color_swatch);
                    current_color_swatch.on('click', () => {
                        this.color = swatch.hex;
                        this.picker.color.hsl = swatch.hsl;
                        if ($('div.color-swatch').length > 1) {
                            $('div.color-swatch').removeClass('selected');
                        }
                        current_color_swatch.addClass('selected');
                    });
                }
            }
        }
        resize_handle(e) {
            if ($(window).width() <= 450 && !this.picker_elem.hasClass('mobile')) {
                this.picker = null;
                $('div.IroColorPicker', this.picker_elem).remove();
                this.picker_elem.addClass('mobile');
                let calc_width = $(window).width() * 0.3;
                this.picker = new iro.ColorPicker(this.picker_container.get(0), {
                    color: this.color,
                    layoutDirection: 'horizontal',
                    width: calc_width,
                    display: 'inline-block',
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
                        },
                    ]
                });
            }
            else if ($(window).width() > 450) {
                if (this.picker_elem.hasClass('mobile')) {
                    this.picker = null;
                    $('div.IroColorPicker', this.picker_elem).remove();
                    this.picker_elem.removeClass('mobile');
                }
                if (!this.picker) {
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
                            },
                        ]
                    });
                }
            }
        }
        update_color() {
            let current_color = this.picker.color.hexString;
            let current_hsl = this.picker.color.hsl;
            this.preview_elem.css('background', current_color);
            this.elem.val(current_color);
            if (this.hsl_display) {
                $('input.h', this.hsl_display).val(current_hsl.h);
                $('input.s', this.hsl_display).val(current_hsl.s);
                $('input.l', this.hsl_display).val(current_hsl.l);
            }
            if (this.hex_display) {
                $('input', this.hex_display).val(current_color);
            }
        }
        update_hsl_value(e) {
            e.preventDefault();
            let target = $(e.target);
            let hsl = {
                h: this.picker.color.hsl.h,
                s: this.picker.color.hsl.s,
                l: this.picker.color.hsl.l
            };
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
        update_hex_value(hex) {
            if (typeof hex === 'string'
                && hex[0] === '#'
                && hex.length === 7
                && !isNaN(Number('0x' + hex.substring(1,7)))) {
                this.picker.color.hexString = hex;
            }
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
            let color = this.picker.color.hexString;
            for (let swatch of this.color_swatches) {
                if (hsl.h === swatch.hsl.h &&
                    hsl.s === swatch.hsl.s &&
                    hsl.l === swatch.hsl.l) {
                        return;
                }
            }
            let current_color_swatch = $(`
            <div class="color-swatch" id="${color.substr(1)}" style="background:${color}"/>
        `);
            if (this.color_swatches.length >= 12) {
                this.color_swatches.shift();
                $('div.color-swatch')[0].remove();
            }
            this.swatches_container.append(current_color_swatch);
            $('div.color-swatch').removeClass('selected');
            current_color_swatch.addClass('selected');
            let swatch = {
                hex: color,
                hsl: hsl
            };
            this.color_swatches.push(swatch);
            current_color_swatch.on('click', () => {
                this.color = color;
                this.picker.color.hsl = hsl;
                $('div.color-swatch').removeClass('selected');
                current_color_swatch.addClass('selected');
            });
            this.set_swatches();
        }
        remove_swatch(e) {
            if (e) {
                e.preventDefault();
            }
            let current_color_swatch = $('div.color-swatch.selected');
            let color = `#${current_color_swatch.attr('id')}`;
            let swatches = this.color_swatches;
            for (let index in swatches) {
                if (color === swatches[index].hex) {
                    this.color_swatches.splice(index, 1);
                }
            }
            current_color_swatch.remove();
            $('div.color-swatch').last().addClass('selected');
            if (this.color_swatches.length === 0) {
                this.picker.color.hsl = {h: 0, s: 0, l: 100};
                this.color = '#ffffff';
                localStorage.removeItem('color-swatches');
                return;
            }
            let last_color = this.color_swatches[this.color_swatches.length - 1];
            this.picker.color.hsl = last_color.hsl;
            this.set_swatches();
        }
        set_swatches() {
            let json_str = JSON.stringify(this.color_swatches);
            localStorage.setItem("color-swatches", json_str);
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
