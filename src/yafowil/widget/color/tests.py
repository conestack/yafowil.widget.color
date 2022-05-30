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
        reload(color.widget)
        color.register()

    def test_edit_renderer(self):
        pass

    def test_display_renderer(self):
        pass

    def test_resources(self):
        factory.theme = 'default'
        resources = factory.get_resources('yafowil.widget.color')
        self.assertTrue(resources.directory.endswith(np('/color/resources')))
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
