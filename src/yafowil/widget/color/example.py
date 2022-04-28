# -*- coding: utf-8 -*-
from yafowil.base import factory


DOC_COLOR = """
Color widget
------------

This is the default hex color picker widget.

.. code-block:: python

    color = factory('color', name='colorwidget')
"""


def default_example():
    part = factory(u'fieldset', name='yafowil.widget.color')
    part['color'] = factory(
        '#field:color',
        props={
            'label': 'A default Color Picker'
        })
    return {
        'widget': part,
        'doc': DOC_COLOR,
        'title': 'Default Color Picker',
    }



DOC_DIM = """
Custom dimensions
-----------------

Initialize the widget color box with custom dimensions.
The 'box_width' and 'box_height' properties change the width and height of
the color picker box, respectively.
Setting only one value produces a square color picker.

'slider_size' defines the thickness of the slider, while 'slider_length' defines
the length of the entire slider.

All values are defined in pixels.


.. code-block:: python

    color = factory(
        'color',
        name='colorwidget',
        props={
            'label': 'Picker with custom dimensions',
            'box_width': 400,
            'box_height': 100,
            'slider_size': 20,
            'slider_length': 400
        }
    )
"""


def dim_example():
    part = factory(u'fieldset', name='yafowil.widget.color')
    part['color'] = factory(
        '#field:color',
        props={
            'label': 'Picker with custom dimensions',
            'box_width': 400,
            'box_height': 100,
            'slider_size': 20,
            'slider_length': 400
        })
    return {
        'widget': part,
        'doc': DOC_DIM,
        'title': 'Custom dimensions',
    }



DOC_PREVIEW = """
Custom preview elements
-----------------------

Add your own optional preview element by adding a HTML string in the
'preview_elem' option.

The color of your element is set by css 'background-color' attribute.


.. code-block:: python

    color = factory(
        'color',
        name='colorwidget',
        props={
            'label': 'Picker with custom preview',
            'sliders': ['box', 'h', 'a'],
            'preview_elem': '<div id="my-preview" style="border-radius: 50%; width:100px; height:100px; margin:20px; border: 1px solid gray;" />',
            'color': '#4287f5'
        }
    )
"""


def preview_example():
    part = factory(u'fieldset', name='yafowil.widget.color')
    part['color'] = factory(
        '#field:color',
        props={
            'label': 'Picker with custom preview',
            'sliders': ['box', 'h', 'a'],
            'preview_elem': '<div id="my-preview" style="border-radius: 50%; width:100px; height:100px; margin:20px; border: 1px solid gray;" />',
            'color': '#4287f5'
        })
    return {
        'widget': part,
        'doc': DOC_PREVIEW,
        'title': 'Preview element',
    }



DOC_SWATCHES = """
Fixed color swatches
--------------------

Initialize the widget with custom swatches by passing an array of elements
in the 'swatches' option.
Swatches passed in this option are not removable by the user.

Supported formats:

- Number Array (will default to rgb / rgba value)
- rgb string
- rgba string
- hsl string
- hex string
- hsl object
- rgb/rgba object


.. code-block:: python

    color = factory(
        'color',
        name='colorwidget',
        props={
            'label': 'Picker with fixed swatches',
            'sliders': ['h', 's', 'v', 'a'],
            'color': '#ff0000',
            'swatches': [
                [255, 0, 0],          # default interpretation as rgb
                [255, 150, 0, 0.5],     # default interpretation as rgba
                'rgb(255,255,0)',      # rgb string
                'rgba(255,255,0,0.5)',  # rgba string
                'hsl(100, 100%, 50%)',   # hsl string
                '#00fff0',              # hex string
                {                       # hsl object
                    'h': '200',
                    's': '100',
                    'l': '50'
                }, {                    # rgb object
                    'r': 150,
                    'g': 0,
                    'b': 255
                }
            ]
        }
    )
"""


def swatches_example():
    part = factory(u'fieldset', name='yafowil.widget.color')
    part['color'] = factory(
        '#field:color',
        props={
            'label': 'Picker with fixed swatches',
            'sliders': ['h', 's', 'v', 'a'],
            'color': '#ff0000',
            'swatches': [
                [255, 0, 0],          # default interpretation as rgb
                [255, 150, 0, 0.5],     # default interpretation as rgba
                'rgb(255,255,0)',      # rgb string
                'rgba(255,255,0,0.5)',  # rgba string
                'hsl(100, 100%, 50%)',   # hsl string
                '#00fff0',              # hex string
                {                       # hsl object
                    'h': '200',
                    's': '100',
                    'l': '50'
                }, {                    # rgb object
                    'r': 150,
                    'g': 0,
                    'b': 255
                }
            ]
        })
    return {
        'widget': part,
        'doc': DOC_SWATCHES,
        'title': 'Fixed swatches',
    }



DOC_INPUT = """
Enabling input fields
---------------------

If you want to show input fields next to your sliders, set the 'show_inputs'
property to True.
Input fields can be set as read-only with the 'disabled' property.


.. code-block:: python

    color = factory(
        'color',
        name='colorwidget',
        props={
            'label': 'Picker with input fields',
            'sliders': ['h', 's', 'v'],
            'show_inputs' : True,
            #'disabled': True,
            'format': 'hexString'
        }
    )
"""


def input_example():
    part = factory(u'fieldset', name='yafowil.widget.color')
    part['color'] = factory(
        '#field:color',
        props={
            'label': 'Picker with input fields',
            'sliders': ['h', 's', 'v'],
            'show_inputs' : True,
            # 'disabled': True,
            'format': 'hexString'
        })
    return {
        'widget': part,
        'doc': DOC_INPUT,
        'title': 'Input Fields',
    }



DOC_RGB = """
Example: RGB/RGBA color picker
------------------------------

The color picker widget can be used to edit and view RGB/RGBA values.
Single channel editing is also possible.

If editing a channel (for example, red), the corresponding blue and
green channels will be fixed at the initially passed color value.

Pass 'a' in the 'sliders' option to edit alpha channel value.


.. code-block:: python

    color = factory(
        'color',
        name='colorwidget',
        props={
            'label': 'Example: RGBA Picker',
            'sliders': ['r', 'g', 'b', 'a'],
            'format': 'rgbaString'
        }
    )
"""


def rgb_example():
    part = factory(u'fieldset', name='yafowil.widget.color')
    part['color'] = factory(
        '#field:color',
        props={
            'label': 'Example: RGBA Picker',
            'sliders': ['r', 'g', 'b', 'a'],
            'format': 'rgbaString'
        })
    return {
        'widget': part,
        'doc': DOC_RGB,
        'title': 'Example: RGBA',
    }



DOC_HSV = """
Example: HSV color picker
-------------------------

Pass the following values to create a HSV/HSVA color picker.


.. code-block:: python

    color = factory(
        'color',
        name='colorwidget',
        props={
            'label': 'Example: HSV Picker',
            'sliders': ['h', 's', 'v'],
            'format': 'hslaString'
        }
    )
"""


def hsv_example():
    part = factory(u'fieldset', name='yafowil.widget.color')
    part['color'] = factory(
        '#field:color',
        props={
            'label': 'Example: HSV Picker',
            'sliders': ['h', 's', 'v', 'a'],
            'format': 'hslaString'
        })
    return {
        'widget': part,
        'doc': DOC_HSV,
        'title': 'Example: HSV',
    }




DOC_KELVIN = """
Example: Temperature
--------------------

Pass 'k' in the 'sliders' option of your widget to create a color
temperature slider.

Slider Temperature defaults to 2000-12000K, if you want to override this
behaviour pass a dict like object with min and max values.

The possible kelvin temperature ranges from 1000 to 40000.


.. code-block:: python

    color = factory(
        'color',
        name='colorwidget',
        props={
            'label': 'Example: Temperature Picker',
            'sliders': ['k'],
            'slider_size': 30,
            'format': 'kelvin',
            'color': '#ffffff',
            'temperature': {'min': 4000, 'max': 8000}
        }
    )
"""


def kelvin_example():
    part = factory(u'fieldset', name='yafowil.widget.color')
    part['color'] = factory(
        '#field:color',
        props={
            'label': 'Example: Temperature Picker',
            'sliders': ['k'],
            'slider_size': 30,
            'format': 'kelvin',
            'color': '#ffffff',
            'temperature': {'min': 4000, 'max': 8000}
        })
    return {
        'widget': part,
        'doc': DOC_KELVIN,
        'title': 'Example: Temperature',
    }



def get_example():
    return [
        default_example(),
        dim_example(),
        input_example(),
        preview_example(),
        swatches_example(),
        rgb_example(),
        hsv_example(),
        kelvin_example()
    ]
