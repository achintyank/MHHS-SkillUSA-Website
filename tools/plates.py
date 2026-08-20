#!/usr/bin/env python3
"""Generate the placeholder plates for MHHS SkillsUSA.

The chapter has no photographs yet, so every image slot on the site is filled
by a *plate* — a generated graphic in the chapter palette. They are meant to
look designed rather than missing: geometry drawn from the SkillsUSA emblem,
in SkillsUSA red, navy and gold.

Slugs are read straight out of assets/js/data.js, so this script and the site
can never disagree about which images exist.

    python3 tools/plates.py

Writes:
    assets/img/gallery/<slug>.svg        full size (3:2)
    assets/img/gallery/thumb/<slug>.svg  same artwork, thumbnail slot
    assets/img/people/<slug>.svg         square monogram plate
    assets/img/brand/wordmark.svg        favicon / share image

Replacing a plate with a real photograph: drop <slug>.jpg into the same
folders and add the slug to `media.real` in data.js. Nothing here needs
to change.
"""
import hashlib
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "assets", "js", "data.js")

# ------------------------------------------------------------------ palette
INK      = "#04091A"
NAVY     = "#071633"
NAVY_2   = "#0E2450"
NAVY_3   = "#1B3568"
RED      = "#C8102E"
RED_2    = "#E3213E"
GOLD     = "#FFC72C"
GOLD_2   = "#FFE199"
STEEL    = "#00205B"
STEEL_LF = "#7CA6E8"
PAPER    = "#F6F3EE"

# Ground / accent pairings a plate can be built from. Keeping the grounds
# dark keeps the plates sitting quietly behind white type everywhere they
# are used.
SCHEMES = [
    (NAVY,   NAVY_2, GOLD,     GOLD_2),
    (NAVY,   NAVY_3, RED_2,    RED),
    (INK,    NAVY_2, GOLD,     RED_2),
    (STEEL,  NAVY_3, GOLD_2,   GOLD),
    (NAVY_2, NAVY_3, STEEL_LF, GOLD),
    (INK,    STEEL,  RED_2,    GOLD),
]

W, H = 1500, 1000          # gallery plate
PW = 760                   # people plate


def seed(slug):
    """A stable pseudo-random stream for one slug."""
    digest = hashlib.sha256(slug.encode("utf-8")).digest()
    return [b for b in digest]


class Rand:
    def __init__(self, slug):
        self.b = seed(slug)
        self.i = 0

    def next(self):
        v = self.b[self.i % len(self.b)]
        self.i += 1
        return v

    def pick(self, items):
        return items[self.next() % len(items)]

    def between(self, lo, hi):
        return lo + (self.next() / 255.0) * (hi - lo)


# ------------------------------------------------------------ compositions
def chevrons(r, g1, g2, a1, a2):
    """Ranks of chevrons marching across the plate — the emblem's stroke."""
    out = []
    cols = int(r.between(3, 6))
    rows = int(r.between(2, 4))
    cw, ch = W / float(cols), H / float(rows)
    sw = min(cw, ch) * r.between(0.13, 0.22)
    for j in range(rows):
        for i in range(cols + 1):
            x = i * cw - cw * 0.25 + (cw * 0.5 if j % 2 else 0)
            y = j * ch
            col = [a1, a2, g2][(i + j) % 3]
            op = [0.95, 0.72, 0.34][(i + j) % 3]
            out.append(
                '<polyline points="{x0:.0f},{y0:.0f} {x1:.0f},{y1:.0f} {x0:.0f},{y2:.0f}" '
                'fill="none" stroke="{c}" stroke-width="{sw:.0f}" stroke-linecap="round" '
                'stroke-linejoin="round" opacity="{o:.2f}"/>'.format(
                    x0=x, y0=y + ch * 0.18, x1=x + cw * 0.44, y1=y + ch * 0.5,
                    y2=y + ch * 0.82, c=col, sw=sw, o=op))
    return "".join(out)


def orbits(r, g1, g2, a1, a2):
    """Concentric arcs — the orbital circles that ring the emblem's torch."""
    out = []
    cx, cy = W * r.between(0.34, 0.62), H * r.between(0.42, 0.62)
    n = int(r.between(5, 9))
    for i in range(n):
        rad = (i + 1) * (H * 0.085)
        col = a1 if i % 2 == 0 else a2
        out.append(
            '<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r:.0f}" fill="none" '
            'stroke="{c}" stroke-width="{w:.1f}" opacity="{o:.2f}"/>'.format(
                cx=cx, cy=cy, r=rad, c=col,
                w=r.between(1.5, 5.5), o=r.between(0.22, 0.75)))
    out.append('<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r:.0f}" fill="{c}" '
               'opacity="0.92"/>'.format(cx=cx, cy=cy, r=H * 0.045, c=a1))
    return "".join(out)


def bands(r, g1, g2, a1, a2):
    """Angled colour bands, red-white-blue-gold read as stripes."""
    out = []
    n = int(r.between(6, 11))
    skew = r.between(-0.42, 0.42)
    step = W * 1.6 / n
    for i in range(n):
        x = -W * 0.3 + i * step
        w = step * r.between(0.24, 0.72)
        col = r.pick([a1, a2, g2, g2, a1])
        out.append(
            '<path d="M{x:.0f} 0 L{x2:.0f} 0 L{x3:.0f} {h} L{x4:.0f} {h} Z" '
            'fill="{c}" opacity="{o:.2f}"/>'.format(
                x=x, x2=x + w, x3=x + w + skew * H, x4=x + skew * H,
                h=H, c=col, o=r.between(0.32, 0.92)))
    return "".join(out)


def blueprint(r, g1, g2, a1, a2):
    """A drafting grid with cells called out — technical drawing."""
    out = []
    cols, rows = int(r.between(6, 10)), int(r.between(4, 7))
    cw, ch = W / float(cols), H / float(rows)
    for i in range(1, cols):
        out.append('<line x1="{x:.0f}" y1="0" x2="{x:.0f}" y2="{h}" stroke="{c}" '
                   'stroke-width="1.5" opacity="0.55"/>'.format(x=i * cw, h=H, c=a2))
    for j in range(1, rows):
        out.append('<line x1="0" y1="{y:.0f}" x2="{w}" y2="{y:.0f}" stroke="{c}" '
                   'stroke-width="1.5" opacity="0.55"/>'.format(y=j * ch, w=W, c=a2))
    # a run of filled cells, then a frame around a larger region
    ci, cj = int(r.between(0, cols - 3)), int(r.between(0, rows - 2))
    for k in range(int(r.between(2, 5))):
        out.append('<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" '
                   'fill="{c}" opacity="{o:.2f}"/>'.format(
                       x=(ci + k) % cols * cw, y=(cj + k) % rows * ch, w=cw, h=ch,
                       c=a1 if k % 2 == 0 else a2, o=0.55 + 0.35 * (k % 2 == 0)))
    out.append('<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" '
               'fill="none" stroke="{c}" stroke-width="5" opacity="0.85"/>'.format(
                   x=ci * cw, y=cj * ch, w=cw * min(3, cols - ci),
                   h=ch * min(2, rows - cj), c=a1))
    return "".join(out)


def rays(r, g1, g2, a1, a2):
    """A torch's light — rays fanning from a point off the lower edge."""
    out = []
    cx, cy = W * r.between(0.20, 0.80), H * r.between(1.02, 1.25)
    n = int(r.between(11, 19))
    for i in range(n):
        ang = -3.14159 * (0.10 + 0.80 * i / float(n - 1))
        import math
        x2 = cx + math.cos(ang) * W * 1.5
        y2 = cy + math.sin(ang) * W * 1.5
        out.append('<line x1="{cx:.0f}" y1="{cy:.0f}" x2="{x2:.0f}" y2="{y2:.0f}" '
                   'stroke="{c}" stroke-width="{w:.1f}" opacity="{o:.2f}"/>'.format(
                       cx=cx, cy=cy, x2=x2, y2=y2,
                       c=a1 if i % 3 else a2,
                       w=r.between(3, 18), o=r.between(0.22, 0.70)))
    return "".join(out)


def stack(r, g1, g2, a1, a2):
    """Offset plates — material stacked on a bench."""
    out = []
    n = int(r.between(4, 7))
    for i in range(n):
        w = W * r.between(0.30, 0.62)
        h = H * r.between(0.12, 0.26)
        x = W * r.between(0.02, 0.50)
        y = H * (0.10 + i * (0.78 / n))
        col = r.pick([a1, a2, g2])
        out.append('<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" '
                   'rx="2" fill="{c}" opacity="{o:.2f}"/>'.format(
                       x=x, y=y, w=w, h=h, c=col, o=r.between(0.42, 0.95)))
    return "".join(out)


def halftone(r, g1, g2, a1, a2):
    """A dot field thinning across the plate."""
    out = []
    cols, rows = 22, 15
    for j in range(rows):
        for i in range(cols):
            t = (i / float(cols - 1)) * 0.6 + (j / float(rows - 1)) * 0.4
            rad = max(0.0, (1.0 - t) * (W / cols) * 0.42)
            if rad < 0.6:
                continue
            out.append('<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.1f}" fill="{c}" '
                       'opacity="{o:.2f}"/>'.format(
                           x=(i + 0.5) * W / cols, y=(j + 0.5) * H / rows, r=rad,
                           c=a1 if (i + j) % 4 else a2, o=0.38 + (1 - t) * 0.58))
    return "".join(out)


COMPOSITIONS = [chevrons, orbits, bands, blueprint, rays, stack, halftone]


def plate(slug, w=W, h=H):
    r = Rand(slug)
    g1, g2, a1, a2 = r.pick(SCHEMES)
    comp = r.pick(COMPOSITIONS)
    angle = r.between(-8, 8)

    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        'width="{w}" height="{h}" role="img">'
        '<defs>'
        '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="{g1}"/>'
        '<stop offset="1" stop-color="{g2}"/>'
        '</linearGradient>'
        '<radialGradient id="v" cx="0.5" cy="0.45" r="0.78">'
        '<stop offset="0.55" stop-color="#000" stop-opacity="0"/>'
        '<stop offset="1" stop-color="#000" stop-opacity="0.45"/>'
        '</radialGradient>'
        '<clipPath id="c"><rect width="{w}" height="{h}"/></clipPath>'
        '</defs>'
        '<rect width="{w}" height="{h}" fill="url(#g)"/>'
        '<g clip-path="url(#c)">'
        '<g transform="rotate({a:.1f} {cx} {cy})">{art}</g>'
        '</g>'
        '<rect width="{w}" height="{h}" fill="url(#v)"/>'
        '</svg>'
    ).format(w=w, h=h, g1=g1, g2=g2, a=angle, cx=w // 2, cy=h // 2,
             art=comp(r, g1, g2, a1, a2))


def initials(slug):
    parts = [p for p in re.split(r"[-_]+", slug) if p and not p.isdigit()]
    if not parts:
        return "SU"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[1][0]).upper()


def person_plate(slug):
    """A monogram plate for a roster portrait that does not exist yet."""
    r = Rand(slug + "|person")
    g1, g2, a1, _a2 = r.pick(SCHEMES)
    mono = initials(slug)
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {s} {s}" '
        'width="{s}" height="{s}" role="img">'
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="{g1}"/><stop offset="1" stop-color="{g2}"/>'
        '</linearGradient></defs>'
        '<rect width="{s}" height="{s}" fill="url(#g)"/>'
        '<path d="M0 {b:.0f} L{s} {b:.0f} L{s} {s} L0 {s} Z" fill="{a}" opacity="0.10"/>'
        '<path d="M{c1:.0f} {t:.0f} L{c2:.0f} {m:.0f} L{c1:.0f} {bo:.0f}" fill="none" '
        'stroke="{a}" stroke-width="{sw:.0f}" stroke-linecap="round" '
        'stroke-linejoin="round" opacity="0.30"/>'
        '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" '
        'font-family="Newsreader, Iowan Old Style, Georgia, serif" '
        'font-size="{fs:.0f}" fill="{a}" opacity="0.95" '
        'letter-spacing="{ls:.0f}">{mono}</text>'
        '<rect x="0" y="{r:.0f}" width="{s}" height="{rh:.0f}" fill="{a}" opacity="0.85"/>'
        '</svg>'
    ).format(s=PW, g1=g1, g2=g2, a=a1, b=PW * 0.62,
             c1=PW * 0.70, c2=PW * 0.84, t=PW * 0.14, m=PW * 0.30, bo=PW * 0.46,
             sw=PW * 0.035, fs=PW * 0.30, ls=PW * 0.01, mono=mono,
             r=PW * 0.955, rh=PW * 0.045)


def wordmark():
    """Small square mark used as the favicon and share image."""
    s = 512
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {s} {s}" '
        'width="{s}" height="{s}" role="img">'
        '<rect width="{s}" height="{s}" fill="{navy}"/>'
        '<path d="M{x1} {y1} L{x2} {ym} L{x1} {y2}" fill="none" stroke="{red}" '
        'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'
        '<path d="M{x3} {y1} L{x4} {ym} L{x3} {y2}" fill="none" stroke="{gold}" '
        'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'
        '</svg>'
    ).format(s=s, navy=NAVY, red=RED_2, gold=GOLD,
             x1=int(s * 0.20), x2=int(s * 0.44), x3=int(s * 0.50), x4=int(s * 0.74),
             y1=int(s * 0.26), ym=int(s * 0.50), y2=int(s * 0.74), sw=int(s * 0.085))


# ------------------------------------------------------------------ driver
def slugs_from_data():
    """Read the gallery and roster slugs out of data.js."""
    src = open(DATA, encoding="utf-8").read()

    block = re.search(r"const gallery = \[(.*?)\]\.map", src, re.S)
    gallery = re.findall(r'\["([a-z0-9-]+)"', block.group(1)) if block else []

    people = re.findall(r'slug:\s*"([a-z0-9-]+)"', src)

    # de-duplicate, keep order
    def uniq(xs):
        seen, out = set(), []
        for x in xs:
            if x not in seen:
                seen.add(x)
                out.append(x)
        return out

    return uniq(gallery), uniq(people)


def write(path, body):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(body)


def main():
    gallery, people = slugs_from_data()

    for slug in gallery:
        svg = plate(slug)
        write(os.path.join(ROOT, "assets", "img", "gallery", slug + ".svg"), svg)
        write(os.path.join(ROOT, "assets", "img", "gallery", "thumb", slug + ".svg"), svg)

    for slug in people:
        write(os.path.join(ROOT, "assets", "img", "people", slug + ".svg"),
              person_plate(slug))

    write(os.path.join(ROOT, "assets", "img", "brand", "wordmark.svg"), wordmark())

    print("plates: {} gallery (x2 sizes), {} people, 1 wordmark".format(
        len(gallery), len(people)))


if __name__ == "__main__":
    main()
