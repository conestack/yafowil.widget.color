# -*- coding: utf-8 -*-
from yafowil.base import factory


DOC_COLOR = """
Color widget
------------

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
            'preview_elem': '<div id="my-preview" style="border-radius: 50%; width:100px; height:100px; margin:20px; border: 1px solid gray;" />',
            'color': '#4287f5'
        })
    return {
        'widget': part,
        'doc': DOC_PREVIEW,
        'title': 'Color with preview element',
    }



DOC_HSL = """
Color Widget with HSL option
----------------------------

Add an option to edit and view HSL values of the currently selected color.


.. code-block:: python

    color = factory(
        'color',
        name='colorwidget',
        props={
            'label': 'Color Widget with hsl option',
            'hsl_display': True
        }
    )
"""


def hsl_example():
    part = factory(u'fieldset', name='yafowil.widget.color')
    part['color'] = factory(
        '#field:color',
        props={
            'label': 'Color Widget with hsl option',
            'hsl_display': True
        })
    return {
        'widget': part,
        'doc': DOC_HSL,
        'title': 'Color with HSL option',
    }



DOC_HEX = """
Color Widget with HEX option
----------------------------

Add an option to edit and view HEX values of the currently selected color.


.. code-block:: python

    color = factory(
        'color',
        name='colorwidget',
        props={
            'label': 'Color Widget with hex option',
            'hex_display': True
        }
    )
"""


def hex_example():
    part = factory(u'fieldset', name='yafowil.widget.color')
    part['color'] = factory(
        '#field:color',
        props={
            'label': 'Color Widget with HEX option',
            'hex_display': True
        })
    return {
        'widget': part,
        'doc': DOC_HEX,
        'title': 'Color with hex option',
    }



DOC_DIM = """
Color Widget with custom dimensions
-----------------------------------

Initialize the widget with custom dimensions (in pixels).


.. code-block:: python

    color = factory(
        'color',
        name='colorwidget',
        props={
            'label': 'Color Widget dimensions',
            'box_width': 400,
            'box_height': 100
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
            'box_height': 100
        })
    return {
        'widget': part,
        'doc': DOC_DIM,
        'title': 'Color Widget dimensions',
    }



def get_example():
    return [
        default_example(),
        preview_example(),
        hsl_example(),
        hex_example(),
        dim_example()
    ]
