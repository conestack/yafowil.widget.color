from node.utils import UNSET
from yafowil.base import ExtractionError
from yafowil.base import factory
from yafowil.compat import IS_PY2
from yafowil.tests import YafowilTestCase
import os
import unittest


if not IS_PY2:
    from importlib import reload


def np(path):
    return path.replace('/', os.path.sep)


class TestColorWidget(YafowilTestCase):

    def setUp(self):
        super(TestColorWidget, self).setUp()
        from yafowil.widget import color
        from yafowil.widget.color import widget
        reload(widget)
        color.register()

    def test_edit_renderer(self):
        pass

    def test_display_renderer(self):
        pass

    def test_color_extractor(self):
        # empty value
        color = UNSET
        widget = factory(
            'color',
            name='colorwidget',
            value=UNSET,
            props={
                'format': 'hexString',
                'color': UNSET
            })
        data = widget.extract({})
        self.assertEqual(data.value, UNSET)

        # initial value
        color = '#ffffff'
        widget = factory(
            'color',
            name='colorwidget',
            value=color,
            props={
                'format': 'hexString',
                'color': color
            })
        data = widget.extract({})
        self.assertEqual(data.value, '#ffffff')

    def test_color_extractor_hexString(self):
        widget = factory(
            'color',
            name='colorwidget',
            value=UNSET,
            props={
                'format': 'hexString'
            })
        # not startswith '#'
        request = {'colorwidget': 'ff0000'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Unknown Format',)])

        # too short
        request = {'colorwidget': '#ff000'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Unknown Format',)])

        # incorrect hex value
        request = {'colorwidget': '#ffxx00'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect Hex Value',)])

    def test_color_extractor_hex8String(self):
        widget = factory(
            'color',
            name='colorwidget',
            value=UNSET,
            props={
                'format': 'hex8String'
            })
        # not startswith '#'
        request = {'colorwidget': 'ff000000'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Unknown Format',)])

        # too short
        request = {'colorwidget': '#ff0000'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Unknown Format',)])

        # incorrect hex value
        request = {'colorwidget': '#ff00bbxc'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect Hex Value',)])

        # correct hex value
        request = {'colorwidget': '#ff00bbcc'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [])

    def test_color_extractor_hslString(self):
        widget = factory(
            'color',
            name='colorwidget',
            value=UNSET,
            props={
                'format': 'hslString'
            })
        # not startswith hsl(
        request = {'colorwidget': 'rgb(360, 122, 122)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Unknown Format',)])

        # not endswith )
        request = {'colorwidget': 'hsl(360, 100%, 88%'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Unknown Format',)])

        # hsl+alpha string
        request = {'colorwidget': 'hsl(360, 100%, 88%, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('HSLA String',)])

        # Incorrect Hue Value
        request = {'colorwidget': 'hsl(380, 100%, 88%)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect Hue Value',)])

        # Incorrect Saturation Value
        request = {'colorwidget': 'hsl(360, 102%, 88%)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect Saturation Value',)])

        # Incorrect Lightness Value
        request = {'colorwidget': 'hsl(360, 100%, 88)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect Brightness Value',)])

        # correct value
        request = {'colorwidget': 'hsl(360, 100%, 88%)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [])

    def test_color_extractor_hslaString(self):
        widget = factory(
            'color',
            name='colorwidget',
            value=UNSET,
            props={
                'format': 'hslaString'
            })
        # not startswith hsla(
        request = {'colorwidget': 'hsl(360, 122, 122)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Unknown Format',)])

        # not endswith )
        request = {'colorwidget': 'hsla(360, 100%, 88%, 0.5'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Unknown Format',)])

        # no alpha channel
        request = {'colorwidget': 'hsla(360, 100%, 88%)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('HSL String',)])

        # Incorrect Hue Value
        request = {'colorwidget': 'hsla(380, 100%, 88%, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect Hue Value',)])

        # Incorrect Saturation Value
        request = {'colorwidget': 'hsla(360, 102%, 88%, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect Saturation Value',)])

        # Incorrect Lightness Value
        request = {'colorwidget': 'hsla(360, 100%, 88, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect Brightness Value',)])

        # Incorrect Alpha Value
        request = {'colorwidget': 'hsla(360, 100%, 88%, 1.8)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect Alpha Value',)])

        # correct value
        request = {'colorwidget': 'hsla(360, 100%, 88%, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [])

    def test_color_extractor_rgbString(self):
        widget = factory(
            'color',
            name='colorwidget',
            value=UNSET,
            props={
                'format': 'rgbString'
            })
        # not startswith rgb(
        request = {'colorwidget': 'rgba(122, 122, 122)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Unknown Format',)])

        # not endswith )
        request = {'colorwidget': 'rgb(122, 122, 122'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Unknown Format',)])

        # alpha channel
        request = {'colorwidget': 'rgb(122, 122, 122, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('RGBA String',)])

        # Incorrect Red Channel Value
        request = {'colorwidget': 'rgb(-1, 122, 122)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect RGB Value',)])

        # Incorrect Green Channel Value
        request = {'colorwidget': 'rgb(122, 300, 122)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect RGB Value',)])

        # Incorrect Blue Channel Value
        request = {'colorwidget': 'rgb(122, 122, 300)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect RGB Value',)])

        # correct value
        request = {'colorwidget': 'rgb(255, 255, 255)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [])

    def test_color_extractor_rgbaString(self):
        widget = factory(
            'color',
            name='colorwidget',
            value=UNSET,
            props={
                'format': 'rgbaString'
            })
        # not startswith rgba(
        request = {'colorwidget': 'rgb(122, 122, 122, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Unknown Format',)])

        # not endswith )
        request = {'colorwidget': 'rgba(122, 122, 122, 0.5'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Unknown Format',)])

        # no alpha channel
        request = {'colorwidget': 'rgba(122, 122, 122)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('RGB String',)])

        # Incorrect Red Channel Value
        request = {'colorwidget': 'rgba(-1, 122, 122, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect RGB Value',)])

        # Incorrect Green Channel Value
        request = {'colorwidget': 'rgba(122, 300, 122, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect RGB Value',)])

        # Incorrect Blue Channel Value
        request = {'colorwidget': 'rgba(122, 122, 300, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect RGB Value',)])

        # Incorrect Alpha Channel Value
        request = {'colorwidget': 'rgba(122, 122, 300, 1.5)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Incorrect RGB Value',)])

        # correct value
        request = {'colorwidget': 'rgba(255, 255, 255, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [])

    def test_color_extractor_kelvin(self):
        widget = factory(
            'color',
            name='colorwidget',
            value=UNSET,
            props={
                'format': 'kelvin'
            })

        # not a number / convertable string
        request = {'colorwidget': '4000K'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Unknown Format',)])

        # Temperature not in range
        request = {'colorwidget': 80000}
        data = widget.extract(request)
        self.assertEqual(data.errors, [ExtractionError('Kelvin Temperature not in possible Range',)])

        # number / convertable string
        request = {'colorwidget': '4000'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [])
        request = {'colorwidget': 4000}
        data = widget.extract(request)
        self.assertEqual(data.errors, [])

    def test_resources(self):
        factory.theme = 'default'
        resources = factory.get_resources('yafowil.widget.color')
        self.assertTrue(resources.directory.endswith(np('/color/resources')))
        self.assertEqual(resources.name, 'yafowil.widget.color')
        self.assertEqual(resources.path, 'yafowil-color')

        scripts = resources.scripts
        self.assertEqual(len(scripts), 2)

        self.assertTrue(
            scripts[0].directory.endswith(np('/color/resources/iro'))
        )
        self.assertEqual(scripts[0].path, 'yafowil-color/iro')
        self.assertEqual(scripts[0].file_name, 'iro.min.js')
        self.assertTrue(os.path.exists(scripts[0].file_path))

        self.assertTrue(scripts[1].directory.endswith(np('/color/resources')))
        self.assertEqual(scripts[1].path, 'yafowil-color')
        self.assertEqual(scripts[1].file_name, 'widget.min.js')
        self.assertTrue(os.path.exists(scripts[1].file_path))

        styles = resources.styles
        self.assertEqual(len(styles), 1)

        self.assertTrue(styles[0].directory.endswith(np('/color/resources')))
        self.assertEqual(styles[0].path, 'yafowil-color')
        self.assertEqual(styles[0].file_name, 'widget.css')
        self.assertTrue(os.path.exists(styles[0].file_path))


if __name__ == '__main__':
    unittest.main()
