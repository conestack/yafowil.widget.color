Changes
=======

2.0.0 (2026-02-03)
------------------

- Refactor package layout to use ``pyproject.toml`` and implicit namespace packages.
  [rnix]

- Add ``strategy`` widget property for positioning dropdown via popper.js.
  [lenadax]

- Update jQuery to version ``4.0.0-beta.2``.
  [lenadax]

- Use rollup for bundling scss. Use ``make rollup`` to compile js and scss.
  [lenadax]

- Use ``webtestrunner`` instead of ``karma`` for js tests. Use ``make wtr`` to run tests.
  [lenadax]

- Use ``pnpm`` as package manager.
  [lenadax]

- Add ``placement`` and ``auto-align`` widget properties.
  [lenadax]


1.0a2 (2024-02-12)
------------------

- Introduce ``on_open`` handler in ``ColorPicker`` JS.
  [rnix]


1.0a1 (2023-05-15)
------------------

- Extend JS by ``color_on_array_add`` and ``register_array_subscribers``
  functions to enable usage in ``yafowil.widget.array``.
  [lenadax]

- Add feature: locked swatches
  [lenadax]

- Include forked version of iro.js (https://github.com/lenadax/iro.js)
  [lenadax]

- Utilize iro.js
  [lenadax]

- Initial.
  [rnix]
