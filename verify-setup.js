#!/usr/bin/env node

/**
 * IAMROOT AI - Setup Verification Script
 * ตรวจสอบว่าระบบพร้อมใช้งานหรือยัง
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 IAMROOT AI - Setup Verification\n');

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

let errorCount = 0;
let warningCount = 0;

function check(name, condition, errorMsg, warningMsg = null) {
  if (condition) {
    console.log(`${colors.green}✅ ${name}${colors.reset}`);
    return true;
  } else {
    if (warningMsg) {
      console.log(`${colors.yellow}⚠️  ${name}: ${warningMsg}${colors.reset}`);
      warningCount++;
    } else {
      console.log(`${colors.red}❌ ${name}: ${errorMsg}${colors.reset}`);
      errorCount++;
    }
    return false;
  }
}

console.log(`${colors.cyan}📋 Checking Environment Variables...${colors.reset}\n`);

// Check .env.local
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

check('Environment File', envExists, '.env.local not found');

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  check(
    'Supabase URL',
    envContent.includes('NEXT_PUBLIC_SUPABASE_URL=https://'),
    'NEXT_PUBLIC_SUPABASE_URL not configured'
  );
  
  check(
    'Supabase Anon Key',
    envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ'),
    'NEXT_PUBLIC_SUPABASE_ANON_KEY not configured'
  );
  
  const hasServiceKey = envContent.includes('SUPABASE_SERVICE_ROLE_KEY=eyJ');
  check(
    'Service Role Key',
    hasServiceKey,
    'Missing SUPABASE_SERVICE_ROLE_KEY',
    hasServiceKey ? null : 'Admin features will not work without this'
  );
  
  const hasSiteUrl = envContent.includes('NEXT_PUBLIC_SITE_URL=http');
  check(
    'Site URL',
    hasSiteUrl,
    'Missing NEXT_PUBLIC_SITE_URL',
    hasSiteUrl ? null : 'OG tags will use fallback URL'
  );
}

console.log(`\n${colors.cyan}📁 Checking Required Files...${colors.reset}\n`);

const requiredFiles = [
  'package.json',
  'next.config.ts',
  'tailwind.config.js',
  'tsconfig.json',
  'app/layout.tsx',
  'app/(user)/page.tsx',
  'components/Home/NearbyDeals.tsx',
  'hooks/useGeolocation.ts',
  'store/useAppStore.ts',
  'lib/supabase.ts',
  'lib/supabase/server.ts',
  'supabase/SETUP_DATABASE.sql',
  'supabase/MOCK_PRODUCTS.sql',
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  check(
    file,
    fs.existsSync(filePath),
    `File not found: ${file}`
  );
});

console.log(`\n${colors.cyan}📦 Checking Dependencies...${colors.reset}\n`);

const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = {
    'next': 'Next.js',
    'react': 'React',
    'framer-motion': 'Framer Motion',
    '@supabase/supabase-js': 'Supabase Client',
    'react-dropzone': 'React Dropzone',
    'react-masonry-css': 'React Masonry',
    'react-intersection-observer': 'Intersection Observer',
    'zustand': 'Zustand',
  };
  
  Object.entries(requiredDeps).forEach(([pkg, name]) => {
    check(
      name,
      deps[pkg],
      `Missing package: ${pkg}`,
      deps[pkg] ? null : `Run: npm install ${pkg}`
    );
  });
}

console.log(`\n${colors.cyan}🎨 Checking Static Assets...${colors.reset}\n`);

const publicFiles = [
  'public/og-default.svg',
];

publicFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  check(
    file,
    exists,
    `Missing: ${file}`,
    exists ? null : 'OG image fallback may not work'
  );
});

// Check for og-default.jpg (should be replaced)
const ogJpgPath = path.join(__dirname, 'public/og-default.jpg');
if (fs.existsSync(ogJpgPath)) {
  const stats = fs.statSync(ogJpgPath);
  const isPlaceholder = stats.size < 1000; // Less than 1KB = placeholder
  check(
    'OG Image Quality',
    !isPlaceholder,
    null,
    isPlaceholder ? 'Replace og-default.jpg with real 1200x630px image' : null
  );
}

console.log(`\n${colors.cyan}🗄️  Database Setup Reminder...${colors.reset}\n`);

console.log(`${colors.yellow}⚠️  Manual Steps Required:${colors.reset}`);
console.log('   1. Open Supabase Dashboard → SQL Editor');
console.log('   2. Run: supabase/SETUP_DATABASE.sql');
console.log('   3. Run: supabase/MOCK_PRODUCTS.sql (optional)');
console.log('   4. Create Storage bucket: "promotions" (Public)');
console.log('   5. Test RPC: SELECT * FROM nearby_products(13.746, 100.534, 5);');

console.log(`\n${colors.cyan}📊 Summary${colors.reset}\n`);

if (errorCount === 0 && warningCount === 0) {
  console.log(`${colors.green}🎉 All checks passed! System is ready.${colors.reset}`);
  console.log('\n📚 Next steps:');
  console.log('   1. npm run dev');
  console.log('   2. Open http://localhost:3000');
  console.log('   3. Test /admin/create-post');
} else {
  if (errorCount > 0) {
    console.log(`${colors.red}❌ ${errorCount} error(s) found${colors.reset}`);
  }
  if (warningCount > 0) {
    console.log(`${colors.yellow}⚠️  ${warningCount} warning(s) found${colors.reset}`);
  }
  console.log('\n🔧 Fix the issues above before deploying to production.');
}

console.log(`\n📖 Documentation:`);
console.log('   • PRODUCTION_SETUP.md - Deployment guide');
console.log('   • FIXES_SUMMARY.md - What was changed');
console.log('   • supabase/SETUP_DATABASE.sql - Database schema');

process.exit(errorCount > 0 ? 1 : 0);
