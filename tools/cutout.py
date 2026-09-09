#!/usr/bin/env python3
"""Lift subjects out of photographs, leaving a transparent background.

    python3 tools/cutout.py                 # every photo in incoming/
    python3 tools/cutout.py president.jpg   # just one

Writes <name>-cut.png beside the original in assets/img/incoming/, so the
originals stay untouched and you can compare before committing to anything.

This is the same subject lift macOS uses for Preview's "Remove Background",
run through Vision rather than by hand. It handles hair edges properly and
keeps every person in a group shot, which is the part naive chroma-key and
most web tools get wrong.

Nothing to install: the helper is a small Swift file compiled on first run
and cached in tools/.build/. Needs macOS 14 or newer.

The output is deliberately NOT wired into the site. Look at the PNGs first;
cutouts only read well when the lighting is consistent across the set.
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INBOX = os.path.join(ROOT, "assets", "img", "incoming")
SRC = os.path.join(ROOT, "tools", "cutout.swift")
BUILD = os.path.join(ROOT, "tools", ".build")
BIN = os.path.join(BUILD, "cutout")

EXTS = (".jpg", ".jpeg", ".png", ".heic")


def helper():
    """Compile the Swift helper if it is missing or older than its source."""
    if os.path.exists(BIN) and os.path.getmtime(BIN) >= os.path.getmtime(SRC):
        return BIN
    os.makedirs(BUILD, exist_ok=True)
    print("compiling the subject-lift helper (first run only)...")
    r = subprocess.run(["swiftc", "-O", SRC, "-o", BIN], capture_output=True, text=True)
    if r.returncode:
        sys.exit("swiftc failed:\n" + r.stderr)
    return BIN


def main():
    if sys.platform != "darwin":
        sys.exit("This uses the macOS Vision framework and only runs on a Mac.")

    names = sys.argv[1:]
    if not names:
        names = [f for f in sorted(os.listdir(INBOX))
                 if f.lower().endswith(EXTS)
                 and not f.startswith(".")
                 and not f.endswith("-cut.png")]
    if not names:
        sys.exit("Nothing in assets/img/incoming/ to work on.")

    exe = helper()
    ok = 0
    for fn in names:
        src = fn if os.path.isabs(fn) else os.path.join(INBOX, fn)
        dst = os.path.splitext(src)[0] + "-cut.png"
        r = subprocess.run([exe, src, dst], capture_output=True, text=True)
        if r.returncode:
            print("  SKIP  %-28s %s" % (os.path.basename(fn), r.stderr.strip()))
        else:
            print("  ok    %-28s %s" % (os.path.basename(fn), r.stdout.strip()))
            ok += 1
    print("\n%d cut out. Open the -cut.png files and see what you think." % ok)


if __name__ == "__main__":
    main()
