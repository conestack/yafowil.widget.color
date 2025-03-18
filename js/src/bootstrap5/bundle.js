import $ from 'jquery';

import {BS5ColorWidget} from './widget.js';
import {register_array_subscribers} from './widget.js';

export * from './widget.js';

$(function() {
    if (window.ts !== undefined) {
        ts.ajax.register(BS5ColorWidget.initialize, true);
    } else if (window.bdajax !== undefined) {
        bdajax.register(BS5ColorWidget.initialize, true);
    } else {
        BS5ColorWidget.initialize();
    }
    register_array_subscribers();
});
