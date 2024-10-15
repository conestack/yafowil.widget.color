import $ from 'jquery';
import Popper from 'popper';
import {
    BS5LockedSwatchesContainer,
    BS5UserSwatchesContainer
} from './components.js';
import {
    PreviewElement
} from '../components.js';
import { ColorPicker } from '../widget.js';
import { ColorWidget } from '../widget.js';

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

export class BS5ColorPicker extends ColorPicker {

    constructor(elem, options) {
        super(elem, options);
        this.dropdown_elem.addClass('card card-body p-4 pb-3');

        // Dropdown Popper
        const popper_modifiers = [
            {
                name: 'preventOverflow',
                options: {
                    boundary: 'viewport',
                    padding: 10
                },
            },
            {
                name: 'flip'
            },
        ];
        this.popper = Popper.createPopper(this.elem[0], this.dropdown_elem[0], {
            placement: options.placement,
            flipVariations: true,
            modifiers: popper_modifiers
        });
    }

    create_swatch_containers(options) {
        if (options.locked_swatches) {
            this.locked_swatches = new BS5LockedSwatchesContainer(
                this,
                options.locked_swatches
            );
        }
        if (options.user_swatches) {
            this.user_swatches = new BS5UserSwatchesContainer(this);
        }
    }

    create_preview_element(options) {
        let prev_elem;
        if (options.preview_elem) {
            prev_elem = $(options.preview_elem)
                .addClass('yafowil-color-picker-preview');
        } else {
            prev_elem = $('<span />')
                .addClass('yafowil-color-picker-color layer-transparent');

            // Popper should automaticall cleanup, no unbind necessary
            Popper.createPopper(this.elem[0], prev_elem[0], {
                placement: "right",
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 10],
                        },
                    },
                    {
                        name: 'preventOverflow',
                        options: {
                            mainAxis: false
                        },
                    },
                    {
                        name: 'flip',
                        options: {
                            flipVariations: false
                        }
                    }
                ]
            });
        }
        this.preview = new PreviewElement(this, prev_elem, this.color);
    }

    place() {
        // ...
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
}

export class BS5ColorWidget extends ColorWidget {

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
            new BS5ColorWidget(elem, options);
        });
    }

    constructor(elem, options) {
        super(elem, options);
    }

    create_color_picker(elem, options) {
        this.color_picker = new BS5ColorPicker(elem, options);
    }
}

//////////////////////////////////////////////////////////////////////////////
// yafowil.widget.array integration
//////////////////////////////////////////////////////////////////////////////

function color_on_array_add(inst, context) {
    BS5ColorWidget.initialize(context);
}

export function register_array_subscribers() {
    if (window.yafowil_array === undefined) {
        return;
    }
    window.yafowil_array.on_array_event('on_add', color_on_array_add);
}
