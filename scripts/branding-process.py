"""
Marka asset'lerini hazırlar:
  - Siyah arkaplanı (~RGB ≤ 18) tam transparent yapar (alpha = 0)
  - Koyu kenar piksellerine soft alpha uygular (ramp 18→32) — halo bırakmaz
  - Üç boyut çıktı: full (orijinal), 512, 256, 128, 64, 32, 16
  - Favicon için ayrıca .ico (multi-size: 16/32/48/64) üretir

Kaynak JPG'ler: public/branding/{psikosun-icon,psikosun-wordmark,psikosun-mark}.jpg
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "public" / "branding"

THRESH_FULL = 18   # bu ve altı = tam saydam
THRESH_SOFT = 32   # bu ve üstü = tam opak
RAMP = THRESH_SOFT - THRESH_FULL


def black_to_alpha(src_path: Path) -> Image.Image:
    img = Image.open(src_path).convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            v = max(r, g, b)
            if v <= THRESH_FULL:
                px[x, y] = (r, g, b, 0)
            elif v < THRESH_SOFT:
                a = int(round((v - THRESH_FULL) / RAMP * 255))
                px[x, y] = (r, g, b, a)
            # else: full opaque, leave alpha 255
    return img


def trim_to_content(rgba: Image.Image, padding: int = 8) -> Image.Image:
    """Alpha-tabanli bbox bul, sayfa bosluklarini kirp; gorsel iceriginin
    etrafina kucuk bir nefes payi birak."""
    bbox = rgba.getbbox()
    if bbox is None:
        return rgba
    l, t, r, b = bbox
    l = max(0, l - padding)
    t = max(0, t - padding)
    r = min(rgba.width, r + padding)
    b = min(rgba.height, b + padding)
    return rgba.crop((l, t, r, b))


def export_set(rgba: Image.Image, base_name: str, sizes: list[int]) -> None:
    rgba.save(BRAND / f"{base_name}.png", "PNG", optimize=True)
    for s in sizes:
        # En boy oranını koru: kısa kenar = s
        w, h = rgba.size
        scale = s / max(w, h)
        nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
        resized = rgba.resize((nw, nh), Image.LANCZOS)
        resized.save(BRAND / f"{base_name}-{s}.png", "PNG", optimize=True)


def export_favicon(rgba: Image.Image) -> None:
    # ICO multi-size
    sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
    # rgba kare kabul ediliyor — değilse padding'le kareye al
    w, h = rgba.size
    if w != h:
        side = max(w, h)
        canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        canvas.paste(rgba, ((side - w) // 2, (side - h) // 2), rgba)
        rgba = canvas
    rgba.save(BRAND / "favicon.ico", format="ICO", sizes=sizes)


def main():
    print(f"[branding] Source dir: {BRAND}")

    # 1) Icon (favicon kaynagi + apple-touch + sosyal kart)
    icon = trim_to_content(black_to_alpha(BRAND / "psikosun-icon.jpg"), padding=12)
    export_set(icon, "psikosun-icon", [512, 256, 192, 180, 128, 64, 32])
    export_favicon(icon)
    print("  [ok] psikosun-icon (PNG set + favicon.ico)")

    # 2) Wordmark (ust nav) - tight crop sart, text okunabilir kalsin
    wm = trim_to_content(black_to_alpha(BRAND / "psikosun-wordmark.jpg"), padding=8)
    export_set(wm, "psikosun-wordmark", [800, 480, 320, 240])
    print(f"  [ok] psikosun-wordmark (PNG set, cropped to {wm.size})")

    # 3) Mark (footer)
    mark = trim_to_content(black_to_alpha(BRAND / "psikosun-mark.jpg"), padding=10)
    export_set(mark, "psikosun-mark", [512, 256, 128, 64])
    print("  [ok] psikosun-mark (PNG set)")

    print("[branding] Done.")


if __name__ == "__main__":
    main()
