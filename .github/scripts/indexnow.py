#!/usr/bin/env python3
"""IndexNow submission for heightenedsenses.net (standard library only).

Modes:
  indexnow.py changed BASE_SHA HEAD_SHA   submit pages changed between two commits
  indexnow.py urls URL [URL ...]          submit specific URLs
  indexnow.py sitemap                     submit every URL in sitemap.xml

A page counts as changed when an .html file was added, modified, renamed, or
deleted, and the change is more than whitespace. Added or modified pages are
submitted only if they are public and self-canonical (canonical tag points to
their own URL, no noindex). Deleted .html and .pdf URLs are always submitted
so engines recrawl them and see the 404 or redirect.

Set DRY_RUN=1 to print what would be sent without sending it.
"""
import json, os, re, subprocess, sys, urllib.request, urllib.error

HOST = "heightenedsenses.net"
SITE = "https://" + HOST
KEY = "1d47dcf4bca3b631f0587304780a0610"
KEY_LOCATION = f"{SITE}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"
SKIP_FILES = {"404.html"}
SKIP_PREFIXES = ("google",)  # search-console verification files


def git(*args):
    return subprocess.run(["git", *args], check=True, capture_output=True, text=True).stdout


def path_to_url(path):
    if path == "index.html":
        return SITE + "/"
    if path.endswith("/index.html"):
        return f"{SITE}/{path[:-len('index.html')]}"
    return f"{SITE}/{path}"


def is_public_canonical(path):
    try:
        html = open(path, encoding="utf-8").read()
    except OSError:
        return False
    if re.search(r'<meta[^>]+name=["\']robots["\'][^>]+noindex', html, re.I):
        return False
    m = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)', html, re.I)
    return bool(m) and m.group(1).rstrip("/") == path_to_url(path).rstrip("/")


def material(base, head, path):
    """True when the file changed beyond whitespace and blank lines."""
    r = subprocess.run(["git", "diff", "--quiet", "-w", "--ignore-blank-lines", base, head, "--", path])
    return r.returncode != 0


def changed_urls(base, head):
    urls = []
    for line in git("diff", "--name-status", "-M", base, head).splitlines():
        parts = line.split("\t")
        status, paths = parts[0][0], parts[1:]
        if status == "R":
            old, new = paths
            if old.endswith((".html", ".pdf")):
                urls.append(path_to_url(old))
            paths = [new]
            status = "A"
        path = paths[0]
        name = os.path.basename(path)
        if name in SKIP_FILES or name.startswith(SKIP_PREFIXES) or path.startswith("."):
            continue
        if status == "D":
            if path.endswith((".html", ".pdf")):
                urls.append(path_to_url(path))
        elif path.endswith(".html") and material(base, head, path) and is_public_canonical(path):
            urls.append(path_to_url(path))
    return sorted(set(urls))


def sitemap_urls():
    return re.findall(r"<loc>([^<]+)</loc>", open("sitemap.xml", encoding="utf-8").read())


def submit(urls):
    urls = [u for u in dict.fromkeys(urls) if u.startswith(SITE + "/")]
    if not urls:
        print("IndexNow: nothing to submit.")
        return 0
    print("IndexNow: submitting", len(urls), "URL(s):")
    for u in urls:
        print("  " + u)
    if os.environ.get("DRY_RUN"):
        print("DRY_RUN set; not sent.")
        return 0
    body = json.dumps({"host": HOST, "key": KEY, "keyLocation": KEY_LOCATION, "urlList": urls}).encode()
    req = urllib.request.Request(ENDPOINT, data=body, method="POST",
                                 headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            code = r.status
    except urllib.error.HTTPError as e:
        code = e.code
    meaning = {200: "OK, submitted", 202: "Accepted, key validation pending",
               400: "Bad request", 403: "Key not valid for this host",
               422: "URLs do not belong to the host or key mismatch", 429: "Too many requests"}
    print(f"IndexNow HTTP {code}: {meaning.get(code, 'unexpected response')}")
    return 0 if code in (200, 202) else 1


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    if mode == "changed" and len(sys.argv) == 4:
        sys.exit(submit(changed_urls(sys.argv[2], sys.argv[3])))
    if mode == "urls" and len(sys.argv) > 2:
        sys.exit(submit(sys.argv[2:]))
    if mode == "sitemap":
        sys.exit(submit(sitemap_urls()))
    print(__doc__)
    sys.exit(2)
