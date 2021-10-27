import $ from 'jquery';
import iro from 'iro';

export class ColorWidget {

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
