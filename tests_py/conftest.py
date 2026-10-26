import os
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools'))

FONT_CANDIDATES = [
    os.environ.get('WORDMARK_FONT', ''),
    ROOT / 'node_modules/@fontsource/montserrat/files/montserrat-latin-700-normal.woff2',
]


@pytest.fixture(scope='session')
def committed() -> dict:
    """The wordmark.json that ships with the site."""
    import json
    return json.loads((ROOT / 'assets/wordmark.json').read_text())


@pytest.fixture(scope='session')
def font_path() -> Path:
    for p in FONT_CANDIDATES:
        if p and Path(p).is_file():
            return Path(p)
    pytest.skip('Montserrat Bold not found: run `npm i --no-save @fontsource/montserrat` or set WORDMARK_FONT')


@pytest.fixture(scope='session')
def font(font_path):
    pytest.importorskip('uharfbuzz')
    import make_wordmark
    return make_wordmark.load_font(font_path)
