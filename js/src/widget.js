import $ from 'jquery';
import {
    ColorHexInput,
    ColorHSLInput,
    ColorRGBInput,
    ColorKelvinInput,
    ColorSwatch,
    PreviewElement
} from './components';

export class ColorWidget {

    static initialize(context) {
        $('input.color-picker', context).each(function(index) {
            let elem = $(this);
            let options = {
                preview_elem: elem.data('preview_elem'),
                elements: elem.data('elements'),
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
            .appendTo(this.dropdown_elem);

        this.index = index;
        this.slider_size = options.slider_size;

        let iro_opts = {
            color: options.color,
            width: options.box_width,
            layout: []
        }

        if (options.elements.includes('box')) {
            iro_opts.layout.push({
                component: iro.ui.Box,
                options: {}
            });
        }
        if (options.elements.includes('hex')) {
            iro_opts.layout.push(this.create_slider('hue'));
        }
        if (options.elements.includes('kelvin')) {
            iro_opts.layout.push(this.create_slider('kelvin'));
        }
        if (options.elements.includes('hsl')) {
            iro_opts.layout.push(this.create_slider('hue'));
            iro_opts.layout.push(this.create_slider('saturation'));
            iro_opts.layout.push(this.create_slider('value'));
        }
        if (options.elements.includes('rgb') || options.elements.includes('rgba')) {
            iro_opts.layout.push(this.create_slider('red'));
            iro_opts.layout.push(this.create_slider('green'));
            iro_opts.layout.push(this.create_slider('blue'));
        }
        if (options.elements.includes('rgba')) {
            iro_opts.layout.push(this.create_slider('alpha'));
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
        this.preview.color = this.color.rgbaString;

        // events
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

    init_options(options) {
        let prev_elem = options.preview_elem ? $(options.preview_elem) :
            $(`<span />`).addClass('color-picker-color');
        this.preview = new PreviewElement(this, prev_elem);

        this.box_dimensions = {
            width: options.box_width || null,
            height: options.box_height || null
        }
        // color formats
        let clr = this.picker.color;
        this.displays = {};

        if (options.elements.includes('hsl')) {
            this.displays.hsl = new ColorHSLInput(this, clr.hsl);
        } else {
            this.buttons.addClass('hsl-false');
        }
        if (options.elements.includes('rgba')) {
            this.displays.rgb = new ColorRGBInput(this, clr.rgba);
        } else if (options.elements.includes('rgb')) {
            this.displays.rgb = new ColorRGBInput(this, clr.rgb);
        }
        if (options.elements.includes('hex')) {
            this.displays.hex = new ColorHexInput(this, clr.hexString);
        }
        if (options.elements.includes('kelvin')) {
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

        for (let opt in this.displays) {
            this.displays[opt].update(this.color);
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
