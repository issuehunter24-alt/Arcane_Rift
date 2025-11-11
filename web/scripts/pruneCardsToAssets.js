// Prune cards.json to only include cards that have corresponding image assets
// Image path rule matches cardImage.ts: cards/{Character}_{Type}_{Rarity}.webp|png

import fs from 'fs';
import path from 'path';

const root = process.cwd();
const cardsDir = path.resolve(root, 'public', 'cards');
const dataPath = path.resolve(root, 'public', 'data', 'cards.json');

function extractCharacterFromId(cardId) {
  const parts = String(cardId).split('_');
  if (parts.length >= 2) {
    const charName = parts[1];
    return charName.charAt(0) + charName.slice(1).toLowerCase();
  }
  return 'Ariana';
}

function getBaseName(card) {
  const character = extractCharacterFromId(card.id);
  return `${character}_${card.type}_${card.rarity}`;
}

function hasImage(base) {
  const webp = path.join(cardsDir, `${base}.webp`);
  const png = path.join(cardsDir, `${base}.png`);
  return fs.existsSync(webp) || fs.existsSync(png);
}

try {
  const raw = fs.readFileSync(dataPath, 'utf8');
  const json = JSON.parse(raw);
  if (!Array.isArray(json)) {
    throw new Error('cards.json root is not array');
  }

  const kept = [];
  const dropped = [];
  for (const card of json) {
    const base = getBaseName(card);
    if (hasImage(base)) kept.push(card); else dropped.push({ id: card.id, base });
  }

  fs.writeFileSync(dataPath, JSON.stringify(kept, null, 2), 'utf8');
  console.log(`[prune] Kept ${kept.length} cards. Dropped ${dropped.length}.`);
  if (dropped.length) {
    console.log('[prune] Missing assets for:');
    dropped.slice(0, 20).forEach(d => console.log(` - ${d.id} (${d.base})`));
    if (dropped.length > 20) console.log(` ... and ${dropped.length - 20} more`);
  }
} catch (e) {
  console.error('[prune] Failed:', e.message || String(e));
  process.exit(1);
}


