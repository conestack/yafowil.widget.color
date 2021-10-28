import $ from 'jquery';
import iro from 'iro';

export class ColorWidget {

    static initialize(context) {
        $('input.color-picker', context).each(function() {
            new ColorWidget($(this));
            $(this).attr('spellcheck', "false"); // disable spellcheck on input
        });
    }

    constructor(elem) {
        this.picker = null;
        this.picker_elem = null;
        this.elem = elem;
        let color_elem = this.color_elem = $('<span class="color-picker-color" />');
        elem.after(color_elem);
        this.color = "#fff"; // color on init
        this.color_swatches = []; // recent colours

        let picker_elem = this.picker_elem = $('<div class="color-picker-wrapper" />');
        this.color_elem.after(picker_elem);

        let close_btn = this.close_btn = $('<button class="close-button">✕</button>');
        this.picker_elem.append(close_btn);

        this.picker = new iro.ColorPicker(picker_elem.get(0), {
            color: this.color
        });
        this.elem.val(this.color);
        this.color_elem.css('background', this.color);

        let add_color_btn = this.add_color_btn = $('<button class="add_color">+ Add</button>');
        this.picker_elem.append(add_color_btn);
        this.add_color_btn.on('click', this.create_swatch.bind(this));

        let recent_colors_container = this.recent_colors_container = $(`
            <div class="color-picker-recent"></div>
        `);
        this.picker_elem.append(recent_colors_container);

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

    create_swatch(e) {
        if(e) {
            e.preventDefault();
            this.recent_colors_container.show();
        }

        let hsl = this.picker.color.hsl;
        let color = this.picker.color.hexString;

        let current_color_swatch = $(`
            <div class="color-swatch" id="${color}" style="background:${color}"/>
        `);

        if(this.color_swatches.length >= 12) {
            this.color_swatches.shift();
            $('div.color-swatch')[0].remove();
        }

        this.recent_colors_container.append(current_color_swatch);
        this.color_swatches.push(color);

        current_color_swatch.on('click', () => {
            this.color = color;
            this.picker.color.hsl = hsl;
        });
    }

    handle_events(e){
        if (e.type == 'keyup' && 
           (e.key == "Enter" || e.key == "Escape"))
        {
            e.preventDefault();
            this.picker_elem.hide();
            this.elem.blur();
            this.color = this.picker.color.hexString;

            this.recent_colors_container.show();
            this.create_swatch();
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
