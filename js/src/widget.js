import $ from 'jquery';
import {
    InputElement,
    LockedSwatchesContainer,
    PreviewElement,
    slider_components,
    UserSwatchesContainer
} from './components';

export class ColorWidget {

    static initialize(context) {
        $('input.color-picker', context).each(function() {
            let elem = $(this);
            if (window.yafowil_array !== undefined &&
                window.yafowil_array.inside_template(elem)) {
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

        this.type_kelvin = options.format === 'kelvin';
        let alpha_types = ['rgbaString', 'hex8String', 'hslaString'];
        this.type_alpha = alpha_types.includes(options.format);

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
        if (options.color) {
            this.color = this.picker.color.clone();
        } else {
            this.color = null;
        }
        this.temp = options.temperature || {min: 2000, max: 11000};
        this.input_elem = new InputElement(
            this, this.elem, this.color, options.format, this.temp
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
            color: opts.color ? opts.color : '#fff',
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

//////////////////////////////////////////////////////////////////////////////
// yafowil.widget.array integration
//////////////////////////////////////////////////////////////////////////////

function color_on_array_add(inst, context) {
    ColorWidget.initialize(context);
}

export function register_array_subscribers() {
    if (window.yafowil_array === undefined) {
        return;
    }
    window.yafowil_array.on_array_event('on_add', color_on_array_add);
}
