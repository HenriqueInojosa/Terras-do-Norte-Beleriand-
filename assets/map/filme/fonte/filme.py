"""Beleriand no estilo dos mapas dos filmes: tinta sépia sobre pergaminho.
Gera camada de tinta (preto/cinza sobre branco; a cor sépia e o papel são aplicados em compor.py)
e camada de nomes. Geografia de geo.json (via common.py)."""
import math, random, sys
exec(open('common.py').read())
from shapely.geometry import Polygon, LineString, Point, box, MultiPolygon
from shapely.ops import unary_union
from shapely import affinity
from shapely.prepared import prep

R = random.Random(1937)
K = '#000'; W_ = '#fff'
VBX, VBY, VBW, VBH = X0, Y0, W, H

# ------------------------------------------------------------------ helpers
def resample(c, step):
    out = [tuple(c[0])]
    for (x0, y0), (x1, y1) in zip(c, c[1:]):
        L = math.hypot(x1 - x0, y1 - y0); n = max(1, int(L / step))
        for k in range(1, n + 1): out.append((x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n))
    return out

def wobble(c, amp=0.25, step=0.6, jit=0.0):
    c = resample(c, step)
    if len(c) < 3: return c
    ph = [R.uniform(0, 6.28) for _ in range(3)]; fr = [R.uniform(.2, .35), R.uniform(.7, 1.1), R.uniform(1.8, 2.6)]
    out = []; s = 0
    for i, (x, y) in enumerate(c):
        a = c[max(0, i - 1)]; b = c[min(len(c) - 1, i + 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        if i: s += math.hypot(x - c[i - 1][0], y - c[i - 1][1])
        o = amp * (0.55 * math.sin(s * fr[0] + ph[0]) + 0.3 * math.sin(s * fr[1] + ph[1]) + 0.15 * math.sin(s * fr[2] + ph[2]))
        o += R.uniform(-jit, jit)
        out.append((x + nx * o, y + ny * o))
    return out

def pl(c, close=False):
    return 'M' + ' '.join(f"{f(x)},{f(y)}" for x, y in c) + ('Z' if close else '')

def rings(g):
    for p in polys(g):
        yield list(p.exterior.coords)
        for i in p.interiors: yield list(i.coords)

def lines_of(g):
    if isinstance(g, LineString): return [list(g.coords)] if len(g.coords) > 1 else []
    return [list(s.coords) for s in getattr(g, 'geoms', []) if isinstance(s, LineString) and len(s.coords) > 1]

def polys(g):
    if isinstance(g, Polygon): return [g]
    out = []
    for s in getattr(g, 'geoms', []):
        out += polys(s)
    return out

def taper(c, w0, w1):
    c = resample(c, 0.45); n = len(c); L = []; Rr = []
    for i, (x, y) in enumerate(c):
        a = c[max(0, i - 1)]; b = c[min(n - 1, i + 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]; l = math.hypot(dx, dy) or 1
        nx, ny = -dy / l, dx / l
        t = i / max(1, n - 1); w = (w0 + (w1 - w0) * (t ** 0.8)) / 2 * R.uniform(.85, 1.15)
        L.append((x + nx * w, y + ny * w)); Rr.append((x - nx * w, y - ny * w))
    return pl(L + Rr[::-1], True)

def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)

def jag(a, b, n, amp, bulge):
    """linha de a até b com pequenas quebras (traço de pena)."""
    dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1
    nx, ny = -dy / L, dx / L
    out = [a]
    for k in range(1, n + 1):
        t = k / (n + 1) + R.uniform(-.06, .06)
        o = bulge * math.sin(math.pi * t) * L + R.uniform(-amp, amp)
        p = lerp(a, b, t); out.append((p[0] + nx * o, p[1] + ny * o))
    out.append(b)
    return out

# ------------------------------------------------------------------ mountains (film style)
def peak(x, y, h, w, dark=1.0):
    tx = x + R.uniform(-.12, .12) * w
    T = (tx, y - h)
    Lb = (x - w / 2 + R.uniform(-.08, .08) * w, y + R.uniform(-.15, .15))
    Rb = (x + w / 2 + R.uniform(-.08, .08) * w, y + R.uniform(-.15, .15))
    left = jag(Lb, T, R.randint(2, 3), w * .035, R.uniform(-.06, .02))
    right = jag(T, Rb, R.randint(2, 3), w * .035, R.uniform(-.06, .02))
    # secondary shoulder peak on the right sometimes
    if R.random() < .35 and h > 3:
        i = len(right) // 2
        sx, sy = right[i]
        right[i] = (sx + w * .04, sy - h * R.uniform(.12, .22))
    M = (tx + w * R.uniform(-.02, .1), y + R.uniform(-.1, .2))
    ridge = jag(T, M, 2, w * .04, R.uniform(-.05, .05))
    body = left + right[1:]
    shade = right + [M] + ridge[::-1][1:]
    sw = max(.16, min(.34, .09 + h * .028))
    out = [f'<path d="{pl(body, True)}" fill="{W_}"/>',
           f'<path d="{pl(shade, True)}" fill="{K}" fill-opacity="{f(min(.95, .4 * dark + R.uniform(-.05, .08)))}"/>']
    # hatch on the shaded flank (darker strokes) and streaks of light
    hs = []; k = max(4, int(h * 1.7 * dark))
    for i in range(k):
        t = (i + .5) / k
        a = lerp(T, Rb, t * .95); b = lerp(T, M, min(1, t * 1.05 + .05))
        hs.append(pl([lerp(a, b, R.uniform(0, .1)), lerp(a, b, R.uniform(.55, .95))]))
    out.append(f'<path d="{"".join(hs)}" fill="none" stroke="{K}" stroke-width="{f(sw*.6)}" stroke-linecap="round"/>')
    if h > 4:
        st = []
        for i in range(R.randint(1, 2)):
            t0 = R.uniform(.15, .45)
            a = lerp(T, Rb, t0); b = lerp(T, M, t0 + .05)
            p0 = lerp(a, b, .55); st.append(pl([p0, (p0[0] - w * .03, p0[1] + h * R.uniform(.12, .22))]))
        out.append(f'<path d="{"".join(st)}" fill="none" stroke="{W_}" stroke-width="{f(sw*.5)}" stroke-opacity=".7" stroke-linecap="round"/>')
    # sparse strokes on the lit flank
    ls = []
    for i in range(R.randint(0, 3)):
        t = R.uniform(.35, .85); a = lerp(Lb, T, t)
        ls.append(pl([(a[0] + w * .06, a[1] + h * .02), (a[0] + w * .1, a[1] + h * R.uniform(.1, .22))]))
    out.append(f'<path d="{pl(left)}{pl(right)}{"".join(ls)}" fill="none" stroke="{K}" stroke-width="{f(sw)}" stroke-linejoin="round" stroke-linecap="round"/>')
    # ground stroke
    if R.random() < .5:
        gx = x + R.uniform(-.2, .5) * w
        out.append(f'<path d="M{f(gx)},{f(y+.4)}h{f(R.uniform(.6,1.6))}" stroke="{K}" stroke-width="{f(sw*.6)}" stroke-linecap="round"/>')
    return ''.join(out)

def hillock(x, y, h, w):
    a = (x - w / 2, y); b = (x + w / 2, y); T = (x + R.uniform(-.1, .1) * w, y - h)
    d = f"M{f(a[0])},{f(a[1])}Q{f(a[0]+w*.08)},{f(T[1])} {f(T[0])},{f(T[1])}Q{f(b[0]-w*.08)},{f(T[1])} {f(b[0])},{f(b[1])}"
    hs = ''.join(f"M{f(T[0]+w*(.08+.1*i))},{f(T[1]+h*(.15+.06*i))}l{f(w*.06)},{f(h*(.55-.08*i))}" for i in range(4))
    return (f'<path d="{d}Z" fill="{W_}"/><path d="{d}" fill="none" stroke="{K}" stroke-width=".24" stroke-linecap="round"/>'
            f'<path d="{hs}" stroke="{K}" stroke-width=".14" stroke-linecap="round"/>')

def scatter(p, sp, jit=.45):
    """pontos irregulares (quase poisson) dentro do polígono."""
    pp = prep(p); minx, miny, maxx, maxy = p.bounds
    pts_ = []; y = miny; row = 0
    while y <= maxy + sp:
        x = minx + (sp / 2 if row % 2 else 0)
        while x <= maxx + sp:
            q = (x + R.uniform(-jit, jit) * sp, y + R.uniform(-jit, jit) * sp * .7)
            if pp.contains(Point(q)): pts_.append(q)
            x += sp
        y += sp * .62; row += 1
    return pts_

def range_svg(gid, g, scale=1.0, dark=1.0, hmax=12, density=1.0):
    items = []
    for p in polys(g):
        if p.area < .4: continue
        sp = 4.6 * scale / density
        cand = scatter(p, sp)
        if not cand:
            c = p.representative_point(); cand = [(c.x, c.y)]
        for (x, y) in cand:
            d = p.exterior.distance(Point(x, y))
            hh = min(hmax * scale, (3.0 + d * 1.0) * scale * R.uniform(.75, 1.2))
            hh = max(2.4 * scale, hh)
            ww = hh * R.uniform(1.15, 1.5)
            items.append((y + hh * .28, x, hh, ww))
    items.sort()
    return f'<g id="{gid}">' + ''.join(peak(x, y, h, w, dark) for y, x, h, w in items) + '</g>'

def hills_svg(gid, g, sp=2.6):
    items = []
    for p in polys(g):
        for (x, y) in scatter(p, sp, .35): items.append((y, x))
        if not items: c = p.representative_point(); items.append((c.y, c.x))
    items.sort()
    return f'<g id="{gid}">' + ''.join(hillock(x, y + .6, R.uniform(1.1, 1.8), R.uniform(2.6, 3.6)) for y, x in items) + '</g>'

# ------------------------------------------------------------------ trees
SYMS = []
def crown(r, seed):
    rr = random.Random(seed); n = 22; pts_ = []
    ph = rr.uniform(0, 6.28); lobes = rr.choice([4, 5, 5, 6])
    for k in range(n):
        a = math.pi * 2 * k / n
        m = 1 + .14 * abs(math.sin(a * lobes / 2 + ph))
        y = math.sin(a) * r * m * .82
        if y > 0: y *= .7
        pts_.append((math.cos(a) * r * m, y - r * .75))
    return pts_
for i in range(6):
    r = [0.95, 1.05, 0.88, 1.12, 1.0, 0.92][i]
    cr = crown(r, i * 7 + 3)
    cp = Polygon(cr)
    sh = cp.difference(affinity.translate(cp, -r * .38, -r * .42))
    shd = ''.join(pl(list(p.exterior.coords), True) for p in polys(sh))
    lines = ''
    for j in range(2):
        a = R.uniform(-.3, .4) * r
        lines += f'M{f(a)},{f(-r*R.uniform(1.0,1.3))}q{f(r*.2)},{f(r*.12)} {f(r*.35)},{f(r*.35)}'
    SYMS.append(f'<symbol id="t{i}" overflow="visible"><path d="{pl(cr, True)}" fill="{W_}" stroke="{K}" stroke-width=".15" stroke-linejoin="round"/>'
                f'<path d="{shd}" fill="{K}" fill-opacity=".75"/><path d="{lines}" fill="none" stroke="{K}" stroke-width=".08"/>'
                f'<path d="M{f(r*.05)},{f(-r*.2)}l{f(r*.04)},{f(r*.5)}" stroke="{K}" stroke-width=".16" stroke-linecap="round"/></symbol>')
def pine_pts(h, seed):
    rr = random.Random(seed); w = h * .42; tiers = 3
    L = [(0, -h)]; Rr = [(0, -h)]
    for k in range(1, tiers + 1):
        t = k / tiers; yy = -h + h * 1.05 * t; ww = w * t * rr.uniform(.9, 1.1)
        L += [(-ww * .55, yy - h * .12), (-ww, yy)]; Rr += [(ww * .55, yy - h * .12), (ww, yy)]
    return L, Rr
for i in range(4):
    h = [2.6, 3.0, 2.3, 3.3][i]
    L, Rr = pine_pts(h, i + 40)
    body = L + Rr[::-1]
    sh = [(0, -h)] + Rr[1:] + [(h * .04, Rr[-1][1])]
    SYMS.append(f'<symbol id="p{i}" overflow="visible"><path d="{pl(body, True)}" fill="{W_}" stroke="{K}" stroke-width=".15" stroke-linejoin="round"/>'
                f'<path d="{pl(sh, True)}" fill="{K}" fill-opacity=".85"/><path d="M0,{f(Rr[-1][1])}v{f(h*.18)}" stroke="{K}" stroke-width=".18"/></symbol>')

def forest_svg(gid, g, kind='decid', sp=1.55, sc=1.0, edge=2.5, dens=1.0):
    items = []
    for p in polys(g):
        if p.area < .6: continue
        ext = p.exterior
        pz = p.buffer(edge * .6)
        for (x, y) in scatter(pz, sp, .4):
            pt = Point(x, y); inside = p.contains(pt)
            d = ext.distance(pt) * (1 if inside else -1)
            keep = .25 if d < 0 else min(1, .5 + d / edge)
            if R.random() < keep * dens: items.append((y, x))
    items.sort()
    s = [f'<g id="{gid}">']
    for y, x in items:
        if kind == 'pine' or (kind == 'mixed' and R.random() < .35): sym = f'p{R.randrange(4)}'
        else: sym = f't{R.randrange(6)}'
        k = sc * R.uniform(.82, 1.15)
        fl = -1 if R.random() < .2 and sym[0] == 't' else 1
        s.append(f'<use href="#{sym}" transform="translate({f(x)},{f(y)}) scale({f(k*fl)},{f(k)})"/>')
    s.append('</g>')
    return ''.join(s)

# ------------------------------------------------------------------ build
art = []
land_all = land
# ---- sea: horizontal strokes hugging the coast, fading out
coastlines = unary_union([LineString(pts(i)) for i in ['path4537', 'path4741', 'path4743']] + [poly('path4795').exterior])
sea_p = prep(sea.buffer(-.4))
st = []
for _ in range(60000):
    x, y = R.uniform(X0, X1), R.uniform(Y0, Y1)
    pt = Point(x, y)
    if not sea_p.contains(pt): continue
    d = coastlines.distance(pt)
    if d < 1.6 or d > 18 or R.random() > .55 * math.exp(-d / 3.6): continue
    L = R.uniform(1.0, 2.8) * (1 + d * .06)
    st.append(f'M{f(x-L/2)},{f(y)}q{f(L/2)},{f(R.uniform(-.25,.15))} {f(L)},{f(R.uniform(-.1,.1))}')
# a second broken contour along the coast
cont = []
for o in (1.2,):
    ring = land.union(balar).buffer(o).boundary.intersection(sea.buffer(-.2))
    for ln in lines_of(ring):
        c = wobble(ln, .15, .8, .05)
        cont.append(f'<path d="{pl(c)}" stroke-width="{f(.16 if o<2 else .11)}" stroke-dasharray="{f(R.uniform(2,6))} {f(R.uniform(1.5,3))} {f(R.uniform(1,3))} {f(R.uniform(1.5,3.5))}"/>')
# open sea little wave marks
wv = []
for _ in range(500):
    x, y = R.uniform(X0 + 4, X1 - 4), R.uniform(Y0 + 4, Y1 - 4)
    pt = Point(x, y)
    if not sea_p.contains(pt) or coastlines.distance(pt) < 14 or R.random() > .5: continue
    s_ = R.uniform(.7, 1.2)
    wv.append(f'M{f(x)},{f(y)}q{f(.8*s_)},{f(-.7*s_)} {f(1.6*s_)},0q{f(.8*s_)},{f(-.7*s_)} {f(1.6*s_)},0')
art.append(f'<g id="mar" fill="none" stroke="{K}" stroke-linecap="round">{"".join(cont)}'
           f'<path d="{"".join(st)}" stroke-width=".17" stroke-opacity=".85"/><path d="{"".join(wv)}" stroke-width=".14" stroke-opacity=".55"/></g>')

# ---- coast: one firm hand line
co = []
for pid, w in [('path4537', .5), ('path4741', .5), ('path4743', .4), ('path4795', .45)]:
    c = wobble(pts(pid), .22, .45, .04)
    co.append(f'<path d="{pl(c, P[pid]["closed"])}" stroke-width="{w}"/>')
art.append(f'<g id="costa" fill="none" stroke="{K}" stroke-linejoin="round" stroke-linecap="round">{"".join(co)}</g>')
# Helcaraxë: ice floes
ice_g = ice.intersection(MAP)
fl = []
for (x, y) in scatter(ice_g.buffer(-1.5), 7, .5)[:40]:
    r_ = R.uniform(1.2, 2.6); n = R.randint(5, 7)
    pp = [(x + math.cos(2 * math.pi * k / n) * r_ * R.uniform(.6, 1.2), y + math.sin(2 * math.pi * k / n) * r_ * .55 * R.uniform(.6, 1.2)) for k in range(n)]
    fl.append(f'<path d="{pl(pp, True)}" fill="{W_}" stroke="{K}" stroke-width=".18"/>')
art.append(f'<g id="gelo">{"".join(fl)}</g>')

# ---- lakes
lk = []
for lid, pid in {'lago-linaewen': 'path4795-9', 'lago-helevorn': 'path4795-9-9', 'lago-mithrim': 'path4795-9-4'}.items():
    g = poly(pid); minx, miny, maxx, maxy = g.bounds
    lk.append(f'<path id="{lid}" d="{pl(wobble(pts(pid), .12, .4), True)}" fill="{W_}" stroke="{K}" stroke-width=".38"/>')
    hl = []; yy = miny + .8
    while yy < maxy:
        seg = g.buffer(-.6).intersection(LineString([(minx - 1, yy), (maxx + 1, yy)]))
        for ln in lines_of(seg):
            (a, b) = ln[0], ln[-1]
            if R.random() < .8: hl.append(f'M{f(a[0]+R.uniform(0,.8))},{f(yy)}L{f(b[0]-R.uniform(0,.8))},{f(yy)}')
        yy += .75
    lk.append(f'<path d="{"".join(hl)}" stroke="{K}" stroke-width=".1" stroke-opacity=".7"/>')
art.append(f'<g id="lagos">{"".join(lk)}</g>')

# ---- marshes
def tufts(cx, cy, n, rx, ry):
    out = []
    for _ in range(n):
        x, y = cx + R.uniform(-rx, rx), cy + R.uniform(-ry, ry)
        out.append(f'M{f(x-1)},{f(y)}h2M{f(x)},{f(y)}v-1.1M{f(x-.45)},{f(y)}l-.4,-.8M{f(x+.45)},{f(y)}l.4,-.8M{f(x-.6)},{f(y+.55)}h.9')
    return ''.join(out)
art.append(f'<g id="pantanos" fill="none" stroke="{K}" stroke-width=".14" stroke-linecap="round"><path d="{tufts(-192, 86, 16, 13, 4.5)}{tufts(-66, 35, 12, 7, 5)}"/></g>')

# ---- rivers
RIV = [('rio-sirion', ['path1133', 'path1082'], .2, .8), ('rio-sirion-fozes', ['path1085'], .3, .45),
       ('rio-gelion', ['path1105'], .25, .85), ('rio-aros', ['path1102'], .15, .55), ('rio-celon', ['path1124'], .14, .45),
       ('rio-mindeb', ['path1136'], .12, .35), ('rio-teiglin', ['path1138'], .14, .5), ('rio-narog', ['path1141'], .16, .6),
       ('rio-ginglith', ['path1143'], .12, .4), ('rio-nenning', ['path1145'], .12, .45), ('rio-falas', ['path1148'], .12, .38),
       ('rio-mithrim', ['path1136-2'], .3, .12)]
for pid in ['path1110', 'path1112', 'path1114', 'path1116', 'path1120', 'path1122']:
    RIV.append(('rio-' + pid, [pid], .12, .45))
rv = []
for rid, ids, w0, w1 in RIV:
    for i, pid in enumerate(ids):
        c = wobble(pts(pid), .3, .5, .03)
        a = w0 + (w1 - w0) * i / len(ids); b = w0 + (w1 - w0) * (i + 1) / len(ids)
        rv.append(f'<path d="{taper(c, a, b)}"/>')
# Adurant (path1108) splits around Tol Galen
ad = wobble(pts('path1108'), .3, .5, .03)
n_ = len(ad); i0, i1 = int(n_ * .30), int(n_ * .44)
rv.append(f'<path d="{taper(ad[:i0+1], .12, .3)}"/><path d="{taper(ad[i1:], .3, .45)}"/>')
mid = ad[i0:i1 + 1]
def offset(c, o):
    out = []
    for i, (x, y) in enumerate(c):
        a = c[max(0, i - 1)]; b = c[min(len(c) - 1, i + 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]; l = math.hypot(dx, dy) or 1
        t = i / (len(c) - 1); s = math.sin(math.pi * t) * o
        out.append((x - dy / l * s, y + dx / l * s))
    return out
TOLGALEN = offset(mid, 2.6), offset(mid, -2.6)
for arm in TOLGALEN: rv.append(f'<path d="{taper(arm, .22, .22)}"/>')
tg_mid = mid[len(mid) // 2]
art.append(f'<g id="rios" fill="{K}" stroke="{K}" stroke-width=".05">{"".join(rv)}</g>')
# Tol Galen: tiny trees on the isle
tg_poly = Polygon(TOLGALEN[0] + TOLGALEN[1][::-1]).buffer(-.5)
art.append(forest_svg('tol-galen-arvores', tg_poly, 'decid', 1.5, .7, .1, .9))

# ---- forests
dor_raw2 = poly('path4935')
dorth = unary_union([poly('path952'), poly('path959')])
south_band = dorth.difference(affinity.translate(dorth, 0, -8)).intersection(dorth)
fuin = dorth.difference(south_band.buffer(.5))
FOR = [('floresta-doriath', FORESTS['floresta-doriath'], 'decid', 2.0, 1.4, 2.5),
       ('floresta-brethil', FORESTS['floresta-brethil'], 'decid', 1.9, 1.3, 2.2),
       ('floresta-taur-im-duinath', FORESTS['floresta-taur-im-duinath'], 'mixed', 2.1, 1.4, 3.0),
       ('floresta-nan-elmoth', FORESTS['floresta-nan-elmoth'], 'pine', 1.7, 1.15, 1.8),
       ('floresta-nan-tathren', FORESTS['floresta-nan-tathren'], 'decid', 1.9, 1.15, 1.5),
       ('bosques-nimbrethil', FORESTS['bosques-nimbrethil'], 'decid', 1.9, 1.1, 1.5),
       ('taur-nu-fuin', fuin, 'pine', 1.7, 1.2, 2.0)]
fo = [forest_svg(fid, g, kind, sp, sc, ed) for fid, g, kind, sp, sc, ed in FOR]
# a few scattered copses in open land (hand-drawn map feel)
for (cx, cy, n) in [(-200, 135, 9), (-118, 120, 7), (-30, 210, 8), (95, 150, 6), (-175, 250, 7), (30, 120, 5)]:
    g = Point(cx, cy).buffer(math.sqrt(n) * 1.3)
    fo.append(forest_svg(f'bosque-{cx}', g, 'decid', 1.8, 1.1, 1.0, .9))
# girdle of Melian
gird = FORESTS['floresta-doriath'].buffer(2.6, join_style=1)
fo.append(''.join(f'<path d="{pl(wobble(r_, .2, .5), True)}" fill="none" stroke="{K}" stroke-width=".2" stroke-dasharray=".12 1" stroke-linecap="round"/>' for r_ in rings(gird)))
art.append(f'<g id="florestas">{"".join(fo)}</g>')

# ---- mountains
mt = []
mt.append(range_svg('mont-ered-engrin', poly('path3847'), 1.15, 1.15, 13, 1.0))
mt.append(range_svg('mont-ered-wethrin-lomin', poly('path947'), .9, 1.0, 9, 1.35))
mt.append(range_svg('mont-echoriath', poly('path955').difference(poly('path957').buffer(1.5)), .85, 1.0, 8, 1.3))
mt.append(range_svg('mont-ered-gorgoroth', south_band, .85, 1.1, 8, 1.3))
mt.append(range_svg('mont-dorthonion-picos', unary_union([Point(-20, 34).buffer(3), Point(18, 40).buffer(2.5), Point(42, 50).buffer(2.5)]), .8, 1.1, 7, .8))
mt.append(range_svg('colinas-himring', poly('path968'), .75, 1.0, 6))
mt.append(range_svg('mont-ered-luin', poly('path4889'), .95, 1.0, 10, 1.35))
for gid, ids in [('taur-en-faroth', ['path970', 'path972']), ('andram', ['path978']), ('colina-teiglin', ['path980']), ('colinas-falas', ['path997', 'path997-4'])]:
    mt.append(hills_svg(gid, unary_union([poly(i) for i in ids])))
# Thangorodrim: three great black towers of rock
tg = []
for (x, y, h, w) in [(-5, 6, 20, 13), (21, 7, 17, 12), (8, 9, 27, 16)]:
    tg.append(peak(x, y, h, w, 1.6))
smoke = ''.join(f'<path d="M{f(8+R.uniform(-1.5,1.5))},{f(-17-i*3.6)}c{f(R.uniform(-4,-1.5))},-1.4 {f(R.uniform(1.5,4))},-2.2 {f(R.uniform(-1.2,1.2))},-3.6" fill="none" stroke="{K}" stroke-width=".24" stroke-opacity="{f(.75-i*.12)}" stroke-linecap="round"/>' for i in range(6))
mt.append(f'<g id="thangorodrim">{"".join(tg)}{smoke}</g>')
art.append(f'<g id="montanhas">{"".join(mt)}</g>')

# ---- places
def tower(x, y, s=1):
    return (f'<path d="M{f(x-1*s)},{f(y+1.2*s)}L{f(x-.8*s)},{f(y-1.8*s)}h{f(.4*s)}v{f(-.5*s)}h{f(.4*s)}v{f(.5*s)}h{f(.4*s)}v{f(-.5*s)}h{f(.4*s)}L{f(x+1*s)},{f(y+1.2*s)}Z" '
            f'fill="{W_}" stroke="{K}" stroke-width=".22" stroke-linejoin="round"/><path d="M{f(x+.25*s)},{f(y-1.6*s)}L{f(x+.55*s)},{f(y+1.2*s)}" stroke="{K}" stroke-width=".35"/>'
            f'<path d="M{f(x-.15*s)},{f(y+1.2*s)}v{f(-.7*s)}" stroke="{K}" stroke-width=".3"/>')
def city(x, y, s=1):
    o = [f'<ellipse cx="{f(x)}" cy="{f(y+.6*s)}" rx="{f(2.4*s)}" ry="{f(1.1*s)}" fill="{W_}" stroke="{K}" stroke-width=".22"/>']
    for dx, hh in [(-1.3, 1.6), (-.4, 2.6), (.6, 2.0), (1.4, 1.3)]:
        xx = x + dx * s
        o.append(f'<path d="M{f(xx-.35*s)},{f(y+.6*s)}V{f(y-hh*s+.5*s)}L{f(xx)},{f(y-hh*s)}L{f(xx+.35*s)},{f(y-hh*s+.5*s)}V{f(y+.6*s)}Z" fill="{W_}" stroke="{K}" stroke-width=".16"/>'
                 f'<path d="M{f(xx+.05*s)},{f(y-hh*s+.4*s)}L{f(xx+.35*s)},{f(y-hh*s+.5*s)}V{f(y+.6*s)}H{f(xx+.05*s)}Z" fill="{K}" fill-opacity=".6"/>')
    return ''.join(o)
def door(x, y, s=1):
    return (f'<path d="M{f(x-1.4*s)},{f(y)}V{f(y-1*s)}A{f(1.4*s)},{f(1.4*s)} 0 0 1 {f(x+1.4*s)},{f(y-1*s)}V{f(y)}Z" fill="{K}"/>'
            f'<path d="M{f(x-2.2*s)},{f(y)}h{f(4.4*s)}" stroke="{K}" stroke-width=".3"/>')
TS = (-74.5, 52.5)
tol_sirion = (f'<ellipse cx="{TS[0]}" cy="{TS[1]}" rx="2.6" ry="1.7" fill="{W_}" stroke="{K}" stroke-width=".3"/>'
              f'<path d="M{TS[0]-3.4},{TS[1]+1.6}q1.6,.9 3.4,.6q1.8,-.3 3.3,.2" fill="none" stroke="{K}" stroke-width=".12"/>' + tower(TS[0], TS[1] - .4, .75))
pl_ = [tower(*himring_pt, 1.1), tower(-242.5, 92.6, .9), door(-115.6, 164.3, 1), door(9.2, 0.2, .9), tol_sirion,
       door(184, 156, .55), door(172, 59, .55),
       city(-35, 112, .7)]  # Menegroth
art.append(f'<g id="lugares">{"".join(pl_)}</g>')

# ------------------------------------------------------------------ ornaments
def ship(x, y, s=1, flip=False):
    sx = -s if flip else s
    g = [f'<g transform="translate({f(x)},{f(y)}) scale({f(sx)},{f(s)})" stroke="{K}" stroke-linejoin="round" stroke-linecap="round">']
    hull = "M-7,-.2 Q-6.4,3 -2.6,3.3 L3.6,3.3 Q6.6,2.9 7.6,-1.4 L5.4,-.1 L-5.6,-.1 Z"
    g.append(f'<path d="{hull}" fill="{W_}" stroke-width=".28"/>')
    g.append(f'<path d="M-6.2,1.4 Q0,2.2 6.6,1M-5.4,2.4 Q0,3 5.6,2.1" fill="none" stroke-width=".14"/>')
    g.append(f'<path d="M-2.6,3.3 L3.6,3.3 Q6.6,2.9 7.2,.4 Q2,2.6 -4.6,2.6 Z" fill="{K}" fill-opacity=".7" stroke="none"/>')
    for mx, top in [(-1.8, -11), (2.6, -9)]:
        g.append(f'<path d="M{mx},-.1V{top}" stroke-width=".26"/>')
        for k, (sy, hh, ww) in enumerate([(top + 1.2, 3.6, 2.8), (top + 5.3, 3.4, 3.3)]):
            d = f"M{f(mx-ww)},{f(sy)}Q{f(mx)},{f(sy-.5)} {f(mx+ww)},{f(sy)}Q{f(mx+ww+.7)},{f(sy+hh*.55)} {f(mx+ww+.3)},{f(sy+hh)}Q{f(mx)},{f(sy+hh+.6)} {f(mx-ww+.3)},{f(sy+hh)}Q{f(mx-ww+.9)},{f(sy+hh*.55)} {f(mx-ww)},{f(sy)}Z"
            g.append(f'<path d="{d}" fill="{W_}" stroke-width=".2"/>')
            g.append(f'<path d="M{f(mx+ww*.35)},{f(sy+.3)}q.5,{f(hh*.5)} .2,{f(hh*.85)}M{f(mx+ww*.7)},{f(sy+.3)}q.5,{f(hh*.5)} .3,{f(hh*.85)}" fill="none" stroke-width=".11"/>')
        g.append(f'<path d="M{mx},{top}l2,.5l-1.6,.6 1.8,.5" fill="none" stroke-width=".16"/>')
    g.append(f'<path d="M-1.8,-11L-6.6,-.4M2.6,-9L7.2,-1" fill="none" stroke-width=".09"/>')
    for k in range(4):
        wx = -9 + k * 4.6 + R.uniform(-.5, .5)
        g.append(f'<path d="M{f(wx)},{f(3.9+R.uniform(0,.5))}q1.2,-.9 2.4,0q1.2,.9 2.4,0" fill="none" stroke-width=".15"/>')
    g.append('</g>')
    return ''.join(g)

def serpent(x, y, s=1):
    g = [f'<g transform="translate({f(x)},{f(y)}) scale({f(s)})" stroke="{K}" stroke-linejoin="round" stroke-linecap="round">']
    for cx, r in [(-6, 3.0), (1.5, 2.6), (8, 2.0)]:
        ro, ri = r, r - 1.15
        d = f"M{f(cx-ro)},0A{f(ro)},{f(ro)} 0 0 1 {f(cx+ro)},0L{f(cx+ri)},0A{f(ri)},{f(ri)} 0 0 0 {f(cx-ri)},0Z"
        g.append(f'<path d="{d}" fill="{W_}" stroke-width=".22"/>')
        g.append(f'<path d="M{f(cx)},{f(-ro)}A{f(ro)},{f(ro)} 0 0 1 {f(cx+ro)},0L{f(cx+ri)},0A{f(ri)},{f(ri)} 0 0 0 {f(cx)},{f(-ri)}Z" fill="{K}" fill-opacity=".65" stroke="none"/>')
        # dorsal spines
        sp = ''.join(f"M{f(cx+math.cos(a)*ro)},{f(-math.sin(a)*ro)}l{f(math.cos(a)*.7-.2)},{f(-math.sin(a)*.7)}" for a in [math.pi * k / 6 for k in range(1, 6)])
        g.append(f'<path d="{sp}" fill="none" stroke-width=".16"/>')
    # tail curl
    g.append(f'<path d="M10.5,0q1,-2.6 2.6,-2.2q1.3,.5 .2,1.6" fill="none" stroke-width=".35"/>')
    # neck + head
    neck = "M-9,0C-9.4,-3 -10.6,-5.4 -12.4,-6.3L-13.6,-5.2C-12.2,-4.4 -11,-2.6 -10.4,0Z"
    g.append(f'<path d="{neck}" fill="{W_}" stroke-width=".22"/>')
    head = "M-12.4,-6.3L-15.6,-7.2L-17.6,-6.1L-15.4,-5.9L-17.2,-5.0L-14.8,-4.8L-13.6,-5.2Z"
    g.append(f'<path d="{head}" fill="{W_}" stroke-width=".22"/><circle cx="-14.4" cy="-6.4" r=".25" fill="{K}"/>')
    g.append(f'<path d="M-13,-6.6l.6,-1.6 .5,1.2M-12.6,-6.4l1.1,-1.1" fill="none" stroke-width=".16"/>')
    for wx in [-15, -9.5, -4, 3.5, 10.5, 14]:
        g.append(f'<path d="M{f(wx-1.5)},{f(.3+R.uniform(0,.3))}q.75,-.6 1.5,0q.75,.6 1.5,0" fill="none" stroke-width=".15"/>')
    g.append('</g>')
    return ''.join(g)

def compass(cx, cy, Rr):
    g = [f'<g id="rosa-dos-ventos" transform="translate({f(cx)},{f(cy)})" fill="none" stroke="{K}">']
    g.append(f'<circle r="{f(Rr*.72)}" stroke-width=".3"/><circle r="{f(Rr*.66)}" stroke-width=".12"/>')
    for k in range(64):
        a = k * math.pi / 32; r1 = Rr * .72; r2 = Rr * (.69 if k % 2 else .66)
        g.append(f'<path d="M{f(r1*math.sin(a))},{f(-r1*math.cos(a))}L{f(r2*math.sin(a))},{f(-r2*math.cos(a))}" stroke-width=".1"/>')
    def star(n, Lr, wd, off):
        for k in range(n):
            a = off + k * 2 * math.pi / n
            tip = (Lr * math.sin(a), -Lr * math.cos(a))
            l = (wd * math.sin(a - math.pi / 2), -wd * math.cos(a - math.pi / 2)); r = (wd * math.sin(a + math.pi / 2), -wd * math.cos(a + math.pi / 2))
            g.append(f'<path d="M0,0L{f(l[0])},{f(l[1])}L{f(tip[0])},{f(tip[1])}Z" fill="{W_}" stroke-width=".16"/>')
            g.append(f'<path d="M0,0L{f(r[0])},{f(r[1])}L{f(tip[0])},{f(tip[1])}Z" fill="{K}" stroke-width=".16"/>')
    star(8, Rr * .55, Rr * .07, math.pi / 8)
    star(4, Rr * .8, Rr * .12, math.pi / 4)
    star(4, Rr * 1.0, Rr * .14, 0)
    g.append(f'<circle r="{f(Rr*.06)}" fill="{W_}" stroke-width=".2"/>')
    # fleur on north
    g.append(f'<path d="M0,{f(-Rr*1.02)}c-1.2,-.8 -1.6,-2.2 0,-3.4c1.6,1.2 1.2,2.6 0,3.4M-.4,{f(-Rr*1.08)}c-1.4,.1 -2.4,-.8 -2.2,-2M.4,{f(-Rr*1.08)}c1.4,.1 2.4,-.8 2.2,-2" stroke-width=".22"/>')
    fs = Rr * .26
    for t, (tx, ty) in [('S', (0, Rr * 1.27)), ('E', (Rr * 1.2, fs * .35)), ('W', (-Rr * 1.2, fs * .35))]:
        g.append(f'<text x="{f(tx)}" y="{f(ty)}" text-anchor="middle" font-family="IM Fell English SC" font-size="{f(fs)}" fill="{K}" stroke="none">{t}</text>')
    g.append(f'<text x="0" y="{f(-Rr*1.38)}" text-anchor="middle" font-family="IM Fell English SC" font-size="{f(fs*1.1)}" fill="{K}" stroke="none">N</text>')
    g.append('</g>')
    return ''.join(g)

def spiral(x, y, r, d=1, turns=1.6, sw=.22):
    pts_ = []
    for k in range(40):
        t = k / 39; a = t * turns * 2 * math.pi; rr = r * (1 - t * .8)
        pts_.append((x + d * math.cos(a) * rr, y + math.sin(a) * rr))
    return f'<path d="{pl(pts_)}" fill="none" stroke="{K}" stroke-width="{sw}" stroke-linecap="round"/>'

def cartouche(cx, cy, w, h, title):
    x0, y0, x1, y1 = cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2
    n = 2.2
    def notched(o):
        a, b, c, d = x0 - o, y0 - o, x1 + o, y1 + o; k = n + o * .3
        return [(a + k, b), (c - k, b), (c - k, b + k * .2), (c - k * .2, b + k), (c, b + k), (c, d - k), (c - k * .2, d - k), (c - k, d - k * .2), (c - k, d),
                (a + k, d), (a + k, d - k * .2), (a + k * .2, d - k), (a, d - k), (a, b + k), (a + k * .2, b + k), (a + k, b + k * .2)]
    g = [f'<g id="cartela" stroke="{K}">']
    g.append(f'<path d="{pl(wobble(notched(3.2) + [notched(3.2)[0]], .06, 1), True)}" fill="{W_}" stroke-width=".55"/>')
    g.append(f'<path d="{pl(wobble(notched(2.2) + [notched(2.2)[0]], .05, 1), True)}" fill="none" stroke-width=".18"/>')
    g.append(f'<path d="{pl(wobble(notched(0) + [notched(0)[0]], .05, 1), True)}" fill="none" stroke-width=".3"/>')
    # scrolls on left/right
    for side in (-1, 1):
        xs = cx + side * (w / 2 + 3.2)
        g.append(f'<path d="M{f(xs)},{f(cy-h*.35)}c{f(side*4)},{f(-1)} {f(side*6)},{f(2)} {f(side*4.4)},{f(4.6)}M{f(xs)},{f(cy+h*.35)}c{f(side*4)},1 {f(side*6)},-2 {f(side*4.4)},-4.6" fill="none" stroke-width=".3"/>')
        g.append(spiral(xs + side * 4.3, cy - h * .35 + 3.0, 1.6, side, 1.3))
        g.append(spiral(xs + side * 4.3, cy + h * .35 - 3.0, 1.6, side, 1.3))
        g.append(f'<path d="M{f(xs+side*1.2)},{f(cy)}l{f(side*2.2)},-1.6 {f(side*1.4)},1.6 {f(side*-1.4)},1.6Z" fill="{K}" fill-opacity=".7" stroke-width=".15"/>')
    for sgn in (-1, 1):
        yy = cy + sgn * (h / 2 + 3.2)
        g.append(f'<path d="M{f(cx)},{f(yy+sgn*.2)}l-2.4,{f(sgn*1.6)} 2.4,{f(sgn*1.6)} 2.4,{f(-sgn*1.6)}Z" fill="{W_}" stroke-width=".22"/><path d="M{f(cx)},{f(yy+sgn*.2)}v{f(sgn*3.2)}" stroke-width=".15"/>')
        g.append(f'<path d="M{f(cx-2.6)},{f(yy+sgn*1.8)}c-3,{f(sgn*1.4)} -7,{f(sgn*.2)} -9,{f(sgn*-1.6)}M{f(cx+2.6)},{f(yy+sgn*1.8)}c3,{f(sgn*1.4)} 7,{f(sgn*.2)} 9,{f(sgn*-1.6)}" fill="none" stroke-width=".22"/>')
    g.append(f'<text x="{f(cx)}" y="{f(cy+h*.12)}" text-anchor="middle" dominant-baseline="middle" font-family="Uncial Antiqua" font-size="{f(h*.42)}" fill="{K}" stroke="none" letter-spacing=".4">{title}</text>')
    g.append(f'<path d="M{f(cx-w*.3)},{f(cy+h*.36)}q{f(w*.15)},-.8 {f(w*.3)},0q{f(w*.15)},.8 {f(w*.3)},0" fill="none" stroke-width=".18"/>')
    g.append('</g>')
    return ''.join(g)

def frame():
    s = [f'<g id="moldura" fill="none" stroke="{K}" stroke-linecap="round">']
    for o, w in [(1.6, .8), (3.4, .22)]:
        rr = [(X0 + o, Y0 + o), (X1 - o, Y0 + o), (X1 - o, Y1 - o), (X0 + o, Y1 - o)]
        s.append(f'<path d="{pl(wobble(rr + [rr[0]], .1, 1.5, .02), True)}" stroke-width="{w}"/>')
    for (cx, cy, dx, dy) in [(X0, Y0, 1, 1), (X1, Y0, -1, 1), (X1, Y1, -1, -1), (X0, Y1, 1, -1)]:
        ox, oy = cx + dx * 5.2, cy + dy * 5.2
        s.append(f'<path d="M{f(ox)},{f(oy+dy*5)}V{f(oy)}H{f(ox+dx*5)}" stroke-width=".3"/>')
        s.append(spiral(ox + dx * 2.2, oy + dy * 2.2, 1.6, dx, 1.2, .2))
    s.append('</g>')
    return ''.join(s)

orn = [ship(-249, 126, 1.05), ship(-116, 287, 1.0, True), serpent(-205, 279, 1.45),
       compass(-92, 317, 16), cartouche(-224, 318, 64, 19, 'Beleriand'), frame()]
art.append(f'<g id="ornamentos">{"".join(orn)}</g>')

DEFS = f'<defs>{"".join(SYMS)}</defs>'
def svg(body, bg=True):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{f(VBX)} {f(VBY)} {f(VBW)} {f(VBH)}">{DEFS}'
            + (f'<rect x="{f(VBX)}" y="{f(VBY)}" width="{f(VBW)}" height="{f(VBH)}" fill="#fff"/>' if bg else '') + body + '</svg>')
open('filme_tinta.svg', 'w').write(svg(''.join(art)))

# ------------------------------------------------------------------ names (ink, no red)
exec(open('lbl_defs.py').read())
TITLE = {'BELERIAND LESTE': 'Beleriand Leste', 'BELERIAND OESTE': 'Beleriand Oeste', 'FALAS': 'Falas', 'BELEGAER': 'Belegaer',
         'OSSIRIAND': 'Ossiriand', 'THARGELION': 'Thargelion', 'DORIATH': 'Doriath', 'ARVERNIEN': 'Arvernien', 'HITHLUM': 'Hithlum',
         'HIMLAD': 'Himlad', 'NEVRAST': 'Nevrast', 'MITHRIM': 'Mithrim', 'DOR-LÓMIN': 'Dor-lómin', 'LAMMOTH': 'Lammoth', 'BALAR': 'Balar'}
NAMES = []
def nm(txt, x, y, a, cls): NAMES.append((txt, x, y, a, cls))
skip = {'TAUR-IM-DUINATH', 'Angband', 'E r e d    E n g r i n (Iron Mountains)', 'Ered Luin (Blue Mountains)', 'Thangorodrim', 'Gondolin', 'Himring', 'Nargothrond', 'Forest of  Brethil', 'TAUR-NU-FUIN (Dorthonion)', 'BALAR', 'Birchwoods       of Nimbrethil', 'Nan Tathren', 'Nan Elmoth'}
for t in G['texts']:
    key = t['txt']
    if key not in LBL or key in skip: continue
    txt, cls, _ = LBL[key]
    if isinstance(txt, list): txt = txt[0]
    cx, cy, ang = OVR.get(key, (t['cx'], t['cy'], t['angle']))
    c0 = cls.split()[0]
    if c0 == 'reg':
        sz = cls.split()[1] if len(cls.split()) > 1 else 'm'
        nm(TITLE.get(txt, txt.title()), cx, cy, ang, {'xl': 'r1', 'l': 'r2', 'm': 'r3', 's': 'r4', 'xs': 'r4'}[sz])
    elif c0 == 'sea': nm('Belegaer', -246, 212, 72, 'mar')
    elif c0 == 'frs': nm(TITLE.get(txt, txt), cx, cy, ang, 'r1' if 'xl' in cls else 'r4')
    elif c0 == 'mtn': nm(txt, cx, cy, ang, 'mt')
    elif c0 in ('riv', 'wat'): nm(txt, cx, cy, ang, 'rio')
    elif c0 == 'city': nm(txt, cx, cy, ang, 'lug')
    else: nm(txt, cx, cy, ang, 'men')
for args in [('Ered Engrin', 40, -40.5, 0, 'mt1'), ('Angband', 10.4, -21, 0, 'lug2'), ('Thangorodrim', 8, 15, 0, 'mt'),
             ('Ered Luin', 205 - 14, 100, 90, 'mt1'), ('Ard-galen', 70, 13, -2, 'r2'), ('Taur-nu-Fuin', 8, 36, -3, 'men'),
             ('Dorthonion', 8, 30, -3, 'r3'), ('Nimbrethil', -101, 263.5, 0, 'men'), ('Gondolin', -51, 73.5, 0, 'lug'), ('Himring', 74, 64.5, 0, 'lug'),
             ('Nargothrond', -102, 168, 0, 'lug'), ('Menegroth', -35, 117.5, 0, 'lug'), ('Brethil', -80, 103, 32, 'r3'),
             ('Taur-im-Duinath', 18, 290, -12, 'r2'), ('Aglon', aglon[0], aglon[1] - 4, 0, 'lug'),
             ('Brecha de Maglor', maglor[0] + 1, maglor[1] - 5, 0, 'men'), ('Tol Sirion', -74.5, 47.2, 0, 'lug'),
             ('Dimbar', -60, 92, 0, 'r4'), ('Nan-tathren', -66, 226, 0, 'men'), ('Nan Dungortheb', -5, 80, -3, 'r4'), ('Estolad', 65, 134, 0, 'r4'),
             ('Nogrod', 184, 162, 0, 'lug'), ('Belegost', 172, 52, 0, 'lug'), ('Balar', -138.5, 321.5, -20, 'r3'),
             ('Tol Galen', tg_mid[0] + 1, tg_mid[1] - 4.5, 0, 'lug'), ('Nan Elmoth', 57, 117, 0, 'r4')]:
    nm(*args)
NCSS = '''text{text-anchor:middle;dominant-baseline:central;fill:#000}
.r1{font-family:'IM Fell English SC';font-size:9.5px;letter-spacing:5px}
.r2{font-family:'IM Fell English SC';font-size:6.6px;letter-spacing:3px}
.r3{font-family:'IM Fell English SC';font-size:5px;letter-spacing:1.8px}
.r4{font-family:'IM Fell English SC';font-size:4px;letter-spacing:1.1px}
.mar{font-family:'IM Fell English SC';font-size:14px;letter-spacing:10px;opacity:.85}
.mt{font-family:'Almendra';font-style:italic;font-size:3.6px}
.mt1{font-family:'IM Fell English SC';font-size:6px;letter-spacing:4px}
.rio{font-family:'Almendra';font-style:italic;font-size:3.3px}
.lug{font-family:'Almendra';font-size:3.7px}
.lug2{font-family:'IM Fell English SC';font-size:5px;letter-spacing:1.6px}
.men{font-family:'Almendra';font-style:italic;font-size:3.4px}
text{paint-order:stroke;stroke:#fff;stroke-width:1.3px;stroke-linejoin:round}
.r1,.r2,.mar{stroke-width:2.4px}'''
names_body = '<g id="nomes">' + ''.join(f'<text class="{c}" transform="translate({f(x)},{f(y)}) rotate({round(a,1)})">{t}</text>' for t, x, y, a, c in NAMES) + '</g>'
open('filme_nomes.svg', 'w').write(svg(f'<style>{NCSS}</style>' + names_body, bg=False))
open('filme_completo.svg', 'w').write(svg(f'<style>{NCSS}</style>' + ''.join(art) + names_body))
print('ok', len(NAMES), file=sys.stderr)
