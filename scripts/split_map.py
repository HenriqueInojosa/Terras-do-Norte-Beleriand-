"""Divide o mapa estilizado em duas camadas.

- public/maps/beleriand-base.svg: toda a arte (mar, relevo, rios, florestas, moldura),
  sem textos nem zonas clicaveis. E desenhada como <img>, o que deixa o zoom leve.
- src/data/generated/map-layer.ts: territorios clicaveis, rotulos e titulo, desenhados
  em SVG inline pelo React, para poder destacar, esconder (spoilers) e animar.

Uso: python3 scripts/split_map.py
"""
import json
import pathlib
import re
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/map/beleriand-estilizado.svg"
BASE_OUT = ROOT / "public/maps/beleriand-base.svg"
LAYER_OUT = ROOT / "src/data/generated/map-layer.ts"

NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)
ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")
q = lambda t: f"{{{NS}}}{t}"

tree = ET.parse(SRC)
root = tree.getroot()
view_box = [float(v) for v in root.get("viewBox").split()]


def find_by_id(el_id):
    for el in root.iter():
        if el.get("id") == el_id:
            return el
    raise SystemExit(f"id nao encontrado: {el_id}")


parents = {c: p for p in root.iter() for c in p}


def remove(el):
    parents[el].remove(el)


# Territorios
territories = []
for el in find_by_id("territorios"):
    tag = el.tag.replace(f"{{{NS}}}", "")
    if tag == "path":
        territories.append({"id": el.get("id"), "shape": "path", "d": el.get("d")})
    elif tag == "circle":
        territories.append({
            "id": el.get("id"), "shape": "circle",
            "cx": float(el.get("cx")), "cy": float(el.get("cy")), "r": float(el.get("r")),
        })


def text_parts(t):
    parts = []
    if (t.text or "").strip():
        parts.append({"text": t.text.strip()})
    for span in t:
        part = {"text": "".join(span.itertext()).strip()}
        for k in ("class", "x", "dy"):
            if span.get(k) is not None:
                part[k if k != "class" else "cls"] = span.get(k)
        parts.append(part)
    return parts


labels = []
for t in find_by_id("labels"):
    label = {
        "id": t.get("id"),
        "cls": t.get("class") or "",
        "transform": t.get("transform"),
        "parts": text_parts(t),
    }
    if t.get("data-territorio"):
        label["territory"] = t.get("data-territorio")
    labels.append(label)

titles = []
for t in find_by_id("titulo").findall(q("text")):
    titles.append({"cls": t.get("class"), "x": float(t.get("x")), "y": float(t.get("y")), "text": "".join(t.itertext())})

# Marca da cidade de Gondolin: sai da base para poder ser escondida
gondolin_marker = ET.tostring(find_by_id("cidade-gondolin"), encoding="unicode")
gondolin_marker = re.sub(r'\s+xmlns(:\w+)?="[^"]+"', "", gondolin_marker)

# Monta a base sem textos, zonas e marca de Gondolin
for el_id in ("labels", "territorios", "cidade-gondolin"):
    remove(find_by_id(el_id))
for t in list(root.iter(q("text"))):
    remove(t)
for tag in ("title", "desc"):
    for el in root.findall(q(tag)):
        root.remove(el)
style = root.find(q("defs")).find(q("style"))
if style is not None:
    style.text = re.sub(r"@import[^;]+;", "", style.text)
BASE_OUT.parent.mkdir(parents=True, exist_ok=True)
tree.write(BASE_OUT, encoding="unicode", xml_declaration=False)

LAYER_OUT.parent.mkdir(parents=True, exist_ok=True)
payload = {
    "viewBox": view_box,
    "territories": territories,
    "labels": labels,
    "titles": titles,
    "gondolinMarker": gondolin_marker,
}
LAYER_OUT.write_text(
    "// Gerado por scripts/split_map.py a partir de assets/map/beleriand-estilizado.svg. Nao editar.\n"
    "import type { MapLayer } from '@/lib/types';\n\n"
    f"export const mapLayer: MapLayer = {json.dumps(payload, ensure_ascii=False, indent=1)};\n",
    encoding="utf-8",
)
print(f"base: {BASE_OUT.stat().st_size // 1024} KB, territorios: {len(territories)}, rotulos: {len(labels)}")
