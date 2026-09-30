#!/usr/bin/env python3
"""Create size-optimized WebP copies of blog images and record intrinsic dimensions.

The build serves content/blog/images-optimized/<name>.webp in place of
/blog/images/<name> when an entry exists in images-optimized/manifest.json, and adds
width/height attributes from the manifest. Originals are kept so a wiki re-pull still
builds; rerun this script after pulling new images.

Also records width/height for note media in content/media/media-manifest.json.

Usage: python3 scripts/optimize-images.py [--max-width 1400] [--quality 80]
"""
import argparse
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BLOG_IMAGES = ROOT / "content" / "blog" / "images"
OPTIMIZED = ROOT / "content" / "blog" / "images-optimized"
MEDIA_DIR = ROOT / "content" / "media"


def optimize_blog_images(max_width, quality):
    OPTIMIZED.mkdir(parents=True, exist_ok=True)
    manifest = {}
    for source in sorted(BLOG_IMAGES.iterdir()):
        if not source.is_file():
            continue
        with Image.open(source) as image:
            image.load()
            if image.width > max_width:
                height = round(image.height * max_width / image.width)
                image = image.resize((max_width, height), Image.LANCZOS)
            has_alpha = image.mode in ("RGBA", "LA") or "transparency" in image.info
            image = image.convert("RGBA" if has_alpha else "RGB")
            target = OPTIMIZED / f"{source.stem}.webp"
            image.save(target, "WEBP", quality=quality, method=6)
            manifest[source.name] = {
                "file": target.name,
                "width": image.width,
                "height": image.height,
                "bytes": target.stat().st_size,
                "originalBytes": source.stat().st_size,
            }
    (OPTIMIZED / "manifest.json").write_text(json.dumps({"version": 1, "images": manifest}, indent=2) + "\n")
    before = sum(item["originalBytes"] for item in manifest.values())
    after = sum(item["bytes"] for item in manifest.values())
    print(f"blog images: {len(manifest)} files, {before} -> {after} bytes")


def svg_dimensions(path):
    text = path.read_text()
    match = re.search(r'viewBox="0 0 ([0-9.]+) ([0-9.]+)"', text)
    return (round(float(match.group(1))), round(float(match.group(2)))) if match else (None, None)


def record_media_dimensions():
    manifest_path = MEDIA_DIR / "media-manifest.json"
    data = json.loads(manifest_path.read_text())
    for entry in data["images"].values():
        file_path = MEDIA_DIR / entry["src"].removeprefix("/assets/notes-media/")
        if file_path.suffix == ".svg":
            width, height = svg_dimensions(file_path)
        else:
            with Image.open(file_path) as image:
                width, height = image.size
        entry["width"], entry["height"] = width, height
    manifest_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"note media: recorded dimensions for {len(data['images'])} images")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-width", type=int, default=1400)
    parser.add_argument("--quality", type=int, default=80)
    args = parser.parse_args()
    optimize_blog_images(args.max_width, args.quality)
    record_media_dimensions()
