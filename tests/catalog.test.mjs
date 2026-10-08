import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const root = new URL('../konfigurator/', import.meta.url);
const source = await readFile(new URL('app/data.js', root), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context);
const { SHAPES, MATERIALS, TYPES, FONTS, getHeadstoneDesign } = context.window;

test('complete reference catalog and construction geometry available for all three types', () => {
  assert.equal(SHAPES.length, 31);
  assert.equal(MATERIALS.length, 14);
  assert.equal(TYPES.length, 3);
  assert.equal(FONTS.length, 4);
  assert.equal(SHAPES.filter((shape) => shape.gallery).length, 20);
  for (const shape of SHAPES) {
    assert.ok(['rovny', 'zkosene'].includes(shape.id) || shape.svgPath || getHeadstoneDesign(shape.id, shape.dvojhrobOnly ? 'dvojhrob' : 'jednohrob'), shape.id);
  }
  assert.equal(getHeadstoneDesign('deleny-kriz', 'jednohrob').parts.length, 2);
  assert.equal(getHeadstoneDesign('srdce-strom', 'jednohrob').decoration, 'tree-relief');
});

test('local asset contents match verified manifest; no placeholder geometry or missing engravings', async () => {
  const assets = JSON.parse(await readFile(new URL('asset-manifest.json', root), 'utf8'));
  assert.equal(assets.filter((asset) => asset.path.endsWith('.glb')).length, 14);
  for (const asset of assets) {
    const bytes = await readFile(new URL(encodeURI(asset.path), root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.path);
  }
});
