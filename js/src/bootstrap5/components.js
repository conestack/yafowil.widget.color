import $ from 'jquery';
import { LockedSwatchesContainer } from '../default/components.js';
import { UserSwatchesContainer } from '../default/components.js';

/**
 * Container class for Bootstrap 5 styled locked swatches.
 */
export class BS5LockedSwatchesContainer extends LockedSwatchesContainer {

    /**
     * @param {Object} widget - The associated color picker widget.
     * @param {Array} swatches - Initial array of swatches.
     */
    constructor(widget, swatches = []) {
        super(widget, swatches);
        this.elem.addClass('mt-3');
    }
}

/**
 * Container class for Bootstrap 5 styled user-defined swatches.
 */
export class BS5UserSwatchesContainer extends UserSwatchesContainer {

    /**
     * @param {Object} widget - The associated color picker widget.
     */
    constructor(widget) {
        super(widget);
        this.elem.addClass('mt-3');
        this.buttons.addClass('buttons mt-2');
    }
}
