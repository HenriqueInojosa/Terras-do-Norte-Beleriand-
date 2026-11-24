"""Rótulos do mapa no estilo dos filmes: parte dos rótulos do mapa à pena (mesmos ids,
para os spoilers continuarem valendo), muda a posição de alguns e acrescenta outros.
uso (na raiz do repositório): python3 assets/map/filme/fonte/rotulos.py"""
import re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[4]
src = (ROOT / 'assets/map/bico-de-pena/beleriand-rotulos.svg').read_text()
MOVE = {
    'lbl-belegaer': 'translate(-246,212) rotate(72)',
    'lbl-nan-elmoth': 'translate(57,117) rotate(0)',
    'lbl-nimbrethil': 'translate(-101,263.5) rotate(0)',
    'lbl-nan-tathren': 'translate(-66,226) rotate(0)',
    'lbl-balar': 'translate(-138.5,321.5) rotate(-20)',
    'lbl-dorthonion': 'translate(8,29.5) rotate(-3)',
    'lbl-angband': 'translate(10.4,-21) rotate(0)',
    'lbl-thangorodrim': 'translate(8,15) rotate(0)',
    'lbl-ered-engrin': 'translate(40,-40.5) rotate(0)',
}
for lid, tr in MOVE.items():
    src, n = re.subn(rf'(<text id="{lid}"[^>]*?transform=")[^"]+"', rf'\g<1>{tr}"', src)
    assert n == 1, lid
NEW = [
    ('lbl-taur-nu-fuin', 'menor', 'translate(8,35.5) rotate(-3)', 'Taur-nu-Fuin'),
    ('lbl-menegroth', 'lugar', 'translate(-35,117.5) rotate(0)', 'Menegroth'),
    ('lbl-tol-galen', 'lugar', 'translate(166.79,291.38) rotate(0)', 'Tol Galen'),
]
extra = ''.join(f'<text id="{i}" class="{c}" transform="{t}">{x}</text>' for i, c, t, x in NEW)
src = src.replace('</g></svg>', extra + '</g></svg>')
(ROOT / 'assets/map/filme/beleriand-rotulos.svg').write_text(src)
print('ok')
