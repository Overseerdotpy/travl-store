#!/usr/bin/env python3
"""Generates assets/wordmark.json: the TRAVL wordmark as per-letter SVG paths from real Montserrat Bold
outlines, shaped with HarfBuzz (so kerning is correct, e.g. the A-V pair) plus +0.035em tracking.

Note: regenerating gives a visually identical wordmark (about 17 of 420,000 pixels differ, from anti-aliasing)
but not byte-identical JSON, because the contours are decomposed differently.

Why paths instead of live text: the wordmark is the first thing on the page, so it must look identical on
every device and not wait for a web font. Per-letter groups also let the page animate each letter.

    pip install -r tools/requirements.txt
    npm i --no-save @fontsource/montserrat    # provides the font file (SIL Open Font License)
    python3 tools/make_wordmark.py node_modules/@fontsource/montserrat/files/montserrat-latin-700-normal.woff2

Tests: `pytest` (see tests_py/).
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

TEXT = 'TRAVL'
TRACKING_EM = 0.035
DEFAULT_OUT = Path('assets/wordmark.json')


def fmt(v: float) -> str:
    """Numbers for SVG path data: one decimal place, trailing zeros and dot dropped (12.0 -> '12', 12.50 -> '12.5')."""
    s = ('%.1f' % v).rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


@dataclass(frozen=True)
class PlacedGlyph:
    name: str   # glyph name in the font, e.g. 'A'
    x: float    # pen position in font units, after kerning and tracking


@dataclass
class Font:
    """A font loaded once for both fontTools (outlines) and HarfBuzz (shaping)."""
    tt: object
    hb_font: object

    @property
    def upm(self) -> int:
        return self.tt['head'].unitsPerEm

    @property
    def glyph_set(self):
        return self.tt.getGlyphSet()


def load_font(path: str | os.PathLike) -> Font:
    """Loads a TTF/OTF/WOFF/WOFF2. HarfBuzz can't read WOFF2, so the font is saved as plain TTF first."""
    import uharfbuzz as hb
    from fontTools.ttLib import TTFont

    tt = TTFont(str(path))
    tt.flavor = None
    with tempfile.TemporaryDirectory() as tmp:
        ttf = os.path.join(tmp, 'font.ttf')
        tt.save(ttf)
        blob = hb.Blob(Path(ttf).read_bytes())
    return Font(tt=tt, hb_font=hb.Font(hb.Face(blob)))


def shape(font: Font, text: str = TEXT, tracking_em: float = TRACKING_EM, kern: bool = True) -> list[PlacedGlyph]:
    """Lays out `text` left to right: HarfBuzz advances and offsets, plus `tracking_em` after every glyph."""
    import uharfbuzz as hb

    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font.hb_font, buf, {'kern': kern})

    order = font.tt.getGlyphOrder()
    x, placed = 0.0, []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        placed.append(PlacedGlyph(order[info.codepoint], x + pos.x_offset))
        x += pos.x_advance + tracking_em * font.upm
    return placed


def ink_bounds(font: Font, placed: list[PlacedGlyph]) -> tuple[float, float, float, float]:
    """(xmin, ymin, xmax, ymax) of the inked outlines, in font units (y up)."""
    from fontTools.pens.boundsPen import BoundsPen
    from fontTools.pens.transformPen import TransformPen

    gs = font.glyph_set
    bp = BoundsPen(gs)
    for g in placed:
        gs[g.name].draw(TransformPen(bp, (1, 0, 0, 1, g.x, 0)))
    if bp.bounds is None:
        raise ValueError('nothing to draw: the text has no visible glyphs')
    return bp.bounds


def build_wordmark(font: Font, text: str = TEXT, tracking_em: float = TRACKING_EM, kern: bool = True) -> dict:
    """The JSON the page reads: a viewBox cropped to the ink, and one SVG path per glyph (y flipped into SVG space)."""
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen

    placed = shape(font, text, tracking_em, kern)
    xmin, ymin, xmax, ymax = ink_bounds(font, placed)
    gs = font.glyph_set

    paths = []
    for g in placed:
        pen = SVGPathPen(gs, ntos=fmt)
        gs[g.name].draw(TransformPen(pen, (1, 0, 0, -1, g.x - xmin, ymax)))
        paths.append(pen.getCommands())

    w, h = round(xmax - xmin), round(ymax - ymin)
    return {'vb': f'0 0 {w} {h}', 'w': w, 'h': h, 'paths': paths}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('font', help='path to Montserrat Bold (.woff2, .woff, .ttf or .otf)')
    ap.add_argument('--out', type=Path, default=DEFAULT_OUT, help=f'output JSON (default: {DEFAULT_OUT})')
    ap.add_argument('--text', default=TEXT)
    ap.add_argument('--tracking', type=float, default=TRACKING_EM, help='extra space after each letter, in em')
    args = ap.parse_args(argv)

    out = build_wordmark(load_font(args.font), args.text, args.tracking)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(out))
    print(f'wrote {args.out}', out['vb'])
    return 0


if __name__ == '__main__':
    sys.exit(main())
