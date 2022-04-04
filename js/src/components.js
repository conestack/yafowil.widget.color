export class ColorSwatch {

    constructor(widget, color, fixed = false) {
        this.widget = widget;
        this.color = color;
        this.fixed = fixed;

        this.elem = $('<div />')
            .addClass('color-swatch')
            .appendTo(this.widget.swatches_container);

        this.color_layer = $('<div />')
            .addClass('swatch-color-layer')
            .css('background-color', this.color.rgbaString)
            .appendTo(this.elem);

        this.destroy = this.destroy.bind(this);
        this.select = this.select.bind(this);
        this.elem.on('click', this.select);
    }

    destroy() {
        this.elem.off('click', this.select);
        this.elem.remove();
    }

    select(e) {
        $('div.color-swatch').removeClass('selected');
        this.elem.addClass('selected');
        this.widget.active_swatch = this;
        this.widget.picker.color.set(this.color);
    }
}

export class InputElement {

    constructor(widget, elem, color, format) {
        this.widget = widget;
        this.elem = elem;
        if (this.format === 'hexString') {
            this.elem.attr('maxlength', 7);
        }
        this.format = format;
        this.color = color;

        this.update_color(color);

        this.on_input = this.on_input.bind(this);
        this.elem.on('input', this.on_input);
        this.update_color = this.update_color.bind(this);
    }

    on_input(e) {
        let val = this.elem.val();
        if (this.format === 'hsvString') {
            let hsv = this.parse_hsv(val);
            this.widget.picker.color.set(hsv);
        } else if (this.format === 'hsvaString') {
            let hsva = this.parse_hsva(val);
            this.widget.picker.color.set(hsva);
        }
        if (this.type === 'hexString' && val.length === 0) {
            this.elem.val('#');
        } else {
            this.widget.picker.color.set(val);
        }
    }

    hsvString(color) {
        let h = parseInt(color.hsv.h),
            s = parseInt(color.hsv.s),
            v = parseInt(color.hsv.v);
        return `hsv(${h}, ${s}%, ${v}%)`;
    }

    hsvaString(color) {
        let h = parseInt(color.hsva.h),
            s = parseInt(color.hsva.s),
            v = parseInt(color.hsva.v),
            a = parseFloat(color.hsva.a);
        return `hsva(${h}, ${s}%, ${v}%, ${a})`;
    }

    parse_hsv(str) {
        let s = str.slice(4, -1);
        s = s.replace(/\%+/g, function(m, i){
            if(str[i-1] === ' ') {
                return "0";
            } else {
                return '';
            }
        });
        if (s[0] === ',') {
            s = '0' + s;
        }
        let hsv = JSON.parse(`[${s}]`);
        if (hsv[0] > 360) {
            hsv[0] = 360;
        }
        if (hsv[1] > 100) {
            hsv[1] = 100;
        }
        if (hsv[2] > 100) {
            hsv[2] = 100;
        }
        return {
            h: hsv[0],
            s: hsv[1],
            v: hsv[2]
        }
    }

    parse_hsva(str) {
        let s = str.slice(5, -1);

        s = s.replace(/% ?/g, "");
        s = s.replace(/, ?/g, function(m, i) {
            if (s[i-1] === ' ' || !s[i-1]) {
                return "0" + m;
            } else {
                if (!s[i+2]) {
                    return m + '0';
                } else {
                    return m;
                }
            }
        });
        console.log(s)

        let hsva = JSON.parse(`[${s}]`);
        if (hsva[0] > 360) {
            hsva[0] = 360;
        }
        if (hsva[1] > 100) {
            hsva[1] = 100;
        }
        if (hsva[2] > 100) {
            hsva[2] = 100;
        }
        if (hsva[3] > 1) {
            hsva[3] = 1;
        }
        return {
            h: hsva[0],
            s: hsva[1],
            v: hsva[2],
            a: hsva[3]
        }
    }

    update_color(color) {
        if (this.format === 'hsvString') {
            let str = this.hsvString(color);
            this.elem.val(str);
        } else if (this.format === 'hsvaString') {
            let str = this.hsvaString(color);
            this.elem.val(str);
        } else if (this.format === 'kelvin') {
            this.elem.val(parseInt(color.kelvin));
        } else {
            this.elem.val(color[this.format]);
        }
    }
}

export class ColorHexInput {

    constructor(widget, hex) {
        this.widget = widget;
        this.elem = $('<div />')
            .addClass('hex-display')
            .text('HEX:')
            .appendTo(widget.dropdown_elem);
        this.input = $('<input />')
            .val(hex)
            .attr({spellcheck: false, maxlength: 7})
            .appendTo(this.elem);

        this.on_input = this.on_input.bind(this);
        this.input.on('input', this.on_input);
    }

    get value() {
        return this.input.val();
    }

    set value(hex) {
        this.input.val(hex);
    }

    on_input() {
        if (this.value.length === 0) {
            this.input.val('#');
        } else {
            this.widget.picker.color.set(this.value);
        }
    }

    update(color) {
        this.value = color.hexString;
    }
}

export class PreviewElement {

    constructor(widget, elem) {
        this.widget = widget;
        this.layer = $('<div />')
            .addClass('preview-color-layer');
        this.elem = elem
            .addClass('transparent')
            .append(this.layer)
            .insertAfter(this.widget.elem);

        this.on_click = this.on_click.bind(this);
        this.elem.on('click', this.on_click);
    }

    get color() {
        return this._color;
    }

    set color(color) {
        this.layer.css('background-color', color);
        this._color = color;
    }

    on_click() {
        this.widget.open();
    }
}
