from PIL import Image, ImageDraw

def render_garden_icon(size, is_maskable=False):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    scale = size / 256.0
    
    if is_maskable:
        # Full background for maskable icon
        draw.rectangle([0, 0, size, size], fill=(22, 101, 52, 255))
        # Inner safe-zone circle
        inner_pad = int(24 * scale)
        draw.ellipse([inner_pad, inner_pad, size - inner_pad, size - inner_pad], fill=(20, 83, 45, 255), outline=(34, 197, 94, 255), width=max(1, int(3 * scale)))
    else:
        # Outer rounded squircle background
        pad = int(12 * scale)
        r = int(54 * scale)
        draw.rounded_rectangle(
            [pad, pad, size - pad, size - pad],
            radius=r,
            fill=(22, 101, 52, 255),
            outline=(34, 197, 94, 255),
            width=max(1, int(4 * scale))
        )
    
    # Inner garden soil bed
    soil_top = int(145 * scale)
    soil_bottom = size - int(24 * scale)
    soil_left = int(32 * scale)
    soil_right = size - int(32 * scale)
    draw.rounded_rectangle(
        [soil_left, soil_top, soil_right, soil_bottom],
        radius=int(18 * scale),
        fill=(120, 53, 15, 255),
        outline=(180, 83, 9, 255),
        width=max(1, int(3 * scale))
    )
    
    # Bed ridges
    mid_y = int((soil_top + soil_bottom) / 2)
    draw.line([soil_left + int(8*scale), mid_y, soil_right - int(8*scale), mid_y], fill=(90, 40, 10, 255), width=max(1, int(2*scale)))

    # Main Sprout Stem
    stem_x = int(128 * scale)
    stem_y_start = int(155 * scale)
    stem_y_end = int(75 * scale)
    draw.line([stem_x, stem_y_start, stem_x, stem_y_end], fill=(74, 222, 128, 255), width=max(2, int(8 * scale)))
    
    # Left Leaf
    leaf_l = [
        (stem_x, int(115 * scale)),
        (int(70 * scale), int(85 * scale)),
        (int(60 * scale), int(60 * scale)),
        (int(90 * scale), int(68 * scale)),
        (stem_x, int(95 * scale))
    ]
    draw.polygon(leaf_l, fill=(34, 197, 94, 255))
    
    # Right Leaf
    leaf_r = [
        (stem_x, int(105 * scale)),
        (int(186 * scale), int(75 * scale)),
        (int(196 * scale), int(50 * scale)),
        (int(166 * scale), int(58 * scale)),
        (stem_x, int(85 * scale))
    ]
    draw.polygon(leaf_r, fill=(74, 222, 128, 255))
    
    # Tomato fruit
    tom_x = int(170 * scale)
    tom_y = int(135 * scale)
    tom_r = int(24 * scale)
    draw.ellipse([tom_x - tom_r, tom_y - tom_r, tom_x + tom_r, tom_y + tom_r], fill=(239, 68, 68, 255), outline=(185, 28, 28, 255), width=max(1, int(2*scale)))
    draw.polygon([
        (tom_x, tom_y - tom_r),
        (tom_x - int(8*scale), tom_y - tom_r - int(6*scale)),
        (tom_x + int(8*scale), tom_y - tom_r - int(6*scale))
    ], fill=(34, 197, 94, 255))
    
    # Carrot
    car_x = int(85 * scale)
    car_y = int(140 * scale)
    car_points = [
        (car_x - int(14 * scale), car_y - int(12 * scale)),
        (car_x + int(14 * scale), car_y - int(12 * scale)),
        (car_x, car_y + int(26 * scale))
    ]
    draw.polygon(car_points, fill=(249, 115, 22, 255), outline=(194, 65, 12, 255))
    draw.line([car_x, car_y - int(12 * scale), car_x - int(8 * scale), car_y - int(24 * scale)], fill=(34, 197, 94, 255), width=max(1, int(3 * scale)))
    draw.line([car_x, car_y - int(12 * scale), car_x + int(8 * scale), car_y - int(24 * scale)], fill=(74, 222, 128, 255), width=max(1, int(3 * scale)))

    return img

def main():
    # 192x192 standard & maskable
    img192 = render_garden_icon(192, is_maskable=False)
    img192.save('icon-192.png', 'PNG')
    
    img192m = render_garden_icon(192, is_maskable=True)
    img192m.save('icon-maskable-192.png', 'PNG')

    # 512x512 standard & maskable
    img512 = render_garden_icon(512, is_maskable=False)
    img512.save('icon-512.png', 'PNG')
    
    img512m = render_garden_icon(512, is_maskable=True)
    img512m.save('icon-maskable-512.png', 'PNG')

    # 180x180 Apple touch icon
    apple_icon = render_garden_icon(180, is_maskable=False)
    apple_icon.save('apple-touch-icon.png', 'PNG')

    print("Successfully generated icon-192.png, icon-512.png, icon-maskable-192.png, icon-maskable-512.png, apple-touch-icon.png")

if __name__ == '__main__':
    main()
