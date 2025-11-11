// Simple validator for public/data/cards.json
// Checks required fields and basic type consistency.

import fs from 'fs';
import path from 'path';

const dataPath = path.resolve(process.cwd(), 'public', 'data', 'cards.json');

function fail(message) {
  console.error(`[cards.json] ${message}`);
  process.exitCode = 1;
}

try {
  const raw = fs.readFileSync(dataPath, 'utf8');
  const json = JSON.parse(raw);
  if (!Array.isArray(json)) {
    fail('Root is not an array');
  } else {
    let errors = 0;
    const required = ['id', 'name', 'type', 'rarity', 'cost', 'effects', 'tags', 'keywords', 'version'];
    json.forEach((card, idx) => {
      required.forEach((k) => {
        if (!(k in card)) {
          console.error(` - [${idx}] missing '${k}' (id=${card?.id ?? 'unknown'})`);
          errors++;
        }
      });
      if (card && typeof card === 'object') {
        // basic types
        if (!Array.isArray(card.effects)) { console.error(` - [${idx}] effects must be array`); errors++; }
        if (!Array.isArray(card.tags)) { console.error(` - [${idx}] tags must be array`); errors++; }
        if (!Array.isArray(card.keywords)) { console.error(` - [${idx}] keywords must be array`); errors++; }
        if (typeof card.cost !== 'number') { console.error(` - [${idx}] cost must be number`); errors++; }

        // optional fields sanity
        if (card.levelCurve && typeof card.levelCurve !== 'object') {
          console.error(` - [${idx}] levelCurve must be object when present`); errors++; 
        }
        if (!card.effectText) {
          console.warn(` ! [${idx}] missing effectText (id=${card.id})`);
        }

        // simple consistency: Attack should have at least one Damage effect
        if (card.type === 'Attack') {
          const hasDamage = card.effects.some(e => e && typeof e === 'object' && e.type === 'Damage');
          if (!hasDamage) { console.warn(` ! [${idx}] Attack without Damage (id=${card.id})`); }
        }
      }
    });
    if (errors === 0) {
      console.log(`cards.json validation passed (${json.length} cards).`);
    } else {
      fail(`validation failed with ${errors} error(s).`);
    }
  }
} catch (e) {
  fail(`exception: ${e instanceof Error ? e.message : String(e)}`);
}


