"""Erzeugt die App-Icons (PNG) für Homescreen und Browser.
Aufruf:  python tools/make_icons.py
Motiv: Notizblatt mit zwei Zeilen und Funkeln auf Indigo, wie das Favicon."""
import os

from PIL import Image, ImageDraw

INDIGO = (79, 70, 229)
WHITE = (255, 255, 255)
SPARK = (199, 210, 254)
SS = 4  # Überabtastung für weiche Kanten

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'icons')


def sparkle(draw, cx, cy, r, fill):
    """Vierzackiger Stern."""
    k = r * 0.28
    pts = [(cx, cy - r), (cx + k, cy - k), (cx + r, cy), (cx + k, cy + k),
           (cx, cy + r), (cx - k, cy + k), (cx - r, cy), (cx - k, cy - k)]
    draw.polygon(pts, fill=fill)


def render(size, maskable=False, rounded=True):
    S = size * SS
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable or not rounded:
        d.rectangle([0, 0, S, S], fill=INDIGO)
    else:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=INDIGO)

    # Motiv in einem 32er-Raster wie das Favicon; maskable: kleiner (Safe-Zone)
    scale = 0.72 if maskable else 1.0
    u = S / 32 * scale
    off = (S - 32 * u) / 2
    P = lambda x, y: (off + x * u, off + y * u)
    w = max(1, int(2.4 * u))

    x0, y0 = P(8.5, 7.5)
    x1, y1 = P(23.5, 24.5)
    d.rounded_rectangle([x0, y0, x1, y1], radius=int(3.2 * u), outline=WHITE, width=w)
    for (ax, ay, bx) in [(12.5, 13, 19.5), (12.5, 17.5, 17)]:
        a = P(ax, ay)
        b = P(bx, ay)
        d.line([a, b], fill=WHITE, width=w)
        r = w / 2
        d.ellipse([a[0] - r, a[1] - r, a[0] + r, a[1] + r], fill=WHITE)
        d.ellipse([b[0] - r, b[1] - r, b[0] + r, b[1] + r], fill=WHITE)
    cx, cy = P(23.5, 24.5)
    d.ellipse([cx - 4.6 * u, cy - 4.6 * u, cx + 4.6 * u, cy + 4.6 * u], fill=INDIGO)
    sparkle(d, cx, cy, 3.6 * u, SPARK)

    return img.resize((size, size), Image.LANCZOS)


def main():
    os.makedirs(OUT, exist_ok=True)
    render(192).save(os.path.join(OUT, 'icon-192.png'))
    render(512).save(os.path.join(OUT, 'icon-512.png'))
    render(512, maskable=True).save(os.path.join(OUT, 'icon-maskable-512.png'))
    # iOS rundet selbst ab und mag keine Transparenz
    render(180, rounded=False).convert('RGB').save(os.path.join(OUT, 'apple-touch-icon.png'))
    print('Icons erstellt in', os.path.normpath(OUT))


if __name__ == '__main__':
    main()
