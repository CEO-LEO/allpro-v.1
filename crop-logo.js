const sharp = require('sharp');

async function cropLogo() {
  // Extract the circle area tighter to remove any white edge
  const cropped = await sharp('public/logo.png')
    .extract({ left: 660, top: 140, width: 600, height: 600 })
    .resize(512, 512)
    .png()
    .toBuffer();

  // Create a circular mask SVG
  const circle = Buffer.from(
    '<svg width="512" height="512"><circle cx="256" cy="256" r="256" fill="white"/></svg>'
  );

  // Apply circular mask for transparent corners
  await sharp(cropped)
    .composite([{
      input: await sharp(circle).png().toBuffer(),
      blend: 'dest-in'
    }])
    .png()
    .toFile('public/logo-circle.png');

  console.log('Done - circular logo created');
}

cropLogo();
