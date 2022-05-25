from yafowil.base import factory
from yafowil.utils import entry_point
import os
import webresource as wr


resources_dir = os.path.join(os.path.dirname(__file__), 'resources')


##############################################################################
# Default
##############################################################################

# webresource ################################################################

scripts = wr.ResourceGroup(
    name='yafowil-color-scripts',
    path='yafowil.widget.color'
)
scripts.add(wr.ScriptResource(
    name='iro-js',
    directory=os.path.join(resources_dir, 'iro'),
    resource='iro.js',
    compressed='iro.min.js'
))
scripts.add(wr.ScriptResource(
    name='yafowil-color-js',
    depends=['jquery-js', 'iro-js'],
    directory=resources_dir,
    resource='widget.js',
    compressed='widget.min.js'
))

styles = wr.ResourceGroup(
    name='yafowil-color-styles',
    path='yafowil.widget.color'
)
styles.add(wr.StyleResource(
    name='yafowil-color-css',
    directory=resources_dir,
    resource='widget.css'
))

# B/C resources ##############################################################

js = [{
    'group': 'yafowil.widget.color.dependencies',
    'resource': 'iro/iro.js',
    'order': 20,
}, {
    'group': 'yafowil.widget.color.common',
    'resource': 'widget.js',
    'order': 21,
}]
css = [{
    'group': 'yafowil.widget.color.common',
    'resource': 'widget.css',
    'order': 21,
}]


##############################################################################
# Registration
##############################################################################

@entry_point(order=10)
def register():
    from yafowil.widget.color import widget  # noqa

    # Default
    factory.register_theme(
        'default', 'yafowil.widget.color', resources_dir,
        js=js, css=css
    )
    factory.register_scripts('default', 'yafowil.widget.color', scripts)
    factory.register_styles('default', 'yafowil.widget.color', styles)
