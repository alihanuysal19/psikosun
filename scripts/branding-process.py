"""
Marka asset'lerini hazirlar:
  - "Premultiplied unmultiply" ile siyah arkaplani temizler:
    alpha = max(r,g,b), kenar pikselleri renk doygunlugunu koruyarak
    yari-saydam isina (glow) cevrilir; gri halo birakmaz
  - Boyut seti: full (orijinal), 512, 256, 128, 64, 32, 16
  - Favicon icin ayrica .ico (multi-size: 16/32/48/64)

Kaynak JPG'ler: public/branding/{psikosun-icon,psikosun-wordmark,psikosun-mark}.jpg
"""
from pathlib import Path
from PIL import Image
import numpy as np


ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "public" / "branding"

# Cok dusuk parlaklikta pikselleri tamamen kes (JPG salt-and-pepper noise)
NOISE_FLOOR = 6


def black_to_alpha(src_path: Path) -> Image.Image:
    """JPG'de siyah arkaplani temiz alpha kanalina cevir.

    Yaklasim: alpha = max(r,g,b). Bu siyahi tam saydam (alpha=0), beyazi
    tam opak (alpha=255) yapar. Kenar pikselleri (orn. cyan-on-black blend
    sonucu rgb=40,80,80) "premultiplied unmultiply" ile rengin orijinal
    saturasyonuna cikarilir: r' = r*255/alpha. Boylelikle yari-saydam
    cyan/magenta glow olarak goruntu doruk korur, gri halo birakmaz.
    """
    img = Image.open(src_path).convert("RGB")
    arr = np.asarray(img, dtype=np.uint8).astype(np.float32)  # HxWx3

    # alpha = max(r,g,b)
    alpha = arr.max(axis=2)  # HxW

    # Cok dusuk parlaklik = pure noise -> tamamen kes
    alpha[alpha < NOISE_FLOOR] = 0.0

    # Premultiplied unmultiply: rgb'yi alpha'ya bol, renk satursyonunu koru
    safe_alpha = np.where(alpha > 0, alpha, 1.0)  # bolme hatasini onle
    factor = 255.0 / safe_alpha  # HxW
    rgb = (arr * factor[..., None]).clip(0, 255)

    # alpha=0 olan pikseller icin rgb'yi de sifirla (defensive)
    mask0 = alpha == 0
    rgb[mask0] = 0.0

    out = np.dstack([rgb.astype(np.uint8), alpha.astype(np.uint8)])
    return Image.fromarray(out, mode="RGBA")


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
