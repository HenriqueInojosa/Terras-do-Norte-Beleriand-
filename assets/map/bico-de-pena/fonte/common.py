import json, math, random, sys
from shapely.geometry import Polygon, LineString, Point, box, MultiPolygon, GeometryCollection
from shapely.ops import unary_union, nearest_points
from shapely.validation import make_valid

random.seed(7)
G = json.load(open('geo.json'))
P = G['paths']
X0, Y0, W, H = -273.18542, -58.418143, 475.78688, 402.47709
X1, Y1 = X0 + W, Y0 + H
MAP = box(X0, Y0, X1, Y1)
S = 0.297361  # sketch px (1600 wide) -> map units

def px(x, y): return (x * S + X0, y * S + Y0)
def pts(i): return P[i]['pts']
def poly(i, buf=0):
    g = make_valid(Polygon(pts(i)))
    if buf: g = g.buffer(buf)
    return g
def f(v): return f"{v:.2f}".rstrip('0').rstrip('.')

def geom_d(g):
    out = []
    polys = []
    if isinstance(g, Polygon): polys = [g]
    elif hasattr(g, 'geoms'):
        for s in g.geoms:
            if isinstance(s, Polygon): polys.append(s)
            elif isinstance(s, MultiPolygon): polys += list(s.geoms)
    for p in polys:
        for ring in [p.exterior] + list(p.interiors):
            c = list(ring.coords)
            out.append('M' + ' '.join(f"{f(x)},{f(y)}" for x, y in c) + 'Z')
    return ''.join(out)

def line_d(g):
    out = []
    lines = [g] if isinstance(g, LineString) else [s for s in getattr(g, 'geoms', []) if isinstance(s, LineString)]
    for l in lines:
        c = list(l.coords)
        if len(c) > 1: out.append('M' + ' '.join(f"{f(x)},{f(y)}" for x, y in c))
    return ''.join(out)

# ---------------- water ----------------
coast_w = pts('path4537'); coast_n = pts('path4741')
sea_ring = [(X0 - 1, Y0 - 1)] + list(reversed(coast_n)) + coast_w[1:] + [(coast_w[-1][0], Y1 + 1), (X0 - 1, Y1 + 1)]
sea = make_valid(Polygon(sea_ring)).intersection(MAP)
if not isinstance(sea, Polygon): sea = max([g for g in getattr(sea, 'geoms', [sea]) if isinstance(g, Polygon)], key=lambda g: g.area)
balar = poly('path4795')
ice = make_valid(Polygon(pts('path4743') + [(pts('path4743')[-1][0], Y0 - 1), (pts('path4743')[0][0], Y0 - 1)]))
sea = sea.difference(balar).difference(ice)
land = MAP.difference(sea)
lakes = {'lago-linaewen': 'path4795-9', 'lago-helevorn': 'path4795-9-9', 'lago-mithrim': 'path4795-9-4'}

# ---------------- features ----------------
MOUNTS = {
    'mont-ered-engrin': (['path3847'], 'iron'),
    'thangorodrim': (['path3849', 'path3849-6', 'path3849-6-1', 'path3849-6-1-4'], 'fire'),
    'mont-ered-wethrin-lomin': (['path947'], 'std'),
    'mont-echoriath': (['path955'], 'std'),
    'mont-dorthonion': (['path952', 'path959'], 'dark'),
    'colinas-himring': (['path968'], 'std'),
    'mont-ered-luin': (['path4889'], 'blue'),
    'taur-en-faroth': (['path970', 'path972'], 'std'),
    'andram': (['path978'], 'std'),
    'colina-teiglin': (['path980'], 'std'),
    'colinas-falas': (['path997', 'path997-4'], 'std'),
}
dor_raw = poly('path4935')
brethil_clip = box(-100, 80, -52, 128)
FORESTS = {
    'floresta-doriath': dor_raw.difference(brethil_clip),
    'floresta-brethil': dor_raw.intersection(brethil_clip),
    'floresta-taur-im-duinath': poly('path4898'),
    'floresta-nan-elmoth': poly('path5264-6'),
    'floresta-nan-tathren': poly('path4937'),
    'bosques-nimbrethil': unary_union([poly('path4939'), make_valid(Polygon(pts('path4941')))]),
}
RIVERS = {
    'rio-sirion': (['path1133', 'path1082', 'path1085'], 1.15),
    'rio-gelion': (['path1105'], 1.15),
    'rio-aros': (['path1102'], .8), 'rio-celon': (['path1124'], .7),
    'rio-mindeb': (['path1136'], .55), 'rio-teiglin': (['path1138'], .75),
    'rio-narog': (['path1141'], .85), 'rio-ginglith': (['path1143'], .6),
    'rio-nenning': (['path1145'], .7), 'rio-falas': (['path1148'], .55),
    'rio-mithrim': (['path1136-2'], .5),
    'rios-ossiriand': (['path1108', 'path1110', 'path1112', 'path1114', 'path1116', 'path1120', 'path1122'], .65),
}

# ---------------- territories (Atlas hit zones) ----------------
def pxpoly(l): return make_valid(Polygon([px(*p) for p in l]))
mount_all = unary_union([poly(i) for k, (ids, _) in MOUNTS.items() for i in ids])
hithlum = pxpoly([(225,110),(420,115),(560,150),(605,170),(618,250),(628,330),(600,372),(520,420),(470,442),(400,448),(330,440),(298,400),(280,340),(240,300),(210,230),(200,160)]).intersection(land).difference(poly('path3847').buffer(1))
mithrim = pxpoly([(500,165),(560,152),(605,170),(618,250),(628,330),(600,372),(540,388),(470,352),(458,300),(488,240)]).intersection(hithlum)
dorlomin = pxpoly([(298,350),(458,328),(470,352),(540,388),(520,420),(470,442),(400,448),(330,440),(300,400)]).intersection(hithlum)
nevrast = pxpoly([(230,375),(330,352),(352,400),(445,455),(470,490),(410,522),(250,535),(90,535),(60,520),(150,430)]).intersection(land).difference(hithlum)
dorthonion = unary_union([poly('path952'), poly('path959')]).buffer(2.5).buffer(-1)
ardgalen = pxpoly([(645,110),(1330,110),(1330,300),(1310,330),(1100,330),(1000,300),(780,290),(700,335),(660,300)]).difference(poly('path3847').buffer(1)).difference(dorthonion).difference(poly('path968'))
himlad = pxpoly([(1000,405),(1100,412),(1190,420),(1205,445),(1150,520),(1060,560),(1020,520),(1000,470)])
gel = pts('path1105'); asc = pts('path1120')
cut = min(range(len(gel)), key=lambda k: (gel[k][0]-asc[-1][0])**2 + (gel[k][1]-asc[-1][1])**2)
thar = make_valid(Polygon(gel[:cut+1] + list(reversed(asc)) + [(178, 148), (172, 70), (150, 55), (126, 56)]))
thargelion = thar.difference(poly('path4889'))
angband = unary_union([poly(i) for i in MOUNTS['thangorodrim'][0]]).buffer(3).union(Point(10.4, -24).buffer(5)).convex_hull
gondolin = make_valid(Polygon(pts('path957'))).buffer(2.2)
a, b = nearest_points(poly('path959'), poly('path968'))
aglon = ((a.x + b.x) / 2, (a.y + b.y) / 2)
l_end = (pts('path968')[0]); ed = poly('path4889')
a2, b2 = nearest_points(poly('path968'), ed)
maglor = ((a2.x + b2.x) / 2, (a2.y + b2.y) / 2)
himring_pt = (63.5, 61.0)
TERR = [('hithlum', hithlum.difference(mithrim).difference(dorlomin)), ('mithrim', mithrim), ('dor-lomin', dorlomin), ('nevrast', nevrast),
        ('dorthonion', dorthonion), ('ard-galen', ardgalen), ('himlad', himlad), ('thargelion', thargelion),
        ('angband', angband), ('gondolin', gondolin)]
TPTS = [('himring', himring_pt, 5), ('aglon', aglon, 4.5), ('maglors-gap', maglor, 5.5)]

