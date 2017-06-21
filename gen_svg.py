#!/usr/bin/env python

import json
import sys

PATH_SVG = """
<svg width="1600" height="400" viewBox="0 0 {viewbox_width} {viewbox_height}" preserveAspectRatio="none"
     xmlns="http://www.w3.org/2000/svg" version="1.1">
  <path d="{path}" fill="black"/>
</svg>
"""


def main():
    with open("data.json", "r") as fin:
        data = json.load(fin)
    points = data["points"]

    viewbox_width = 1
    viewbox_height = 1

    width = 1
    height = 1

    path = []
    for point in points:
        cmd = "L" if path else "M"
        x = point['total_ndist']
        y = height - point['nele']
        path.append("{}{} {}".format(cmd, x, y))

    path.append("L{} {}".format(viewbox_width, viewbox_height))
    path.append("L0 {}".format(viewbox_height))
    path.append("Z")
    path = " ".join(path)

    print PATH_SVG.format(
        width=width,
        height=height,
        viewbox_width=viewbox_width,
        viewbox_height=viewbox_height,
        path=path,
    )


if __name__ == "__main__":
    main()
