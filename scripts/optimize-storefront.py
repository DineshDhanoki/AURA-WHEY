"""Run with Python + Pillow to regenerate display assets; originals stay intact."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
files = [*ROOT.glob('assets/RC Card/*.png'), *ROOT.glob('assets/MK Card/*.png'),
         *ROOT.glob('assets/BLOG/*.png')]
files += [ROOT / 'assets' / name for name in ['image.png', 'lab image.png', 'aura-whey-logo.jpeg']]
before = after = 0
for source in files:
    target = ROOT / 'assets/optimized/site' / source.relative_to(ROOT / 'assets').with_suffix('.webp')
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as original:
        im = ImageOps.exif_transpose(original)
        size = 256 if source.name == 'aura-whey-logo.jpeg' else 1280
        im.thumbnail((size, size), Image.Resampling.LANCZOS)
        im.save(target, 'WEBP', quality=84, method=6)
    before += source.stat().st_size
    after += target.stat().st_size
    print(f'{source.name}: {source.stat().st_size:,} -> {target.stat().st_size:,} bytes')
for index, time in enumerate(['02_08_34', '02_11_54', '02_08_58', '02_10_27', '02_10_32']):
    source = ROOT / f'assets/Hero section/desktop/ChatGPT Image Sep 9, 2026, {time} AM(1).jpg'
    with Image.open(source) as im:
        im.thumbnail((96, 96), Image.Resampling.LANCZOS)
        im.save(ROOT / f'assets/optimized/ambient-{index}.webp', 'WEBP', quality=60)
print(f'Total display images: {before:,} -> {after:,} bytes ({100 * (1-after/before):.1f}% smaller)')
