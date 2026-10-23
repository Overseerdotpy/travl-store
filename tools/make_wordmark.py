#!/usr/bin/env python3
"""Generates assets/wordmark.json: the TRAVL wordmark as per-letter SVG paths from real Montserrat Bold
outlines, shaped with HarfBuzz (so kerning is correct, e.g. the A-V pair) plus +0.035em tracking.

Note: regenerating gives a visually identical wordmark (about 17 of 420,000 pixels differ, from anti-aliasing)
but not byte-identical JSON, because the contours are decomposed differently.

Why paths instead of live text: the wordmark is the first thing on the page, so it must look identical on
every device and not wait for a web font. Per-letter groups also let the page animate each letter.

    pip install fonttools brotli uharfbuzz
    npm i @fontsource/montserrat          # provides the font file (SIL Open Font License)
    python3 tools/make_wordmark.py node_modules/@fontsource/montserrat/files/montserrat-latin-700-normal.woff2
"""
import json, sys, tempfile, os
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

TEXT, TRACKING_EM = 'TRAVL', 0.035
src = sys.argv[1]
tt = TTFont(src); tt.flavor = None
tmp = os.path.join(tempfile.mkdtemp(), 'font.ttf'); tt.save(tmp)
gs, upm, order = tt.getGlyphSet(), tt['head'].unitsPerEm, tt.getGlyphOrder()

font = hb.Font(hb.Face(hb.Blob.from_file_path(tmp)))
buf = hb.Buffer(); buf.add_str(TEXT); buf.guess_segment_properties(); hb.shape(font, buf, {'kern': True})

x, items = 0, []
for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
    items.append((order[info.codepoint], x + pos.x_offset)); x += pos.x_advance + TRACKING_EM * upm

bp = BoundsPen(gs)
for name, gx in items: gs[name].draw(TransformPen(bp, (1, 0, 0, 1, gx, 0)))
xmin, ymin, xmax, ymax = bp.bounds

paths = []
for name, gx in items:
    sp = SVGPathPen(gs, ntos=lambda v: ('%.1f' % v).rstrip('0').rstrip('.'))
    gs[name].draw(TransformPen(sp, (1, 0, 0, -1, gx - xmin, ymax)))  # flip y into SVG space
    paths.append(sp.getCommands())

out = {'vb': f'0 0 {round(xmax - xmin)} {round(ymax - ymin)}', 'w': round(xmax - xmin), 'h': round(ymax - ymin), 'paths': paths}
json.dump(out, open('assets/wordmark.json', 'w'))
print('wrote assets/wordmark.json', out['vb'])
