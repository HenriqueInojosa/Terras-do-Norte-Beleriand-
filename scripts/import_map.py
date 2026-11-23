"""Importa o mapa à pena (assets/map/bico-de-pena/) para o app.

Entrada: beleriand-regioes.svg (grupo "territorios") e beleriand-rotulos.svg
(grupo "labels"), no mesmo viewBox da arte. A arte já vem pronta em WebP
(public/maps/beleriand-base.webp e @2x), sem nenhum nome escrito: os rótulos
são desenhados pelo app por cima, para respeitar spoilers e o nível de zoom.

Saída: src/data/generated/map-layer.ts
"""
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/map/bico-de-pena"
OUT = ROOT / "src/data/generated/map-layer.ts"
NS = "http://www.w3.org/2000/svg"


def q(tag):
    return f"{{{NS}}}{tag}"


def load(name):
    return ET.parse(SRC / name).getroot()


regioes = load("beleriand-regioes.svg")
rotulos = load("beleriand-rotulos.svg")
view_box = [float(v) for v in regioes.get("viewBox").split()]
assert view_box == [float(v) for v in rotulos.get("viewBox").split()], "viewBox diferente entre regiões e rótulos"

territories = []
for el in regioes.iter():
    tag = el.tag.replace(f"{{{NS}}}", "")
    if "territorio" not in (el.get("class") or ""):
        continue
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
for t in rotulos.iter(q("text")):
    label = {"id": t.get("id"), "cls": t.get("class") or "", "transform": t.get("transform"), "parts": text_parts(t)}
    if t.get("data-territorio"):
        label["territory"] = t.get("data-territorio")
    labels.append(label)

layer = {"viewBox": view_box, "territories": territories, "labels": labels, "titles": [], "gondolinMarker": ""}
OUT.write_text(
    "// Gerado por scripts/import_map.py a partir de assets/map/bico-de-pena/. Nao editar.\n"
    "import type { MapLayer } from '@/lib/types';\n\n"
    f"export const mapLayer: MapLayer = {json.dumps(layer, ensure_ascii=False, indent=1)};\n"
)
print(f"territorios: {len(territories)}, rotulos: {len(labels)}, viewBox: {view_box}")
