# -*- coding: utf-8 -*-
from yafowil.base import ExtractionError
from yafowil.base import factory
from yafowil.common import generic_emptyvalue_extractor
from yafowil.common import generic_extractor
from yafowil.common import generic_required_extractor
from yafowil.tsf import TSF
from yafowil.utils import attr_value
from yafowil.utils import cssclasses
from yafowil.utils import cssid
from yafowil.utils import data_attrs_helper
from yafowil.utils import managedprops
from node.utils import UNSET


_ = TSF('yafowil.widget.color')


@managedprops('format')
def color_extractor(widget, data):
    extracted = data.extracted
    if not extracted:
        return extracted
    format = attr_value('format', widget, data)

    if format == 'hexString' or format == 'hex8String':
        if (
            not extracted.startswith('#') or
            format == 'hexString' and len(extracted) != 7 or
            format == 'hex8String' and len(extracted) != 9
        ):
            raise ExtractionError('Unknown Format')

        color = extracted[1:]
        r = color[0:2]
        g = color[2:4]
        b = color[4:6]
        if format == 'hex8String':
            a = color[6:8]
        try:
            r = int(r, 16)
            g = int(g, 16)
            b = int(b, 16)
            if format == 'hex8String':
                a = int(a, 16)
        except ValueError:
            raise ExtractionError('Incorrect Hex Value')
    elif format == 'hslString' or format == 'hslaString':
        if (
            format == 'hslString' and not extracted.startswith('hsl(')
            or format == 'hslaString' and not extracted.startswith('hsla(')
            or not extracted.endswith(')')
        ):
            raise ExtractionError('Unknown Format')
        length = 3 if format == 'hslString' else 4
        color = extracted[length + 1:-1]
        color = [channel.strip() for channel in color.split(',')]
        if len(color) != length:
            raise ExtractionError('Incorrect String')
        h = color[0]
        s = color[1]
        l = color[2]
        a = color[3] if format == 'hslaString' else False

        if (
            int(h) not in range(0, 361)
            or not s.endswith('%') or int(s[0:-1]) not in range(0, 101)
            or not l.endswith('%') or int(l[0:-1]) not in range(0, 101)
            or a and float(a) < 0 or float(a) > 1
        ):
            raise ExtractionError('Incorrect HSL/HSLA Value')
    elif format == 'rgbString' or format == 'rgbaString':
        if (
            format == 'rgbString' and not extracted.startswith('rgb(')
            or format == 'rgbaString' and not extracted.startswith('rgba(')
            or not extracted.endswith(')')
        ):
            raise ExtractionError('Unknown Format')
        length = 3 if format == 'rgbString' else 4
        color = extracted[length + 1:-1]
        color = [channel.strip() for channel in color.split(',')]
        if len(color) != length:
            raise ExtractionError('Incorrect String')

        r = color[0]
        g = color[1]
        b = color[2]
        a = color[3] if format == 'rgbaString' else False

        if (
            int(r) not in range(0, 256) or
            int(g) not in range(0, 256) or
            int(b) not in range(0, 256) or
            a and float(a) < 0 or float(a) > 1
        ):
            raise ExtractionError('Incorrect RGB/RGBA Value')
    elif format == 'kelvin':
        try:
            color = int(extracted)
        except ValueError:
            raise ExtractionError('Unknown Format')
        if color < 1000 or color > 40000:
            raise ExtractionError('Kelvin Temperature not in possible Range')
    else:
        pass
    return extracted


color_options = [
    'preview_elem',
    'sliders',
    'box_width',
    'box_height',
    'slider_size',
    'color',
    'locked_swatches',
    'user_swatches',
    'temperature',
    'format',
    'disabled',
    'show_inputs',
    'show_labels',
    'slider_length',
    'layout_direction',
    'open_on_focus'
]


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
        generic_extractor,
        generic_required_extractor,
        color_extractor,
        generic_emptyvalue_extractor
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

factory.defaults['color.format'] = 'hexString'
factory.doc['props']['color.format'] = """\
Specify the output format of the color picker color.
Values: [Str].

Available options:
- hexString
- hex8String
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

factory.defaults['color.color'] = ''
factory.doc['props']['color.color'] = """\
Set the inital picker color.
The color can be passed as hexString, hslString, hslaString,
rgbString, rgbaString or kelvin number.
Values: [String()].
"""

factory.defaults['color.locked_swatches'] = None
factory.doc['props']['color.locked_swatches'] = """\
Swatches to be initialized.
Given swatches can't be deleted in the widget.
Values: [Array(Dict)].
"""

factory.defaults['color.user_swatches'] = True
factory.doc['props']['color.user_swatches'] = """\
Flag whether the user can add and remove swatches.
Values: [Array(Dict)].
"""

factory.defaults['color.temperature'] = {'min': 2000, 'max': 12000}
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

factory.defaults['color.show_labels'] = False
factory.doc['props']['color.show_labels'] = """\
Show or hide slider label elements.
Values: [True|False(Default)].
"""

factory.defaults['color.slider_length'] = None
factory.doc['props']['color.slider_length'] = """\
Slider length prop
Values: [True|False(Default)].
"""

factory.defaults['color.layout_direction'] = 'vertical'
factory.doc['props']['color.layout_direction'] = """\
Direction of the entire layout.
Values: ['vertical'|'horizontal'].
"""

factory.defaults['color.open_on_focus'] = True
factory.doc['props']['color.open_on_focus'] = """\
Flag whether the picker dropdown opens on input focus.
Values: [True | False].
"""
