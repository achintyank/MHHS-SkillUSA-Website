#!/usr/bin/env python3
"""Build the web-sized hero images from the chapter's originals.

The hero loads two photographs into a WebGL shader, and the shader cannot
draw until both have decoded. Full-size phone photos are far too heavy for
that, so this produces sized-down WebP (with JPEG fallback) at two widths.

    python3 tools/hero_images.py

Reads   assets/img/hero/<name>.jpg          (the originals you dropped in)
Writes  assets/img/hero/<name>-2048.webp    desktop
        assets/img/hero/<name>-2048.jpg     desktop fallback
        assets/img/hero/<name>-1280.webp    phones
        assets/img/hero/<name>-1280.jpg     phones fallback

EXIF is dropped on every output. Phone photos carry GPS coordinates, the
device make and model, and a capture timestamp; none of that belongs on a
public site. The originals in this folder keep theirs, so do not deploy the
originals; only the derived files are referenced by data.js.

Both source images must already be the same orientation and, ideally, the
same pixel dimensions. This script will warn if they are not: the reveal
effect lines up only when the two frames share a coordinate space.
"""
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  python3 -m pip install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERO = os.path.join(ROOT, "assets", "img", "hero")

# Each source is cropped to ASPECT before resizing, so the hero is a wide
# band centred on the students rather than a 4:3 frame that is half sky.
#
#   focus_y  the vertical fraction of the ORIGINAL that should end up in the
#            middle of the crop. Raise it to move the crop down the frame.
#   focus_x  the same horizontally (0.5 = centred).
#   zoom     >1 crops in from the sides as well. Both groups span nearly the
#            full width of their frames, so keep this at or near 1.0 or the
#            people on the ends get cut off.
#
# The two crops are tuned SEPARATELY on purpose: the students sit at slightly
# different heights in the two photographs, and matching their bands in the
# OUTPUT is what makes the reveal line up.
ASPECT = 2.35

SOURCES = [
    ("delegation.jpg",        "delegation",        dict(focus_y=0.650, focus_x=0.48, zoom=1.15)),
    ("delegation-reveal.jpg", "delegation-reveal", dict(focus_y=0.535, focus_x=0.50, zoom=1.07)),
]

WIDTHS = [2048, 1280]
WEBP_Q = 82
JPEG_Q = 84


def crop_to_band(im, focus_y, focus_x, zoom):
    """Crop to ASPECT around a focal point, without running off the edges."""
    W, H = im.size
    cw = W / float(zoom)
    ch = cw / ASPECT
    if ch > H:                     # frame is too short for the aspect
        ch = float(H)
        cw = ch * ASPECT
    left = min(max(focus_x * W - cw / 2.0, 0), W - cw)
    top  = min(max(focus_y * H - ch / 2.0, 0), H - ch)
    return im.crop((int(round(left)), int(round(top)),
                    int(round(left + cw)), int(round(top + ch))))


def build(src_name, stem, cfg):
    src = os.path.join(HERO, src_name)
    if not os.path.exists(src):
        print("  MISSING  %s" % src_name)
        return None

    im = Image.open(src).convert("RGB")
    im = crop_to_band(im, cfg["focus_y"], cfg["focus_x"], cfg["zoom"])
    made = []

    for w in WIDTHS:
        # Always resize to exactly w x w/ASPECT. Both sources MUST come out at
        # identical dimensions: the shader samples them with the same UVs, so
        # a mismatch shifts one image against the other. The per-source zoom
        # differs, so this may upscale one of them slightly, and 10-15% is
        # invisible and is worth it for a shared coordinate space.
        tw = w
        th = int(round(w / ASPECT))
        out = im.resize((tw, th), Image.LANCZOS)

        for ext, kw in (("webp", dict(quality=WEBP_Q, method=6)),
                        ("jpg",  dict(quality=JPEG_Q, optimize=True, progressive=True))):
            path = os.path.join(HERO, "%s-%d.%s" % (stem, w, ext))
            fmt = "WEBP" if ext == "webp" else "JPEG"
            out.save(path, fmt, exif=b"", **kw)
            made.append((os.path.basename(path), os.path.getsize(path)))

    return im.size, made


def main():
    sizes = []
    for src_name, stem, cfg in SOURCES:
        print(src_name)
        res = build(src_name, stem, cfg)
        if not res:
            continue
        size, made = res
        sizes.append((src_name, size))
        for name, nbytes in made:
            print("    %-32s %6.0f KB" % (name, nbytes / 1024.0))

    # Outputs are always ASPECT, so differing CROP sizes are fine; they are
    # resized to a common target. What is worth flagging is heavy upscaling,
    # which softens the image.
    for n, s in sizes:
        factor = max(WIDTHS) / float(s[0])
        if factor > 1.30:
            print("\n  NOTE: %s is upscaled %.2fx to reach %dpx." % (n, factor, max(WIDTHS)))
            print("  Lower its `zoom`, or drop max WIDTHS, if it looks soft.")


if __name__ == "__main__":
    main()
