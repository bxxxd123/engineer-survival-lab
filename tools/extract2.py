import numpy as np
from PIL import Image
from collections import deque
import os

SRC = '/Users/zaichi/Desktop/Ai-chief/docs/superpowers/工程師生存實驗室素材.png'
SHEET = np.array(Image.open(SRC).convert('RGB')).astype(np.float64)
SH, SW, _ = SHEET.shape


def box_blur(a, r=1):
    """Separable box blur (window 2r+1) on HxW or HxWxC float array."""
    k = 2 * r + 1

    def axis_blur(arr, axis):
        pad = [(0, 0)] * arr.ndim
        pad[axis] = (r, r)
        p = np.pad(arr, pad, mode='edge')
        zshape = list(p.shape)
        zshape[axis] = 1
        c = np.cumsum(np.concatenate([np.zeros(zshape), p], axis=axis), axis=axis)
        hi = [slice(None)] * arr.ndim
        lo = [slice(None)] * arr.ndim
        hi[axis] = slice(k, None)
        lo[axis] = slice(None, -k)
        return (c[tuple(hi)] - c[tuple(lo)]) / k

    return axis_blur(axis_blur(a, 0), 1)


def model_background(crop, small=40, iters=900, ring=2):
    """Harmonic (Laplace) inpainting from the border ring => smooth bg model."""
    h, w, _ = crop.shape
    sm = np.array(Image.fromarray(crop.astype(np.uint8)).resize((small, small), Image.BILINEAR)).astype(np.float64)
    known = np.zeros((small, small), bool)
    known[:ring, :] = known[-ring:, :] = True
    known[:, :ring] = known[:, -ring:] = True
    B = sm.copy()
    km = known[:, :, None]
    for _ in range(iters):
        B = np.where(km, sm, box_blur(B, 1))
    big = Image.fromarray(np.clip(B, 0, 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return np.array(big).astype(np.float64)


def flood_from_border(seed_bg, blocked):
    """Grow seed_bg through pixels that are not `blocked` (4-connectivity)."""
    h, w = seed_bg.shape
    reach = seed_bg & ~blocked
    for _ in range(h + w):
        g = reach.copy()
        g[1:, :] |= reach[:-1, :]
        g[:-1, :] |= reach[1:, :]
        g[:, 1:] |= reach[:, :-1]
        g[:, :-1] |= reach[:, 1:]
        g &= ~blocked
        if np.array_equal(g, reach):
            break
        reach = g
    return reach


def components(mask):
    h, w = mask.shape
    todo = mask.copy()
    out = []
    for y in range(h):
        for x in np.nonzero(todo[y])[0]:
            if not todo[y, x]:
                continue
            q = deque([(y, x)])
            todo[y, x] = False
            px = []
            while q:
                cy, cx = q.popleft()
                px.append((cy, cx))
                for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < h and 0 <= nx < w and todo[ny, nx]:
                        todo[ny, nx] = False
                        q.append((ny, nx))
            out.append(px)
    return out


def extract(box, lo=14.0, hi=34.0, keep_ratio=0.02):
    x0, y0, x1, y1 = box
    crop = SHEET[y0:y1, x0:x1]
    h, w, _ = crop.shape
    bg = model_background(crop)

    dist = np.sqrt(((crop - bg) ** 2).sum(axis=2))
    dist = box_blur(dist, 1)

    definite_fg = dist > hi
    definite_bg = dist < lo

    border = np.zeros((h, w), bool)
    border[0, :] = border[-1, :] = True
    border[:, 0] = border[:, -1] = True
    seed = border & definite_bg
    if not seed.any():
        seed = border

    bg_reach = flood_from_border(seed, definite_fg)
    fg = ~bg_reach

    comps = components(fg)
    if comps:
        biggest = max(len(c) for c in comps)
        keep = np.zeros((h, w), bool)
        for c in comps:
            if len(c) >= biggest * keep_ratio:
                ys, xs = zip(*c)
                keep[np.array(ys), np.array(xs)] = True
        fg = keep

    soft = np.clip((dist - lo) / max(hi - lo, 1e-6), 0, 1)
    alpha = np.where(fg, np.maximum(soft, 0.0), 0.0)
    alpha = box_blur(alpha, 1)
    alpha = np.where(fg, np.clip(alpha * 1.35, 0, 1), 0.0)

    rgba = np.dstack([crop, alpha * 255]).astype(np.uint8)
    return rgba, alpha


def touches_edge(alpha, thresh=0.35, margin=1):
    a = alpha > thresh
    return (a[:margin, :].any(), a[-margin:, :].any(), a[:, :margin].any(), a[:, -margin:].any())


def trim(rgba, pad=4):
    a = rgba[:, :, 3]
    ys, xs = np.nonzero(a > 10)
    if len(ys) == 0:
        return rgba
    y0, y1 = max(0, ys.min() - pad), min(rgba.shape[0], ys.max() + 1 + pad)
    x0, x1 = max(0, xs.min() - pad), min(rgba.shape[1], xs.max() + 1 + pad)
    return rgba[y0:y1, x0:x1]
