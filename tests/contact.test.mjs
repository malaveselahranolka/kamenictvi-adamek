import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { GET, POST } from '../api/contact.mjs';

const origin = 'https://kamenictvi-adamek.cz';
function inquiry(changes = {}) {
  const form = new FormData();
  const values = { name: 'Testovací zákazník', email: 'test@example.com', phone: '', locality: 'Jeseník',
    message: 'Označený místní test. Jednohrob, růže, Impala.', dimensions: '90 × 200 cm', preferredContact: 'email',
    designUrl: origin + '/konfigurator/?cfg=eyJ0eXBlIjoiamVkbm9ocm9iIn0%3D', submissionId: randomUUID(), ...changes };
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return new Request(origin + '/api/contact', { method: 'POST', body: form, headers: { Origin: origin } });
}

test('delivery contract, validation and attachments; no real mail', async (t) => {
  const oldFetch = globalThis.fetch;
  const oldKey = process.env.RESEND_API_KEY;
  const oldFrom = process.env.CONTACT_FROM_EMAIL;
  let calls = [];
  let providerStatus = 200;
  let providerData = { id: 'local-mock-email' };
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options, payload: JSON.parse(options.body) });
    return Response.json(providerData, { status: providerStatus });
  };
  try {
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_FROM_EMAIL;
    await t.test('missing delivery configuration never confirms submission', async () => {
      assert.equal((await GET().json()).available, false);
      assert.equal((await POST(inquiry())).status, 503);
      assert.equal(calls.length, 0);
    });
    process.env.RESEND_API_KEY = 'test-only-not-a-real-key';
    process.env.CONTACT_FROM_EMAIL = 'test@verified.example';
    await t.test('invalid contacts, hostile design links and cross-origin requests rejected before sending', async () => {
      for (const change of [{ name: 'A' }, { email: 'bad email' }, { email: '', phone: '' },
        { phone: '123' }, { designUrl: 'https://example.com/konfigurator/?cfg=xx' },
        { preferredContact: 'telefon', phone: '' }]) {
        assert.equal((await POST(inquiry(change))).status, 400);
      }
      const req = inquiry();
      req.headers.set('Origin', 'https://untrusted.example');
      assert.equal((await POST(req)).status, 403);
      assert.equal(calls.length, 0);
    });
    await t.test('accepted inquiry contains full proposal and always goes to business recipient', async () => {
      const request = inquiry({ to: 'attacker@example.com' });
      assert.deepEqual(await (await POST(request)).json(), { ok: true });
      assert.equal(calls.length, 1);
      assert.equal(calls[0].url, 'https://api.resend.com/emails');
      assert.deepEqual(calls[0].payload.to, ['info@kamenictvi-adamek.cz']);
      assert.equal(calls[0].payload.reply_to, 'test@example.com');
      assert.match(calls[0].payload.text, /růže, Impala/);
      assert.match(calls[0].payload.text, /https:\/\/kamenictvi-adamek.cz\/konfigurator\/\?cfg=/);
      assert.match(calls[0].options.headers['Idempotency-Key'], /^adamek\//);
    });
    await t.test('real PNG signature accepted, disguised executables and oversize photos rejected', async () => {
      const png = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0]);
      const req = inquiry();
      const form = await req.formData();
      form.set('files', new Blob([png], { type: 'image/png' }), '../../photo.png');
      assert.equal((await POST(new Request(req.url, { method: 'POST', body: form }))).status, 200);
      assert.equal(calls.at(-1).payload.attachments[0].filename, 'foto-hroboveho-mista.png');
      assert.equal(Buffer.from(calls.at(-1).payload.attachments[0].content, 'base64').length, png.length);
      form.set('files', new Blob(['<script>bad</script>'], { type: 'image/png' }), 'photo.png');
      assert.equal((await POST(new Request(req.url, { method: 'POST', body: form }))).status, 415);
      form.set('files', new Blob([new Uint8Array(4 * 1024 * 1024 + 1)], { type: 'image/png' }), 'photo.png');
      assert.equal((await POST(new Request(req.url, { method: 'POST', body: form }))).status, 413);
    });
    await t.test('provider errors, missing acknowledgement and timeout never produce success', async () => {
      providerStatus = 429;
      assert.equal((await POST(inquiry())).status, 429);
      providerStatus = 200;
      providerData = {};
      assert.equal((await POST(inquiry())).status, 502);
      globalThis.fetch = async () => { throw new Error('Mock timeout'); };
      assert.equal((await POST(inquiry())).status, 502);
    });
  } finally {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = oldKey;
    if (oldFrom === undefined) delete process.env.CONTACT_FROM_EMAIL; else process.env.CONTACT_FROM_EMAIL = oldFrom;
  }
});
