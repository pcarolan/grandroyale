// Ready a photo for a blog post: node tools/post-photo.mjs <source image> <name>
// Writes blog/photos/<name>.jpg: rotated upright, max 1280px, metadata stripped (no GPS), then list it in blog/posts.json.
import { execFileSync } from 'node:child_process';
const [src, name] = process.argv.slice(2);
if (!src || !name) { console.error('usage: node tools/post-photo.mjs <src> <name>'); process.exit(1); }
const out = `blog/photos/${name}.jpg`;
const args = [src, '-auto-orient', '-resize', '1280x1280>', '-strip', '-interlace', 'Plane', '-quality', '78', out];
try { execFileSync('magick', args); } catch (e) { if (e.code !== 'ENOENT') throw e; execFileSync('convert', args); }
console.log(`wrote ${out}; add { "file": "${name}.jpg", "alt": "..." } to a post in blog/posts.json, then node build.mjs`);
