"""Beleriand em estilo bico de pena. Gera arte (sem nomes), camada de regiões e camada de rótulos."""
import math, random, sys, unicodedata
exec(open('common.py').read())
from shapely.geometry import Polygon, LineString, Point, box, MultiPolygon
from shapely.ops import unary_union, nearest_points
from shapely import affinity

R = random.Random(42)
INK = '#2a1f16'; PAPER = '#f0e4c6'; RED = '#8e2b1c'
VBX, VBY, VBW, VBH = -273.19, -58.42, 475.79, 402.48  # sem moldura: borda a borda

# ---------------------------------------------------------------- helpers
def resample(c, step):
    out = [c[0]]
    for (x0, y0), (x1, y1) in zip(c, c[1:]):
        L = math.hypot(x1 - x0, y1 - y0)
        n = max(1, int(L / step))
        for k in range(1, n + 1):
            out.append((x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n))
    return out

def wobble(c, amp=0.25, step=0.6, closed=False):
    c = resample(c, step)
    if len(c) < 3: return c
    ph = [R.uniform(0, 6.28) for _ in range(3)]; fr = [R.uniform(.25, .4), R.uniform(.7, 1.1), R.uniform(1.8, 2.6)]
    out = []; s = 0
    for i, (x, y) in enumerate(c):
        a = c[max(0, i - 1)]; b = c[min(len(c) - 1, i + 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        if i: s += math.hypot(x - c[i - 1][0], y - c[i - 1][1])
        o = amp * (0.55 * math.sin(s * fr[0] + ph[0]) + 0.3 * math.sin(s * fr[1] + ph[1]) + 0.15 * math.sin(s * fr[2] + ph[2]))
        out.append((x + nx * o, y + ny * o))
    return out

def pl(c, close=False):
    return 'M' + ' '.join(f"{f(x)},{f(y)}" for x, y in c) + ('Z' if close else '')

def rings(g):
    gs = [g] if isinstance(g, Polygon) else [s for s in getattr(g, 'geoms', []) if isinstance(s, Polygon)]
    for p in gs:
        yield list(p.exterior.coords)
        for i in p.interiors: yield list(i.coords)

def lines_of(g):
    if isinstance(g, LineString): return [list(g.coords)]
    return [list(s.coords) for s in getattr(g, 'geoms', []) if isinstance(s, LineString) and len(s.coords) > 1]

def polys(g):
    if isinstance(g, Polygon): return [g]
    return [s for s in getattr(g, 'geoms', []) if isinstance(s, Polygon)]

def taper(c, w0, w1):
    """variable-width ribbon along polyline (source w0 -> mouth w1)."""
    c = resample(c, 0.5)
    n = len(c); L = []; Rr = []
    for i, (x, y) in enumerate(c):
        a = c[max(0, i - 1)]; b = c[min(n - 1, i + 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]; l = math.hypot(dx, dy) or 1
        nx, ny = -dy / l, dx / l
        t = i / (n - 1)
        w = (w0 + (w1 - w0) * (t ** 0.7)) / 2
        L.append((x + nx * w, y + ny * w)); Rr.append((x - nx * w, y - ny * w))
    return pl(L + Rr[::-1], True)

# ---------------------------------------------------------------- mountains
def mountain(x, y, h, w, style):
    dx = R.uniform(-.15, .15) * w
    Lb = (x - w / 2, y); Rb = (x + w / 2 + R.uniform(-.1, .1) * w, y); T = (x + dx, y - h)
    cl = (Lb[0] + (T[0] - Lb[0]) * R.uniform(.5, .65), y - h * R.uniform(.28, .42))
    shoulder = R.random() < .45
    if shoulder:
        S = (T[0] + w * R.uniform(.16, .26), y - h * R.uniform(.55, .7))
        right = f"L{f(S[0])},{f(S[1])}Q{f(S[0]+(Rb[0]-S[0])*.45)},{f(y-h*.18)} {f(Rb[0])},{f(Rb[1])}"
    else:
        cr = (T[0] + (Rb[0] - T[0]) * R.uniform(.35, .5), y - h * R.uniform(.3, .42))
        right = f"Q{f(cr[0])},{f(cr[1])} {f(Rb[0])},{f(Rb[1])}"
    outline = f"M{f(Lb[0])},{f(Lb[1])}Q{f(cl[0])},{f(cl[1])} {f(T[0])},{f(T[1])}{right}"
    # hatching on the shaded (right) flank
    dens = {'std': 1.05, 'dark': 1.35, 'iron': 1.6, 'fire': 2.0, 'blue': 1.1}[style]
    k = max(2, int(h * dens))
    hs = []
    for i in range(k):
        t = (i + 1) / (k + 1)
        px_ = T[0] + (Rb[0] - T[0]) * t * .92; py_ = T[1] + (y - T[1]) * (t ** 1.25)
        ln = (y - py_) * R.uniform(.45, .8)
        ex, ey = px_ - ln * .32, py_ + ln
        if ey > y - .15: ey = y - .15
        hs.append(f"M{f(px_-.08)},{f(py_+.15)}L{f(ex)},{f(ey)}")
    # crease from peak
    cre = f"M{f(T[0])},{f(T[1])}q{f(w*.04)},{f(h*.3)} {f(w*.1)},{f(h*.55)}" if h > 3 else ''
    # a few strokes on lit flank for iron/fire
    if style in ('iron', 'fire'):
        for i in range(int(h * .5)):
            t = R.uniform(.3, .8)
            px_ = Lb[0] + (T[0] - Lb[0]) * t; py_ = y - h * t * .9
            hs.append(f"M{f(px_+.3)},{f(py_+.3)}l{f(.4)},{f(h*.18)}")
    fill = outline + 'Z'
    return fill, outline, ''.join(hs) + cre

def hill(x, y, h, w):
    o = f"M{f(x-w/2)},{f(y)}Q{f(x-w*.05)},{f(y-h*1.7)} {f(x+w/2)},{f(y)}"
    hs = ''.join(f"M{f(x+w*(.12+.1*i))},{f(y-h*(.62-.16*i))}l{f(-.25)},{f(h*(.45-.1*i))}" for i in range(3))
    return o + 'Z', o, hs

def range_glyphs(g, style, scale=1.0, hills=False):
    items = []
    for p in polys(g):
        if p.area < 0.5: continue
        minx, miny, maxx, maxy = p.bounds
        hbar = 6.4 * scale if not hills else 1.9
        dy = hbar * .6; y = miny + dy * .5; row = 0
        while y <= maxy + hbar * .3:
            dxs = hbar * 1.25
            x = minx + (dxs / 2 if row % 2 else 0) + R.uniform(0, dxs * .3)
            while x <= maxx:
                pt = Point(x, y - hbar * .25)
                if p.contains(pt):
                    d = p.exterior.distance(pt)
                    if hills:
                        h = R.uniform(1.1, 1.7); w = h * R.uniform(2.2, 2.8)
                    else:
                        h = min(10 * scale, max(3.0, (2.4 + d * 1.0) * R.uniform(.8, 1.15)))
                        w = h * R.uniform(1.55, 2.0)
                    items.append((y, x, h, w))
                x += dxs * R.uniform(.8, 1.1)
            y += dy; row += 1
        if not items:
            c = p.representative_point(); items.append((c.y + 1, c.x, 2.4, 3.4))
    items.sort()
    out = []
    for y, x, h, w in items:
        fl, ol, hs = hill(x, y, h, w) if hills else mountain(x, y, h, w, style)
        out.append((fl, ol, hs))
    return out

def mountains_svg(gid, g, style, scale=1.0, hills=False):
    gl = range_glyphs(g, style, scale, hills)
    sw = {'std': .3, 'dark': .32, 'iron': .34, 'fire': .38, 'blue': .3}[style]
    s = [f'<g id="{gid}">']
    for fl, ol, hs in gl:
        s.append(f'<path d="{fl}" fill="{PAPER}"/><path d="{ol}" class="o"/><path d="{hs}" class="h"/>')
    s.append('</g>')
    return ''.join(s).replace('class="o"', f'fill="none" stroke="{INK}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"').replace('class="h"', f'fill="none" stroke="{INK}" stroke-width="{sw*.55}" stroke-linecap="round"')

# ---------------------------------------------------------------- trees
TREE_SYMS = []
def decid(r):
    n = 5; pts_ = []
    for k in range(n + 1):
        a = math.pi * (1.05 + k * 0.9 / n * 1.0)  # 189deg..351deg (top arc)
        pts_.append((math.cos(a) * r, -r * .9 + math.sin(a) * r * .95))
    d = f"M{f(pts_[0][0])},{f(pts_[0][1])}"
    for (x0, y0), (x1, y1) in zip(pts_, pts_[1:]):
        d += f"A{f(r*.36)},{f(r*.36)} 0 0 1 {f(x1)},{f(y1)}"
    # lower bumps (back toward start)
    lo = [(r * .9, -r * .55), (r * .35, -r * .15), (-r * .35, -r * .15), (-r * .9, -r * .55)]
    prev = pts_[-1]
    for q in lo:
        d += f"A{f(r*.42)},{f(r*.42)} 0 0 1 {f(q[0])},{f(q[1])}"
    d += 'Z'
    return d
for i, r in enumerate([1.0, 1.15, 0.9]):
    crown = decid(r)
    TREE_SYMS.append(f'<symbol id="arv{i}" overflow="visible"><path d="{crown}" fill="{PAPER}" stroke="{INK}" stroke-width=".17" stroke-linejoin="round"/><path d="M0,{f(-r*.15)}V{f(r*.35)}" stroke="{INK}" stroke-width=".2"/><path d="M{f(r*.25)},{f(-r*.5)}a{f(r*.5)},{f(r*.5)} 0 0 1 {f(r*.2)},{f(-r*.6)}" fill="none" stroke="{INK}" stroke-width=".1"/></symbol>')
def pine(h):
    w = h * .32
    return (f"M0,{f(-h)}L{f(-w*.55)},{f(-h*.55)}L{f(-w*.3)},{f(-h*.58)}L{f(-w*.8)},{f(-h*.2)}L{f(-w*.35)},{f(-h*.24)}L{f(-w)},{f(h*.12)}"
            f"L{f(w)},{f(h*.12)}L{f(w*.35)},{f(-h*.24)}L{f(w*.8)},{f(-h*.2)}L{f(w*.3)},{f(-h*.58)}L{f(w*.55)},{f(-h*.55)}Z")
for i, h in enumerate([2.4, 2.8]):
    TREE_SYMS.append(f'<symbol id="pin{i}" overflow="visible"><path d="{pine(h)}" fill="{PAPER}" stroke="{INK}" stroke-width=".17" stroke-linejoin="round"/><path d="M0,{f(h*.12)}V{f(h*.3)}" stroke="{INK}" stroke-width=".2"/><path d="M{f(h*.06)},{f(-h*.5)}l{f(h*.12)},{f(h*.35)}M{f(h*.12)},{f(-h*.12)}l{f(h*.14)},{f(h*.2)}" stroke="{INK}" stroke-width=".1"/></symbol>')

def forest_svg(gid, g, kind='decid', spacing=1.55, scale=1.0, sparse=1.0):
    items = []
    for p in polys(g):
        if p.area < 1: continue
        minx, miny, maxx, maxy = p.bounds
        dy = spacing * .72; y = miny + .3; row = 0
        while y <= maxy + 1:
            x = minx + (spacing / 2 if row % 2 else 0)
            while x <= maxx:
                q = (x + R.uniform(-.25, .25) * spacing, y + R.uniform(-.2, .2) * dy)
                if p.contains(Point(q[0], q[1] - .6)) and R.random() < sparse:
                    items.append((q[1], q[0]))
                x += spacing
            y += dy; row += 1
    items.sort()
    s = [f'<g id="{gid}">']
    for y, x in items:
        if kind == 'pine' or (kind == 'mixed' and R.random() < .45):
            sym = f'pin{R.randrange(2)}'
        else:
            sym = f'arv{R.randrange(3)}'
        sc = scale * R.uniform(.85, 1.12)
        s.append(f'<use href="#{sym}" transform="translate({f(x)},{f(y)}) scale({f(sc)})"/>')
    s.append('</g>')
    return ''.join(s), len(items)

# ---------------------------------------------------------------- build art
art = []
# sea ripples (offset lines along coast, broken)
ripple = []
inner_sea = sea.buffer(-0.2)
landish = land.union(MAP.exterior.buffer(0.01).intersection(land))
for k, (o, op) in enumerate([(1.3, .8), (2.6, .6), (4.0, .45), (5.6, .32), (7.4, .2), (9.6, .12)]):
    ring = landish.buffer(o).boundary.intersection(inner_sea)
    for ln in lines_of(ring):
        c = wobble(ln, .12 + k * .03, .8)
        ripple.append(f'<path d="{pl(c)}" stroke-opacity="{op}" stroke-dasharray="{f(R.uniform(5,14))} {f(R.uniform(.6,1.6))} {f(R.uniform(2,6))} {f(R.uniform(.6,1.4))}"/>')
# open-sea strokes: short horizontal ruled strokes
seastrokes = []
for _ in range(2600):
    x, y = R.uniform(X0 + 2, X1), R.uniform(Y0 + 2, Y1 - 2)
    pt = Point(x, y)
    if not sea.contains(pt) or land.distance(pt) < 11: continue
    L = R.uniform(1.5, 4.5)
    seastrokes.append(f'M{f(x)},{f(y)}q{f(L/2)},{f(-.35)} {f(L)},0')
art.append(f'<g id="mar" fill="none" stroke="{INK}" stroke-width=".18" stroke-linecap="round">{"".join(ripple)}<path d="{"".join(seastrokes)}" stroke-opacity=".28" stroke-width=".16"/></g>')

# coast
coast = []
for pid, w in [('path4537', .55), ('path4741', .55), ('path4743', .45), ('path4795', .5)]:
    c = wobble(pts(pid), .18, .5)
    coast.append(f'<path d="{pl(c, P[pid]["closed"])}" stroke-width="{w}"/>')
    coast.append(f'<path d="{pl(wobble(pts(pid), .22, .5), P[pid]["closed"])}" stroke-width="{w*.35}" stroke-opacity=".6"/>')
art.append(f'<g id="costa" fill="none" stroke="{INK}" stroke-linejoin="round" stroke-linecap="round">{"".join(coast)}</g>')

# lakes
lk = []
for lid, pid in {'lago-linaewen': 'path4795-9', 'lago-helevorn': 'path4795-9-9', 'lago-mithrim': 'path4795-9-4'}.items():
    g = poly(pid)
    lk.append(f'<path id="{lid}" d="{pl(wobble(pts(pid), .12, .4), True)}" fill="{PAPER}" stroke="{INK}" stroke-width=".42"/>')
    for o in (.7, 1.4):
        gi = g.buffer(-o)
        for rr in rings(gi):
            lk.append(f'<path d="{pl(rr, True)}" fill="none" stroke="{INK}" stroke-width=".14" stroke-opacity=".5" stroke-dasharray="3 .8"/>')
art.append(f'<g id="lagos">{"".join(lk)}</g>')

# marsh
def tufts(cx, cy, n, rx, ry):
    out = []
    for _ in range(n):
        x, y = cx + R.uniform(-rx, rx), cy + R.uniform(-ry, ry)
        out.append(f'M{f(x-1.2)},{f(y)}h2.4M{f(x)},{f(y)}v-1.2M{f(x-.5)},{f(y)}l-.45,-.9M{f(x+.5)},{f(y)}l.45,-.9M{f(x-.9)},{f(y+.6)}h1')
    return ''.join(out)
art.append(f'<g id="pantanos" fill="none" stroke="{INK}" stroke-width=".16" stroke-linecap="round"><path d="{tufts(-192, 86, 18, 13, 4.5)}{tufts(-66, 35, 14, 7, 5)}"/></g>')

# rivers (tapered ribbons, source -> mouth)
RIV = [('rio-sirion', ['path1133', 'path1082'], .25, .95), ('rio-sirion-fozes', ['path1085'], .3, .5),
       ('rio-gelion', ['path1105'], .3, 1.0), ('rio-aros', ['path1102'], .2, .7), ('rio-celon', ['path1124'], .18, .55),
       ('rio-mindeb', ['path1136'], .15, .45), ('rio-teiglin', ['path1138'], .18, .62), ('rio-narog', ['path1141'], .2, .75),
       ('rio-ginglith', ['path1143'], .15, .5), ('rio-nenning', ['path1145'], .15, .55), ('rio-falas', ['path1148'], .15, .45),
       ('rio-mithrim', ['path1136-2'], .35, .15)]
for pid in ['path1108', 'path1110', 'path1112', 'path1114', 'path1116', 'path1120', 'path1122']:
    RIV.append(('rio-' + pid, [pid], .15, .55))
rv = []
for rid, ids, w0, w1 in RIV:
    for i, pid in enumerate(ids):
        c = wobble(pts(pid), .22, .5)
        a = w0 + (w1 - w0) * i / len(ids); b = w0 + (w1 - w0) * (i + 1) / len(ids)
        rv.append(f'<path id="{rid}{"-"+str(i) if i else ""}" d="{taper(c, a, b)}"/>')
art.append(f'<g id="rios" fill="{INK}" stroke="{INK}" stroke-width=".06">{"".join(rv)}</g>')

# forests
FOR = [('floresta-doriath', FORESTS['floresta-doriath'], 'decid', 2.3, 1.5, 1),
       ('floresta-brethil', FORESTS['floresta-brethil'], 'decid', 2.1, 1.35, 1),
       ('floresta-taur-im-duinath', FORESTS['floresta-taur-im-duinath'], 'mixed', 2.4, 1.5, 1),
       ('floresta-nan-elmoth', FORESTS['floresta-nan-elmoth'], 'pine', 1.9, 1.3, 1),
       ('floresta-nan-tathren', FORESTS['floresta-nan-tathren'], 'decid', 2.1, 1.25, .85),
       ('bosques-nimbrethil', FORESTS['bosques-nimbrethil'], 'decid', 2.0, 1.15, .9)]
dorth_land = unary_union([poly('path952'), poly('path959')]).buffer(2).difference(unary_union([poly('path952'), poly('path959')]).buffer(.4))
fo = []
for fid, g, kind, sp, sc, sparse in FOR:
    s_, n_ = forest_svg(fid, g.buffer(-.3), kind, sp, sc, sparse); fo.append(s_)
s_, _ = forest_svg('pinhais-dorthonion', unary_union([poly('path952'), poly('path959')]).buffer(1.2).difference(poly('path959').buffer(-1.5)).difference(poly('path952').buffer(-1.5)), 'pine', 3.4, 1.05, .45); fo.append(s_)
# girdle of Melian: fine dotted line
gird = FORESTS['floresta-doriath'].buffer(1.4, join_style=1)
fo.append(''.join(f'<path id="cinturao-de-melian" d="{pl(wobble(r_, .15, .5), True)}" fill="none" stroke="{INK}" stroke-width=".22" stroke-dasharray=".15 .9" stroke-linecap="round"/>' for r_ in rings(gird)))
art.append(f'<g id="florestas">{"".join(fo)}</g>')

# mountains (drawn after forests: they sit on top where they meet)
MT = [('mont-ered-engrin', ['path3847'], 'iron', 1.05, False), ('mont-ered-wethrin-lomin', ['path947'], 'std', .9, False),
      ('mont-echoriath', ['path955'], 'std', .85, False), ('mont-dorthonion', ['path952', 'path959'], 'dark', .85, False),
      ('colinas-himring', ['path968'], 'std', .75, False), ('mont-ered-luin', ['path4889'], 'blue', .95, False),
      ('taur-en-faroth', ['path970', 'path972'], 'std', .6, True), ('andram', ['path978'], 'std', .6, True),
      ('colina-teiglin', ['path980'], 'std', .6, True), ('colinas-falas', ['path997', 'path997-4'], 'std', .7, True)]
mt = []
for gid, ids, style, sc, hl in MT:
    g = unary_union([poly(i) for i in ids])
    mt.append(mountains_svg(gid, g, style, sc, hl))
# Thangorodrim: three great peaks
tg = []
for (x, y, h, w) in [(-6, 5, 17, 15), (20, 6, 15, 14), (7, 8, 23, 17)]:
    fl, ol, hs = mountain(x, y, h, w, 'fire')
    tg.append(f'<path d="{fl}" fill="{PAPER}"/><path d="{ol}" fill="none" stroke="{INK}" stroke-width=".5" stroke-linejoin="round"/><path d="{hs}" fill="none" stroke="{INK}" stroke-width=".26"/>')
smoke = ''.join(f'<path d="M{f(7+R.uniform(-1,1))},{f(-10-i*3.2)}c{f(R.uniform(-3,-1))},-1.2 {f(R.uniform(1,3))},-2 {f(R.uniform(-1,1))},-3.2" fill="none" stroke="{INK}" stroke-width=".22" stroke-opacity="{f(.7-i*.12)}"/>' for i in range(5))
mt.append(f'<g id="thangorodrim">{"".join(tg)}{smoke}</g>')
art.append(f'<g id="montanhas">{"".join(mt)}</g>')

# places (no names; gondolin intentionally unmarked)
def tower(x, y, s=1):
    return (f'<path d="M{f(x-1.1*s)},{f(y+1*s)}V{f(y-1.6*s)}h{f(.55*s)}v{f(.5*s)}h{f(.55*s)}v{f(-.5*s)}h{f(.55*s)}v{f(.5*s)}h{f(.55*s)}v{f(-.5*s)}h{f(.0)}V{f(y+1*s)}Z" '
            f'fill="{PAPER}" stroke="{INK}" stroke-width=".22"/><path d="M{f(x)},{f(y+1*s)}v{f(-.9*s)}" stroke="{INK}" stroke-width=".25"/>')
pl_ = [tower(*himring_pt, 1.1), tower(-242.5, 92.6, .9),
       f'<path d="M-118.4,164.2a2.8,2.4 0 0 1 5.6,0Z" fill="{INK}"/><path d="M-119.4,164.2h7.6" stroke="{INK}" stroke-width=".3"/>',  # Nargothrond doors
       f'<path d="M7,-1.5a2.2,2.2 0 0 1 4.4,0v2h-4.4Z" fill="{INK}"/>']  # gates of Angband
art.append(f'<g id="lugares">{"".join(pl_)}</g>')

# ---------------------------------------------------------------- frame, compass, title (no region names)
def compass(cx, cy, Rr):
    g = [f'<g id="rosa-dos-ventos" transform="translate({f(cx)},{f(cy)})" fill="none" stroke="{INK}">']
    g.append(f'<circle r="{f(Rr)}" stroke-width=".35"/><circle r="{f(Rr*.88)}" stroke-width=".15"/>')
    for k in range(32):
        a = k * math.pi / 16; r1 = Rr * .88; r2 = Rr * (.8 if k % 2 else .74)
        g.append(f'<path d="M{f(r1*math.sin(a))},{f(-r1*math.cos(a))}L{f(r2*math.sin(a))},{f(-r2*math.cos(a))}" stroke-width=".14"/>')
    for k in range(8):
        a = k * math.pi / 4; Lr = Rr * (1.05 if k == 0 else .95 if k % 2 == 0 else .58); wd = Rr * (.13 if k % 2 == 0 else .09)
        tip = (Lr * math.sin(a), -Lr * math.cos(a))
        l = (wd * math.sin(a - math.pi / 2), -wd * math.cos(a - math.pi / 2)); r = (wd * math.sin(a + math.pi / 2), -wd * math.cos(a + math.pi / 2))
        g.append(f'<path d="M0,0L{f(l[0])},{f(l[1])}L{f(tip[0])},{f(tip[1])}Z" fill="{PAPER}" stroke-width=".18"/>')
        g.append(f'<path d="M0,0L{f(r[0])},{f(r[1])}L{f(tip[0])},{f(tip[1])}Z" fill="{INK}" stroke-width=".18"/>')
    g.append(f'<circle r="{f(Rr*.07)}" fill="{PAPER}" stroke-width=".2"/>')
    g.append(f'<text y="{f(-Rr*1.18)}" text-anchor="middle" font-family="IM Fell English SC, serif" font-size="5.5" fill="{INK}" stroke="none">N</text></g>')
    return ''.join(g)

def frame():
    s = [f'<g id="moldura" fill="none" stroke="{INK}">']
    for o, w in [(0, .7), (2.2, .25), (7.5, .9), (9, .25)]:
        rr = [(X0 - o, Y0 - o), (X1 + o, Y0 - o), (X1 + o, Y1 + o), (X0 - o, Y1 + o)]
        s.append(f'<path d="{pl(wobble(rr + [rr[0]], .08, 1.5), True)}" stroke-width="{w}"/>')
    # tick marks between inner lines (hand-ruled graticule)
    t = []
    for x in [X0 + k * 10 for k in range(1, int(W // 10) + 1)]:
        t.append(f'M{f(x)},{f(Y0)}v-2.2M{f(x)},{f(Y1)}v2.2')
    for y in [Y0 + k * 10 for k in range(1, int(H // 10) + 1)]:
        t.append(f'M{f(X0)},{f(y)}h-2.2M{f(X1)},{f(y)}h2.2')
    s.append(f'<path d="{"".join(t)}" stroke-width=".2"/>')
    s.append('</g>')
    return ''.join(s)

title = (f'<g id="titulo"><text x="{f(X0+W/2)}" y="{f(Y0-24)}" text-anchor="middle" font-family="Uncial Antiqua, serif" font-size="24" fill="{INK}" letter-spacing="2">Beleriand</text>'
         f'<text x="{f(X0+W/2)}" y="{f(Y0-13)}" text-anchor="middle" font-family="IM Fell English, serif" font-style="italic" font-size="6.2" fill="{INK}" letter-spacing=".6">as terras do norte e de além do Sirion nos dias antigos</text>'
         f'<path d="M{f(X0+W/2-150)},{f(Y0-33)}c30,-3 50,3 72,0M{f(X0+W/2+150)},{f(Y0-33)}c-30,-3 -50,3 -72,0" fill="none" stroke="{INK}" stroke-width=".35"/></g>')

FONTS = "@import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&amp;family=IM+Fell+English+SC&amp;family=Pirata+One&amp;family=Uncial+Antiqua&amp;display=swap');"
DEFS = f'''<defs><style>{FONTS}</style>
<filter id="papel" x="0" y="0" width="100%" height="100%">
 <feTurbulence type="fractalNoise" baseFrequency=".028" numOctaves="5" seed="9" result="n"/>
 <feColorMatrix in="n" type="matrix" values="0 0 0 0 .45  0 0 0 0 .32  0 0 0 0 .17  0 0 0 -.9 .42" result="m"/>
 <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="g"/>
 <feColorMatrix in="g" type="matrix" values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .12  0 0 0 -1 .5" result="gr"/>
 <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="m"/><feMergeNode in="gr"/></feMerge></filter>
<filter id="tinta" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="2" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale=".35"/></filter>
<radialGradient id="vinheta" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#5a3a16" stop-opacity="0"/><stop offset="1" stop-color="#4a2e10" stop-opacity=".3"/></radialGradient>
{"".join(TREE_SYMS)}</defs>'''

def art_svg():
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VBX} {VBY} {VBW} {VBH}">{DEFS}'
            f'<rect x="{VBX}" y="{VBY}" width="{VBW}" height="{VBH}" fill="{PAPER}" filter="url(#papel)"/>'
            f'<g id="arte" filter="url(#tinta)" opacity=".93">{"".join(art)}{compass(-238, 302, 17)}</g>'
            f'<rect x="{VBX}" y="{VBY}" width="{VBW}" height="{VBH}" fill="url(#vinheta)"/></svg>')

open('ink_art.svg', 'w').write(art_svg())
exec(open('ink_layers.py').read())
print('art ok', len(art_svg()), file=sys.stderr)
