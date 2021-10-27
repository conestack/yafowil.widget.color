(function (exports, $) {
    'use strict';

    class ColorWidget {
        static initialize(context) {
            $('div.color-picker-trigger', context).each(function() {
                new ColorWidget($(this));
            });
        }
        constructor(elem) {
            this.elem = elem;
            this.trigger_handle = this.trigger_handle.bind(this);
            elem.on('click', this.trigger_handle);
        }
        trigger_handle(evt) {
            evt.preventDefault();
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

})({}, jQuery);
//# sourceMappingURL=widget.js.map
