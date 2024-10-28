from yafowil.base import factory
from yafowil.utils import entry_point
import os
import webresource as wr


resources_dir = os.path.join(os.path.dirname(__file__), 'resources')


##############################################################################
# Default
##############################################################################

# webresource ################################################################

resources = wr.ResourceGroup(
    name='yafowil.widget.color',
    directory=resources_dir,
    path='yafowil-color'
)
resources.add(wr.ScriptResource(
    name='iro-js',
    directory=os.path.join(resources_dir, 'iro'),
    path='yafowil-color/iro',
    resource='iro.js',
    compressed='iro.min.js'
))
resources.add(wr.ScriptResource(
    name='yafowil-color-js',
    depends=['jquery-js', 'iro-js'],
    resource='default/widget.js',
    compressed='default/widget.min.js'
))
resources.add(wr.StyleResource(
    name='yafowil-color-css',
    resource='default/widget.css'
))

# B/C resources ##############################################################

js = [{
    'group': 'yafowil.widget.color.dependencies',
    'resource': 'iro/iro.js',
    'order': 20,
}, {
    'group': 'yafowil.widget.color.common',
    'resource': 'default/widget.js',
    'order': 21,
}]
css = [{
    'group': 'yafowil.widget.color.common',
    'resource': 'default/widget.css',
    'order': 21,
}]

##############################################################################
# Bootstrap 5
##############################################################################

# webresource ################################################################

bootstrap5_resources = wr.ResourceGroup(
    name='yafowil.widget.color',
    directory=resources_dir,
    path='yafowil-color'
)
bootstrap5_resources.add(wr.ScriptResource(
    name='iro-js',
    directory=os.path.join(resources_dir, 'iro'),
    path='yafowil-color/iro',
    resource='iro.js',
    compressed='iro.min.js'
))
bootstrap5_resources.add(wr.ScriptResource(
    name='yafowil-color-js',
    depends=['jquery-js', 'iro-js'],
    resource='bootstrap5/widget.js',
    compressed='bootstrap5/widget.min.js'
))
bootstrap5_resources.add(wr.StyleResource(
    name='yafowil-color-css',
    resource='bootstrap5/widget.css'
))

# B/C resources ##############################################################

bootstrap5_js = [{
    'group': 'yafowil.widget.color.dependencies',
    'resource': 'iro/iro.js',
    'order': 20,
}, {
    'group': 'yafowil.widget.color.common',
    'resource': 'bootstrap5/widget.js',
    'order': 21,
}]
bootstrap5_css = [{
    'group': 'yafowil.widget.color.common',
    'resource': 'bootstrap5/widget.css',
    'order': 20,
}]


##############################################################################
# Registration
##############################################################################

@entry_point(order=10)
def register():
    from yafowil.widget.color import widget  # noqa

    widget_name = 'yafowil.widget.color'

    # Default
    factory.register_theme(
        'default',
        widget_name,
        resources_dir,
        js=js,
        css=css
    )
    factory.register_resources('default', widget_name, resources)

    # Bootstrap 5
    factory.register_theme(
        ['bootstrap5'],
        widget_name,
        resources_dir,
        js=bootstrap5_js,
        css=bootstrap5_css
    )

    factory.register_resources(
        ['bootstrap5'],
        widget_name,
        bootstrap5_resources
    )
