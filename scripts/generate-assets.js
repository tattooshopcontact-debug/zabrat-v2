const fs = require('fs');
const path = require('path');

const API_KEY = 'AIzaSyA3JRGwwTAoDXbHNFLJC-I2-2DBQhoMxRE';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`;

const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'images');

async function generateImage(prompt, filename) {
  console.log(`\n🎨 Generating: ${filename}...`);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`❌ API error for ${filename}: ${response.status} - ${err.slice(0, 200)}`);
      return false;
    }

    const data = await response.json();
    const imagePart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (!imagePart) {
      console.error(`❌ No image in response for ${filename}`);
      return false;
    }

    const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
    const filepath = path.join(ASSETS_DIR, filename);

    // Ensure directory exists
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, buffer);

    console.log(`✅ Saved: ${filepath} (${(buffer.length / 1024).toFixed(1)}KB)`);
    return true;
  } catch (err) {
    console.error(`❌ Error for ${filename}: ${err.message}`);
    return false;
  }
}

// Delay between requests to avoid rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🍺 Zabrat Asset Generator — Gemini API\n');
  console.log(`Output: ${ASSETS_DIR}\n`);

  const assets = [
    // 1. App Icon
    {
      filename: 'app-icon.png',
      prompt: `Create a mobile app icon for Zabrat, a nightlife beer tracking social app. Square with rounded corners (iOS style). Pure black background. A stylized golden amber beer mug in the center fused with a speech bubble shape (like a chat bubble), with 3 small white stars on the mug. Subtle amber glow around it. NO text on the icon. Premium, dark, luxurious feel. Clean, recognizable at small sizes. 1024x1024px.`
    },
    // 2. Splash Screen
    {
      filename: 'splash.png',
      prompt: `Create a sleek dark mobile app splash screen for a nightlife beer tracking app called Zabrat. Pure black background (#0D0D0D). Center: large 3D beer mug fused with speech bubble shape, 3 white stars on the mug, glowing amber (#F5A623) with golden light rays. Below: ZABRAT in bold golden metallic font. Tagline "Track. Share. Compete." in subtle gray. Golden bokeh particles floating. A sleek amber rounded button "Commencer" at bottom. Premium nightlife luxury vibe. Mobile 9:16 ratio.`
    },
    // 3. Badges (9 individual badges)
    {
      filename: 'badges/first-sip.png',
      prompt: `Create a single achievement badge for a beer app. Dark transparent background. Shiny 3D metallic golden circle badge. Inside: a single golden beer glass with white foam on top. Amber/gold tones (#F5A623). Premium collectible look. 256x256px.`
    },
    {
      filename: 'badges/party-animal.png',
      prompt: `Create a single achievement badge for a beer app. Dark transparent background. Shiny 3D metallic golden circle badge. Inside: a cocktail shaker with sparkles and party confetti. Amber/gold tones (#F5A623). Premium collectible look. 256x256px.`
    },
    {
      filename: 'badges/streak-7.png',
      prompt: `Create a single achievement badge for a beer app. Dark transparent background. Shiny 3D metallic golden circle badge. Inside: 7 small beer bottles arranged in a row with flames above them. Amber/gold tones (#F5A623). Premium collectible look. 256x256px.`
    },
    {
      filename: 'badges/bar-king.png',
      prompt: `Create a single achievement badge for a beer app. Dark transparent background. Shiny 3D metallic golden circle badge. Inside: a beer mug wearing a golden crown. Amber/gold tones (#F5A623). Premium collectible look. 256x256px.`
    },
    {
      filename: 'badges/explorer.png',
      prompt: `Create a single achievement badge for a beer app. Dark transparent background. Shiny 3D metallic golden circle badge. Inside: a map location pin inside a beer glass shape. Amber/gold tones (#F5A623). Premium collectible look. 256x256px.`
    },
    {
      filename: 'badges/speed-logger.png',
      prompt: `Create a single achievement badge for a beer app. Dark transparent background. Shiny 3D metallic golden circle badge. Inside: a beer glass with motion speed lines around it. Amber/gold tones (#F5A623). Premium collectible look. 256x256px.`
    },
    {
      filename: 'badges/100-club.png',
      prompt: `Create a single achievement badge for a beer app. Dark transparent background. Shiny 3D metallic golden circle badge. Inside: the number 100 made to look like beer bottles. Amber/gold tones (#F5A623). Premium collectible look. 256x256px.`
    },
    {
      filename: 'badges/social-drinker.png',
      prompt: `Create a single achievement badge for a beer app. Dark transparent background. Shiny 3D metallic golden circle badge. Inside: two beer mugs clinking together with foam splashing. Amber/gold tones (#F5A623). Premium collectible look. 256x256px.`
    },
    {
      filename: 'badges/legend.png',
      prompt: `Create a single achievement badge for a beer app. Dark transparent background. Shiny 3D metallic golden circle badge with gems. Inside: a golden beer barrel with a glowing halo above it. Amber/gold tones (#F5A623). Ultra premium collectible look. 256x256px.`
    },
    // 4. Level emblems (7 levels)
    {
      filename: 'levels/level-1-novice.png',
      prompt: `Create a level emblem for a beer app. Dark background. Simple bronze shield shape with a small beer glass inside. Text "Novice" below. Metallic 3D render, bronze tones. 256x256px.`
    },
    {
      filename: 'levels/level-2-amateur.png',
      prompt: `Create a level emblem for a beer app. Dark background. Silver shield shape with a pint glass with foam inside. Text "Amateur" below. Metallic 3D render, silver tones. 256x256px.`
    },
    {
      filename: 'levels/level-3-habitue.png',
      prompt: `Create a level emblem for a beer app. Dark background. Gold shield shape with a beer mug and a star inside. Text "Habitué" below. Metallic 3D render, gold tones. 256x256px.`
    },
    {
      filename: 'levels/level-4-regulier.png',
      prompt: `Create a level emblem for a beer app. Dark background. Platinum shield with flames, a cocktail glass inside. Text "Régulier" below. Metallic 3D render, gold and orange tones. 256x256px.`
    },
    {
      filename: 'levels/level-5-expert.png',
      prompt: `Create a level emblem for a beer app. Dark background. Diamond-encrusted shield with a premium whisky glass and diamond. Text "Expert" below. Metallic 3D render, platinum tones. 256x256px.`
    },
    {
      filename: 'levels/level-6-legende.png',
      prompt: `Create a level emblem for a beer app. Dark background. Elaborate golden shield with crown, beer barrel inside with gems. Text "Légende" below. Metallic 3D render, gold and ruby tones. 256x256px.`
    },
    {
      filename: 'levels/level-7-maestro.png',
      prompt: `Create a level emblem for a beer app. Dark background. Massive diamond-encrusted golden shield with golden light rays. Inside: a beer throne with golden mugs. Text "El Maestro" below. Ultra premium 3D render, gold and diamond tones. 256x256px.`
    },
    // 5. Empty states
    {
      filename: 'empty-feed.png',
      prompt: `Create a dark mode empty state illustration for a beer social app. Background #0D0D0D. Center: a lonely golden beer glass with a small sad face drawn on it, soft amber glow around it. Subtle bokeh lights. Minimalist, premium dark aesthetic. 512x512px. No text.`
    },
    {
      filename: 'empty-friends.png',
      prompt: `Create a dark mode empty state illustration for a social app friends page. Background #0D0D0D. Center: two empty beer mugs far apart from each other looking lonely, soft amber glow. Subtle bokeh lights. Minimalist, premium dark aesthetic. 512x512px. No text.`
    },
  ];

  let success = 0;
  let fail = 0;

  for (const asset of assets) {
    const ok = await generateImage(asset.prompt, asset.filename);
    if (ok) success++;
    else fail++;
    await delay(2000); // 2s between requests
  }

  console.log(`\n🏁 Done! ${success} generated, ${fail} failed out of ${assets.length} total.`);
}

main().catch(console.error);
