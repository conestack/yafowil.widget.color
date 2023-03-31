# -*- coding: utf-8 -*-
from yafowil.base import ExtractionError
from yafowil.base import factory
from yafowil.common import generic_emptyvalue_extractor, input_attributes_common
from yafowil.common import generic_extractor
from yafowil.common import generic_required_extractor
from yafowil.tsf import TSF
from yafowil.utils import attr_value
from yafowil.utils import data_attrs_helper
from yafowil.utils import managedprops


_ = TSF('yafowil.widget.color')


@managedprops('format')
def color_extractor(widget, data):
    extracted = data.extracted
    if not extracted:
        return extracted
    format = attr_value('format', widget, data)

    formats = ', '.join(
        [
            'hexString',
            'hex8String',
            'hslString',
            'hslaString',
            'rgbString',
            'rgbaString',
            'kelvin'
        ]
    )

    if format == 'hexString' or format == 'hex8String':
        if (not extracted.startswith('#')):
            msg = _(
                'unknown_color_format',
                default=u'Unknown Format. Supported formats: ${formats}',
                mapping={'formats':formats}
            )
            raise ExtractionError(msg)
        elif format == 'hexString' and len(extracted) != 7:
            msg = _(
                'incorrect_hex_length',
                default=u'Incorrect hex Color String length: string length must be 7'
            )
            raise ExtractionError(msg)
        elif format == 'hex8String' and len(extracted) != 9:
            msg = _(
                'incorrect_hex8_length',
                default=u'Incorrect hex8 Color String length: string length must be 9'
            )
            raise ExtractionError(msg)
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
        except Exception as e:
            args = ', '.join(e.args)
            msg = _(
                'incorrect_hex_value',
                default=u'Incorrect Hex Value: ${args}',
                mapping={'args':args}
            )
            raise ExtractionError(msg)
    elif format == 'hslString' or format == 'hslaString':
        hsl_format = u'hsl([0-360], [0-100]%, [0-100]%)'
        hsla_format = u'hsla([0-360], [0-100]%, [0-100]%, [0-1])'

        if not extracted.endswith(')'):
            msg = _(
                'unclosed_brace',
                default=u"Incorrect Color String:  Unclosed bracket."
            )
            raise ExtractionError(msg)
        elif format == 'hslString' and not extracted.startswith('hsl('):
            msg = _(
                'hsl_str_start',
                default=u"Incorrect Color String: String must start with 'hsl'"
            )
            raise ExtractionError(msg)
        elif format == 'hslaString' and not extracted.startswith('hsla('):
            msg = _(
                'hsla_str_start',
                default=u"Incorrect Color String: String must start with 'hsla'"
            )
            raise ExtractionError(msg)
        length = 3 if format == 'hslString' else 4
        color = extracted[length + 1:-1]
        color = [channel.strip() for channel in color.split(',')]

        if format == 'hslString' and len(color) != 3:
            msg = _(
                'hsl_str_length',
                default=u"Incorrect Color String: expected format: ${hsl_format}",
                mapping={'hsl_format':hsl_format}
            )
            raise ExtractionError(msg)
        if format == 'hslaString' and len(color) != 4:
            msg = _(
                'hsla_str_length',
                default=u"Incorrect Color String: expected format: ${hsla_format}",
                mapping={'hsla_format':hsla_format}
            )
            raise ExtractionError(msg)

        h = color[0]
        s = color[1]
        l = color[2]
        a = color[3] if format == 'hslaString' else False

        if int(h) < 0 or int(h) > 360:
            msg = _(
                "incorrect_hue_value",
                default=u"Incorrect Color String: value for hue must be between 0 and 360."
            )
            raise ExtractionError(msg)
        elif not s.endswith('%') or int(s[0:-1]) not in range(0, 101):
            msg = _(
                "incorrect_saturation_value",
                default=u'Incorrect Color String: value for saturation must be between 0 and 100 followed by "%".'
            )
            raise ExtractionError(msg)
        elif not l.endswith('%') or int(l[0:-1]) not in range(0, 101):
            msg = _(
                "incorrect_lightness_value",
                default=u'Incorrect Color String: value for lightness must be between 0 and 100 followed by "%".'
            )
            raise ExtractionError(msg)
        elif a and float(a) < 0 or float(a) > 1:
            msg = _(
                "incorrect_alpha_value",
                default=u'Incorrect Color String: Alpha value must be between 0 and 1.'
            )
            raise ExtractionError(msg)
    elif format == 'rgbString' or format == 'rgbaString':
        rgb_format = 'rgb([0-255], [0-255], [0-255])'
        rgba_format = 'rgba([0-255], [0-255], [0-255], [0-1])'

        if not extracted.endswith(')'):
            msg = _(
                'unclosed_brace',
                default=u"Incorrect Color String: Unclosed bracket."
            )
            raise ExtractionError(msg)
        elif format == 'rgbString' and not extracted.startswith('rgb('):
            msg = _(
                'rgb_str_start',
                default=u"Incorrect Color String: String must start with 'rgb'"
            )
            raise ExtractionError(msg)
        elif format == 'rgbaString' and not extracted.startswith('rgba('):
            msg = _(
                'rgba_str_start',
                default=u"Incorrect Color String: String must start with 'rgba'"
            )
            raise ExtractionError(msg)
        length = 3 if format == 'rgbString' else 4
        color = extracted[length + 1:-1]
        color = [channel.strip() for channel in color.split(',')]

        if format == 'rgbString' and len(color) != 3:
            msg = _(
                'rgb_str_length',
                default=u"Incorrect Color String: expected format: ${rgb_format}",
                mapping={'rgb_format':rgb_format}
            )
            raise ExtractionError(msg)
        elif format == 'rgbaString' and len(color) != 4:
            msg = _(
                'rgba_str_length',
                default=u"Incorrect Color String: expected format: ${rgba_format}",
                mapping={'rgba_format':rgba_format}
            )
            raise ExtractionError(msg)
        r = color[0]
        g = color[1]
        b = color[2]
        a = color[3] if format == 'rgbaString' else False

        if int(r) < 0 or int(r) > 255:
            msg = _(
                'incorrect_red_value',
                default=u"Incorrect Color String: value for red must be between 0 and 255."
            )
            raise ExtractionError(msg)
        elif int(g) < 0 or int(g) > 255:
            msg = _(
                'incorrect_green_value',
                default=u"Incorrect Color String: value for green must be between 0 and 255."
            )
            raise ExtractionError(msg)
        elif int(b) < 0 or int(b) > 255:
            msg = _(
                'incorrect_blue_value',
                default=u"Incorrect Color String: value for blue must be between 0 and 255."
            )
            raise ExtractionError(msg)
        elif a and float(a) < 0 or float(a) > 1:
            msg = _(
                "incorrect_alpha_value",
                default=u'Incorrect Color String: Alpha value must be between 0 and 1.'
            )
            raise ExtractionError(msg)
    elif format == 'kelvin':
        try:
            color = int(extracted)
        except ValueError:
            msg = _(
                "incorrect_kelvin_format",
                default=u'Unknown Format, expected format: int(1000 - 40000) or str(1000 - 40000)'
            )
            raise ExtractionError(msg)
        if color < 1000 or color > 40000:
            msg = _(
                "incorrect_kelvin_number",
                default=u'Kelvin Temperature out of range (1000-40000)'
            )
            raise ExtractionError(msg)
    else:
        msg = _(
            'unknown_color_format',
            default=u'Unknown Format. Supported formats: ${formats}',
            mapping={'formats':formats}
        )
        raise ExtractionError(msg)
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
    input_attrs = input_attributes_common(widget, data)
    custom_attrs = data_attrs_helper(widget, data, color_options)
    input_attrs.update(custom_attrs)
    input_attrs['type'] = 'text'
    input_attrs['data-color'] = input_attrs['value']
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
