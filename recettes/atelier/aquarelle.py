"""Transforme les rendus vectoriels (aplats + traits) en illustrations façon aquarelle.

Usage : python3 aquarelle.py <dossier_rendus> <dossier_sortie> [taille]
Entrée : <id>.fill.png et <id>.line.png (600 px, fond transparent)
Sortie : <id>.webp (illustration finale, fond transparent)
"""
import sys, os, json, glob, hashlib
import numpy as np
import cv2
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
SIZE = int(sys.argv[3]) if len(sys.argv) > 3 else 360
os.makedirs(OUT, exist_ok=True)


def noise(h, w, sigma, rng):
    n = rng.standard_normal((h, w)).astype(np.float32)
    n = cv2.GaussianBlur(n, (0, 0), sigma)
    n /= (n.std() + 1e-6)
    return n


def wobble(img, amp, sigma, rng):
    h, w = img.shape[:2]
    dx = noise(h, w, sigma, rng) * amp
    dy = noise(h, w, sigma, rng) * amp
    xs, ys = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    return cv2.remap(img, xs + dx, ys + dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)


def regions(rgb, a):
    """Étiquette les zones de couleur unie (aplats)."""
    q = (rgb // 6).astype(np.int32)
    key = (q[..., 0] << 12) | (q[..., 1] << 6) | q[..., 2]
    key[a < 0.5] = -1
    labels = np.zeros(key.shape, np.int32)
    n = 0
    vals, counts = np.unique(key[key >= 0], return_counts=True)
    for v, c in zip(vals, counts):
        if c < 60:
            continue
        m = (key == v).astype(np.uint8)
        k, lab = cv2.connectedComponents(m, connectivity=4)
        for i in range(1, k):
            mm = lab == i
            if mm.sum() < 60:
                continue
            n += 1
            labels[mm] = n
    return labels, n


def process(id_):
    seed = int(hashlib.md5(id_.encode()).hexdigest()[:8], 16)
    rng = np.random.default_rng(seed)
    fill = np.asarray(Image.open(f'{SRC}/{id_}.fill.png').convert('RGBA')).astype(np.float32) / 255
    line = np.asarray(Image.open(f'{SRC}/{id_}.line.png').convert('RGBA')).astype(np.float32) / 255
    H, W = fill.shape[:2]
    rgb = fill[..., :3].copy()
    a = fill[..., 3].copy()

    # --- volumes : ombre en bas à droite, lumière en haut à gauche, par zone de couleur
    labels, n = regions((rgb * 255).astype(np.int32), a)
    shade = np.zeros((H, W), np.float32)
    light = np.zeros((H, W), np.float32)
    off = 9
    for i in range(1, n + 1):
        m = (labels == i).astype(np.float32)
        ys, xs = np.nonzero(m)
        size = max(np.ptp(xs) if len(xs) else 1, np.ptp(ys) if len(ys) else 1)
        o = max(3, min(off, size * 0.12))
        M1 = np.float32([[1, 0, -o], [0, 1, -o]])
        M2 = np.float32([[1, 0, o * 0.8], [0, 1, o * 0.8]])
        inner_sh = m * (1 - cv2.warpAffine(m, M1, (W, H)))
        inner_li = m * (1 - cv2.warpAffine(m, M2, (W, H)))
        b = max(2.0, o * 0.9)
        shade += cv2.GaussianBlur(inner_sh, (0, 0), b) * m
        light += cv2.GaussianBlur(inner_li, (0, 0), b) * m
    shade = np.clip(shade * 1.6, 0, 1)
    light = np.clip(light * 1.4, 0, 1)

    # --- lavis : couleur un peu transparente, irrégulière
    wash = noise(H, W, 26, rng)
    wash2 = noise(H, W, 7, rng)
    lum = 1 + 0.06 * wash + 0.025 * wash2
    col = rgb * lum[..., None]
    col = col * (1 - 0.30 * shade[..., None]) + (1 - col) * (0.22 * light[..., None])
    col = col * 0.93 + 0.07         # transparence de l'aquarelle

    # --- bords plus foncés (le pigment s'accumule)
    g = cv2.cvtColor((np.clip(rgb, 0, 1) * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32)
    edges = (cv2.Canny((g).astype(np.uint8), 12, 30) > 0) | (cv2.Canny((a * 255).astype(np.uint8), 40, 120) > 0)
    dist = cv2.distanceTransform((~edges).astype(np.uint8), cv2.DIST_L2, 3)
    pool = np.exp(-dist / 3.2)
    col = col * (1 - 0.16 * pool[..., None])

    # --- grain du papier et granulation
    grain = cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), 0.9)
    grain /= grain.std() + 1e-6
    col = col * (1 - 0.022 * grain[..., None])
    col = np.clip(col, 0, 1)

    # --- bords irréguliers
    rgba = np.dstack([col, a])
    rgba = wobble(rgba, 2.6, 9, rng)
    rgba[..., :3] = cv2.GaussianBlur(rgba[..., :3], (0, 0), 0.7)
    alpha = rgba[..., 3]
    alpha = np.clip(alpha * (0.93 + 0.07 * noise(H, W, 3, rng)), 0, 1)
    # un léger halo de pigment qui déborde
    halo = cv2.GaussianBlur(alpha, (0, 0), 2.2) * 0.18
    alpha = np.maximum(alpha, halo)

    # --- trait d'encre
    la = wobble(line[..., 3].copy(), 1.0, 6, rng)
    la *= np.clip(0.72 + 0.28 * noise(H, W, 14, rng), 0.25, 1)
    ink = np.array([0x4A, 0x34, 0x26], np.float32) / 255

    out_rgb = rgba[..., :3] * (1 - la[..., None] * 0.85) + ink * (la[..., None] * 0.85)
    out_a = np.clip(alpha + la * (1 - alpha), 0, 1)
    # on prémultiplie proprement pour éviter les liserés
    res = np.dstack([out_rgb, out_a])
    res = (np.clip(res, 0, 1) * 255).astype(np.uint8)
    im = Image.fromarray(res, 'RGBA')
    bbox = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    if bbox:
        # carré centré autour du dessin, avec une petite marge
        x0, y0, x1, y1 = bbox
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        s = max(x1 - x0, y1 - y0) * 1.06
        im = im.crop((int(cx - s / 2), int(cy - s / 2), int(cx + s / 2), int(cy + s / 2)))
    im = im.resize((SIZE, SIZE), Image.LANCZOS)
    im.save(f'{OUT}/{id_}.webp', 'WEBP', quality=88, method=6)


if __name__ == '__main__':
    from multiprocessing import Pool
    ids = sorted({os.path.basename(p).split('.')[0] for p in glob.glob(f'{SRC}/*.fill.png')})
    only = sys.argv[4:] if len(sys.argv) > 4 else None
    if only:
        ids = [i for i in ids if i in only]
    with Pool(os.cpu_count() or 2) as pool:
        pool.map(process, ids)
    print('aquarelle', len(ids))
