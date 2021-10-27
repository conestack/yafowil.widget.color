# -*- coding: utf-8 -*-
from yafowil.base import factory


DOC_COLOR = """
Color widget
------------

.. code-block:: python

    color = factory('color', name='colorwidget')
"""


def color_example():
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


def get_example():
    return [
        color_example(),
    ]
