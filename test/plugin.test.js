// test/plugin.test.js · validate the inlined SDK + markdown formatters
// runs with `node --test` · no Obsidian boot · stubs the 'obsidian' module
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Module from 'node:module';

// stub the 'obsidian' module · main.js requires it at load time
const _resolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (request === 'obsidian') return join(dirname(fileURLToPath(import.meta.url)), 'obsidian-stub.js');
  return _resolve.call(this, request, parent, ...rest);
};

const require_ = createRequire(import.meta.url);
const Plugin = require_('../main.js');
const sdk = Plugin.__sdk__;

test('CASE_DB has at least 25 inlined cases', () => {
  assert.ok(sdk.CASE_DB.length >= 25);
  sdk.CASE_DB.forEach(c => {
    assert.ok(c.id && c.citation && c.area && c.principle);
    assert.ok(Array.isArray(c.strands));
  });
});

test('WEAVE_PATTERNS · 10 patterns · WEAVE_STRANDS · 7 strands', () => {
  assert.equal(sdk.PATTERN_KEYS.length, 10);
  assert.equal(sdk.WEAVE_STRANDS.length, 7);
});

test('searchCases returns ranked hits', () => {
  const hits = sdk.searchCases('landlord deposit not protected', 'housing');
  assert.ok(hits.length > 0);
  assert.ok(hits[0].citation.includes('Tiensia'));
});

test('runWeave returns 7 strands + contradiction array', () => {
  const w = sdk.runWeave('employer dismissed me without process', 'unfair_dismissal');
  assert.equal(w.results.length, 7);
  assert.ok(Array.isArray(w.contradictions));
});

test('scoreRisk returns labelled risk', () => {
  const w = sdk.runWeave('landlord deposit unprotected', 'deposit_dispute');
  const r = sdk.scoreRisk(w);
  assert.ok(['STRONG','MODERATE','WEAK','INADVISABLE'].includes(r.label));
});

test('draftDocument default type', () => {
  const r = sdk.draftDocument({ facts: 'Acme owes me $4200.\nMultiple invoices ignored.' });
  assert.ok(r.draft.includes('LEGAL BRIEF'));
  assert.ok(Array.isArray(r.citations));
});

test('every DOC_TYPE produces a non-empty draft', () => {
  sdk.DOC_TYPES.forEach(type => {
    const r = sdk.draftDocument({ type, facts: 'facts' });
    assert.ok(r.draft.length > 100, `type ${type} produced empty draft`);
  });
});

test('auditCompliance flags Art 12 gap', () => {
  const r = sdk.auditCompliance({ ca_uses_ai: 'yes', ca_eu_users: 'yes', ca_audit_log: 'no' });
  assert.ok(r.gaps.some(g => g.id === 'eu_ai_act_audit'));
});

test('caseToMarkdown renders > 80 chars with citation', () => {
  const c = sdk.CASE_DB[0];
  const md = sdk.caseToMarkdown(c);
  assert.ok(md.includes(c.citation));
  assert.ok(md.length > 80);
});

test('weaveToMarkdown renders a 7-row table', () => {
  const w = sdk.runWeave('deposit dispute', 'deposit_dispute');
  const md = sdk.weaveToMarkdown('deposit dispute', w);
  // 7 strand rows + header + separator
  const rowCount = (md.match(/\| /g) || []).length;
  assert.ok(rowCount >= 7);
});

test('complianceToMarkdown handles zero-gap case', () => {
  const r = sdk.auditCompliance({ ca_size: '1', ca_personal_data: 'none', ca_uses_ai: 'no' });
  const md = sdk.complianceToMarkdown(r);
  assert.ok(md.includes('Score'));
});

test('Plugin class is exported as default module.exports', () => {
  assert.equal(typeof Plugin, 'function');
  assert.equal(Plugin.name, 'GroundLevelPlugin');
});
