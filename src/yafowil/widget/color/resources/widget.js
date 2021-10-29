(function (exports, $, iro) {
    'use strict';

    class ColorWidget {
        static initialize(context) {
            $('input.color-picker', context).each(function() {
                new ColorWidget($(this));
            });
        }
        constructor(elem) {
            this.picker = null;
            this.picker_elem = null;
            this.elem = elem;
            this.elem.attr('spellcheck', "false");
            let color_elem = this.color_elem = $('<span class="color-picker-color" />');
            elem.after(color_elem);
            let picker_elem = this.picker_elem = $('<div class="color-picker-wrapper" />');
            this.color_elem.after(picker_elem);
            let close_btn = this.close_btn = $('<button class="close-button">✕</button>');
            this.picker_elem.append(close_btn);
            this.color = "#ffffff";
            this.color_swatches = [];
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
            this.elem.val(this.color);
            this.color_elem.css('background', this.color);
            let add_color_btn = this.add_color_btn = $('<button class="add_color">+ Add</button>');
            let remove_color_btn = this.remove_color_btn = $('<button class="remove_color">- Remove</button>');
            let buttons = $('<div class="buttons"/>');
            this.picker_elem.append(buttons);
            buttons.append(add_color_btn).append(remove_color_btn);
            this.add_color_btn.on('click', this.create_swatch.bind(this));
            this.remove_color_btn.on('click', this.remove_swatch.bind(this));
            let swatches_container = this.swatches_container = $(`
            <div class="color-picker-recent"></div>
        `);
            this.picker_elem.append(swatches_container);
            this.trigger_handle = this.trigger_handle.bind(this);
            elem.on('focus', this.trigger_handle);
            color_elem.on('click', this.trigger_handle);
            this.update_color = this.update_color.bind(this);
            this.picker.on('color:change', this.update_color);
            this.hide_elem = this.hide_elem.bind(this);
            this.close_btn.on('click', this.hide_elem);
            this.handle_keypress = this.handle_keypress.bind(this);
            this.handle_click = this.handle_click.bind(this);
            this.init_swatches();
        }
        init_swatches() {
            let json_str = localStorage.getItem("color-swatches");
            if (json_str) {
                this.swatches_container.show();
                this.color_swatches = JSON.parse(json_str);
                for (let swatch of this.color_swatches) {
                    let current_color_swatch = $(`
                    <div class="color-swatch" id="${swatch.hex}" style="background:${swatch.hex}"/>
                `);
                    this.swatches_container.append(current_color_swatch);
                    current_color_swatch.on('click', () => {
                        this.color = swatch.color;
                        this.picker.color.hsl = swatch.hsl;
                        if($('div.color-swatch').length > 1){
                            $('div.color-swatch').removeClass('selected');
                        }
                        current_color_swatch.addClass('selected');
                    });
                }
            }
        }
        update_color() {
            let current_color = this.picker.color.hexString;
            this.color_elem.css('background', current_color);
            this.elem.val(current_color);
        }
        trigger_handle(evt) {
            evt.preventDefault();
            if(this.picker_elem.css('display') === "none") {
                this.picker_elem.show();
                $(window).on('keydown', this.handle_keypress);
                $(window).on('mousedown', this.handle_click);
            } else {
                this.hide_elem();
            }
        }
        handle_keypress(e) {
            e.preventDefault();
            if (e.key === "Enter" || e.key === "Escape"){
                this.hide_elem();
            } else if (e.key === "Delete") {
                this.remove_swatch();
            }
        }
        handle_click(e) {
            let target = this.picker_elem;
            if(!target.is(e.target) &&
                target.has(e.target).length === 0 &&
                !this.color_elem.is(e.target) &&
                target.css('display') === 'block')
            {
                this.hide_elem();
            }
        }
        hide_elem(e) {
            if(e) {
                e.preventDefault();
            }
            this.picker_elem.hide();
            this.elem.blur();
            $(window).off('keydown', this.handle_keypress);
            $(window).off('mousedown', this.handle_click);
        }
        create_swatch(e) {
            if(e) {
                e.preventDefault();
                this.swatches_container.show();
            }
            let hsl = this.picker.color.hsl;
            let color = this.picker.color.hexString;
            for (let swatch of this.color_swatches) {
                if (swatch.hex === color) {
                    return
                }
            }
            let current_color_swatch = $(`
            <div class="color-swatch" id="${color}" style="background:${color}"/>
        `);
            if(this.color_swatches.length >= 12) {
                this.color_swatches.shift();
                $('div.color-swatch')[0].remove();
            }
            this.swatches_container.append(current_color_swatch);
            let swatch = {
                hex: color,
                hsl: hsl
            };
            this.color_swatches.push(swatch);
            current_color_swatch.on('click', (e) => {
                this.color = color;
                this.picker.color.hsl = hsl;
                $('div.color-swatch').removeClass('selected');
                current_color_swatch.addClass('selected');
            });
            this.set_swatches();
        }
        remove_swatch(e) {
            if(e) {
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

})({}, jQuery, iro);
//# sourceMappingURL=widget.js.map
