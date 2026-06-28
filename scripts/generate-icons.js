import sharp from 'sharp'
import { mkdirSync } from 'fs'

const svg = Buffer.from(`
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#7F77DD"/>
  <text x="256" y="320" font-size="280" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold">U</text>
</svg>
`)

mkdirSync('public', { recursive: true })

await sharp(svg).resize(192, 192).png().toFile('public/pwa-192x192.png')
await sharp(svg).resize(512, 512).png().toFile('public/pwa-512x512.png')

console.log('Icons generated!')