from yafowil.compat import IS_PY2
from yafowil.tests import YafowilTestCase
import yafowil.loader  # noqa


if not IS_PY2:
    from importlib import reload


class TestColorWidget(YafowilTestCase):

    def setUp(self):
        super(TestColorWidget, self).setUp()
        from yafowil.widget.color import widget
        reload(widget)

    def test_edit_renderer(self):
        pass

    def test_display_renderer(self):
        pass
