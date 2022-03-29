import $ from 'jquery';
import {
    ColorHexInput,
    ColorHSLInput,
    ColorRGBInput,
    ColorSwatch
} from './components';

export class ColorWidget {

    static initialize(context) {
        $('input.color-picker', context).each(function(index) {
            let elem = $(this);
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

        this.dropdown_elem = $(`<div />`)
            .addClass('color-picker-wrapper')
            .css('top', this.elem.outerHeight());
        this.picker_container = $('<div />')
            .addClass('color-picker-container')
            .appendTo(this.dropdown_elem);
        this.close_btn = $(`<button />`)
            .addClass('close-button')
            .text('✕')
            .appendTo(this.dropdown_elem);;
        this.add_color_btn = $(`<button />`)
            .addClass('add_color')
            .text('+ Add');
        this.remove_color_btn = $(`<button />`)
            .addClass('remove_color')
            .text('- Remove');
        this.buttons = $('<div />')
            .addClass('buttons')
            .append(this.add_color_btn)
            .append(this.remove_color_btn)
            .appendTo(this.dropdown_elem);;
        this.swatches_container = $(`<div />`)
            .addClass('color-picker-recent')
            .appendTo(this.dropdown_elem);;
        this.index = index;

        let iro_opts = {
            color: options.color,
            width: options.box_width,
            layout: [{
                component: iro.ui.Box,
                options: {}
            }, {
                component: iro.ui.Slider,
                options: {
                    sliderType: 'hue',
                    sliderSize: options.slider_size
                }
            }]
        }

        if (options.format.includes('rgba')) {
            iro_opts.layout.push({
                component: iro.ui.Slider,
                options: {
                    sliderType: 'alpha',
                    sliderSize: options.slider_size
                }
            });
        }
        if (options.box_height) {
            iro_opts.boxHeight = options.box_height;
        }

        this.picker = new iro.ColorPicker(this.picker_container.get(0), iro_opts);

        this.swatches = []; // saved colors
        this.fixed_swatches = [];
        this.fix_swatches(options.swatches);

        // json
        this.parse_json();
        this.init_options(options);

        // color related
        this.color = this.picker.color.clone();
        this.elem.val(this.color.hexString);
        this.preview_elem.css('background-color', this.color.rgbaString);

        // events
        this.on_resize = this.on_resize.bind(this);
        this.on_resize();
        $(window).on('resize', this.on_resize);
        this.create_swatch = this.create_swatch.bind(this);
        this.add_color_btn.on('click', this.create_swatch);
        this.remove_swatch = this.remove_swatch.bind(this);
        this.remove_color_btn.on('click', this.remove_swatch);
        this.open = this.open.bind(this);
        this.elem.on('focus', this.open);
        this.preview_elem.on('click', this.open);

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
        if (options && options.preview_elem) {
            let transparency_elem = $(options.preview_elem);
            this.elem.after(transparency_elem);
            transparency_elem
                .addClass('transparent')
                .after(this.dropdown_elem);
            this.preview_elem = $('<div />')
                .appendTo(transparency_elem)
                .addClass('preview-color-layer');
        } else {
            let preview_background = $(`<span />`).addClass('color-picker-color');
            this.preview_elem = $(`<div />`)
                .addClass('color-layer')
                .appendTo(preview_background);
            this.elem.after(preview_background);
            preview_background.after(this.dropdown_elem);
        }

        // color formats
        if (options.format.includes('hsl')) {
            this.hsl_display = new ColorHSLInput(this, this.picker.color.hsl);
        } else {
            this.buttons.addClass('hsl-false');
        }
        if (options.format.includes('hex')) {
            this.hex_display = new ColorHexInput(this, this.picker.color.hexString);
        }

        if (options.format.includes('rgba')) {
            this.rgb_display = new ColorRGBInput(this, this.picker.color.rgba, true);
        } else if (options.format.includes('rgb')) {
            this.rgb_display = new ColorRGBInput(this, this.picker.color.rgb);
        }

        let dimensions = {};
        if (options && options.box_width) {
            dimensions.width = options.box_width;
        }
        if (options && options.box_height) {
            dimensions.height = options.box_height;
        }
        this.box_dimensions = dimensions;
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
        this.preview_elem.css('background-color', this.color.rgbaString);
        this.elem.val(this.color.hexString);

        if (this.hsl_display) {
            this.hsl_display.value = this.color.hsl;
        }
        if (this.rgb_display) {
            if (this.rgb_display.a_input) {
                this.rgb_display.rgba = this.color.rgba;
            } else {
                this.rgb_display.rgb = this.color.rgb;
            }
        }

        this.elem.val(this.color.hexString);
        if (this.hex_display) {
            this.hex_display.value = this.color.hexString;
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
        $(window).off('keydown', this.on_keydown);
        $(window).off('mousedown', this.on_click);
    }

    color_equals(color) {
        if (color instanceof iro.Color &&
            color.hsl.h === this.color.hsl.h &&
            color.hsl.s === this.color.hsl.s &&
            color.hsl.l === this.color.hsl.l) {
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
                }
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
            swatches.push(swatch.color.hsl);
        }
        localStorage.setItem(`color-swatches-${this.index}`, JSON.stringify(swatches));
    }
}
