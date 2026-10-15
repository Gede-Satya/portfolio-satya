const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createOgImage() {
  const width = 1200;
  const height = 630;
  const avatarSize = 420;

  // 1. Prepare portrait circular cutout 420x420
  const avatarSquarePath = path.join(__dirname, '..', 'public', 'satya-square.png');
  const avatarBuffer = await sharp(avatarSquarePath)
    .resize(avatarSize, avatarSize)
    .composite([{
      input: Buffer.from(`<svg width="${avatarSize}" height="${avatarSize}"><circle cx="${avatarSize/2}" cy="${avatarSize/2}" r="${avatarSize/2}" fill="white"/></svg>`),
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  const svgGraphic = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0d14"/>
        <stop offset="50%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
      <radialGradient id="glow1" cx="80%" cy="20%" r="50%">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glow2" cx="20%" cy="60%" r="60%">
        <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.1"/>
      </linearGradient>
      <linearGradient id="avatarRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="50%" stop-color="#a855f7"/>
        <stop offset="100%" stop-color="#06b6d4"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>
    <circle cx="1000" cy="150" r="450" fill="url(#glow1)"/>
    <circle cx="250" cy="380" r="400" fill="url(#glow2)"/>

    <!-- Subtle border frame -->
    <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="24" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>

    <!-- Avatar Glow and Outer Ring -->
    <circle cx="240" cy="315" r="222" fill="none" stroke="url(#avatarRing)" stroke-width="6" opacity="0.9"/>

    <!-- Status pill under avatar -->
    <rect x="130" y="525" width="220" height="36" rx="18" fill="#0f172a" stroke="rgba(99,102,241,0.3)" stroke-width="1.5"/>
    <circle cx="152" cy="543" r="5" fill="#10b981"/>
    <text x="168" y="549" font-family="Segoe UI, Roboto, Helvetica, sans-serif" font-size="14" font-weight="600" fill="#94a3b8">Available for Work</text>

    <!-- Text Group (Right side) -->
    <!-- Top badge -->
    <rect x="510" y="110" width="180" height="34" rx="17" fill="url(#badgeGrad)" stroke="rgba(99,102,241,0.4)" stroke-width="1"/>
    <text x="528" y="133" font-family="Segoe UI, Roboto, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#818cf8" letter-spacing="1.5">WEB DEVELOPER</text>

    <!-- Main Title -->
    <text x="510" y="205" font-family="Segoe UI, Roboto, Helvetica, sans-serif" font-size="42" font-weight="800" fill="#ffffff" letter-spacing="-0.5">Gede Satya Budi</text>
    <text x="510" y="258" font-family="Segoe UI, Roboto, Helvetica, sans-serif" font-size="42" font-weight="800" fill="#f8fafc" letter-spacing="-0.5">Dharma Wiguna</text>

    <!-- Bio / Subheadline -->
    <text x="510" y="320" font-family="Segoe UI, Roboto, Helvetica, sans-serif" font-size="19" font-weight="400" fill="#94a3b8">Modern Web Developer • Next.js, TypeScript &amp; UI/UX</text>

    <!-- Tech Stack Pills -->
    <rect x="510" y="370" width="105" height="38" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
    <text x="532" y="395" font-family="Segoe UI, Roboto, Helvetica, sans-serif" font-size="16" font-weight="600" fill="#f1f5f9">Next.js</text>

    <rect x="625" y="370" width="95" height="38" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
    <text x="647" y="395" font-family="Segoe UI, Roboto, Helvetica, sans-serif" font-size="16" font-weight="600" fill="#38bdf8">React</text>

    <rect x="730" y="370" width="135" height="38" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
    <text x="750" y="395" font-family="Segoe UI, Roboto, Helvetica, sans-serif" font-size="16" font-weight="600" fill="#60a5fa">TypeScript</text>

    <rect x="875" y="370" width="130" height="38" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
    <text x="895" y="395" font-family="Segoe UI, Roboto, Helvetica, sans-serif" font-size="16" font-weight="600" fill="#2dd4bf">Tailwind</text>

    <!-- Bottom URL Link / Domain -->
    <line x1="510" y1="460" x2="1130" y2="460" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <text x="510" y="505" font-family="monospace" font-size="17" font-weight="600" fill="#818cf8">portfolio-satya-five.vercel.app</text>
    <text x="1030" y="505" font-family="Segoe UI, Roboto, Helvetica, sans-serif" font-size="15" font-weight="500" fill="#64748b">Bali, Indonesia</text>
  </svg>
  `;

  const bgBuffer = await sharp(Buffer.from(svgGraphic)).png().toBuffer();

  const finalImage = await sharp(bgBuffer)
    .composite([
      {
        input: avatarBuffer,
        top: Math.round(315 - avatarSize / 2),
        left: Math.round(240 - avatarSize / 2)
      }
    ])
    .png({ quality: 95 })
    .toBuffer();

  const publicOg = path.join(__dirname, '..', 'public', 'og-image.png');
  const appOg = path.join(__dirname, '..', 'src', 'app', 'opengraph-image.png');

  fs.writeFileSync(publicOg, finalImage);
  fs.writeFileSync(appOg, finalImage);

  console.log('Successfully generated public/og-image.png and src/app/opengraph-image.png!');
}

createOgImage().catch(err => {
  console.error('Error generating OG image:', err);
  process.exit(1);
});
