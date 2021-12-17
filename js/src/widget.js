import $ from 'jquery';
import iro from 'iro';

export class ColorWidget {

    static initialize(context) {
        $('input.color-picker', context).each(function() {
            let options = {
                // preview_elem: $('h1.title'), // add optional preview elem
                hsl_display: true,
                hex_display: true
            };
            new ColorWidget($(this), options);
        });
    }

    constructor(elem, options) {
        this.picker = null;
        this.picker_elem = null;
        this.elem = elem;
        this.elem.attr('spellcheck', "false"); // disable spellcheck on input
        this.elem.attr('maxlength', 7);
        let picker_elem = this.picker_elem = $(`
            <div class="color-picker-wrapper" />
        `);

        if (options) {
            if (options.preview_elem) {
                this.preview_elem = options.preview_elem;
                this.elem.after(picker_elem);
            } else {
                let preview_elem = this.preview_elem = $(`
                    <span class="color-picker-color" />
                `);
                this.elem.after(preview_elem);
                this.preview_elem.after(picker_elem);
            }
        }

        let close_btn = this.close_btn = $(`
            <button class="close-button">✕</button>
        `);
        this.picker_elem.append(close_btn);

        // color related
        this.color = "#ffffff"; // color on init
        this.color_swatches = []; // saved colors
        this.elem.val(this.color);
        this.preview_elem.css('background', this.color);

        if ($(window).width() <= 450) {
            let calc_width = this.picker_elem.outerWidth() / 2 - 40;

            this.picker = new iro.ColorPicker(picker_elem.get(0), {
                color: this.color,
                layoutDirection: 'horizontal',
                width: calc_width,
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
        } else {
            this.picker = new iro.ColorPicker(picker_elem.get(0), {
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
        let buttons = $('<div class="buttons"/>');
        this.picker_elem.append(buttons);
        buttons.append(add_color_btn).append(remove_color_btn);
        this.create_swatch = this.create_swatch.bind(this);
        this.remove_swatch = this.remove_swatch.bind(this);
        this.add_color_btn.on('click', this.create_swatch);
        this.remove_color_btn.on('click', this.remove_swatch);

        let swatches_container = this.swatches_container = $(`
            <div class="color-picker-recent"></div>
        `);
        this.picker_elem.append(swatches_container);

        if (options) {
            this.init_options(options);
        }

        let elem_bottom_edge = this.elem.offset().top + this.elem.height();
        if (
            elem_bottom_edge + this.picker_elem.height()
            > $(document).height() - 44
        ){
            this.picker_elem.css('transform', `translateY(calc(-100% - 28px)`);
        }

        this.trigger_handle = this.trigger_handle.bind(this);
        this.elem.on('focus', this.trigger_handle);
        this.elem.on('input', () => {
            let hex = this.elem.val();
            if (hex.length === 0) {
                this.elem.val('#');
            }
            this.update_hex_value(hex);
        });

        this.preview_elem.on('click', this.trigger_handle);

        this.update_color = this.update_color.bind(this);
        this.picker.on('color:change', this.update_color);

        this.hide_elem = this.hide_elem.bind(this);
        this.close_btn.on('click', this.hide_elem);

        this.handle_keypress = this.handle_keypress.bind(this);
        this.handle_click = this.handle_click.bind(this);

        this.init_swatches();
    }

    init_options(options) {
        if (options.hsl_display) {
            let hsl = this.picker.color.hsl;
            let hsl_display = this.hsl_display = $(`
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
            this.picker_elem.append(hsl_display);
            $('input', this.hsl_display).on('input', 
                this.update_hsl_value.bind(this));
        }

        if (options.hex_display) {
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
                let current_color_swatch = $(`
                    <div class="color-swatch"
                         id="${swatch.hex}"
                         style="background:${swatch.hex}"/>
                `);
                this.swatches_container.append(current_color_swatch);

                current_color_swatch.on('click', () => {
                    this.color = swatch.color;
                    this.picker.color.hsl = swatch.hsl;

                    if ($('div.color-swatch').length > 1) {
                        $('div.color-swatch').removeClass('selected');
                    }
                    current_color_swatch.addClass('selected');
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
            <div class="color-swatch" id="${color}" style="background:${color}"/>
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
        }
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
        let color = current_color_swatch.attr('id');

        let swatches = this.color_swatches;

        for (let index in swatches) {
            if (color === swatches[index].hex) {
                this.color_swatches.splice(index, 1);
            }
        }
        current_color_swatch.remove();
        $('div.color-swatch').last().addClass('selected');
        let last_color = this.color_swatches[this.color_swatches.length - 1];
        this.picker.color.hsl = last_color.hsl;
        this.set_swatches();
    }

    set_swatches() {
        let json_str = JSON.stringify(this.color_swatches);
        localStorage.setItem("color-swatches", json_str);
    }
}
