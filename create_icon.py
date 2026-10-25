"""
Generate a high quality garden icon for the Smart Garden application.
"""
from PIL import Image, ImageDraw

def create_garden_icon():
    sizes = [256, 128, 64, 48, 32, 16]
    images = []
    
    for size in sizes:
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        scale = size / 256.0
        
        # Outer rounded circle / squircle background with emerald gradient
        # Rounded rectangle
        pad = int(12 * scale)
        r = int(54 * scale)
        draw.rounded_rectangle(
            [pad, pad, size - pad, size - pad],
            radius=r,
            fill=(22, 101, 52, 255), # dark green border
            outline=(34, 197, 94, 255), # bright emerald
            width=max(1, int(4 * scale))
        )
        
        # Inner garden soil bed (rich dark brown)
        soil_top = int(145 * scale)
        soil_bottom = size - int(24 * scale)
        soil_left = int(32 * scale)
        soil_right = size - int(32 * scale)
        draw.rounded_rectangle(
            [soil_left, soil_top, soil_right, soil_bottom],
            radius=int(18 * scale),
            fill=(120, 53, 15, 255), # warm wood/soil brown
            outline=(180, 83, 9, 255),
            width=max(1, int(3 * scale))
        )
        
        # Bed ridges / planks
        mid_y = int((soil_top + soil_bottom) / 2)
        draw.line([soil_left + int(8*scale), mid_y, soil_right - int(8*scale), mid_y], fill=(90, 40, 10, 255), width=max(1, int(2*scale)))

        # Carrot / Tomato / Sprout elements
        # 1. Main Sprout Stem (center)
        stem_x = int(128 * scale)
        stem_y_start = int(155 * scale)
        stem_y_end = int(75 * scale)
        draw.line([stem_x, stem_y_start, stem_x, stem_y_end], fill=(74, 222, 128, 255), width=max(2, int(8 * scale)))
        
        # 2. Left Leaf
        leaf_l = [
            (stem_x, int(115 * scale)),
            (int(70 * scale), int(85 * scale)),
            (int(60 * scale), int(60 * scale)),
            (int(90 * scale), int(68 * scale)),
            (stem_x, int(95 * scale))
        ]
        draw.polygon(leaf_l, fill=(34, 197, 94, 255))
        
        # 3. Right Leaf
        leaf_r = [
            (stem_x, int(105 * scale)),
            (int(186 * scale), int(75 * scale)),
            (int(196 * scale), int(50 * scale)),
            (int(166 * scale), int(58 * scale)),
            (stem_x, int(85 * scale))
        ]
        draw.polygon(leaf_r, fill=(74, 222, 128, 255))
        
        # 4. Cute Tomato fruit on the right
        tom_x = int(170 * scale)
        tom_y = int(135 * scale)
        tom_r = int(24 * scale)
        draw.ellipse([tom_x - tom_r, tom_y - tom_r, tom_x + tom_r, tom_y + tom_r], fill=(239, 68, 68, 255), outline=(185, 28, 28, 255), width=max(1, int(2*scale)))
        # Tomato leaf cap
        draw.polygon([
            (tom_x, tom_y - tom_r),
            (tom_x - int(8*scale), tom_y - tom_r - int(6*scale)),
            (tom_x + int(8*scale), tom_y - tom_r - int(6*scale))
        ], fill=(34, 197, 94, 255))
        
        # 5. Cute Carrot on the left
        car_x = int(85 * scale)
        car_y = int(140 * scale)
        car_points = [
            (car_x - int(14 * scale), car_y - int(12 * scale)),
            (car_x + int(14 * scale), car_y - int(12 * scale)),
            (car_x, car_y + int(26 * scale))
        ]
        draw.polygon(car_points, fill=(249, 115, 22, 255), outline=(194, 65, 12, 255))
        # Carrot greens
        draw.line([car_x, car_y - int(12 * scale), car_x - int(8 * scale), car_y - int(24 * scale)], fill=(34, 197, 94, 255), width=max(1, int(3 * scale)))
        draw.line([car_x, car_y - int(12 * scale), car_x + int(8 * scale), car_y - int(24 * scale)], fill=(74, 222, 128, 255), width=max(1, int(3 * scale)))

        images.append(img)
        
    # Save as .ico containing all sizes
    images[0].save('icon.ico', format='ICO', sizes=[(s, s) for s in sizes])
    images[0].save('icon.png', format='PNG')
    print('Successfully created icon.ico and icon.png')

if __name__ == '__main__':
    create_garden_icon()
