(function (exports, $, iro) {
    'use strict';

    class ColorWidget {
        static initialize(context) {
            $('input.color-picker', context).each(function() {
                new ColorWidget($(this));
                $(this).attr('spellcheck', "false");
            });
        }
        constructor(elem) {
            this.picker = null;
            this.picker_elem = null;
            this.elem = elem;
            let color_elem = this.color_elem = $('<span class="color-picker-color" />');
            elem.after(color_elem);
            this.color = "#fff";
            let picker_elem = this.picker_elem = $('<div class="color-picker-wrapper" />');
            this.color_elem.after(picker_elem);
            let close_btn = this.close_btn = $('<button class="close-button">✕</button>');
            this.picker_elem.append(close_btn);
            this.picker = new iro.ColorPicker(picker_elem.get(0), {
                color: this.color
            });
            this.elem.val(this.color);
            this.color_elem.css('background', this.color);
            this.trigger_handle = this.trigger_handle.bind(this);
            elem.on('focus', this.trigger_handle);
            color_elem.on('mousedown', this.trigger_handle);
            this.picker.on('color:change', this.update_color.bind(this));
            this.close_btn.off('click').on('click', (e) => {
                e.preventDefault();
                this.picker_elem.hide();
            });
            this.handle_events = this.handle_events.bind(this);
            $(window).off('mousedown keyup', this.handle_events).on('mousedown keyup', this.handle_events);
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
            } else {
                this.picker_elem.hide();
            }
        }
        handle_events(e){
            if (e.type == 'keyup' &&
               (e.key == "Enter" || e.key == "Escape"))
            {
                e.preventDefault();
                this.picker_elem.hide();
                this.elem.blur();
                this.color = this.picker.color.hexString;
            } else {
                let target = this.picker_elem;
                if(!target.is(e.target) &&
                    target.has(e.target).length === 0 &&
                    !this.color_elem.is(e.target) &&
                    target.css('display') === 'block')
                {
                    this.picker_elem.hide();
                }
            }
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
