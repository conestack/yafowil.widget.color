from importlib import reload
from node.utils import UNSET
from yafowil.base import ExtractionError
from yafowil.base import factory
from yafowil.tests import YafowilTestCase
from yafowil.widget.color.widget import ColorDatatypeConverter
import os
import unittest


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
        # Render widget
        widget = factory(
            'color',
            name='colorwidget')
        self.checkOutput(
        """
        <input class="color-picker" data-box_width='250' data-disabled='false'
        data-format='hexString' data-layout_direction='vertical'
        data-open_on_focus='true' data-show_inputs='false'
        data-show_labels='false' data-slider_size='10'
        data-sliders='["box", "h"]' data-temperature='{...}'
        data-user_swatches='true' id="input-colorwidget" name="colorwidget"
        type="text" />
        """
        , widget()
        )

        # Render with JS config properties
        widget = factory(
            'color',
            name='colorwidget',
            props={
                'color': 'rgba(255, 255, 0, 1)',
                'format': 'rgbaString',
                'show_inputs': True,
                'show_labels': True,
                'slider_size': 50,
                'layout_direction': 'horizontal',
                'open_on_focus': False
            })
        self.checkOutput("""
        <input class="color-picker" data-box_width='250' data-disabled='false'
        data-format='rgbaString' data-layout_direction='horizontal'
        data-open_on_focus='false' data-show_inputs='true'
        data-show_labels='true' data-slider_size='50'
        data-sliders='["box", "h"]' data-temperature='{...}'
        data-user_swatches='true' id="input-colorwidget" name="colorwidget"
        type="text" />
        """
        , widget()
        )

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
        # unknown format
        color = '#ff0000'
        widget = factory(
            'color',
            name='colorwidget',
            value=color,
            props={
                'format': 'unknown_format_type',
                'color': color
            })
        request = {'colorwidget': 'abc'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
              'Unknown Format. Supported formats: hexString, hex8String, '
              'hslString, hslaString, rgbString, rgbaString, kelvin',
            )]
        )

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
        self.assertEqual(
            data.errors, 
            [ExtractionError(
                'Unknown Format. Supported formats: hexString, hex8String, '
                'hslString, hslaString, rgbString, rgbaString, kelvin'
            )]
        )
        # too short
        request = {'colorwidget': '#ff000'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors, 
            [ExtractionError(
                'Incorrect hex Color String length: string length must be 7',
            )]
        )
        # incorrect hex value
        request = {'colorwidget': '#ffxx00'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                "Incorrect Hex Value: invalid literal for int() with base 16: 'xx'",
            )]
        )

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
        self.assertEqual(
            data.errors, 
            [ExtractionError(
                'Unknown Format. Supported formats: hexString, hex8String, '
                'hslString, hslaString, rgbString, rgbaString, kelvin'
            )]
        )
        # too short
        request = {'colorwidget': '#ff0000'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect hex8 Color String length: string length must be 9',
            )]
        )
        # incorrect hex value
        request = {'colorwidget': '#ff00bbxc'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                "Incorrect Hex Value: invalid literal for int() with base 16: 'xc'"
            ,)]
        )
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
        self.assertEqual(
            data.errors,
            [ExtractionError(
                "Incorrect Color String: String must start with 'hsl'",
            )]
        )
        # not endswith )
        request = {'colorwidget': 'hsl(360, 100%, 88%'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError("Incorrect Color String:  Unclosed bracket.",)]
        )
        # hsl+alpha string
        request = {'colorwidget': 'hsl(360, 100%, 88%, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                "Incorrect Color String: expected format: hsl([0-360], "
                "[0-100]%, [0-100]%)",
            )]
        )
        # Incorrect Hue Value
        request = {'colorwidget': 'hsl(380, 100%, 88%)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect Color String: value for hue must be between 0 and 360.',
            )]
        )
        # Incorrect Saturation Value
        request = {'colorwidget': 'hsl(360, 102%, 88%)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors, 
            [ExtractionError(
                'Incorrect Color String: value for saturation must be between 0 '
                'and 100 followed by "%".',
            )]
        )
        # Incorrect Lightness Value
        request = {'colorwidget': 'hsl(360, 100%, 88)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect Color String: value for lightness must be between 0 '
                'and 100 followed by "%".',
            )]
        )
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
        self.assertEqual(
            data.errors,
            [ExtractionError(
                "Incorrect Color String: String must start with 'hsla'",
            )]
        )
        # not endswith )
        request = {'colorwidget': 'hsla(360, 100%, 88%, 0.5'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError("Incorrect Color String:  Unclosed bracket.",)]
        )
        # no alpha channel
        request = {'colorwidget': 'hsla(360, 100%, 88%)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                "Incorrect Color String: expected format: hsla([0-360], "
                "[0-100]%, [0-100]%, [0-1])",
            )]
        )
        # Incorrect Hue Value
        request = {'colorwidget': 'hsla(380, 100%, 88%, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect Color String: value for hue must be between 0 and 360.',
            )]
        )
        # Incorrect Saturation Value
        request = {'colorwidget': 'hsla(360, 102%, 88%, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect Color String: value for saturation must be between 0 '
                'and 100 followed by "%".',
            )]
        )
        # Incorrect Lightness Value
        request = {'colorwidget': 'hsla(360, 100%, 88, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect Color String: value for lightness must be between 0 '
                'and 100 followed by "%".',
            )]
        )
        # Incorrect Alpha Value
        request = {'colorwidget': 'hsla(360, 100%, 88%, 1.8)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect Color String: Alpha value must be between 0 and 1.',
            )]
        )
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
        self.assertEqual(
            data.errors,
            [ExtractionError(
                "Incorrect Color String: String must start with 'rgb'",
            )]
        )
        # not endswith )
        request = {'colorwidget': 'rgb(122, 122, 122'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError("Incorrect Color String: Unclosed bracket.",)]
        )
        # alpha channel
        request = {'colorwidget': 'rgb(122, 122, 122, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect Color String: expected format: rgb([0-255], [0-255], '
                '[0-255])',
            )]
        )
        # Incorrect Red Channel Value
        request = {'colorwidget': 'rgb(-1, 122, 122)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect Color String: value for red must be between 0 and 255.',
            )]
        )
        # Incorrect Green Channel Value
        request = {'colorwidget': 'rgb(122, 300, 122)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect Color String: value for green must be between 0 and 255.'
            ,)]
        )
        # Incorrect Blue Channel Value
        request = {'colorwidget': 'rgb(122, 122, 300)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect Color String: value for blue must be between 0 and 255.',
            )]
        )
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
        self.assertEqual(
            data.errors,
            [ExtractionError(
                "Incorrect Color String: String must start with 'rgba'",
            )]
        )
        # not endswith )
        request = {'colorwidget': 'rgba(122, 122, 122, 0.5'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError("Incorrect Color String: Unclosed bracket.",)]
        )
        # no alpha channel
        request = {'colorwidget': 'rgba(122, 122, 122)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect Color String: expected format: '
                'rgba([0-255], [0-255], [0-255], [0-1])'
            )]
        )
        # Incorrect Red Channel Value
        request = {'colorwidget': 'rgba(-1, 122, 122, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect Color String: value for red must be between 0 and 255.',
            )]
        )
        # Incorrect Green Channel Value
        request = {'colorwidget': 'rgba(122, 300, 122, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect Color String: value for green must be between 0 and 255.',
            )]
        )
        # Incorrect Blue Channel Value
        request = {'colorwidget': 'rgba(122, 122, 300, 0.5)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect Color String: value for blue must be between 0 and 255.',
            )]
        )
        # Incorrect Alpha Channel Value
        request = {'colorwidget': 'rgba(122, 122, 122, 1.5)'}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Incorrect Color String: Alpha value must be between 0 and 1.',
            )]
        )
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
        self.assertEqual(
            data.errors,
            [ExtractionError(
                'Unknown Format, expected format: int(1000 - 40000) or '
                'str(1000 - 40000)',
            )]
        )
        # Temperature not in range
        request = {'colorwidget': 80000}
        data = widget.extract(request)
        self.assertEqual(
            data.errors,
            [ExtractionError('Kelvin Temperature out of range (1000-40000)',)]
        )
        # number / convertable string
        request = {'colorwidget': '4000'}
        data = widget.extract(request)
        self.assertEqual(data.errors, [])
        request = {'colorwidget': 4000}
        data = widget.extract(request)
        self.assertEqual(data.errors, [])

    def test_color_convertor_to_value(self):
        convertor = ColorDatatypeConverter()

        # hexString
        convertor.format = 'hexString'
        val = '#ff0000'
        res = convertor.to_value(val)
        self.assertEqual(res, val)
        # hex8String
        val = '#66000000'
        convertor.format = 'hex8String'
        res = convertor.to_value(val)
        self.assertEqual(res, val)
        # kelvin
        val = '8000'
        convertor.format = 'kelvin'
        convertor.type_ = str
        res = convertor.to_value(val)
        self.assertEqual(res, val)
        # rgbaString
        val = 'rgba(255, 255, 0, 0.5)'
        convertor.format = 'rgbaString'
        convertor.type_ = list
        res = convertor.to_value(val)
        self.assertEqual(res, [255, 255, 0, 0.5])
        # rgbaString to tuple
        convertor.type_ = tuple
        res = convertor.to_value(val)
        self.assertEqual(res, (255, 255, 0, 0.5))
        # rgbaString toInterval
        convertor.range = 'toInterval'
        res = convertor.to_value(val)
        self.assertEqual(res, (1, 1, 0, 0.5))
        # rgbString
        val = 'rgb(125, 125, 5)'
        convertor.format = 'rgbString'
        convertor.type_ = list
        convertor.range = 'full'
        res = convertor.to_value(val)
        self.assertEqual(res, [125, 125, 5])
        # rgbString toInterval
        convertor.range = 'toInterval'
        res = convertor.to_value(val)
        self.assertEqual(round(res[0], 2), 0.49)
        self.assertEqual(round(res[1], 2), 0.49)
        self.assertEqual(round(res[2], 2), 0.02)
        # hslString
        val = 'hsl(360, 100, 50)'
        convertor.format = 'hslString'
        convertor.type_ = list
        convertor.range = 'full'
        res = convertor.to_value(val)
        self.assertEqual(res, [360, 100, 50])
        convertor.range = 'toInterval'
        res = convertor.to_value(val)
        self.assertEqual(res, [1, 1, 0.5])
        # hslaString
        val = 'hsla(360, 100, 50, 0.3)'
        convertor.format = 'hslaString'
        convertor.type_ = int
        convertor.range = 'full'
        res = convertor.to_value(val)
        self.assertEqual(res, [360, 100, 50, 0.3])
        convertor.range = 'toInterval'
        res = convertor.to_value(val)
        self.assertEqual(res, [1, 1, 0.5, 0.3])

        # number kelvin to str
        val = 4500
        convertor.format = 'kelvin'
        convertor.type_ = str
        res = convertor.to_value(val)
        self.assertEqual(res, '4500')
        # number kelvin
        val = 4500
        convertor.format = 'kelvin'
        convertor.type_ = int
        res = convertor.to_value(val)
        self.assertEqual(res, 4500)

        # unsupported type
        val = {'foo': 'bar'}
        self.assertRaises(TypeError, convertor.to_value, val)


    def test_color_convertor_to_form(self):
        convertor = ColorDatatypeConverter()

        # not in accepted formats
        val = ''
        convertor.format = 'someString'
        self.assertRaises(TypeError, convertor.to_form, val)

        # empty
        convertor.format = 'hexString'
        val = None
        res = convertor.to_form(val)
        self.assertEqual(res, None)

        # format tuple
        convertor.type_ = tuple
        val = (100, 100, 50)
        a_val = (100, 100, 50, 0.5)

        # hexString to tuple
        convertor.format = 'hexString'
        self.assertRaises(ValueError, convertor.to_form, val)
        # hex8String to tuple
        convertor.format = 'hex8String'
        self.assertRaises(ValueError, convertor.to_form, val)
        # kelvin to tuple
        convertor.format = 'kelvin'
        self.assertRaises(ValueError, convertor.to_form, val)

        # rgbString #

        # to tuple - range full correct
        convertor.format = 'rgbString'
        res = convertor.to_form((255, 255, 0))
        self.assertEqual(res, 'rgb(255, 255, 0)')
        # to tuple - range full incorrect
        convertor.format = 'rgbString'
        self.assertRaises(ValueError, convertor.to_form, (360, 255, 0.5))
        self.assertEqual(res, 'rgb(255, 255, 0)')
        # to tuple - range toInterval correct
        convertor.range = 'toInterval'
        res = convertor.to_form((0, 1, 0))
        self.assertEqual(res, 'rgb(0, 255, 0)')
        # to tuple - range toInterval incorrect
        self.assertRaises(ValueError, convertor.to_form, (0, 22, 1))
        # wrong length
        convertor.range = 'full'
        self.assertRaises(ValueError, convertor.to_form, (0, 1, 0, 1))

        # rgbaString

        # hslString

        # hslaString

        # kelvin


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
