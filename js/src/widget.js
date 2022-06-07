import $ from 'jquery';
import {
    ColorSwatch,
    InputElement,
    PreviewElement,
    slider_components
} from './components';

export class ColorWidget {

    static initialize(context) {
        $('input.color-picker', context).each(function() {
            let elem = $(this);
            let options = {
                format: elem.data('format'),
                preview_elem: elem.data('preview_elem'),
                sliders: elem.data('sliders'),
                box_width: elem.data('box_width'),
                box_height: elem.data('box_height'),
                slider_size: elem.data('slider_size'),
                color: elem.data('color'),
                locked_swatches: elem.data('swatches'),
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
        this.elem = elem;
        this.elem.attr('spellcheck', "false");
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
            .appendTo(this.dropdown_elem);

        if (options.locked_swatches) {
            this.locked_swatches_container = $(`<div />`)
                .addClass('color-picker-recent')
                .appendTo(this.dropdown_elem);
        }
        if (options.user_swatches) {
            this.user_swatches_container = $(`<div />`)
                .addClass('color-picker-recent')
                .appendTo(this.dropdown_elem);
            this.add_color_btn = $(`<button />`)
                .addClass('add_color')
                .text('+ Add');
            this.remove_color_btn = $(`<button />`)
                .addClass('remove_color')
                .text('- Remove')
                .hide();
            this.buttons = $('<div />')
                .addClass('buttons')
                .append(this.add_color_btn)
                .append(this.remove_color_btn)
                .appendTo(this.dropdown_elem);
        }

        this.slider_size = options.slider_size;
        let iro_opts = this.init_opts(options);
        this.picker = new iro.ColorPicker(this.picker_container.get(0), iro_opts);

        /// box switch
        let sliders = options.sliders;
        if (sliders && sliders.includes('box') && sliders.includes('wheel')) {
            if (sliders.indexOf('box') < sliders.indexOf('wheel')) {
                $('div.IroWheel', this.picker_container).hide();
            } else {
                $('div.IroBox', this.picker_container).hide();
            }
            this.switch_btn = $('<div />')
                .addClass('iro-switch-toggle')
                .append($('<i class="glyphicon glyphicon-retweet" />'))
                .appendTo(this.dropdown_elem);
            this.switch_btn.on('click', () => {
                $('div.IroWheel', this.picker_container).toggle();
                $('div.IroBox', this.picker_container).toggle();
            });
        }
        ///

        if (options.user_swatches) {
            this.user_swatches = []; // saved colors
            this.init_user_swatches();
        }
        if (options.locked_swatches) {
            this.locked_swatches = [];
            this.init_locked_swatches(options.locked_swatches);
        }

        // color related
        this.color = this.picker.color.clone();
        let temp = options.temperature || {min: 2000, max: 11000};
        this.input_elem = new InputElement(this, this.elem, this.color, options.format, temp);
        let prev_elem = options.preview_elem ? $(options.preview_elem).addClass('yafowil-color-picker-preview') :
            $(`<span />`).addClass('yafowil-color-picker-color layer-transparent');
        this.preview = new PreviewElement(this, prev_elem, this.color);

        // events
        if (options.user_swatches) {
            this.create_swatch = this.create_swatch.bind(this);
            this.add_color_btn.on('click', this.create_swatch);
            this.remove_swatch = this.remove_swatch.bind(this);
            this.remove_color_btn.on('click', this.remove_swatch);
            this.init_user_swatches = this.init_user_swatches.bind(this);
            this.elem.on('yafowil-colors:changed', this.init_user_swatches);
        }

        this.open = this.open.bind(this);
        this.elem.on('focus', this.open);
        this.update_color = this.update_color.bind(this);
        this.picker.on('color:change', this.update_color);
        this.close = this.close.bind(this);
        this.close_btn.on('click', this.close);
        this.on_keydown = this.on_keydown.bind(this);
        this.on_click = this.on_click.bind(this);
    }

    init_user_swatches(e) {
        let json_str = localStorage.getItem(`color-swatches`);
        
        if (json_str) {
            for (let swatch of this.user_swatches) {
                swatch.destroy();
            }
            this.user_swatches = [];
            this.remove_color_btn.show();
            let colors = JSON.parse(json_str);
            if (this.remove_color_btn) {
                this.remove_color_btn.show();
            }
            this.user_swatches_container.show();
            for (let color of colors) {
                this.user_swatches.push(new ColorSwatch(this, new iro.Color(color)));
            }
            if (this.user_swatches.length > 10) {
                this.user_swatches[0].destroy();
                this.user_swatches.shift();
            } else if (!this.user_swatches.length) {
                this.remove_color_btn.hide();
            } else {
                this.remove_color_btn.show();
            }
            if (this.user_swatches.length && e && e.origin === this) {
                let active_swatch = this.user_swatches[this.user_swatches.length -1];
                active_swatch.select();
            }
        }
    }

    init_opts(opts) {
        let iro_opts = {
            color: opts.color,
            width: opts.box_width,
            boxHeight: opts.box_height || opts.box_width,
            layoutDirection: opts.layout_direction || 'vertical',
            layout: []
        }
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
                        minTemperature: opts.temperature ? opts.temperature.min : undefined,
                        maxTemperature: opts.temperature ? opts.temperature.max : undefined,
                        disabled: opts.disabled,
                        showInput: opts.show_inputs,
                        showLabel: opts.show_labels
                    }
                });
            }
        });

        return iro_opts;
    }

    update_color() {
        this.color = this.picker.color.clone();
        this.preview.color = this.color.rgbaString;
        this.input_elem.update_color(this.color);
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
            color.hsva.h === this.color.hsva.h &&
            color.hsva.s === this.color.hsva.s &&
            color.hsva.v === this.color.hsva.v &&
            color.hsva.a === this.color.hsva.a) {
            return true;
        }
    }

    init_locked_swatches(swatches) {
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
                return;
            }
            this.locked_swatches.push(
                new ColorSwatch(this, new iro.Color(color), true)
            );
        }
        this.active_swatch = this.locked_swatches[0];
        this.active_swatch.select();
        this.locked_swatches_container.show();
    }

    create_swatch(e) {
        if (e && e.type === 'click') {
            e.preventDefault();
        }
        if (this.locked_swatches) {
            for (let swatch of this.locked_swatches) {
                if (this.color_equals(swatch.color)) {
                    return;
                }
            }
        }
        for (let swatch of this.user_swatches) {
            if (this.color_equals(swatch.color)) {
                return;
            }
        }
        let swatch = new ColorSwatch(this, this.picker.color.clone());
        this.user_swatches.push(swatch);
        this.set_swatches();
    }

    remove_swatch(e) {
        if (e && e.type === 'click') {
            e.preventDefault();
        }
        if (this.active_swatch.locked) {
            return;
        }
        this.active_swatch.destroy();
        let index = this.user_swatches.indexOf(this.active_swatch);
        this.user_swatches.splice(index, 1);

        if (!this.user_swatches.length) {
            if (this.locked_swatches.length) {
                this.active_swatch = this.locked_swatches[this.locked_swatches.length - 1];
                this.active_swatch.select();
                this.picker.color.set(this.active_swatch.color);
            } else {
                this.user_swatches_container.hide();
                this.remove_color_btn.hide();
                this.picker.color.reset();
            }
        } else {
            this.active_swatch = this.user_swatches[this.user_swatches.length - 1];
            this.active_swatch.select();
            this.picker.color.set(this.active_swatch.color);
        }
        this.set_swatches();
    }

    set_swatches() {
        let swatches = [];
        for (let swatch of this.user_swatches) {
            swatches.push(swatch.color.hsva);
        }
        console.log(swatches)
        localStorage.setItem(`color-swatches`, JSON.stringify(swatches));
        let evt = new $.Event('yafowil-colors:changed', {origin: this});
        $('input.color-picker').trigger(evt);
    }
}
