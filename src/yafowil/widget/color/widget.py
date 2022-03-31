# -*- coding: utf-8 -*-
from yafowil.base import factory
from yafowil.common import generic_required_extractor
from yafowil.tsf import TSF
from yafowil.utils import as_data_attrs
from yafowil.utils import cssclasses
from yafowil.utils import cssid
from yafowil.utils import data_attrs_helper
from yafowil.utils import managedprops


_ = TSF('yafowil.widget.color')


color_options = [
    'preview_elem',
    'elements',
    'box_width',
    'box_height',
    'slider_size',
    'color',
    'swatches'
]


def color_extractor(widget, data):
    pass


@managedprops(*color_options)
def color_edit_renderer(widget, data):
    input_attrs = {
        'class_': cssclasses(widget, data),
        'id': cssid(widget, 'input'),
        'name_': widget.dottedpath,
        'type': 'text'
    }
    custom_attrs = data_attrs_helper(widget, data, color_options)
    # XXX: widget options
    for key in custom_attrs:
        input_attrs[key] = custom_attrs[key]

    return data.tag('input', **input_attrs)


def color_display_renderer(widget, data):
    pass


factory.register(
    'color',
    extractors=[
        color_extractor,
        generic_required_extractor
    ],
    edit_renderers=[
        color_edit_renderer
    ],
    display_renderers=[
        color_display_renderer
    ]
)

factory.doc['blueprint']['color'] = """\
Add-on blueprint
`yafowil.widget.color <http://github.com/conestack/yafowil.widget.color/>`_ .
"""

factory.defaults['color.class'] = 'color-picker'
factory.doc['props']['color.class'] = """\
CSS classes for color widget wrapper DOM element.
"""

factory.doc['props']['color.emptyvalue'] = """\
If color value empty, return as extracted value.
"""

# Additional Options

factory.defaults['color.preview_elem'] = None
factory.doc['props']['color.preview_elem'] = """\
Add an optional preview elem.
Values: [True|False|None (default)].
"""

factory.defaults['color.elements'] = ['box', 'hex']
factory.doc['props']['color.elements'] = """\
Add option to display and edit hsl color values.
Values: [List(Str)|None].

Available options:
- 'box'
- 'hex'
- 'hsl'
- 'rgb'
- 'rgba'
- 'kelvin'
"""

factory.defaults['color.box_width'] = 250
factory.doc['props']['color.box_width'] = """\
Set the initial width of the color box (in pixels).
Values: [px].
"""

factory.defaults['color.box_height'] = None
factory.doc['props']['color.box_height'] = """\
Set the initial height of the color box (in pixels).
Values: [px].
"""

factory.defaults['color.slider_size'] = 10
factory.doc['props']['color.slider_size'] = """\
Set the height of slider elements (in pixels).
Values: [px].
"""

factory.defaults['color.color'] = '#ffffff'
factory.doc['props']['color.color'] = """\
Set the inital picker color if no swatches are specified.
The color can be passed as hex or hsl value.
Values: [String(hex), Obj(hsl)].
"""

factory.defaults['color.swatches'] = None
factory.doc['props']['color.swatches'] = """\
Set swatches to be initialized.
Given swatches can't be deleted in the widget.
Values: [Array(Dict)].
"""
