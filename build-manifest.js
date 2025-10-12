const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, 'manifest.json');
const distPath = path.join(__dirname, 'dist', 'manifest.json');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Update paths
manifest.background.service_worker = 'background.js';
manifest.content_scripts[0].js = ['content.js'];

fs.writeFileSync(distPath, JSON.stringify(manifest, null, 2));
