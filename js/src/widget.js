import $ from 'jquery';
import iro from 'iro';

export class ColorWidget {

    static initialize(context) {
        $('input.color-picker', context).each(function() {
            new ColorWidget($(this));
        });
    }

    constructor(elem) {
        this.picker = null;
        this.picker_elem = null;
        this.elem = elem;
        let color_elem = this.color_elem = $('<span class="color-picker-color" />');
        elem.after(color_elem);
        this.trigger_handle = this.trigger_handle.bind(this);
        elem.on('focus', this.trigger_handle);
        color_elem.on('click', this.trigger_handle);
    }

    trigger_handle(evt) {
        evt.preventDefault();
        let picker_elem = this.picker_elem = $('<div class="color-picker-wrapper" />');
        this.color_elem.after(picker_elem);
        this.picker = new iro.ColorPicker(picker_elem.get(0), {
        });
    }
}
