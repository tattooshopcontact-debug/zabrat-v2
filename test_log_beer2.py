from playwright.sync_api import sync_playwright

BASE = "http://localhost:8084"
console_logs = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})

    # Capturer TOUS les logs console
    page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

    print("1. Navigation vers /log-beer...")
    page.goto(f"{BASE}/log-beer", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(4000)

    # Cliquer sur Blonde
    print("2. Clic Blonde...")
    page.locator("text=Blonde").first.click()
    page.wait_for_timeout(1000)

    # Cliquer LOGGER
    print("3. Clic LOGGER...")
    page.locator("text=LOGGER").first.click()
    page.wait_for_timeout(5000)  # Attendre plus longtemps pour les appels réseau

    page.screenshot(path="/tmp/zabrat-screenshots/test_logbeer_debug.png")

    browser.close()

    print("\n--- Console logs ---")
    for log in console_logs:
        print(log)
    print(f"\nTotal: {len(console_logs)} logs")
