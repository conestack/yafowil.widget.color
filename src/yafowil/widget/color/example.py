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
            'label': 'Color Widget'
        })
    return {
        'widget': part,
        'doc': DOC_COLOR,
        'title': 'Color',
    }



DOC_PREVIEW = """
Color Widget with preview element
---------------------------------

Add your own optional preview element by adding a HTML string in the 'preview_elem' option.

The color of your element is set by css 'background-color' attribute.


.. code-block:: python

    color = factory(
        'color',
        name='colorwidget',
        props={
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
            'label': 'Color Widget with preview element',
            'elements': [],
            'sliders': ['box', 'h', 'a'],
            'preview_elem': '<div id="my-preview" style="border-radius: 50%; width:100px; height:100px; margin:20px; border: 1px solid gray;" />',
            'color': '#4287f5'
        })
    return {
        'widget': part,
        'doc': DOC_PREVIEW,
        'title': 'Color with preview element',
    }



DOC_HSV = """
Color Widget with HSV option
----------------------------

Add an option to edit and view HSV values of the currently selected color.


.. code-block:: python

    color = factory(
        'color',
        name='colorwidget',
        props={
            'label': 'Color Widget with hsv option',
            'elements': ['h', 's', 'v', 'a'],
            'sliders': ['h', 's', 'v', 'a'],
            'format': 'hsvaString'
        }
    )
"""


def hsv_example():
    part = factory(u'fieldset', name='yafowil.widget.color')
    part['color'] = factory(
        '#field:color',
        props={
            'label': 'Color Widget with hsv option',
            'elements': ['h', 's', 'v', 'a'],
            'sliders': ['h', 's', 'v', 'a'],
            'format': 'hsvaString'
        })
    return {
        'widget': part,
        'doc': DOC_HSV,
        'title': 'Color with HSV option',
    }



DOC_RGB = """
Color Widget with RGB/RGBA option
---------------------------------

Add an option to edit and view RGB/RGBA values of the currently selected color.

RGB does not include alpha channel, while RGBA adds an opacity slider and allows
RGBA values.


.. code-block:: python

    color = factory(
        'color',
        name='colorwidget',
        props={
            'label': 'Color Widget with rgb option',
            'elements': ['r', 'g', 'b'],
            'sliders': ['r', 'g', 'b'],
            'format': 'rgbString'
        }
    )
"""


def rgb_example():
    part = factory(u'fieldset', name='yafowil.widget.color')
    part['color'] = factory(
        '#field:color',
        props={
            'label': 'Color Widget with rgb option',
            'elements': ['r', 'g', 'b'],
            'sliders': ['r', 'g', 'b'],
            'format': 'rgbString'
        })
    return {
        'widget': part,
        'doc': DOC_RGB,
        'title': 'Color with RGB option',
    }



DOC_KELVIN = """
Color Widget with Kelvin option
-------------------------------

Add an option to edit and view Kelvin values of the currently selected color.

Adds a Kelvin temperature slider.


.. code-block:: python

    color = factory(
        'color',
        name='colorwidget',
        props={
            'label': 'Color Widget with Kelvin option',
            'elements': ['k'],
            'sliders': ['k'],
            'slider_size': 30,
            'format': 'kelvin',
            'color': '#ffffff',
            'temp': {'min': 4000, 'max': 8000}
        }
    )
"""


def kelvin_example():
    part = factory(u'fieldset', name='yafowil.widget.color')
    part['color'] = factory(
        '#field:color',
        props={
            'label': 'Color Widget with Kelvin option',
            'elements': ['k'],
            'sliders': ['k'],
            'slider_size': 30,
            'format': 'kelvin',
            'color': '#ffffff',
            'temp': {'min': 4000, 'max': 8000}
        })
    return {
        'widget': part,
        'doc': DOC_KELVIN,
        'title': 'Color with Kelvin option',
    }



DOC_DIM = """
Color Widget with custom dimensions
-----------------------------------

Initialize the widget color box with custom dimensions (in pixels).

Set the slider height (optional).


.. code-block:: python

    color = factory(
        'color',
        name='colorwidget',
        props={
            'label': 'Color Widget dimensions',
            'box_width': 400,
            'box_height': 100,
            'slider_size' : 10
        }
    )
"""


def dim_example():
    part = factory(u'fieldset', name='yafowil.widget.color')
    part['color'] = factory(
        '#field:color',
        props={
            'label': 'Color Widget dimensions',
            'box_width': 400,
            'box_height': 100,
            'slider_size' : 20,
            'sliders': ['h'],
        })
    return {
        'widget': part,
        'doc': DOC_DIM,
        'title': 'Color Widget dimensions',
    }



DOC_SWATCHES = """
Color Widget with custom swatches
---------------------------------

Initialize the widget with custom swatches by passing an array of elements
in the 'swatches' option.
Swatches passed in this option are not removable.

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
            'label': 'Color Widget swatches',
            'elements': ['h', 's', 'v', 'r', 'g', 'b', 'a'],
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
            'label': 'Color Widget swatches',
            'elements': ['h', 's', 'v', 'r', 'g', 'b', 'a'],
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
        'title': 'Color Widget swatches',
    }


DOC_TEST = """
TEST
----
"""

def TEST():
    part = factory(u'fieldset', name='yafowil.widget.color')
    part['color'] = factory(
        '#field:color',
        props={
            'label': 'Color Widget dimensions',
            'elements': ['h', 's', 'v', 'a'],
            'sliders': ['box', 'h', 's', 'v', 'a'],
            'swatches': ['#fff700'],
            'temp': {
                'min': 4000,
                'max': 8000
            },
            'format': 'hslaString'
        })
    return {
        'widget': part,
        'doc': DOC_TEST,
        'title': 'Color Widget dimensions',
    }



def get_example():
    return [
        default_example(),
        hsv_example(),
        rgb_example(),
        kelvin_example(),
        preview_example(),
        # dim_example(),
        swatches_example(),
        # TEST()
    ]
