"""Pergaminho envelhecido + tinta sépia. uso: compor.py tinta.png saida.jpg"""
import sys, numpy as np
from PIL import Image, ImageFilter
rng = np.random.default_rng(5)
ink = Image.open(sys.argv[1]).convert('L')
Wd, Hh = ink.size

def noise(scale, octaves=5, persist=.55):
    out = np.zeros((Hh, Wd), np.float32); amp = 1; tot = 0
    for o in range(octaves):
        s = max(2, int(scale * 2 ** o))
        g = rng.random((max(2, int(Hh / Wd * s)), s)).astype(np.float32)
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((Wd, Hh), Image.BICUBIC)
        out += amp * (np.asarray(im, np.float32) / 255); tot += amp; amp *= persist
    return out / tot

yy, xx = np.mgrid[0:Hh, 0:Wd].astype(np.float32)
u = xx / Wd - .5; v = yy / Hh - .5
r = np.sqrt((u * 1.1) ** 2 + (v * 1.25) ** 2)
base = np.array([232, 210, 166], np.float32)     # light parchment
dark = np.array([170, 128, 74], np.float32)      # burnt edge
blot = noise(3, 6)                               # large stains
fine = noise(60, 3)                              # grain
crinkle = np.abs(noise(9, 5) - .5)               # creased veins (ridged)
veins = np.clip(1 - crinkle * 14, 0, 1) ** 3
t = np.clip((r - .22) * 1.8, 0, 1) ** 1.5       # vignette
t += np.clip(blot - .5, 0, 1) * 1.5             # stains
t += veins * .16 + (fine - .5) * .12
# two fold creases
for c, axis in [(.5, 'x'), (.5, 'y')]:
    d = np.abs((xx / Wd if axis == 'x' else yy / Hh) - c) * (Wd if axis == 'x' else Hh)
    t += np.exp(-(d / 5) ** 2) * .12 - np.exp(-((d - 7) / 6) ** 2) * .04
# a couple of ring stains
for (cx, cy, rr) in [(.78, .14, .07), (.12, .62, .05), (.62, .86, .06)]:
    d = np.sqrt((xx / Wd - cx) ** 2 + (yy / Wd - cy) ** 2)
    t += np.exp(-((d - rr) / .004) ** 2) * .09 + (d < rr) * .03
t = np.clip(t, 0, 1.3)[..., None]
paper = base * (1 - t * .55) + dark * (t * .55)
paper *= (1 - np.clip(t - 1, 0, 1) * .3)

# ink: darkness from render, softened and broken by paper grain
k = np.asarray(ink.filter(ImageFilter.GaussianBlur(.6 * Wd / 3000)), np.float32) / 255
d = 1 - k
d *= (.82 + .3 * noise(90, 2))
d = np.clip(d * 1.05, 0, 1)[..., None]
INK = np.array([52, 32, 16], np.float32)
out = paper * (1 - d * .94) + INK * (d * .94)
img = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
img.save(sys.argv[2], quality=90) if sys.argv[2].endswith('.jpg') else img.save(sys.argv[2], quality=88)
print('ok', img.size)
