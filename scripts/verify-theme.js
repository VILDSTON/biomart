// Verification script for theme tokens and contrast ratios (WCAG 2.1 AA)

function hexToRgb(hex) {
  let clean = (hex || '').replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(clean)) {
    return { r: 17, g: 24, b: 39 }; // #111827 default
  }
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v) => clamp(v).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

function getRelativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function computeStoreTokens(accentHex, isDark = false) {
  const rgb = hexToRgb(accentHex || '#111827');
  const L = getRelativeLuminance(rgb);

  const contrastWithWhite = 1.05 / (L + 0.05);
  const contrastWithBlack = (L + 0.05) / 0.05;

  let onAccent = '#FFFFFF';
  if (contrastWithWhite < 4.5 && contrastWithBlack >= 4.5) {
    onAccent = '#111827';
  } else if (contrastWithWhite < 4.5 && contrastWithBlack < 4.5) {
    onAccent = contrastWithBlack > contrastWithWhite ? '#111827' : '#FFFFFF';
  }

  let hoverRgb;
  if (L > 0.5) {
    hoverRgb = { r: rgb.r * 0.85, g: rgb.g * 0.85, b: rgb.b * 0.85 };
  } else if (L < 0.05) {
    hoverRgb = {
      r: Math.min(255, rgb.r + 35),
      g: Math.min(255, rgb.g + 35),
      b: Math.min(255, rgb.b + 35),
    };
  } else {
    if (isDark) {
      hoverRgb = {
        r: Math.min(255, rgb.r + 28),
        g: Math.min(255, rgb.g + 28),
        b: Math.min(255, rgb.b + 28),
      };
    } else {
      hoverRgb = { r: rgb.r * 0.88, g: rgb.g * 0.88, b: rgb.b * 0.88 };
    }
  }

  let softRgb;
  if (isDark) {
    softRgb = {
      r: rgb.r * 0.25 + 30 * 0.75,
      g: rgb.g * 0.25 + 30 * 0.75,
      b: rgb.b * 0.25 + 30 * 0.75,
    };
  } else {
    softRgb = {
      r: rgb.r * 0.12 + 255 * 0.88,
      g: rgb.g * 0.12 + 255 * 0.88,
      b: rgb.b * 0.12 + 255 * 0.88,
    };
  }

  const onAccentRgb = hexToRgb(onAccent);
  const onAccentLum = getRelativeLuminance(onAccentRgb);
  const finalContrast = getContrastRatio(L, onAccentLum);

  return {
    accent: rgbToHex(rgb.r, rgb.g, rgb.b),
    accentHover: rgbToHex(hoverRgb.r, hoverRgb.g, hoverRgb.b),
    accentSoft: rgbToHex(softRgb.r, softRgb.g, softRgb.b),
    onAccent,
    finalContrast: finalContrast.toFixed(2),
  };
}

const TEST_COLORS = [
  { name: 'Графит / Minimal', hex: '#111827' },
  { name: 'Изумруд / Emerald', hex: '#1F7A5A' },
  { name: 'Королевский синий / Royal Blue', hex: '#2563EB' },
  { name: 'Фиолетовый / Violet', hex: '#7C3AED' },
  { name: 'Терракота / Warm Terracotta', hex: '#B85934' },
  { name: 'Рубин / Boutique Ruby', hex: '#E11D48' },
  { name: 'Неон / Streetwear Neon Yellow', hex: '#E5FF00' },
  { name: 'Янтарь / Amber', hex: '#F59E0B' },
  { name: 'Крайний светлый / Pure White', hex: '#FFFFFF' },
  { name: 'Крайний тёмный / Pure Black', hex: '#000000' },
  { name: 'Пастельная мята / Pastel Mint', hex: '#A7F3D0' },
];

console.log('================================================================');
console.log('WCAG 2.1 AA THEME ACCENT CONTRAST VERIFICATION');
console.log('================================================================');

let allPassed = true;

for (const tc of TEST_COLORS) {
  const light = computeStoreTokens(tc.hex, false);
  const dark = computeStoreTokens(tc.hex, true);
  const contrastNum = parseFloat(light.finalContrast);
  const pass = contrastNum >= 4.5;

  if (!pass) allPassed = false;

  console.log(`[${tc.name} (${tc.hex})]`);
  console.log(`  -> Text On Accent: ${light.onAccent} | Contrast: ${light.finalContrast}:1`);
  console.log(`  -> Light Soft: ${light.accentSoft} | Hover: ${light.accentHover}`);
  console.log(`  -> Dark Soft: ${dark.accentSoft} | Hover: ${dark.accentHover}`);
  console.log(`  -> WCAG AA (>= 4.5:1): ${pass ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log('----------------------------------------------------------------');
}

if (allPassed) {
  console.log('ALL 11 TEST COLORS PASSED WCAG AA ACCESSIBILITY VERIFICATION!');
} else {
  console.error('SOME COLORS FAILED WCAG AA!');
  process.exit(1);
}
