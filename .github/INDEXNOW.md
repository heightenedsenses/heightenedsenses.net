# IndexNow

IndexNow tells participating search engines (Bing, Yandex, Seznam, Naver, and others that share submissions) that a URL was added, changed, or removed, so they recrawl it sooner. A submission is a notification only. It does not guarantee when, or whether, a page is recrawled or reindexed. Google does not participate; use Search Console for Google.

## Key file

- Key: `1d47dcf4bca3b631f0587304780a0610`
- File: `/1d47dcf4bca3b631f0587304780a0610.txt` at the site root, containing only the key (UTF-8).
- Live: https://heightenedsenses.net/1d47dcf4bca3b631f0587304780a0610.txt

The key proves the submitter controls the domain. It is public by design and is not a secret.

## Automatic submission

`.github/workflows/indexnow.yml` runs after each successful GitHub Pages deployment of `main`, so engines are notified only once the new version is live. It compares the deployed commit with the commit of the previous successful deployment and calls `.github/scripts/indexnow.py changed`.

The script submits:

- **Added or changed pages:** `.html` files that changed beyond whitespace and are public and self-canonical (canonical tag points to their own URL, no `noindex`).
- **Deleted pages and documents:** removed `.html` or `.pdf` files, so engines see the 404 or redirect.

It skips CSS, JavaScript, images, and other assets; whitespace-only edits; `404.html`; search-console verification files; noindex pages such as the digital card and the legacy redirect pages; and repository files.

To skip submission for one commit, put `[skip indexnow]` in its commit message.

## Manual submission

- **From GitHub:** Actions → IndexNow → Run workflow. Enter space-separated URLs, or leave the field blank to submit every URL in `sitemap.xml`.
- **From a terminal in the repository:**
  - `python3 .github/scripts/indexnow.py urls https://heightenedsenses.net/uas.html`
  - `python3 .github/scripts/indexnow.py sitemap`
  - Add `DRY_RUN=1` in front of either command to preview without sending.

Responses:

| Code | Meaning |
|------|---------|
| 200 | Submitted |
| 202 | Accepted, key validation pending |
| 400 | Bad request |
| 403 | Key not valid |
| 422 | URL or host mismatch |
| 429 | Too many requests (wait, then retry) |

## Keep these in agreement

`sitemap.xml`, the canonical tags, `robots.txt`, and IndexNow should describe the same set of public pages. When a page is added or retired:

- Update `sitemap.xml`.
- Give the new page a self-canonical tag.
- Give retired pages a `noindex` redirect, or delete them.

The workflow handles the notification.

## Rotating the key

1. Generate a new key: 8 to 128 characters, letters, digits, and dashes. For example, run `python3 -c "import secrets; print(secrets.token_hex(16))"`.
2. Add `<newkey>.txt` at the site root, containing only the new key.
3. Change `KEY` in `.github/scripts/indexnow.py` to the new key.
4. Deploy, and confirm the new key file loads on the live site.
5. Delete the old key file in a later commit.
6. If Bing Webmaster Tools shows the old key, nothing else is needed. Bing validates whichever key file the submission names.
