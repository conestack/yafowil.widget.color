from yafowil.base import factory
from yafowil.utils import entry_point
import os


resourcedir = os.path.join(os.path.dirname(__file__), 'resources')
js = [{
    'group': 'yafowil.widget.color.dependencies',
    'resource': 'iro/iro_lena.js',
    'order': 20,
}, {
    'group': 'yafowil.widget.color.common',
    'resource': 'widget.js',
    'order': 21,
}]
default_css = [{
    'group': 'yafowil.widget.color.common',
    'resource': 'widget.css',
    'order': 21,
}]


@entry_point(order=10)
def register():
    from yafowil.widget.color import widget  # noqa
    factory.register_theme('default', 'yafowil.widget.color',
                           resourcedir, js=js, css=default_css)
