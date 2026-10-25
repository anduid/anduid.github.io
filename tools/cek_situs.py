#!/usr/bin/env python3
"""
Pemeriksa konsistensi situs hasil build (folder _site). Dipanggil otomatis oleh
GitHub Actions setelah Jekyll selesai; bisa juga dijalankan lokal:

    python3 tools/cek_situs.py [--situs _site]

Yang diperiksa:
  - sitemap.xml ada, valid, dan setiap URL di dalamnya benar-benar ada berkasnya
  - robots.txt menunjuk ke sitemap.xml
  - setiap aplikasi terbit: halaman /aplikasi/NAMA/ ada, berkas aplikasi sudah diberi
    blok SEO, dan keduanya tercantum di sitemap serta ditautkan dari hub /aplikasi/
  - tulisan yang memakai  apps: [nama]  menunjuk aplikasi yang memang ada
  - beranda menaut ke /blog/ dan /aplikasi/
  - tautan internal di halaman bertema (beranda, hub, halaman aplikasi, blog) tidak patah

Kode keluar 1 hanya bila ada ERROR. PERINGATAN tidak menggagalkan apa pun.
"""
import argparse
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlsplit, unquote

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sinkron_app as S  # noqa: E402

ROOT = S.ROOT
NS = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
SITE = S.SITE_URL

galat, peringatan = [], []


def err(m):
    galat.append(m)
    print(f"::error::{m}")


def warn(m):
    peringatan.append(m)
    print(f"::warning::{m}")


def ke_berkas(situs, path):
    """Terjemahkan path URL ke berkas di _site seperti yang dilakukan GitHub Pages."""
    p = unquote(path.split("?")[0].split("#")[0])
    if not p.startswith("/"):
        return None
    if p.endswith("/"):
        kandidat = [situs / p.lstrip("/") / "index.html"]
    else:
        rel = p.lstrip("/")
        kandidat = [situs / rel, situs / (rel + ".html"), situs / rel / "index.html"]
    for k in kandidat:
        if k.is_file():
            return k
    return None


def baca(p):
    return p.read_text(encoding="utf-8", errors="replace")


def periksa(situs):
    # ---------- sitemap
    sm = situs / "sitemap.xml"
    urls = []
    if not sm.is_file():
        err("sitemap.xml tidak ada di hasil build.")
    else:
        try:
            akar = ET.fromstring(sm.read_bytes())
            urls = [e.text.strip() for e in akar.findall(".//s:loc", NS) if e.text]
        except ET.ParseError as e:
            err(f"sitemap.xml bukan XML valid: {e}")
        if sm.is_file() and not urls:
            err("sitemap.xml kosong (tidak ada <loc>).")
    himpunan = set(urls)
    if len(urls) != len(himpunan):
        warn(f"sitemap.xml memuat {len(urls) - len(himpunan)} URL ganda.")
    for u in urls:
        if not u.startswith(SITE):
            err(f"sitemap memuat URL di luar {SITE}: {u}")
            continue
        if ke_berkas(situs, u[len(SITE):] or "/") is None:
            err(f"URL ada di sitemap tetapi berkasnya tidak ada: {u}")

    # ---------- robots
    rb = situs / "robots.txt"
    if not rb.is_file():
        warn("robots.txt tidak ada.")
    elif f"{SITE}/sitemap.xml" not in baca(rb):
        warn("robots.txt tidak menyebut Sitemap: https://andu.my.id/sitemap.xml")

    # ---------- aplikasi
    desk = S.baca_deskriptor(ROOT)
    hub = situs / "aplikasi" / "index.html"
    hub_html = baca(hub) if hub.is_file() else ""
    if not hub.is_file():
        err("Halaman hub /aplikasi/ tidak ada.")
    terbit = {f: d for f, d in desk.items() if d.get("published") is not False}
    for f, d in terbit.items():
        stem = d["_berkas"][:-3]
        landing = situs / "aplikasi" / stem / "index.html"
        raw = situs / f"{f}.html"
        if not landing.is_file():
            err(f"Halaman aplikasi /aplikasi/{stem}/ tidak terbentuk untuk '{f}'.")
        if not raw.is_file():
            err(f"Berkas aplikasi {f}.html tidak ada di hasil build.")
        elif S.MULAI not in baca(raw) and not d.get("noindex_manual"):
            warn(f"{f}.html belum mendapat blok SEO (tahap pasca belum berjalan?).")
        if f"{SITE}/aplikasi/{stem}/" not in himpunan:
            warn(f"/aplikasi/{stem}/ tidak ada di sitemap.")
        if f"{SITE}/{f}" not in himpunan and not d.get("noindex"):
            warn(f"/{f} tidak ada di sitemap.")
        if hub_html and f"/aplikasi/{stem}/" not in hub_html:
            warn(f"Hub /aplikasi/ tidak menaut ke /aplikasi/{stem}/ (aplikasi yatim).")
    for f, d in desk.items():
        if d.get("published") is False and ke_berkas(situs, f"/aplikasi/{d['_berkas'][:-3]}/"):
            err(f"'{f}' diberi published: false tetapi halamannya tetap terbentuk.")

    # ---------- tulisan -> aplikasi
    for p in sorted((ROOT / "_posts").glob("*.md")):
        try:
            data, _ = S.pisah_front_matter(p.read_text(encoding="utf-8"))
        except ValueError as e:
            err(f"{p.name}: {e}")
            continue
        for nama in (data or {}).get("apps") or []:
            if str(nama) not in terbit:
                err(f"{p.name}: apps menyebut '{nama}', tetapi tidak ada aplikasi terbit dengan nama itu "
                    f"(cek _apps/ dan penulisan).")

    # ---------- beranda
    idx = situs / "index.html"
    if idx.is_file():
        h = baca(idx)
        for tujuan in ("/blog/", "/aplikasi/"):
            if f'href="{tujuan}"' not in h:
                err(f"Beranda tidak memuat tautan ke {tujuan}.")
        if "{{" in h or "{%" in h:
            err("Beranda masih memuat tag Liquid mentah (front matter hilang?).")
    else:
        err("index.html tidak ada.")

    # ---------- tautan internal di halaman bertema
    halaman = [idx] if idx.is_file() else []
    halaman += sorted((situs / "aplikasi").rglob("index.html")) + sorted((situs / "blog").rglob("index.html"))
    patah = {}
    for h in halaman:
        isi = baca(h)
        for m in re.finditer(r"""<a\b[^>]*\bhref\s*=\s*["']([^"'#][^"']*)["']""", isi, re.I):
            href = m.group(1).strip()
            if href.startswith(("mailto:", "tel:", "javascript:", "data:", "//")):
                continue
            if href.startswith("http"):
                if not href.startswith(SITE):
                    continue
                href = href[len(SITE):] or "/"
            if not href.startswith("/"):
                continue
            if ke_berkas(situs, href) is None:
                patah.setdefault(href, set()).add(str(h.relative_to(situs)))
    for href, sumber in sorted(patah.items())[:30]:
        warn(f"Tautan patah {href}  (ditemukan di: {', '.join(sorted(sumber)[:3])})")
    if len(patah) > 30:
        warn(f"...dan {len(patah) - 30} tautan patah lain.")

    # ---------- canonical halaman bertema harus ada di sitemap
    for h in halaman:
        isi = baca(h)
        c = re.search(r'<link rel="canonical" href="([^"]+)"', isi)
        if not c:
            warn(f"{h.relative_to(situs)} tidak punya tag canonical.")
        elif "noindex" not in isi[:20000] and c.group(1) not in himpunan:
            warn(f"canonical {c.group(1)} tidak ada di sitemap.")

    print(f"\nRingkasan: {len(urls)} URL di sitemap, {len(terbit)} aplikasi terbit, "
          f"{len(galat)} error, {len(peringatan)} peringatan.")
    return 1 if galat else 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--situs", default="_site")
    a = ap.parse_args()
    situs = Path(a.situs)
    if not situs.is_absolute():
        situs = ROOT / situs
    if not situs.is_dir():
        sys.exit(f"Folder {situs} tidak ada. Jalankan setelah 'jekyll build'.")
    sys.exit(periksa(situs))


if __name__ == "__main__":
    main()
