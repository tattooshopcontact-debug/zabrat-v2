from playwright.sync_api import sync_playwright
import os

ROUTES = [
    ("feed", "/(tabs)/feed"),
    ("stats", "/(tabs)/stats"),
    ("top", "/(tabs)/top"),
    ("profile", "/(tabs)/profile"),
    ("log-beer", "/log-beer"),
    ("map", "/(tabs)/map"),
]

BASE = "http://localhost:8084"
OUT_DIR = "/tmp/zabrat-screenshots"
os.makedirs(OUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})  # iPhone 14 size

    for name, route in ROUTES:
        url = f"{BASE}{route}"
        print(f"Navigating to {url}...")
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)  # Let animations/rendering settle
        path = f"{OUT_DIR}/{name}.png"
        page.screenshot(path=path, full_page=False)
        print(f"  Saved: {path}")

    browser.close()
    print("Done!")
