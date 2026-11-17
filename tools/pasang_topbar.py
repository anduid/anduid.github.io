#!/usr/bin/env python3
"""
Memasang bilah ekosistem andu.my.id (topbar) ke halaman HTML mandiri di repo ini.

Halaman Jekyll yang memakai layout (blog, hub aplikasi, halaman aplikasi, portal, terminal, admin)
sudah mendapat topbar dari _includes/topbar.html. Skrip ini mengurus sisanya: berkas HTML utuh
(punya <body>) seperti index.html, pesaner.html, siplokal.html, kerapi.html, profil/index.html, dst.

  python3 tools/pasang_topbar.py          pasang / perbarui (aman dijalankan berulang)
  python3 tools/pasang_topbar.py --cek    hanya periksa; keluar dengan kode 1 bila ada yang belum mutakhir
  python3 tools/pasang_topbar.py --hapus  lepaskan topbar dari semua halaman

Daftar tautan diambil dari "ekosistem" di _config.yml (satu sumber, sama dengan repo /market).
Blok terkelola berada di antara penanda <!-- andu:topbar:mulai --> dan <!-- andu:topbar:selesai -->,
sisipan baru ditaruh tepat setelah tag <body>. Akhir baris (CRLF/LF) berkas dipertahankan.
Fragmen tanpa <html>/<body> (advanzer.html) disisipi di awal berkas. Folder public/ (sisa Firebase) tidak disentuh.

Hanya memakai pustaka standar Python + PyYAML.
"""
import argparse
import html
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML belum terpasang. Jalankan: pip install pyyaml")

ROOT = Path(__file__).resolve().parent.parent
MULAI = "<!-- andu:topbar:mulai -->"
SELESAI = "<!-- andu:topbar:selesai -->"
VERSI = "1"  # samakan dengan ?v= di _includes/topbar.html bila CSS/JS diubah
ABAIKAN = {"_includes", "_layouts", "_site", "_posts", "_apps", "_data", "node_modules", "vendor",
           "public", "assets", "tools", "backend", ".git", ".github", ".firebase"}
POLA_BLOK = re.compile(re.escape(MULAI) + r".*?" + re.escape(SELESAI), re.S)
POLA_BODY = re.compile(r"<body\b[^>]*>", re.I)


def kunci_halaman(rel):
    """Halaman mana yang ditandai aktif. Aturannya sama dengan _includes/topbar.html."""
    if rel == "index.html":
        return "studio"
    if rel.startswith("pesaner"):
        return "pesaner"
    if rel.startswith(("portal/", "terminal/", "admin/")):
        return "portal"
    if rel.startswith("blog/"):
        return "blog"
    if rel.startswith("profil/"):
        return "profil"
    return ""


def baca_ekosistem():
    cfg = yaml.safe_load((ROOT / "_config.yml").read_text(encoding="utf-8")) or {}
    daftar = cfg.get("ekosistem") or []
    if not daftar:
        sys.exit("Bagian 'ekosistem' di _config.yml kosong atau tidak ada.")
    return daftar


def buat_blok(daftar, aktif, nl):
    tautan = "".join(
        '<a class="atb-link" href="{}"{}>{}</a>'.format(
            html.escape(e["url"], quote=True),
            ' aria-current="page"' if aktif and e.get("kunci") == aktif else "",
            html.escape(e["nama"]))
        for e in daftar)
    baris = [
        MULAI,
        '<link rel="stylesheet" href="/assets/css/topbar.css?v=%s">' % VERSI,
        '<nav id="andu-topbar" aria-label="Ekosistem andu.my.id"><div class="atb-isi">'
        '<span class="atb-merek">andu<span>.my.id</span></span>' + tautan + "</div></nav>",
        '<script src="/assets/js/topbar.js?v=%s" defer></script>' % VERSI,
        SELESAI,
    ]
    return nl.join(baris)


def berkas_sasaran():
    for p in sorted(ROOT.rglob("*.html")):
        rel = p.relative_to(ROOT)
        if any(bagian in ABAIKAN for bagian in rel.parts[:-1]):
            continue
        yield p, rel.as_posix()


def proses(mode):
    daftar = baca_ekosistem()
    diubah, dilewati, basi = [], [], []
    for p, rel in berkas_sasaran():
        teks = p.read_bytes().decode("utf-8")
        jumlah_body = len(POLA_BODY.findall(teks))
        rendah = teks.lower()
        # Fragmen: bukan halaman Jekyll, tanpa <html>/<head>/<body> (browser membuat body sendiri).
        fragmen = (jumlah_body == 0 and not teks.startswith("---") and "<html" not in rendah and "<head" not in rendah)
        if jumlah_body > 1 or (jumlah_body == 0 and not fragmen):
            dilewati.append(rel)  # tanpa <body> (halaman ber-layout) atau ambigu
            continue
        nl = "\r\n" if "\r\n" in teks else "\n"
        if mode == "hapus":
            baru = POLA_BLOK.sub("", teks)
            baru = re.sub(r"(<body\b[^>]*>)(\r?\n){2,}", r"\1" + nl, baru, count=1, flags=re.I) if baru != teks else baru
            if fragmen and baru != teks:
                baru = baru.lstrip("\r\n")
        else:
            blok = buat_blok(daftar, kunci_halaman(rel), nl)
            if POLA_BLOK.search(teks):
                baru = POLA_BLOK.sub(lambda m: blok, teks, count=1)
            elif fragmen:
                baru = blok + nl + teks
            else:
                m = POLA_BODY.search(teks)
                baru = teks[:m.end()] + nl + blok + teks[m.end():]
        if baru != teks:
            (basi if mode == "cek" else diubah).append(rel)
            if mode not in ("cek",):
                p.write_bytes(baru.encode("utf-8"))
    return diubah, dilewati, basi


def main():
    ap = argparse.ArgumentParser(description="Pasang bilah ekosistem andu.my.id ke halaman HTML mandiri.")
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--cek", action="store_true", help="hanya periksa, jangan menulis")
    g.add_argument("--hapus", action="store_true", help="lepaskan topbar dari semua halaman")
    a = ap.parse_args()
    mode = "cek" if a.cek else "hapus" if a.hapus else "pasang"
    diubah, dilewati, basi = proses(mode)
    if mode == "cek":
        for r in basi:
            print("belum mutakhir:", r)
        print("%d halaman belum mutakhir." % len(basi))
        sys.exit(1 if basi else 0)
    for r in diubah:
        print(("dilepas  " if mode == "hapus" else "diperbarui ") + r)
    print("Selesai: %d halaman %s. Dilewati (tanpa <body> sendiri, ditangani layout): %d."
          % (len(diubah), "dilepas" if mode == "hapus" else "diperbarui", len(dilewati)))


if __name__ == "__main__":
    main()
