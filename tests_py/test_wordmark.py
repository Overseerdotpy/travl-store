"""Tests for tools/make_wordmark.py and the assets/wordmark.json it produces.

The first group checks the committed JSON with no dependencies at all, so a hand edit or a bad regeneration
can't ship. The second group needs the font and runs the generator itself.
"""
import json
import re

import pytest

TOKEN = re.compile(r'[MLHVCSQTZ]|-?\d+(?:\.\d+)?')


def points(path: str):
    """Yields (x, y) for every point in an absolute SVG path, tracking H/V so both coordinates are always known."""
    cmd, nums, x, y = None, [], 0.0, 0.0

    def flush():
        nonlocal x, y
        if cmd in 'MLTCSQ':
            for i in range(0, len(nums), 2):
                x, y = nums[i], nums[i + 1]
                yield x, y
        elif cmd == 'H':
            for x in nums:
                yield x, y
        elif cmd == 'V':
            for y in nums:
                yield x, y

    for tok in TOKEN.findall(path):
        if tok.isalpha():
            if cmd:
                yield from flush()
            cmd, nums = tok, []
        else:
            nums.append(float(tok))
    if cmd:
        yield from flush()


def letter_box(path: str):
    xs, ys = zip(*points(path))
    return min(xs), min(ys), max(xs), max(ys)


# ---------------------------------------------------------------- the committed file (no dependencies)

def test_has_exactly_the_keys_the_page_reads(committed):
    assert set(committed) == {'vb', 'w', 'h', 'paths'}


def test_viewbox_matches_width_and_height(committed):
    assert committed['vb'] == f"0 0 {committed['w']} {committed['h']}"
    assert committed['w'] > committed['h'] > 0


def test_one_path_per_letter_of_travl(committed):
    assert len(committed['paths']) == len('TRAVL')


@pytest.mark.parametrize('i', range(5))
def test_each_path_is_well_formed(committed, i):
    p = committed['paths'][i]
    assert p.startswith('M') and p.endswith('Z')
    assert re.fullmatch(r'[MLHVCSQTZ0-9.\- ]+', p), 'only absolute commands and plain numbers'
    assert 'e' not in p.lower(), 'no exponent notation'


def test_every_point_stays_inside_the_viewbox(committed):
    w, h = committed['w'], committed['h']
    for p in committed['paths']:
        x0, y0, x1, y1 = letter_box(p)
        assert -1 <= x0 and x1 <= w + 1 and -1 <= y0 and y1 <= h + 1


def test_the_ink_touches_all_four_edges(committed):
    """The viewBox is cropped to the letters, with no stray margin the page would have to compensate for."""
    boxes = [letter_box(p) for p in committed['paths']]
    assert min(b[0] for b in boxes) == pytest.approx(0, abs=1)
    assert min(b[1] for b in boxes) == pytest.approx(0, abs=1)
    assert max(b[2] for b in boxes) == pytest.approx(committed['w'], abs=1)
    assert max(b[3] for b in boxes) == pytest.approx(committed['h'], abs=1)


def test_letters_run_left_to_right(committed):
    lefts = [letter_box(p)[0] for p in committed['paths']]
    assert lefts == sorted(lefts)


def test_numbers_have_at_most_one_decimal(committed):
    for p in committed['paths']:
        assert not re.search(r'\.\d\d', p)


# ---------------------------------------------------------------- number formatting

@pytest.mark.parametrize('value, expected', [
    (12.0, '12'), (12.5, '12.5'), (12.54, '12.5'), (12.56, '12.6'),
    (100.0, '100'), (0.0, '0'), (-0.04, '0'), (-3.25, '-3.2'), (700.0, '700'),
])
def test_fmt(value, expected):
    import make_wordmark
    assert make_wordmark.fmt(value) == expected


# ---------------------------------------------------------------- the generator (needs the font)

def test_regenerating_reproduces_the_committed_geometry(font, committed):
    out = __import__('make_wordmark').build_wordmark(font)
    assert (out['vb'], out['w'], out['h']) == (committed['vb'], committed['w'], committed['h'])
    for new, old in zip(out['paths'], committed['paths']):
        assert letter_box(new) == pytest.approx(letter_box(old), abs=1)


def test_kerning_tightens_the_a_v_pair(font):
    import make_wordmark as m
    kerned = {g.name: g.x for g in m.shape(font, 'AV', 0, kern=True)}
    plain = {g.name: g.x for g in m.shape(font, 'AV', 0, kern=False)}
    assert kerned['V'] < plain['V'], 'HarfBuzz applied no kerning between A and V'


def test_tracking_adds_the_same_space_after_every_letter(font):
    import make_wordmark as m
    tight = m.shape(font, 'TRAVL', 0)
    tracked = m.shape(font, 'TRAVL', 0.035)
    step = 0.035 * font.upm
    for i, (a, b) in enumerate(zip(tight, tracked)):
        assert b.x - a.x == pytest.approx(i * step)


def test_wider_tracking_makes_a_wider_wordmark(font):
    import make_wordmark as m
    assert m.build_wordmark(font, tracking_em=0.1)['w'] > m.build_wordmark(font, tracking_em=0)['w']


def test_y_axis_is_flipped_into_svg_space(font):
    """In the font, y points up; in SVG it points down. The T's crossbar must end up at the top (small y)."""
    import make_wordmark as m
    t = m.build_wordmark(font, text='T', tracking_em=0)
    x0, y0, x1, y1 = letter_box(t['paths'][0])
    top_points = [x for x, y in points(t['paths'][0]) if y < 5]
    assert top_points and max(top_points) - min(top_points) == pytest.approx(x1 - x0, abs=2), 'crossbar not at the top'


def test_text_with_no_ink_is_rejected(font):
    import make_wordmark as m
    with pytest.raises(ValueError):
        m.build_wordmark(font, text=' ')


def test_cli_writes_the_json(font_path, tmp_path, capsys):
    import make_wordmark as m
    out = tmp_path / 'nested' / 'wordmark.json'
    assert m.main([str(font_path), '--out', str(out)]) == 0
    data = json.loads(out.read_text())
    assert len(data['paths']) == 5
    assert data['vb'] in capsys.readouterr().out
