import $ from 'jquery';

import {ColorWidget} from './widget.js';
import {register_array_subscribers} from './widget.js';

export * from './widget.js';

$(function() {
    if (window.ts !== undefined) {
        ts.ajax.register(ColorWidget.initialize, true);
    } else if (window.bdajax !== undefined) {
        bdajax.register(ColorWidget.initialize, true);
    } else {
        ColorWidget.initialize();
    }
    register_array_subscribers();
});
