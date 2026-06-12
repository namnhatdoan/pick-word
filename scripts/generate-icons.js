#!/usr/bin/env node
// Generates SVG icons for the PWA.
// Run: node scripts/generate-icons.js
// Then convert to PNG with: npx sharp-cli or any SVG→PNG tool.
//
// The icons are also committed as SVG directly — most modern browsers
// and Android accept SVG icons when referenced from the manifest.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../public/icons')
fs.mkdirSync(outDir, { recursive: true })

// ── Design: pencil on warm dark background ───────────────────────────────────
const makeSVG = (size, maskable = false) => {
  const pad    = maskable ? size * 0.12 : size * 0.1   // safe zone for maskable
  const inner  = size - pad * 2
  const cx     = size / 2
  const cy     = size / 2
  const r      = size / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <clipPath id="clip">
      ${maskable
        ? `<rect width="${size}" height="${size}"/>`   // full bleed for maskable
        : `<circle cx="${cx}" cy="${cy}" r="${r}"/>`}  // circle for regular
    </clipPath>
  </defs>

  <!-- Background -->
  ${maskable
    ? `<rect width="${size}" height="${size}" fill="#2A2015"/>`
    : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2A2015"/>`}

  <!-- Warm accent ring -->
  ${maskable
    ? ''
    : `<circle cx="${cx}" cy="${cy}" r="${r - size * 0.03}" fill="none" stroke="#C4943A" stroke-width="${size * 0.025}" opacity="0.4"/>`}

  <!-- Pencil body -->
  <g transform="translate(${cx}, ${cy}) rotate(-35)" clip-path="url(#clip)">
    <!-- Shaft -->
    <rect x="${-inner * 0.08}" y="${-inner * 0.38}" width="${inner * 0.16}" height="${inner * 0.58}"
          rx="${inner * 0.03}" fill="#C4943A"/>
    <!-- Wood tip area -->
    <polygon points="${-inner * 0.08},${inner * 0.20} ${inner * 0.08},${inner * 0.20} 0,${inner * 0.36}"
             fill="#D4A86A"/>
    <!-- Lead tip -->
    <polygon points="${-inner * 0.03},${inner * 0.32} ${inner * 0.03},${inner * 0.32} 0,${inner * 0.40}"
             fill="#888"/>
    <!-- Eraser -->
    <rect x="${-inner * 0.08}" y="${-inner * 0.43}" width="${inner * 0.16}" height="${inner * 0.08}"
          rx="${inner * 0.02}" fill="#D46A7A"/>
    <!-- Eraser band -->
    <rect x="${-inner * 0.08}" y="${-inner * 0.38}" width="${inner * 0.16}" height="${inner * 0.025}"
          fill="#A08060"/>
    <!-- Shine -->
    <rect x="${-inner * 0.02}" y="${-inner * 0.34}" width="${inner * 0.03}" height="${inner * 0.38}"
          rx="${inner * 0.01}" fill="rgba(255,255,255,0.15)"/>
  </g>

  <!-- "PW" wordmark at bottom -->
  <text x="${cx}" y="${size * 0.88}" text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${size * 0.14}" font-weight="800" fill="#C4943A" letter-spacing="${size * 0.005}">
    PW
  </text>
</svg>`
}

const files = [
  { name: 'icon-192.svg',      size: 192,  maskable: false },
  { name: 'icon-512.svg',      size: 512,  maskable: false },
  { name: 'icon-maskable.svg', size: 512,  maskable: true  },
]

files.forEach(({ name, size, maskable }) => {
  const svg = makeSVG(size, maskable)
  fs.writeFileSync(path.join(outDir, name), svg)
  console.log(`✓ ${name}`)
})

console.log('\nSVG icons written to public/icons/')
console.log('To convert to PNG, run:')
console.log('  npx @squoosh/cli --oxipng {} public/icons/*.svg')
console.log('or install sharp-cli:')
console.log('  npx sharp-cli -i public/icons/icon-192.svg -o public/icons/icon-192.png')
console.log('  npx sharp-cli -i public/icons/icon-512.svg -o public/icons/icon-512.png')
console.log('  npx sharp-cli -i public/icons/icon-maskable.svg -o public/icons/icon-maskable.png')
