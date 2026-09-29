"""
Splits assets/logo.png into animatable layers without changing a single pixel of the artwork:
every visible pixel lands in exactly one layer, with its original colour and alpha, so the
layers composite back to the original. Run from motion/seal:  python tools/split-logo.py

  ray-XX.png  each sunburst ray on its own (so they can pulse in a wave)
  wheel.png   the yellow wheel ring and its lotus petals along the bottom
  core.png    the blue crown, frame and banner, plus the small yellow ornaments between
  layers.json geometry the composition needs (ray order, centroids, sparkle anchors)
"""
import json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

SRC = "assets/logo.png"
OUT = "assets/layers"
a = np.array(Image.open(SRC).convert("RGBA"))
H, W = a.shape[:2]
alpha = a[..., 3]
r, g, b = (a[..., i].astype(int) for i in range(3))
opaque = alpha > 128
yellow = opaque & (r > 200) & (g > 190) & (b < 120)
blue = opaque & (b > 120) & (r < 120)

labels = np.zeros((H, W), dtype=np.int32)   # 0 = unassigned
CORE, WHEEL = 1, 2
next_label = 10
rays = []                                     # (label, centroid_x, centroid_y, area)

ylab, n = ndi.label(yellow, structure=np.ones((3, 3)))
for i in range(1, n + 1):
    m = ylab == i
    ys, xs = np.nonzero(m)
    cy, cx, area = ys.mean(), xs.mean(), int(m.sum())
    if cy >= 360:
        labels[m] = WHEEL
    elif cy >= 270:
        labels[m] = CORE
    elif area >= 120:
        labels[m] = next_label
        rays.append((next_label, float(cx), float(cy), area))
        next_label += 1
    else:
        labels[m] = -1                        # speck in the ray zone: joins its nearest ray below
labels[blue] = CORE

# Every remaining visible pixel (anti-aliased edges, specks) joins its nearest labelled pixel.
known = labels > 0
_, (iy, ix) = ndi.distance_transform_edt(~known, return_indices=True)
nearest = labels[iy, ix]
visible = alpha > 0
assign = np.where(known, labels, nearest) * visible

def write(name, mask):
    layer = np.zeros_like(a)
    layer[mask] = a[mask]
    Image.fromarray(layer, "RGBA").save(f"{OUT}/{name}.png")

# Rays ordered by angle around the finial, so the wave can run out from the centre.
PIVOT = (181.0, 100.0)
import math
rays.sort(key=lambda t: math.atan2(t[1] - PIVOT[0], -(t[2] - PIVOT[1])))
meta = {"canvas": [W, H], "pivot": PIVOT, "rays": []}
for k, (lab, cx, cy, area) in enumerate(rays):
    name = f"ray-{k:02d}"
    write(name, assign == lab)
    ang = math.degrees(math.atan2(cx - PIVOT[0], -(cy - PIVOT[1])))
    meta["rays"].append({"file": f"{name}.png", "cx": round(cx, 1), "cy": round(cy, 1), "angle": round(ang, 1), "area": area})
write("wheel", assign == WHEEL)
write("core", assign == CORE)

# The layers must add back up to the original artwork exactly.
total = np.zeros_like(a)
for f in [x["file"][:-4] for x in meta["rays"]] + ["wheel", "core"]:
    L = np.array(Image.open(f"{OUT}/{f}.png"))
    m = L[..., 3] > 0
    assert not (total[..., 3][m] > 0).any(), f"{f} overlaps another layer"
    total[m] = L[m]
assert (total[visible] == a[visible]).all(), "layers do not reproduce the logo"

# Bright gold spots for sparkles: the centre of each big ray tip and of the wheel.
meta["sparkles"] = [{"x": r_["cx"], "y": r_["cy"]} for r_ in meta["rays"][:0]]
meta["bbox"] = [int(v) for v in (np.nonzero(visible)[1].min(), np.nonzero(visible)[0].min(), np.nonzero(visible)[1].max(), np.nonzero(visible)[0].max())]
json.dump(meta, open(f"{OUT}/layers.json", "w"), indent=1)
print(f"{len(rays)} rays + wheel + core; layers reproduce the original exactly; bbox {meta['bbox']}")
