#!/usr/bin/env python3
"""Local preview server for the MHHS SkillsUSA site.

    python3 tools/serve.py [port]      # default 8123
    open http://localhost:8123

The site must be served over http:// rather than opened from a file:// path,
so that the gallery and the intro behave the way they will in production.
"""
import http.server
import os
import socketserver
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8123


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print("serving %s at http://localhost:%d" % (ROOT, PORT))
        httpd.serve_forever()
