#!/usr/bin/env python3
"""Import chapter photographs into the site.

Drop photos into assets/img/incoming/ named after the slot they fill, then:

    python3 tools/photos.py

For each one this produces the sizes the site needs, strips EXIF, puts the
files where they belong, and updates the `real` list in data.js so the site
starts using them instead of the generated plates. Nothing else to edit.

    incoming/slsc-medal-stage.jpg
        -> assets/img/gallery/slsc-medal-stage.jpg        (1500px long edge)
        -> assets/img/gallery/thumb/slsc-medal-stage.jpg  (620px)

    incoming/president.jpg
        -> assets/img/people/president.jpg                (780x1040, 3:4 crop)

NAMING IS THE WHOLE INTERFACE. A portrait can be named three ways:

    president.jpg                the seat
    arman-khan-president.jpg     the person AND the seat  <- best
    Arman_Khan.jpg               the person, once their name is in data.js

The middle form is worth preferring: it says who and which seat in one
string, so the file needs no context to be filed correctly, AND this script
writes the name straight into data.js for you. Drop nine files, run once,
and the officer page has nine real names on it.

Underscores, hyphens and spaces are all read the same and case is ignored,
so Arman Khan-President.jpg and ARMAN_KHAN_PRESIDENT.JPG are one name.
Gallery photos are always named by slot.

Run with --list to print every accepted name. An unrecognised one is reported
and skipped rather than guessed at, because a wrong guess puts a photograph
under someone else's caption.

EXIF is stripped from every output. Phone photos carry GPS coordinates, the
device make and model, and a capture timestamp; none of that belongs on a
public site. Originals in incoming/ keep theirs; that folder is git-ignored
so they are never committed.
"""
import os
import re
import subprocess
import sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow is required:  python3 -m pip install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "assets", "js", "data.js")
INBOX = os.path.join(ROOT, "assets", "img", "incoming")

# Per-slug crop, for photos whose subject does not suit the box they land in.
#   (left, top, right, bottom) as fractions of the ORIGINAL, applied first.
# A portrait photo in a wide letterbox row loses most of its height, so cropping
# to the band that actually matters beats letting object-fit choose.
CROPS = {
    # Build session: the TV with the code and the seated programmer.
    # The standing figure spans nearly the full height and cannot fit a strip
    # this wide; see the note in the commit.
    "chapter-build-night": (0.00, 0.30, 1.00, 0.95),
    # Officer team against a wall. KEEP the empty band above their heads:
    # the headline sits in it. Trimming that wall is what pushed the type down
    # onto the back row's faces. Only the sides come in.
    "chapter-officer-team": (0.03, 0.00, 0.99, 1.00),
    # Naman at the camera. Face detection finds nothing here: he is in
    # profile with the eyepiece over half his face, in a hall full of other
    # people. Framed by hand to head-and-torso instead.
    "director-of-events-2": (0.20, 0.09, 0.70, 0.57),
}

GALLERY_LONG = 1500
THUMB_LONG = 620
# Portraits are 3:4 rather than square. The officer roster reveals a portrait
# inside a wide row, and a square source cropped to that band is mostly
# shoulders; a tall frame keeps a face in it. Card layouts crop this to their
# own box with object-fit, so one shape serves both.
PERSON_W, PERSON_H = 780, 1040
QUALITY = 86

EXTS = (".jpg", ".jpeg", ".png", ".heic", ".webp")


# --------------------------------------------------------------- portraits
# Where a face should sit in a finished portrait: this wide as a share of the
# frame, and this far down it. Chosen so a head-and-shoulders crop and a
# full-body snapshot come out looking like the same set of photographs.
FACE_W, FACE_Y = 0.30, 0.36

# Per-person override of FACE_W, for a photo that wants a wider frame than
# the default. Smaller number = smaller face = more of the scene around it.
FACE_W_BY_SLUG = {
    "vice-president-1":     0.23,   # Anjali: the field behind her is worth keeping
    "director-of-events-3": 0.23,   # Nandan
    "competition-manager":  0.23,   # Sadana
}
FACE_BIN = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".build", "face")
FACE_SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "face.swift")


def face_box(path):
    """(x, y, w, h) of the largest face as fractions, or None.

    Uses the macOS Vision face detector through a small Swift helper, the same
    build path as tools/cutout.py. Without it a portrait is centre-cropped,
    which is fine for a head-and-shoulders shot and useless for someone
    standing in a field."""
    if sys.platform != "darwin":
        return None
    try:
        if (not os.path.exists(FACE_BIN)
                or os.path.getmtime(FACE_BIN) < os.path.getmtime(FACE_SRC)):
            os.makedirs(os.path.dirname(FACE_BIN), exist_ok=True)
            if subprocess.run(["swiftc", "-O", FACE_SRC, "-o", FACE_BIN],
                              capture_output=True).returncode:
                return None
        r = subprocess.run([FACE_BIN, path], capture_output=True, text=True)
        if r.returncode:
            return None
        x, y, w, h, _n = r.stdout.split()
        return float(x), float(y), float(w), float(h)
    except Exception:
        return None


def face_crop(im, box, aspect, face_w=FACE_W):
    """Crop `im` to `aspect` (w/h) around a face, keeping it inside the frame."""
    W, H = im.size
    fx, fy, fw, fh = box
    cw = min(W, (fw * W) / face_w)
    ch = cw / aspect
    if ch > H:                          # not tall enough: take what there is
        ch = H
        cw = min(W, ch * aspect)
    cx = (fx + fw / 2) * W
    cy = (fy + fh / 2) * H - (FACE_Y - 0.5) * ch
    left = min(max(cx - cw / 2, 0), W - cw)
    top = min(max(cy - ch / 2, 0), H - ch)
    return im.crop((int(left), int(top), int(left + cw), int(top + ch)))


# ------------------------------------------------------------------ slots
def key(text):
    """Fold a filename or a person's name to one comparable form.

    Underscores, hyphens and spaces are the same separator, and case is
    ignored, so the naming convention someone actually uses on their phone
    does not have to match the one in data.js."""
    return re.sub(r"[^a-z0-9]+", "-", text.strip().lower()).strip("-")


def bare(text):
    """Like key(), but with the separators gone entirely.

    People write a seat as VicePresident, vice-president, Vice President or
    vice_president depending on the day. Comparing with every separator
    removed makes all of those one string."""
    return re.sub(r"[^a-z0-9]+", "", text.lower())


def slots():
    """Read the slot names straight out of data.js so the two cannot drift."""
    src = open(DATA, encoding="utf-8").read()

    blk = re.search(r"const gallery = \[(.*?)\]\.map", src, re.S)
    gallery = re.findall(r'\["([a-z0-9-]+)",\s*"([^"]*)"', blk.group(1)) if blk else []

    # slug first, then whatever `name:` follows it in the same entry
    people, seen = [], set()
    for m in re.finditer(r'slug:\s*"([a-z0-9-]+)"(.*?)(?=slug:\s*"|$)', src, re.S):
        slug = m.group(1)
        if slug in seen:
            continue
        seen.add(slug)
        nm = re.search(r'name:\s*"([^"]*)"', m.group(2))
        name = nm.group(1) if nm else ""
        people.append((slug, "" if name == "TBD" else name))
    return gallery, people


def person_name(_stem, seat_parts):
    """The words left after the seat has been taken off the end.

    Built from the ORIGINAL filename rather than the folded key, so an
    apostrophe or an accent survives; folding is only ever used for matching.
    `seat_parts` is how many trailing words the seat name ate.

    Only capitalises a word that arrived entirely lower case, so a filename
    written McDonald or O'Brien keeps what it was given. Anything this gets
    wrong is one edit in data.js, and the script prints what it set."""
    return " ".join(w.capitalize() if w.islower() else w for w in seat_parts)


def update_names(pairs):
    """Fill in `name:` in data.js for each slug whose file carried a name."""
    src = open(DATA, encoding="utf-8").read()
    for slug, who in pairs:
        # the entry runs from its slug to the next one, and name is inside it
        pat = r'(slug:\s*"%s"\s*,\s*\n\s*name:\s*")[^"]*(")' % re.escape(slug)
        src = re.sub(pat, lambda m: m.group(1) + who + m.group(2), src, count=1)
    open(DATA, "w", encoding="utf-8").write(src)


def print_slots():
    gallery, people = slots()
    print("\nGALLERY  (drop as incoming/<name>.jpg)\n")
    for slug, cap in gallery:
        print("  %-30s %s" % (slug, cap[:70]))
    print("\nPEOPLE   (portraits, 3:4 or taller, drop as incoming/<name>.jpg)\n")
    for slug, name in people:
        if name:
            print("  %-26s or  %s" % (slug, name))
        else:
            print("  %-26s (name still TBD in data.js)" % slug)
    print("\nEither name works. Fill in `name:` in data.js and the person's own")
    print("name starts being accepted too, spelt however you like.\n")


# ------------------------------------------------------------- conversion
def save(im, path, long_edge=None, box=None):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im = im.convert("RGB")
    if box:
        # centering biased above middle so the crop keeps the head, not the chin
        im = ImageOps.fit(im, box, Image.LANCZOS, centering=(0.5, 0.38))
    elif long_edge and max(im.size) > long_edge:
        scale = long_edge / float(max(im.size))
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    # exif=b"" is what drops GPS, device and timestamp
    im.save(path, "JPEG", quality=QUALITY, optimize=True, progressive=True, exif=b"")
    return os.path.getsize(path)


def main():
    if "--list" in sys.argv:
        print_slots()
        return

    gallery, people = slots()
    gallery_slugs = {s for s, _ in gallery}

    # every accepted portrait filename -> the slug it is stored under
    people_by_key = {}
    for slug, name in people:
        people_by_key[bare(slug)] = slug
        if name:
            people_by_key[bare(name)] = slug

    # Seats that come in threes are written without their number on a photo,
    # because nobody thinks of themselves as Director of Events 2. Group them
    # by their base name and hand out the numbers here instead.
    families = {}
    for slug, _ in people:
        base = re.sub(r"-\d+$", "", slug)
        families.setdefault(bare(base), []).append(slug)

    # Titles a seat picks up in the wild: Social Media -> SocialMediaManagers,
    # Secretary -> SecretaryOfficer. Stripped before matching.
    TAILS = ("", "s", "manager", "managers", "officer", "officers", "lead", "leads")

    # longest first, so "SamLeeVicePresident" resolves to vice-president
    # rather than stopping at the "president" sitting inside it
    bases = sorted(families, key=len, reverse=True)
    taken = set()

    def resolve(stem):
        """(slug, name, error) for a portrait filename."""
        if bare(stem) in people_by_key:
            return people_by_key[bare(stem)], None, None

        words = [w for w in re.split(r"[-_\s]+", stem) if w]
        for base in bases:
            # walk in from the end until the tail spells this seat out
            for take in range(1, len(words) + 1):
                tail = bare("".join(words[-take:]))
                if not any(tail == base + t for t in TAILS):
                    continue
                free = [sl for sl in families[base] if sl not in taken]
                if not free:
                    return None, None, ("every %s seat is already claimed by "
                                        "another file" % base)
                slug = free[0]
                taken.add(slug)
                return slug, person_name(stem, words[:-take]) or None, None
        return None, None, None

    os.makedirs(INBOX, exist_ok=True)
    # -cut.png files are tools/cutout.py's working output, not slot photos
    files = [f for f in sorted(os.listdir(INBOX))
             if f.lower().endswith(EXTS)
             and not f.startswith(".")
             and not f.lower().endswith("-cut.png")]

    if not files:
        print("Nothing in assets/img/incoming/")
        print("Drop photos there named after a slot, then run this again.")
        print("Run  python3 tools/photos.py --list  to see the slot names.")
        return

    done, unknown, named, clash = [], [], [], []
    for fn in files:
        stem = os.path.splitext(fn)[0]
        # a portrait may carry the person's name; it is always stored by slug
        slug, who, err = resolve(stem)
        if err:
            clash.append((fn, err))
            continue
        if slug is None:
            slug = stem
        src = os.path.join(INBOX, fn)
        try:
            im = Image.open(src)
            im = ImageOps.exif_transpose(im)      # honour rotation before stripping it
        except Exception as e:
            print("  SKIP  %-28s could not read (%s)" % (fn, e))
            continue

        crop = CROPS.get(slug)
        if crop:
            W, H = im.size
            im = im.crop((int(crop[0] * W), int(crop[1] * H),
                          int(crop[2] * W), int(crop[3] * H)))

        if slug in {sl for sl, _ in people}:
            note = ""
            if not crop:                       # an explicit CROPS entry wins
                fb = face_box(src)
                if fb:
                    im = face_crop(im, fb, PERSON_W / float(PERSON_H),
                                   FACE_W_BY_SLUG.get(slug, FACE_W))
                    if fb[2] < 0.10:
                        note = "  (face was small in the original)"
                else:
                    note = "  (NO FACE FOUND, centre crop)"
            a = save(im, os.path.join(ROOT, "assets", "img", "people", slug + ".jpg"),
                     box=(PERSON_W, PERSON_H))
            print("  ok    %-28s portrait %4.0fKB  -> %s%s" % (fn, a / 1024, slug, note))
            done.append(slug)
            if who:
                named.append((slug, who))
        elif slug in gallery_slugs:
            a = save(im, os.path.join(ROOT, "assets", "img", "gallery", slug + ".jpg"),
                     long_edge=GALLERY_LONG)
            b = save(im, os.path.join(ROOT, "assets", "img", "gallery", "thumb", slug + ".jpg"),
                     long_edge=THUMB_LONG)
            print("  ok    %-28s gallery %4.0fKB + thumb %3.0fKB" % (fn, a / 1024, b / 1024))
            done.append(slug)
        else:
            unknown.append(fn)

    for fn in unknown:
        print("  ??    %-28s no slot with that name; renamed? see --list" % fn)
    for fn, why in clash:
        print("  !!    %-28s %s" % (fn, why))

    if named:
        update_names(named)
        print("")
        for slug, who in named:
            print("  name  %-28s %s" % (slug, who))
        print("  Written into data.js. Fix the spelling there if a name needs it.")

    if done:
        n = update_real(done)
        print("\n%d imported. data.js `real` now lists %d photograph%s."
              % (len(done), n, "" if n == 1 else "s"))
        print("The site uses them immediately; no other edit needed.")
        print("Captions still describe a reserved slot; rewrite those in data.js.")
    if unknown or clash:
        n = len(unknown) + len(clash)
        print("\n%d file%s skipped." % (n, "" if n == 1 else "s"))
    if clash:
        print("Two photos claimed the same seat. Nothing was overwritten and no")
        print("guess was made: rename one of them and run this again.")


def update_real(new_slugs):
    """Rewrite media.real to every slug that now has a real .jpg on disk."""
    src = open(DATA, encoding="utf-8").read()

    have = set()
    for sub, folder in (("gallery", ("assets", "img", "gallery")),
                        ("people", ("assets", "img", "people"))):
        d = os.path.join(ROOT, *folder)
        if os.path.isdir(d):
            for f in os.listdir(d):
                if f.endswith(".jpg"):
                    have.add(os.path.splitext(f)[0])
    have |= set(new_slugs)

    listing = ", ".join('"%s"' % s for s in sorted(have))
    src = re.sub(r"real:\s*\[[^\]]*\]", "real: [" + listing + "]", src, count=1)
    open(DATA, "w", encoding="utf-8").write(src)
    return len(have)


if __name__ == "__main__":
    main()
