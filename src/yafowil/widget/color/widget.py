# -*- coding: utf-8 -*-
from yafowil.base import factory
from yafowil.common import generic_required_extractor
from yafowil.tsf import TSF
from yafowil.utils import managedprops


_ = TSF('yafowil.widget.color')


@managedprops('emptyvalue')
def color_extractor(widget, data):
    pass


def color_edit_renderer(widget, data):
    pass


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
