"""Regenera la sección Posts de index.html y en/index.html desde posts.json.
Con --issue añade antes el post descrito en el cuerpo de la issue (variable ISSUE_BODY)."""
import json, os, re, sys, html, datetime, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PJ = ROOT / "posts.json"
TAG_EN = {"Proyecto": "Project", "Otro": "Other"}
MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"]
MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
PAGES = {"index.html": ("es", "Leer en LinkedIn ↗"), "en/index.html": ("en", "Read on LinkedIn ↗")}

def js(s):
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ") + "'"

def from_issue(body):
    f = {}
    for m in re.finditer(r"^### (.+?)\s*\n+(.*?)(?=^### |\Z)", body, re.S | re.M):
        v = m.group(2).strip()
        f[m.group(1).strip().lower()] = "" if v == "_No response_" else v
    get = lambda *ks: next((f[k] for k in f for kk in ks if k.startswith(kk)), "")
    url = get("enlace").strip()
    if not re.match(r"https://([a-z]+\.)?linkedin\.com/", url):
        sys.exit(f"Enlace no válido: {url!r}")
    hoy = datetime.date.today()
    tag = get("etiqueta") or "Otro"
    p = {"url": url, "fecha": f"{MES[hoy.month-1]} {hoy.year}", "etiqueta": tag,
         "titulo": get("título", "titulo"), "resumen": get("resumen")}
    en = {"fecha": f"{MON[hoy.month-1]} {hoy.year}", "etiqueta": TAG_EN.get(tag, tag),
          "titulo": get("título en inglés", "titulo en ingles") or p["titulo"],
          "resumen": get("resumen en inglés", "resumen en ingles") or p["resumen"]}
    p["en"] = en
    if not p["titulo"] or not p["resumen"]:
        sys.exit("Faltan título o resumen")
    return p

def build(posts):
    for rel, (lang, more) in PAGES.items():
        f = ROOT / rel; s = f.read_text(encoding="utf-8")
        items = []
        for i, p in enumerate(posts):
            q = p if lang == "es" else {**p, **{k: v for k, v in p.get("en", {}).items()}}
            items.append(dict(feat=i == 0, tag=q["etiqueta"], date=q["fecha"], t=q["titulo"], d=q["resumen"], url=p["url"]))
        arr = "const POSTS = [\n" + ",\n".join(
            "  {" + ("feat:true, " if x["feat"] else "") + f"tag:{js(x['tag'])}, date:{js(x['date'])}, t:{js(x['t'])}, d:{js(x['d'])}, url:{js(x['url'])}" + "}"
            for x in items) + "\n];"
        s, n1 = re.subn(r"const POSTS = \[\n.*?\n\];", lambda m: arr, s, count=1, flags=re.S)
        e = lambda v: html.escape(v, quote=False)
        cards = "".join(f'''
  <a class="post reveal {'feat' if x['feat'] else ''}" href="{html.escape(x['url'])}" target="_blank" rel="noopener">
    <div class="meta"><span class="tag">{e(x['tag'])}</span><span>{e(x['date'])}</span></div>
    <h3>{e(x['t'])}</h3><p>{e(x['d'])}</p><span class="more">{more}</span>
  </a>''' for x in items)
        s, n2 = re.subn(r'(<div class="posts" id="postsGrid">)\n.*?\n  </a></div>', lambda m: m.group(1) + cards + "</div>", s, count=1, flags=re.S)
        assert n1 == 1 and n2 == 1, (rel, n1, n2)
        f.write_text(s, encoding="utf-8")
        print(rel, len(items), "posts")

posts = json.loads(PJ.read_text(encoding="utf-8"))
if "--issue" in sys.argv:
    new = from_issue(os.environ["ISSUE_BODY"])
    posts = [p for p in posts if p["url"] != new["url"]]
    posts.insert(0, new)
    PJ.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Añadido:", new["titulo"])
build(posts)
