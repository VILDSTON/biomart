const http = require('http');

function fetchUrl(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- STARTING COMPREHENSIVE SITE VERIFICATION ---');

  const routes = [
    '/',
    '/demo',
    '/demo?store=tashkent_drip',
    '/demo?store=volt_gadgets',
    '/demo?store=aura_perfume',
    '/tashkent_drip',
    '/volt_gadgets',
    '/aura_perfume',
    '/login',
    '/register',
    '/onboarding',
    '/dashboard',
    '/rules',
    '/terms',
    '/privacy',
  ];

  let allOk = true;

  for (const r of routes) {
    try {
      const res = await fetchUrl(r);
      const is200 = res.statusCode === 200;
      const hasDemoVitrinaBanner = res.data.includes('Демо-витрина');
      const hasUpravleniyeLink = res.data.includes('Управление →');

      console.log(`Route [${r}] => Status: ${res.statusCode} | 'Демо-витрина' present: ${hasDemoVitrinaBanner} | 'Управление →' present: ${hasUpravleniyeLink}`);

      if (!is200) {
        console.error(`  FAIL: ${r} returned status ${res.statusCode}`);
        allOk = false;
      }
      if (hasDemoVitrinaBanner || hasUpravleniyeLink) {
        console.error(`  FAIL: ${r} still contains redundant 'Демо-витрина' or 'Управление →' banner!`);
        allOk = false;
      }
    } catch (e) {
      console.error(`  ERROR on ${r}:`, e.message);
      allOk = false;
    }
  }

  // Specifically check that no route contains the redundant banner
  if (allOk) {
    console.log('\n>>> ALL 15 HTTP ROUTES VERIFIED CLEAN WITH ZERO REDUNDANT BANNERS (200 OK)! <<<');
  } else {
    console.error('\n>>> SOME HTTP CHECKS FAILED! <<<');
    process.exit(1);
  }
}

run();
