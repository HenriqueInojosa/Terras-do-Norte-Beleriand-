# ---------------------------------------------------------------- territories (Atlas ids)
exec(open('lbl_defs.py').read())
dor = FORESTS['floresta-doriath']
brethil_t = FORESTS['floresta-brethil'].buffer(1.2)
nargo = make_valid(Polygon([(-152, 108), (-128, 100), (-100, 104), (-84, 132), (-76, 175), (-88, 205), (-112, 214), (-140, 198), (-152, 160)])).difference(brethil_t)
falas = make_valid(Polygon([(-275, 95), (-215, 100), (-170, 100), (-160, 130), (-158, 175), (-172, 205), (-215, 215), (-275, 215)])).intersection(land).difference(nevrast)
dimbar = make_valid(Polygon([(-70, 74), (-52, 72), (-46, 80), (-50, 98), (-58, 110), (-66, 105), (-71, 90)])).difference(dor).difference(brethil_t)
nandung = make_valid(Polygon([(-46, 74), (-10, 72), (22, 70), (30, 78), (24, 90), (-10, 92), (-44, 90)])).difference(dor).difference(dorthonion)
nanelmoth = FORESTS['floresta-nan-elmoth'].buffer(1.2)
estolad = make_valid(Polygon([(46, 117), (70, 112), (86, 126), (80, 146), (60, 152), (44, 140)])).difference(nanelmoth)
gcut = min(range(len(gel)), key=lambda k: abs(gel[k][1] - 205))
bl = make_valid(Polygon([(-67, 174), (-30, 182), (20, 192), (64, 204)] + [tuple(p) for p in gel[gcut::-1]] + [(70, 72), (40, 92), (20, 110)]))
taurim = FORESTS['floresta-taur-im-duinath']
beleriand_leste = bl.difference(dor.buffer(1.5)).difference(himlad).difference(nanelmoth).difference(estolad).difference(nandung).difference(taurim)
_el = poly('path4889')
east = []
for yy in [y_ / 2 for y_ in range(690, 290, -1)]:
    xs_ = [x_ / 2 for x_ in range(240, 406) if _el.contains(Point(x_ / 2, yy))]
    east.append((xs_[0] if xs_ else 202.6, yy))
oss = make_valid(Polygon([tuple(p) for p in asc] + [tuple(p) for p in gel[cut:]] + [(202.6, 344.06)] + east))
ossiriand = oss.difference(poly('path4889').buffer(0.5))
ossiriand = max(polys(ossiriand), key=lambda g: g.area)
TERR2 = TERR + [('doriath', dor), ('brethil', FORESTS['floresta-brethil']), ('nargothrond', nargo), ('falas', falas), ('dimbar', dimbar),
                ('nan-dungortheb', nandung), ('beleriand-leste', beleriand_leste), ('nan-elmoth', nanelmoth), ('estolad', estolad),
                ('ossiriand', ossiriand), ('taur-im-duinath', taurim)]
TPTS2 = TPTS + [('tol-sirion', (-74.5, 52.5), 3), ('nogrod', (184, 155), 4), ('belegost', (172, 58), 4)]
TERR2 = [(t, g) for t, g in TERR2 if t != 'gondolin']
TPTS2 = TPTS2 + [('gondolin', (-61.5, 68.1), 4)]

def gd(g):
    return ''.join(pl([(round(x, 2), round(y, 2)) for x, y in r_], True) for r_ in rings(g.simplify(0.15)))
terr_svg = ('<g id="territorios">' + ''.join(f'<path id="{t}" class="territorio" d="{gd(g)}"/>' for t, g in TERR2)
            + ''.join(f'<circle id="{t}" class="territorio" cx="{f(p[0])}" cy="{f(p[1])}" r="{r_}"/>' for t, p, r_ in TPTS2) + '</g>')

# ---------------------------------------------------------------- labels
TID = {'BELERIAND LESTE': 'beleriand-leste', 'OSSIRIAND': 'ossiriand', 'FALAS': 'falas', 'TAUR-IM-DUINATH': 'taur-im-duinath',
       'DORIATH': 'doriath', 'Nan Elmoth': 'nan-elmoth', 'Floresta de Brethil': 'brethil', 'Nargothrond': 'nargothrond'}
CLS = {'reg': 'reg', 'sea': 'mar', 'frs': 'reg', 'mtn': 'mtn', 'riv': 'rio', 'wat': 'rio', 'city': 'lugar', 'minor': 'menor'}
def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return '-'.join(''.join(c if c.isalnum() else ' ' for c in s).split())
LBL['TAUR-NU-FUIN (Dorthonion)'] = ('DORTHONION', 'reg m', 'dorthonion')
LBL['Forest of  Brethil'] = ('BRETHIL', 'reg m', 'brethil')
LBL['D O R I A T H'] = ('DORIATH', 'reg xl', 'doriath')
LBL['TAUR-IM-DUINATH'] = ('TAUR-IM-DUINATH', 'reg l', 'taur-im-duinath')
LBL['Nan Elmoth'] = ('Nan Elmoth', 'reg s', 'nan-elmoth')
LBL['Nan Tathren'] = ('Nan-tathren', 'menor', None)
LBL['Birchwoods       of Nimbrethil'] = ('Nimbrethil', 'menor', None)
LBL['E r e d    E n g r i n (Iron Mountains)'] = ('Ered Engrin', 'mtn big', None)
LBL['Ered Luin (Blue Mountains)'] = ('Ered Luin', 'mtn big', None)
LBL['Angband'] = ('Angband', 'lugar mal', 'angband')
LBL['Gondolin'] = ('Gondolin', 'lugar', 'gondolin')
OVR['Forest of  Brethil'] = (-80, 103, 32)
OVR['E r e d    E n g r i n (Iron Mountains)'] = (40, -36, 0)
OVR['Angband'] = (8, -26, 0)
OVR['Thangorodrim'] = (8, 14, 0)
lbls = []; used = set()
def add(lid, txt, cls, cx, cy, ang, terr=None):
    if lid in used:
        k = 2
        while f'{lid}-{k}' in used: k += 1
        lid = f'{lid}-{k}'
    used.add(lid)
    att = f' data-territorio="{terr}"' if terr else ''
    lbls.append(f'<text id="{lid}" class="{cls}"{att} transform="translate({f(cx)},{f(cy)}) rotate({round(ang,1)})">{txt}</text>')
for t in G['texts']:
    key = t['txt']
    if key not in LBL: continue
    txt, cls, terr = LBL[key]
    if isinstance(txt, list): txt = txt[0]
    terr = terr or TID.get(txt)
    c0 = cls.split()[0]; rest = ' '.join(cls.split()[1:])
    cls2 = (CLS.get(c0, c0) + (' ' + rest if rest else '')).replace('two', '').replace('doriath', '').strip()
    cx, cy, ang = OVR.get(key, (t['cx'], t['cy'], t['angle']))
    add('lbl-' + (terr or slug(txt)), txt, cls2, cx, cy, ang, terr)
add('lbl-ard-galen', 'ARD-GALEN', 'reg l', 70, 13, -2, 'ard-galen')
add('lbl-aglon', 'Aglon', 'lugar', aglon[0], aglon[1] - 4, 0, 'aglon')
add('lbl-maglors-gap', 'Brecha de Maglor', 'menor', maglor[0] + 1, maglor[1] - 5, 0, 'maglors-gap')
add('lbl-tol-sirion', 'Tol Sirion', 'lugar', -74.5, 47, 0, 'tol-sirion')
add('lbl-dimbar', 'DIMBAR', 'reg s', -60, 92, 0, 'dimbar')
add('lbl-nan-dungortheb', 'Nan Dungortheb', 'reg s', -5, 80, -3, 'nan-dungortheb')
add('lbl-estolad', 'ESTOLAD', 'reg s', 65, 134, 0, 'estolad')
add('lbl-nogrod', 'Nogrod', 'lugar', 184, 162, 0, 'nogrod')
add('lbl-belegost', 'Belegost', 'lugar', 172, 51, 0, 'belegost')
LCSS = f'''#labels text{{text-anchor:middle;dominant-baseline:central;paint-order:stroke;stroke:{PAPER};stroke-width:1px;stroke-linejoin:round}}
#labels .reg{{font-family:'IM Fell English SC',serif;fill:{RED};letter-spacing:1.6px}}
#labels .reg.xl{{font-size:9.5px;letter-spacing:4.5px}} #labels .reg.l{{font-size:7px;letter-spacing:2.8px}} #labels .reg.m{{font-size:5.6px;letter-spacing:1.8px}} #labels .reg.s{{font-size:4.6px;letter-spacing:1.2px}} #labels .reg.xs{{font-size:3.8px}}
#labels .mar{{font-family:'Uncial Antiqua',serif;font-size:14px;letter-spacing:8px;fill:{INK};opacity:.8}}
#labels .mtn{{font-family:'IM Fell English',serif;font-style:italic;font-size:4.8px;fill:{INK}}}
#labels .mtn.big{{font-family:'IM Fell English SC',serif;font-style:normal;font-size:8px;letter-spacing:4px}}
#labels .mtn.dark{{font-size:5.2px}}
#labels .rio{{font-family:'IM Fell English',serif;font-style:italic;font-size:4px;fill:#2d4a5e}}
#labels .rio.s{{font-size:3.6px}}
#labels .lugar{{font-family:'IM Fell English',serif;font-size:5px;fill:{INK}}}
#labels .lugar.mal{{font-family:'IM Fell English SC',serif;font-size:6px;letter-spacing:2px;fill:#5a1408}}
#labels .menor{{font-family:'IM Fell English',serif;font-style:italic;font-size:4px;fill:{INK}}}'''
labels_svg = f'<g id="labels">{"".join(lbls)}</g>'
regions_doc = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VBX} {VBY} {VBW} {VBH}">'
               f'<style>{FONTS}\n{LCSS}</style>{terr_svg}{labels_svg}</svg>')
open('ink_regioes.svg', 'w').write(regions_doc)
full = art_svg().replace('</svg>', f'<style>{LCSS}\n#territorios .territorio{{fill:transparent;pointer-events:all}}</style>{terr_svg}{labels_svg}</svg>')
open('ink_completo.svg', 'w').write(full)
dbg = full.replace('fill:transparent', 'fill:rgba(200,0,0,.18);stroke:#c00;stroke-width:.4px')
open('ink_dbg.svg', 'w').write(dbg)
print('layers ok', len(TERR2), len(TPTS2), len(lbls), file=sys.stderr)
