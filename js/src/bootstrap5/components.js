import $ from 'jquery';
import { LockedSwatchesContainer } from '../default/components.js';
import { UserSwatchesContainer } from '../default/components.js';

export class BS5LockedSwatchesContainer extends LockedSwatchesContainer {

    constructor (widget, swatches = []) {
        super(widget, swatches);
        this.elem.addClass('mt-3');
    }
}

export class BS5UserSwatchesContainer extends UserSwatchesContainer {

    constructor (widget) {
        super(widget);
        this.elem.addClass('mt-3');
        this.buttons.addClass('buttons mt-2');
    }
}
