import $ from 'jquery';
import {
    InputElement,
    LockedSwatchesContainer,
    PreviewElement,
    slider_components,
    UserSwatchesContainer
} from './components';

export function lookup_callback(path) {
    if (!path) {
        return null;
    }
    let source = path.split('.'),
        cb = window,
        name;
    for (const idx in source) {
        name = source[idx];
        if (cb[name] === undefined) {
            throw "'" + name + "' not found.";
        }
        cb = cb[name];
    }
    return cb;
}

export class ColorPicker {

    constructor(elem, options) {
        this.elem = elem;

        if (options.on_update) {
            this.elem.on('color_update', options.on_update);
        }
        if (options.on_close) {
            this.elem.on('color_close', options.on_close);
        }

        this.dropdown_elem = $('<div />')
            .addClass('color-picker-wrapper')
            .insertAfter(this.elem);
        this.picker_container = $('<div />')
            .addClass('color-picker-container')
            .appendTo(this.dropdown_elem);
        this.close_btn = $('<button />')
            .addClass('close-button')
            .text('✕')
            .appendTo(this.dropdown_elem);

        this.placement = options.placement;
        this.auto_align = options.auto_align;
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
        if (this.type_kelvin) {
            this.min = options.temperature.min;
            this.max = options.temperature.max;
        }
        let alpha_types = ['rgbaString', 'hex8String', 'hslaString'];
        this.type_alpha = alpha_types.includes(options.format);

        if (!options.locked_swatches && !options.user_swatches) {
            this.picker_container.css('margin-bottom', 0);
        }
        if (options.color) {
            this.color = this.picker.color.clone();
        } else {
            this.color = null;
        }
        this.create_swatch_containers(options);
        this.create_preview_element(options);

        this.open = this.open.bind(this);
        this.update_color = this.update_color.bind(this);
        this.picker.on('color:change', this.update_color);
        this.close = this.close.bind(this);
        this.close_btn.on('click', this.close);
        this.on_keydown = this.on_keydown.bind(this);
        this.on_click = this.on_click.bind(this);

        this.place(options.placement, options.preview_elem);
    }

    get active_swatch() {
        return this._active_swatch;
    }

    set active_swatch(swatch) {
        if (swatch) {
            swatch.selected = true;
            this._active_swatch = swatch;
        } else {
            this._active_swatch = null;
        }
    }

    init_opts(opts) {
        let iro_opts = {
            width: opts.box_width,
            boxHeight: opts.box_height || opts.box_width,
            layoutDirection: opts.layout_direction || 'vertical',
            layout: []
        }
        if (opts.format === 'kelvin') {
            iro_opts.color = iro.Color.kelvinToRgb(opts.color);
        } else {
            iro_opts.color = opts.color ? opts.color : '#fff';
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

    create_swatch_containers(options) {
        if (options.locked_swatches) {
            this.locked_swatches = new LockedSwatchesContainer(
                this,
                options.locked_swatches
            );
        }
        if (options.user_swatches) {
            this.user_swatches = new UserSwatchesContainer(this);
        }
    }

    create_preview_element(options) {
        let prev_elem;
        if (options.preview_elem) {
            prev_elem = $(options.preview_elem)
                .addClass('yafowil-color-picker-preview');
        } else {
            let elem_width = this.elem.outerWidth();
            prev_elem = $('<span />')
                .addClass('yafowil-color-picker-color layer-transparent')
                .css('left', `${elem_width}px`);
        }
        this.preview = new PreviewElement(this, prev_elem, this.color);
    }

    place(placement, custom_preview) {
        let left, top;
        const auto_align = this.auto_align;

        const auto_place = (on_top, on_bottom, prefers) => {
            const window_height = $(window).height();
            const dd_height = this.dropdown_elem.outerHeight();
            const offset = this.elem[0].getBoundingClientRect();
            const y_pos = offset.top + this.elem.outerHeight();
            const below = window_height - y_pos;

            if (!prefers || prefers === 'bottom') {
                if (auto_align) {
                    if (below >= dd_height) {
                        return on_bottom;
                    } else if (y_pos >= dd_height) {
                        on_top -= dd_height;
                    } else {
                        return on_bottom;
                    }
                } else {
                    return on_bottom;
                }
            } else if (prefers === 'top') {
                if (auto_align) {
                    if (y_pos >= dd_height) {
                        on_top -= dd_height;
                    } else if (below >= dd_height) {
                        return on_bottom;
                    } else {
                        return on_bottom;
                    }
                } else {
                    return on_top;
                }
            }
            return on_top;
        }

        switch (placement) {
            case 'left':
                left = - this.dropdown_elem.outerWidth();
                top = auto_place(0, -this.elem.outerHeight());
                break;
            case 'right':
                left = this.elem.outerWidth();
                if (!custom_preview && this.preview) {
                    // default preview elem
                    left += this.preview.elem.outerWidth(true);
                }
                top = auto_place(0, -this.elem.outerHeight());
                break;
            case 'top':
                left = 0;
                top = auto_place(-this.elem.outerHeight(), 0, 'top');
                break;
            case 'bottom':
                left = 0;
                top = auto_place(-this.elem.outerHeight(), 0);
                break;
            case 'static':
                left = 0;
                top = 0;
                this.dropdown_elem.css('position', 'static');
                break;
            default:
                console.warn(`Unknown placement: ${placement}`);
                break;
        }

        this.dropdown_elem.css(
            'transform',
            `translate(${left}px, ${top}px)`
        );
    }

    update_color() {
        this.color = this.picker.color.clone();
        this.preview.color = this.color.rgbaString;
        let evt = new $.Event('color_update', {origin: this});
        this.elem.trigger(evt);
    }

    open(evt) {
        if (this.placement !== 'static' && this.auto_align) {
            this.place(this.placement);
        }
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
            if ((!this.locked_swatches && !this.user_swatches ) ||
                !this.active_swatch) {
                return;
            }
            let swatch = this.active_swatch,
                user_swatches = Boolean(this.user_swatches),
                locked_swatches = Boolean(this.locked_swatches),
                valid_user_swatches,
                valid_locked_swatches;

            if (user_swatches) {
                valid_user_swatches = this.user_swatches.swatches.filter(el => {
                    return !el.invalid;
                });
            }
            if (locked_swatches) {
                valid_locked_swatches = this.locked_swatches.swatches.filter(el => {
                    return !el.invalid;
                });
            }

            const ctx = swatch.locked ? valid_locked_swatches : valid_user_swatches;
            let index = ctx.indexOf(swatch);
            index = e.key === 'ArrowLeft' ? index - 1 : index + 1;
            if (index < 0) {
                if (!swatch.locked
                    && locked_swatches
                    && valid_locked_swatches.length) {
                    this.active_swatch = valid_locked_swatches[valid_locked_swatches.length -1];
                }
            } else if (index >= ctx.length) {
                if (swatch.locked
                    && user_swatches
                    && valid_user_swatches.length) {
                        this.active_swatch = valid_user_swatches[0];
                }
            } else {
                this.active_swatch = ctx[index];
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
        $(window).off('keydown', this.on_keydown);
        $(window).off('mousedown', this.on_click);
        let evt = new $.Event('color_close', {origin: this});
        this.elem.trigger(evt);
    }

    color_equals(color) {
        if (this.color &&
            (color instanceof iro.Color) &&
            color.hsva.h === this.color.hsva.h &&
            color.hsva.s === this.color.hsva.s &&
            color.hsva.v === this.color.hsva.v &&
            color.hsva.a === this.color.hsva.a) {
            return true;
        }
    }
}

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
                placement: elem.data('placement'),
                auto_align: elem.data('auto_align'),
                preview_elem: elem.data('preview_elem'),
                sliders: elem.data('sliders'),
                box_width: elem.data('box_width'),
                box_height: elem.data('box_height'),
                slider_size: elem.data('slider_size'),
                color: elem.val(),
                locked_swatches: elem.data('locked_swatches'),
                user_swatches: elem.data('user_swatches'),
                temperature: elem.data('temperature'),
                disabled: elem.data('disabled'),
                show_inputs: elem.data('show_inputs'),
                show_labels: elem.data('show_labels'),
                slider_length: elem.data('slider_length'),
                layout_direction: elem.data('layout_direction'),
                open_on_focus: elem.data('open_on_focus'),
                on_update: lookup_callback(elem.data('on_update')),
                on_close: lookup_callback(elem.data('on_close'))
            };
            new ColorWidget(elem, options);
        });
    }

    constructor(elem, options) {
        elem.data('yafowil-color', this);

        this.elem = elem;
        this.create_color_picker(elem, options);

        this.temp = options.temperature || {min: 2000, max: 11000};
        this.input_elem = new InputElement(
            this, this.elem, this.color_picker.color, options.format, this.temp
        );

        if (options.open_on_focus) {
            this.elem.on('focus', this.color_picker.open);
        }
        this.elem.on('color_update', (e) => {
            this.input_elem.update_color(this.color_picker.color);
        })
        this.elem.on('color_close', (e) => {
            this.elem.blur();
        })
    }

    create_color_picker(elem, options) {
        this.color_picker = new ColorPicker(elem, options);
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
