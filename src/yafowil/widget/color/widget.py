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
    'sliders',
    'box_width',
    'box_height',
    'slider_size',
    'color',
    'swatches',
    'temperature',
    'format',
    'disabled',
    'show_inputs',
    'slider_length'
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

factory.defaults['color.format'] = 'hexString'
factory.doc['props']['color.format'] = """\
Specify the output format of the color picker color.
Values: [Str].

Available options:
- hexString
- hslString
- hslaString
- rgbString
- rgbaString
- kelvin
"""

factory.defaults['color.preview_elem'] = None
factory.doc['props']['color.preview_elem'] = """\
Add an optional preview elem.
Values: [True|False|None (default)].
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

factory.defaults['color.sliders'] = ['box', 'h']
factory.doc['props']['color.sliders'] = """\
Add additional sliders to layout.
Values: [List(Str)|None].

Available options:
- box
- r (red)
- g (green)
- b (blue)
- h (hue)
- s (saturation)
- v (value)
- a (alpha)
- k (kelvin)
"""

factory.defaults['color.slider_size'] = 10
factory.doc['props']['color.slider_size'] = """\
Set the height of slider elements (in pixels).
Values: [px].
"""

factory.defaults['color.color'] = '#000000'
factory.doc['props']['color.color'] = """\
Set the inital picker color if no swatches are specified.
The color can be passed as hexString, hslString, hslaString,
rgbString, rgbaString or kelvin number.
Values: [String()].
"""

factory.defaults['color.swatches'] = None
factory.doc['props']['color.swatches'] = """\
Set swatches to be initialized.
Given swatches can't be deleted in the widget.
Values: [Array(Dict)].
"""

factory.defaults['color.temperature'] = {'min': 1000, 'max': 40000}
factory.doc['props']['color.temperature'] = """\
Set the minimum and maximum kelvin temperature.
Values: [Dict('min': 2200-11000, 'max': 2200-11000)].
"""

factory.defaults['color.disabled'] = False
factory.doc['props']['color.disabled'] = """\
Disable or enable input field editing.
Values: [True | False].
"""

factory.defaults['color.show_inputs'] = False
factory.doc['props']['color.show_inputs'] = """\
Show or hide slider input elements.
Values: [True|False(Default)].
"""

factory.defaults['color.slider_length'] = None
factory.doc['props']['color.slider_length'] = """\
Slider length prop WIP
Values: [True|False(Default)].
"""
