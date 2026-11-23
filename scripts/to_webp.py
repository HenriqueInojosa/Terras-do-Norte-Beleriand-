"""Converte o PNG rasterizado do mapa em WebP (2400px e 4800px de largura). Requer Pillow."""
import sys
from pathlib import Path
from PIL import Image

src, out = sys.argv[1], Path(sys.argv[2])
im = Image.open(src).convert("RGB")
im.save(out / "beleriand-base@2x.webp", quality=80, method=6)
im.resize((im.width // 2, im.height // 2), Image.LANCZOS).save(out / "beleriand-base.webp", quality=82, method=6)
print("ok", im.size)
