"""
center_virtual_tryon.py
Simplified version: Always center product on webcam feed.
Controls: +/- to resize, q/ESC to quit, p to save snapshot.
"""

import cv2
import numpy as np
import os
import time
import argparse

def load_product_with_alpha(path):
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise FileNotFoundError(f"Could not read product image: {path}")

    if img.ndim == 3 and img.shape[2] == 4:  # Already RGBA
        bgr = img[:, :, :3]
        alpha = img[:, :, 3]
    elif img.ndim == 3 and img.shape[2] == 3:  # No alpha → make one
        bgr = img
        thr = 240
        near_white = (bgr[:, :, 0] >= thr) & (bgr[:, :, 1] >= thr) & (bgr[:, :, 2] >= thr)
        alpha = np.where(near_white, 0, 255).astype(np.uint8)
    elif img.ndim == 2:
        bgr = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        alpha = np.full(bgr.shape[:2], 255, dtype=np.uint8)
    else:
        raise ValueError("Unsupported product image format.")
    return bgr, alpha

def overlay_center(frame, prod_bgr, prod_alpha):
    H, W = frame.shape[:2]
    h, w = prod_bgr.shape[:2]
    x = W//2 - w//2
    y = H//2 - h//2

    # Ensure inside frame
    x1 = max(x, 0); y1 = max(y, 0)
    x2 = min(x+w, W); y2 = min(y+h, H)
    if x1 >= x2 or y1 >= y2:
        return frame

    fx1 = x1 - x; fy1 = y1 - y
    fx2 = fx1 + (x2 - x1); fy2 = fy1 + (y2 - y1)

    fg_crop = prod_bgr[fy1:fy2, fx1:fx2].astype(np.float32)
    alpha_crop = prod_alpha[fy1:fy2, fx1:fx2].astype(np.float32) / 255.0
    alpha_crop = alpha_crop[:, :, None]

    bg_roi = frame[y1:y2, x1:x2].astype(np.float32)
    blended = alpha_crop * fg_crop + (1.0 - alpha_crop) * bg_roi
    frame[y1:y2, x1:x2] = blended.astype(np.uint8)
    return frame

def main_loop(product_path, cam_index=0):
    prod_bgr_orig, prod_alpha_orig = load_product_with_alpha(product_path)
    prod_h0, prod_w0 = prod_bgr_orig.shape[:2]

    scale = 0.3  # default small size

    cap = cv2.VideoCapture(cam_index)
    if not cap.isOpened():
        raise RuntimeError(f"Could not open webcam (index {cam_index})")

    print("\nControls: +/-: scale | p: snapshot | q/ESC: quit\n")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("[!] Webcam frame not available, exiting.")
            break

        # Resize product according to scale
        cur_w = max(1, int(prod_w0 * scale))
        cur_h = max(1, int(prod_h0 * scale))
        prod_bgr = cv2.resize(prod_bgr_orig, (cur_w, cur_h), interpolation=cv2.INTER_AREA)
        prod_alpha = cv2.resize(prod_alpha_orig, (cur_w, cur_h), interpolation=cv2.INTER_AREA)

        display = frame.copy()
        overlay_center(display, prod_bgr, prod_alpha)

        cv2.putText(display, f"Scale:{scale:.2f}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200,200,200), 2, cv2.LINE_AA)

        cv2.imshow("Centered Try-On (q to quit)", display)
        key = cv2.waitKey(1) & 0xFF

        if key in [27, ord('q')]:
            break
        elif key in [ord('+'), ord('=')]:
            scale = min(2.5, scale*1.1)
        elif key in [ord('-'), ord('_')]:
            scale = max(0.05, scale*0.9)
        elif key == ord('p'):
            fname = f"snapshot_{int(time.time())}.png"
            cv2.imwrite(fname, display)
            print(f"[+] Snapshot saved: {fname}")

    cap.release()
    cv2.destroyAllWindows()

def parse_args():
    p = argparse.ArgumentParser(description="Centered live virtual try-on")
    p.add_argument("--product","-p",type=str,default="painting.png",help="Product image path")
    p.add_argument("--cam",type=int,default=0,help="Camera index")
    return p.parse_args()






if __name__ == "__main__":
    args = parse_args()
    if not os.path.exists(args.product):
        print(f"[!] Product image not found: {args.product}")
        raise SystemExit(1)
    main_loop(args.product, cam_index=args.cam)
