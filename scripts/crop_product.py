import cv2
import os

SRC = r"C:\Users\Hp\BioMart\screenshots\storefront_verified_light.png"
OUT_IMG = r"C:\Users\Hp\BioMart\video\public\hoodie_photo.png"
OUT_STORE = r"C:\Users\Hp\BioMart\video\public\storefront_real.png"

img = cv2.imread(SRC)
h, w, _ = img.shape
print(f"Storefront image: {w}x{h}")

# Save full storefront for phone background
cv2.imwrite(OUT_STORE, img)

# Crop the first product's photo area (approximately top-mid where the product image is)
# Let's inspect where product images are or save a clean crop
cv2.imwrite(OUT_IMG, img[450:900, 40:740])
print("Saved storefront_real.png and hoodie_photo.png")
