import {
    ColorSwatch,
    InputElement,
    PreviewElement,
    slider_components
} from './components';

export class ColorWidget {

    static initialize(context) {
        $('input.color-picker', context).each(function(index) {
            let elem = $(this);
            let options = {
                format: elem.data('format'),
                preview_elem: elem.data('preview_elem'),
                sliders: elem.data('sliders'),
                box_width: elem.data('box_width'),
                box_height: elem.data('box_height'),
                slider_size: elem.data('slider_size'),
                color: elem.data('color'),
                swatches: elem.data('swatches'),
                temperature: elem.data('temperature'),
                disabled: elem.data('disabled'),
                show_inputs: elem.data('show_inputs'),
                slider_length: elem.data('slider_length')
            };
            new ColorWidget(elem, options, index);
        });
    }

    constructor(elem, options, index) {
        this.elem = elem;
        this.elem
            .data('color_widget', this)
            .attr('spellcheck', "false");
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
        this.input_container = $(`<div />`)
            .addClass('color-picker-inputs')
            .insertBefore(this.buttons);

        this.index = index;
        this.slider_size = options.slider_size;

        let iro_opts = this.init_opts(options);
        this.picker = new iro.ColorPicker(this.picker_container.get(0), iro_opts);

        this.swatches = []; // saved colors
        this.fixed_swatches = [];
        this.fix_swatches(options.swatches);

        // json
        this.parse_json();

        // color related
        this.color = this.picker.color.clone();
        this.input_elem = new InputElement(this, this.elem, this.color, options.format);
        let prev_elem = options.preview_elem ? $(options.preview_elem) :
            $(`<span />`).addClass('color-picker-color layer-transparent');
        this.preview = new PreviewElement(this, prev_elem, this.color);

        // events
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

    init_opts(opts) {
        let iro_opts = {
            color: opts.color,
            width: opts.box_width,
            boxHeight: opts.box_height || opts.box_width,
            layoutDirection: 'vertical',
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
                        showInput: opts.show_inputs
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
                this.swatches_container.hide();
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
            swatches.push(swatch.color.hsva);
        }
        localStorage.setItem(`color-swatches-${this.index}`, JSON.stringify(swatches));
    }
}
