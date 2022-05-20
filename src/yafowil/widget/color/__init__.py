from yafowil.base import factory
from yafowil.utils import entry_point
import os
import webresource as wr


resources_dir = os.path.join(os.path.dirname(__file__), 'resources')


##############################################################################
# Default
##############################################################################

# webresource ################################################################

scripts = wr.ResourceGroup(name='scripts')
scripts.add(wr.ScriptResource(
    name='iro-js',
    # actually it not depends on jquery, but yafowil-color-js does
    # think about multiple depends values in webresource
    depends='jquery-js',
    directory=os.path.join(resources_dir, 'iro'),
    resource='iro.js',
    compressed='iro.min.js'
))
scripts.add(wr.ScriptResource(
    name='yafowil-color-js',
    depends='iro-js',
    directory=resources_dir,
    resource='widget.js',
    compressed='widget.min.js'
))

styles = wr.ResourceGroup(name='styles')
styles.add(wr.StyleResource(
    name='yafowil-color-css',
    directory=resources_dir,
    resource='widget.css'
))

resources = wr.ResourceGroup(name='color-resources')
resources.add(scripts)
resources.add(styles)

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
        js=js, css=css, resources=resources
    )
