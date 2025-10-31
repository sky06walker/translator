// generate-icons.js
// Run this script to generate PWA icons
// Usage: node generate-icons.js

const fs = require('fs');
const path = require('path');

// SVG icon template
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#10B981;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">K</text>
  <path d="M ${size * 0.2} ${size * 0.75} Q ${size * 0.35} ${size * 0.65}, ${size * 0.5} ${size * 0.75} T ${size * 0.8} ${size * 0.75}" stroke="white" stroke-width="${size * 0.03}" fill="none" stroke-linecap="round"/>
</svg>`.trim();

// Output directory (project root)
const outputDir = __dirname;

// Generate icons
const sizes = [192, 512];

sizes.forEach(size => {
  const svg = createSVGIcon(size);
  const filename = `icon-${size}.svg`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✓ Generated ${filename}`);
});

console.log('\n📱 PWA icons generated successfully!');