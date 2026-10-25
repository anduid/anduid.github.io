#!/usr/bin/env python3
"""
Penghubung otomatis antara berkas aplikasi HTML dan situs Jekyll.

Dua tahap (dipanggil oleh .github/workflows/situs.yml):

  python3 tools/sinkron_app.py pra
      SEBELUM Jekyll. Setiap berkas HTML di root repo yang bukan halaman Jekyll
      (tidak diawali front matter "---") dianggap aplikasi. Jika belum punya
      deskriptor _apps/NAMA.md, deskriptor dibuat otomatis dari <title> dan
      meta description berkasnya. Hasilnya: aplikasi baru langsung muncul di
      beranda/hub, peta situs, dan blok "aplikasi terkait" tanpa kerja tambahan.

  python3 tools/sinkron_app.py pasca [--situs _site]
      SESUDAH Jekyll. Memperkaya <head> berkas aplikasi di folder _site
      (title, meta description, canonical, Open Graph, Twitter Card, JSON-LD).
      Berkas sumber di repo TIDAK diubah. Tag lama dengan jenis yang sama
      diganti oleh blok terkelola di antara penanda  <!-- andu:seo:mulai -->.

Hanya memakai pustaka standar Python + PyYAML.
"""
import argparse
import html as htmllib
import json
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML belum terpasang. Jalankan: pip install pyyaml")

ROOT = Path(__file__).resolve().parent.parent
SITE_URL = "https://andu.my.id"
SITE_NAME = "andu.my.id"
OG_DEFAULT = "/assets/images/og-studio.png"
MULAI = "<!-- andu:seo:mulai -->"
SELESAI = "<!-- andu:seo:selesai -->"

# Nama berkas HTML di root yang BUKAN aplikasi, atau bentrok dengan folder/URL situs.
RESERVED = {"index", "404", "blog", "aplikasi", "assets", "sitemap", "robots", "feed",
            "search", "tools", "tentang", "kontak", "privasi", "cari", "arsip", "topik"}

LOCALE = {"id": "id_ID", "en": "en_US"}


# ---------------------------------------------------------------- util
def log(level, msg):
    """Tulis pesan; format ::notice:: dst. otomatis tampil sebagai anotasi di GitHub Actions."""
    print(f"::{level}::{msg}" if level in ("notice", "warning", "error") else msg)


def pisah_front_matter(teks):
    m = re.match(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|\Z)(.*)\Z", teks, re.S)
    if not m:
        return None, teks
    try:
        data = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError as e:
        raise ValueError(f"front matter tidak valid: {e}")
    return data, m.group(2)


def baca_deskriptor(root=ROOT):
    """Kembalikan {file: data} dari _apps/*.md (termasuk yang published:false)."""
    hasil = {}
    for p in sorted((root / "_apps").glob("*.md")):
        try:
            data, _ = pisah_front_matter(p.read_text(encoding="utf-8"))
        except ValueError as e:
            log("error", f"{p.name}: {e}")
            continue
        if data is None:
            log("warning", f"{p.name}: tidak ada front matter, dilewati")
            continue
        data.setdefault("file", p.stem)
        data["_berkas"] = p.name
        hasil[str(data["file"])] = data
    return hasil


def berkas_aplikasi(root=ROOT):
    """HTML di root repo tanpa front matter = aplikasi mandiri."""
    hasil = []
    for p in sorted(root.glob("*.html")):
        if p.stem.startswith(("_", ".")) or p.stem in RESERVED:
            continue
        with open(p, "rb") as f:
            awal = f.read(8).lstrip(b"\xef\xbb\xbf \t\r\n")
        if awal.startswith(b"---"):
            continue  # halaman Jekyll biasa
        hasil.append(p)
    return hasil


# ---------------------------------------------------------------- ekstraksi (untuk scaffold)
def _masker(teks):
    """Ganti blok <script>/<style>/komentar dengan penanda agar regex tidak salah baca."""
    simpan = []

    def ganti(m):
        simpan.append(m.group(0))
        return f"\x00{len(simpan) - 1}\x00"

    pola = re.compile(r"<!--.*?-->|<script\b[^>]*>.*?</script\s*>|<style\b[^>]*>.*?</style\s*>", re.I | re.S)
    return pola.sub(ganti, teks), simpan


def _buka_masker(teks, simpan):
    return re.sub(r"\x00(\d+)\x00", lambda m: simpan[int(m.group(1))], teks)


def ekstrak_info(path):
    raw = path.read_text(encoding="utf-8", errors="replace")
    awal = raw[:600_000]  # cukup untuk head dan awal isi
    bersih, _ = _masker(awal)
    judul = re.search(r"<title\b[^>]*>(.*?)</title\s*>", bersih, re.I | re.S)
    judul = htmllib.unescape(re.sub(r"\s+", " ", judul.group(1))).strip() if judul else ""
    desc = None
    for m in re.finditer(r"<meta\b[^>]*>", bersih, re.I):
        tag = m.group(0)
        if re.search(r"""name\s*=\s*["']?description["']?""", tag, re.I):
            c = re.search(r"""content\s*=\s*(?:"([^"]*)"|'([^']*)')""", tag, re.I)
            if c:
                desc = htmllib.unescape(c.group(1) or c.group(2)).strip()
                break
    h1 = re.search(r"<h1\b[^>]*>(.*?)</h1\s*>", bersih, re.I | re.S)
    h1 = htmllib.unescape(re.sub(r"<[^>]+>|\s+", " ", h1.group(1))).strip() if h1 else ""
    lang = re.search(r"<html\b[^>]*\blang\s*=\s*[\"']?([A-Za-z-]+)", awal[:3000], re.I)
    lang = lang.group(1).lower()[:2] if lang else "id"
    teks = ""
    if not desc:
        isi = re.sub(r"<[^>]+>", " ", bersih)
        teks = htmllib.unescape(re.sub(r"\s+", " ", isi)).strip()
    return {"judul": judul, "deskripsi": desc, "h1": h1, "lang": lang, "teks": teks}


def potong(teks, n):
    teks = re.sub(r"\s+", " ", teks).strip()
    if len(teks) <= n:
        return teks
    return teks[: n - 1].rsplit(" ", 1)[0].rstrip(",.;:-") + "…"


def nama_pendek(judul, stem):
    if judul:
        bagian = re.split(r"\s+[-–—|•]\s+|:\s+", judul)[0].strip()
        if 2 <= len(bagian) <= 40:
            return bagian
    return stem.replace("-", " ").title()


def q(v):
    return json.dumps(v, ensure_ascii=False)


def buat_deskriptor(path, root=ROOT):
    info = ekstrak_info(path)
    stem = path.stem
    nama = nama_pendek(info["judul"] or info["h1"], stem)
    judul_seo = potong(info["judul"] or info["h1"] or nama, 60)
    desc = info["deskripsi"] or potong(info["teks"], 155)
    if len(desc) < 50:
        desc = f"Aplikasi web {nama} dari andu.my.id. Buka langsung di browser tanpa instalasi."
    desc = potong(desc, 160)
    baris = [
        "---",
        "# Dibuat OTOMATIS oleh tools/sinkron_app.py dari berkas HTML-nya.",
        "# Lengkapi tagline, kategori, tags, dan fitur agar SEO lebih baik, lalu hapus dua baris komentar ini.",
        f"title: {q(nama)}",
        f"tagline: {q(potong(info['h1'], 70) if info['h1'] and info['h1'] != nama else '')}",
        f"judul_seo: {q(judul_seo)}",
        f"description: {q(desc)}",
        f"file: {stem}",
        'kategori: "Lainnya"',
        "schema_kategori: UtilitiesApplication",
        "tags: []",
        "urutan: 100",
        "beranda: false",
        f"bahasa: {info['lang'] if info['lang'] in LOCALE else 'id'}",
        "---",
        "",
    ]
    return "\n".join(baris)


def tahap_pra(root=ROOT):
    (root / "_apps").mkdir(exist_ok=True)
    ada = baca_deskriptor(root)
    baru = 0
    for p in berkas_aplikasi(root):
        if p.stem in ada:
            continue
        tujuan = root / "_apps" / f"{p.stem}.md"
        if tujuan.exists():
            continue
        tujuan.write_text(buat_deskriptor(p, root), encoding="utf-8")
        baru += 1
        log("notice", f"Aplikasi baru terdeteksi: {p.name}. Deskriptor otomatis dibuat di _apps/{p.stem}.md. "
                      f"Lengkapi isinya (kategori, tags, fitur) agar SEO lebih baik.")
    # peringatan untuk deskriptor yatim
    for f, d in ada.items():
        if not (root / f"{f}.html").exists():
            log("warning", f"_apps/{d['_berkas']} menunjuk {f}.html yang tidak ada di root repo.")
    print(f"pra: {len(ada)} deskriptor ada, {baru} dibuat baru.")
    return baru


# ---------------------------------------------------------------- pengayaan head
def esc(t):
    return htmllib.escape(str(t), quote=True)


def json_ld(d):
    url = f"{SITE_URL}/{d['file']}"
    gambar = d.get("gambar") or OG_DEFAULT
    if "://" not in gambar:
        gambar = SITE_URL + (gambar if gambar.startswith("/") else "/" + gambar)
    landing = f"{SITE_URL}/aplikasi/{d['_berkas'][:-3]}/"
    graf = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebApplication",
                "@id": url + "#app",
                "name": d["title"],
                "url": url,
                "description": d["description"],
                "applicationCategory": d.get("schema_kategori") or "UtilitiesApplication",
                "operatingSystem": "Web",
                "inLanguage": d.get("bahasa") or "id",
                "image": gambar,
                "author": {"@type": "Organization", "name": SITE_NAME, "url": SITE_URL + "/"},
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Beranda", "item": SITE_URL + "/"},
                    {"@type": "ListItem", "position": 2, "name": "Aplikasi", "item": SITE_URL + "/aplikasi/"},
                    {"@type": "ListItem", "position": 3, "name": d["title"], "item": landing},
                ],
            },
        ],
    }
    return json.dumps(graf, ensure_ascii=False, indent=2).replace("</", "<\\/")


def blok_seo(d, perlu_charset, perlu_viewport):
    url = f"{SITE_URL}/{d['file']}"
    judul = d.get("judul_seo") or f"{d['title']}: {d.get('tagline')}".rstrip(": ")
    desc = d["description"]
    gambar = d.get("gambar") or OG_DEFAULT
    if "://" not in gambar:
        gambar = SITE_URL + (gambar if gambar.startswith("/") else "/" + gambar)
    lang = d.get("bahasa") or "id"
    robots = "noindex, follow" if d.get("noindex") else "index, follow, max-image-preview:large"
    b = [MULAI]
    if perlu_viewport:
        b.append('<meta name="viewport" content="width=device-width, initial-scale=1">')
    b += [
        f"<title>{esc(judul)}</title>",
        f'<meta name="description" content="{esc(desc)}">',
        f'<meta name="robots" content="{robots}">',
        f'<link rel="canonical" href="{esc(url)}">',
        f'<meta property="og:type" content="website">',
        f'<meta property="og:site_name" content="{SITE_NAME}">',
        f'<meta property="og:locale" content="{LOCALE.get(lang, "id_ID")}">',
        f'<meta property="og:title" content="{esc(judul)}">',
        f'<meta property="og:description" content="{esc(desc)}">',
        f'<meta property="og:url" content="{esc(url)}">',
        f'<meta property="og:image" content="{esc(gambar)}">',
        f'<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{esc(judul)}">',
        f'<meta name="twitter:description" content="{esc(desc)}">',
        f'<meta name="twitter:image" content="{esc(gambar)}">',
        f'<link rel="icon" href="/assets/images/favicon.svg" type="image/svg+xml">',
        f'<link rel="icon" href="/assets/images/favicon-32.png" type="image/png" sizes="32x32">',
        f'<script type="application/ld+json">\n{json_ld(d)}\n</script>',
        SELESAI,
    ]
    return "\n".join(b) + "\n"


_PEMINDAI = re.compile(
    r"<!--.*?-->|<script\b[^>]*>.*?</script\s*>|<style\b[^>]*>.*?</style\s*>|(<head\b[^>]*>)|(</head\s*>)",
    re.I | re.S,
)

_HAPUS_DI_HEAD = [
    re.compile(r"<title\b[^>]*>.*?</title\s*>", re.I | re.S),
    re.compile(r"""<meta\b[^>]*\bname\s*=\s*["']?(?:description|robots|twitter:[\w:]+)["']?[^>]*>""", re.I),
    re.compile(r"""<meta\b[^>]*\bproperty\s*=\s*["']og:[\w:]+["'][^>]*>""", re.I),
    re.compile(r"""<link\b[^>]*\brel\s*=\s*["']?canonical["']?[^>]*>""", re.I),
]


def cari_head(html):
    """Posisi (akhir tag <head>, awal </head>) di luar script/style/komentar, atau (None, None)."""
    buka = tutup = None
    for m in _PEMINDAI.finditer(html):
        if m.group(1) and buka is None:
            buka = m.end(1)
        elif m.group(2) and buka is not None:
            tutup = m.start(2)
            break
    return buka, tutup


def perkaya_html(html, d):
    """Kembalikan HTML dengan blok SEO terkelola. Idempoten."""
    # buang blok terkelola lama (jika berkas pernah diproses)
    html = re.sub(re.escape(MULAI) + r".*?" + re.escape(SELESAI) + r"\n?", "", html, flags=re.S)
    lang = d.get("bahasa") or "id"
    buka, tutup = cari_head(html)

    if buka is None or tutup is None:
        # Potongan HTML tanpa <head> (mis. advanzer.html): buat <head> minimal,
        # tanpa menambah DOCTYPE agar tampilan aplikasi tidak berubah.
        blok = ('<meta charset="utf-8">\n' + blok_seo(d, False, True))
        kepala = f"<head>\n{blok}</head>\n"
        m_html = re.search(r"<html\b[^>]*>", html, re.I)
        if m_html:
            if not re.search(r"\blang\s*=", m_html.group(0), re.I):
                tag = m_html.group(0)[:-1] + f' lang="{lang}">'
                html = html[: m_html.start()] + tag + html[m_html.end():]
                m_html = re.search(r"<html\b[^>]*>", html, re.I)
            pos = m_html.end()
            return html[:pos] + "\n" + kepala + html[pos:]
        m_dt = re.match(r"\s*<!DOCTYPE[^>]*>", html, re.I)
        pos = m_dt.end() if m_dt else 0
        return html[:pos] + f'<html lang="{lang}">\n' + kepala + html[pos:]

    dalam = html[buka:tutup]
    bersih, simpan = _masker(dalam)
    for pola in _HAPUS_DI_HEAD:
        bersih = pola.sub("", bersih)
    perlu_charset = not re.search(r"<meta\b[^>]*\bcharset\s*=", bersih, re.I)
    perlu_viewport = not re.search(r"""<meta\b[^>]*\bname\s*=\s*["']?viewport""", bersih, re.I)
    bersih = re.sub(r"\n[ \t]*\n[ \t]*\n+", "\n\n", bersih)
    dalam = _buka_masker(bersih, simpan)
    if perlu_charset:
        dalam = '\n<meta charset="utf-8">' + dalam
    dalam = dalam.rstrip() + "\n" + blok_seo(d, False, perlu_viewport)
    hasil = html[:buka] + dalam + html[tutup:]

    # atribut lang pada <html>
    m_html = re.search(r"<html\b[^>]*>", hasil[:buka], re.I)
    if m_html and not re.search(r"\blang\s*=", m_html.group(0), re.I):
        tag = m_html.group(0)[:-1] + f' lang="{lang}">'
        hasil = hasil[: m_html.start()] + tag + hasil[m_html.end():]

    # tautan balik opsional (tautan_balik: true di deskriptor)
    if d.get("tautan_balik"):
        tombol = (
            f'<a href="/aplikasi/{d["_berkas"][:-3]}/" style="position:fixed;left:8px;bottom:8px;z-index:2147483000;'
            'font:600 11px/1 system-ui,sans-serif;background:rgba(15,23,42,.82);color:#e2e8f0;padding:6px 9px;'
            'border-radius:8px;text-decoration:none" title="Tentang aplikasi ini di andu.my.id">andu.my.id</a>\n'
        )
        idx = hasil.lower().rfind("</body>")
        hasil = hasil[:idx] + tombol + hasil[idx:] if idx != -1 else hasil + "\n" + tombol
    return hasil


def tahap_pasca(situs, root=ROOT):
    desk = baca_deskriptor(root)
    diproses = dilewati = 0
    for f, d in desk.items():
        if d.get("published") is False:
            dilewati += 1
            continue
        for kunci in ("title", "description"):
            if not d.get(kunci):
                log("warning", f"_apps/{d['_berkas']}: field '{kunci}' kosong.")
        if not d.get("title") or not d.get("description"):
            continue
        target = situs / f"{f}.html"
        if not target.exists():
            log("warning", f"_site/{f}.html tidak ditemukan, dilewati (cek nama file di _apps/{d['_berkas']}).")
            continue
        try:
            asal = target.read_text(encoding="utf-8")
            baru = perkaya_html(asal, d)
            if baru != asal:
                target.write_text(baru, encoding="utf-8")
            diproses += 1
        except Exception as e:  # satu berkas gagal tidak boleh menggagalkan semuanya
            log("warning", f"Gagal memperkaya {f}.html: {e}")
        if len(d["description"]) < 70 or len(d["description"]) > 170:
            log("warning", f"_apps/{d['_berkas']}: panjang description {len(d['description'])} (ideal 70-160).")
    print(f"pasca: {diproses} aplikasi diperkaya, {dilewati} disembunyikan (published: false).")
    return diproses


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("tahap", choices=["pra", "pasca"])
    ap.add_argument("--situs", default="_site", help="folder hasil build Jekyll (untuk tahap pasca)")
    ap.add_argument("--root", default=str(ROOT))
    a = ap.parse_args()
    root = Path(a.root).resolve()
    if a.tahap == "pra":
        tahap_pra(root)
    else:
        situs = Path(a.situs)
        if not situs.is_absolute():
            situs = root / situs
        if not situs.is_dir():
            sys.exit(f"Folder {situs} tidak ada. Jalankan setelah 'jekyll build'.")
        tahap_pasca(situs, root)


if __name__ == "__main__":
    main()
