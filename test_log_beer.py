from playwright.sync_api import sync_playwright
import json

BASE = "http://localhost:8084"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})

    # 1. Aller sur la page log-beer
    print("1. Navigation vers /log-beer...")
    page.goto(f"{BASE}/log-beer", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    page.screenshot(path="/tmp/zabrat-screenshots/test_logbeer_1_initial.png")
    print("   Screenshot initial pris")

    # 2. Cliquer sur "Blonde"
    print("2. Selection du type 'Blonde'...")
    blonde_btn = page.locator("text=Blonde").first
    blonde_btn.click()
    page.wait_for_timeout(500)
    page.screenshot(path="/tmp/zabrat-screenshots/test_logbeer_2_selected.png")
    print("   Blonde selectionnee")

    # 3. Cliquer sur LOGGER
    print("3. Clic sur LOGGER...")
    logger_btn = page.locator("text=LOGGER").first
    logger_btn.click()
    page.wait_for_timeout(3000)
    page.screenshot(path="/tmp/zabrat-screenshots/test_logbeer_3_logged.png")
    print("   Log effectue!")

    # 4. Capture des erreurs console
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)

    browser.close()

    if errors:
        print(f"\nErreurs console: {errors}")
    else:
        print("\nAucune erreur console!")

    print("Test termine.")
