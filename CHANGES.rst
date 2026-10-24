Changes
=======

2.0.1 (unreleased)
------------------

- Add ``@popperjs/core`` as dev dependency for testing the bootstrap5 widget.
  [rnix]

- Extend the JS tests to 100 % coverage, all modules including bundles are
  loaded by the tests now.
  [rnix]

- Lint and format the JS code with biome. ``make check`` runs ``biome check``,
  ``make format`` runs ``biome check --write`` (see ``include.mk``). Behavior
  unchanged.
  [rnix]

- JS tooling: Commit ``pnpm-lock.yaml``. Upgrade ``@web/test-runner`` to 1.0
  and run the JS tests headless in Chromium via Playwright, installed in the JS
  CI workflow. Drop the accidental ``install`` dev dependency. Pin patched
  versions of vulnerable transitive dependencies via ``pnpm.overrides``.
  [rnix]

- Modernise the code ruff flags as outdated: ``u''`` prefixes and ``.format()``
  over f-strings. Behaviour unchanged. ``super(Class, self)`` is kept, see
  ``cone.app``.
  [rnix]

- Sort the imports with ruff (one per line, ``from`` imports first, no
  sections) and format the code with ``ruff format`` (90 characters per line,
  single quotes).
  [rnix]

- Add ``qa.ruff`` domain to Makefile and pin the ruff configuration in
  ``pyproject.toml``, ``make check`` runs ``ruff check``.
  [rnix]

- Drop the Python 2 remnants: ``# -*- coding: utf-8 -*-``.
  [rnix]

- Declare ``requires-python = ">=3.10"``.
  [rnix]


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
