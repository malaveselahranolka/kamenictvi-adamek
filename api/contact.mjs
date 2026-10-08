import { createHash } from 'node:crypto';

const MAX_BODY = 4_450_000;
const MAX_PHOTO = 4 * 1024 * 1024;
const EMAIL = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const reply = (status, data) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const configured = () => Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_FROM_EMAIL);

export function GET() {
  return reply(200, { available: configured() });
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const source = request.headers.get('origin');
  if (source && source !== origin) return reply(403, { ok: false });
  if (!configured()) return reply(503, { ok: false, error: 'delivery_unavailable' });
  if (!/^multipart\/form-data;\s*boundary=/i.test(request.headers.get('content-type') || '')) {
    return reply(415, { ok: false });
  }
  if (Number(request.headers.get('content-length')) > MAX_BODY) return reply(413, { ok: false });

  let form;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply(400, { ok: false });
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) {
        await reader.cancel();
        return reply(413, { ok: false });
      }
      chunks.push(value);
    }
    form = await new Request(request.url, { method: 'POST', headers: request.headers,
      body: Buffer.concat(chunks) }).formData();
  } catch {
    return reply(400, { ok: false });
  }
  const field = (name) => typeof form.get(name) === 'string' ? form.get(name).trim() : '';
  if (field('honeypot')) return reply(400, { ok: false });
  const name = field('name');
  const email = field('email');
  const phone = field('phone');
  const locality = field('locality');
  const message = field('message');
  const dimensions = field('dimensions');
  const preferred = field('preferredContact');
  const submissionId = field('submissionId');
  if (name.length < 2 || name.length > 100 || /[\r\n]/.test(name) ||
      (!phone && !email) || (email && (email.length > 200 || !EMAIL.test(email))) ||
      (phone && (phone.length > 30 || !/^\+?[1-9][0-9]{8,14}$/.test(phone.replace(/[\s().-]/g, '')))) ||
      locality.length > 100 || message.length > 32000 || !message || dimensions.length > 60 ||
      !['telefon', 'email'].includes(preferred) || (preferred === 'telefon' && !phone) ||
      (preferred === 'email' && !email) || !/^[0-9a-f-]{36}$/i.test(submissionId)) {
    return reply(400, { ok: false, error: 'invalid_fields' });
  }
  let designUrl;
  try {
    const value = field('designUrl');
    if (value.length > 50000) throw new Error();
    designUrl = new URL(value);
    if (designUrl.origin !== origin || !['/konfigurator/', '/konfigurator/index.html'].includes(designUrl.pathname) ||
        !designUrl.searchParams.get('cfg')) throw new Error();
  } catch {
    return reply(400, { ok: false, error: 'invalid_design' });
  }
  const files = form.getAll('files');
  if (files.length > 1) return reply(400, { ok: false });
  const attachments = [];
  if (files.length) {
    const photo = files[0];
    if (typeof photo === 'string' || photo.size > MAX_PHOTO) return reply(413, { ok: false });
    const bytes = Buffer.from(await photo.arrayBuffer());
    const format = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? ['image/png', 'png'] :
      bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? ['image/jpeg', 'jpg'] :
      bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP' ? ['image/webp', 'webp'] : null;
    if (!format || format[0] !== photo.type) return reply(415, { ok: false, error: 'invalid_photo' });
    attachments.push({ filename: `foto-hroboveho-mista.${format[1]}`, content: bytes.toString('base64'), content_type: format[0] });
  }
  const payload = {
    from: process.env.CONTACT_FROM_EMAIL,
    to: ['info@kamenictvi-adamek.cz'],
    ...(email ? { reply_to: email } : {}),
    subject: 'Nová poptávka pomníku — konfigurátor Adámek',
    text: `Zákazník: ${name}\nTelefon: ${phone || 'neuveden'}\nE-mail: ${email || 'neuveden'}\n` +
      `Preferovaný kontakt: ${preferred}\nHřbitov / město: ${locality || 'neuvedeno'}\nRozměry: ${dimensions}\n\n` +
      `${message}\n\nOtevřít celý návrh:\n${designUrl.href}\n`,
    ...(attachments.length ? { attachments } : {}),
  };
  const digest = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json', 'Idempotency-Key': `adamek/${submissionId}/${digest}` },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(15000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || typeof result?.id !== 'string' || !result.id) {
      console.error('Contact delivery rejected', { status: response.status });
      return reply(response.status === 429 ? 429 : 502, { ok: false, error: 'delivery_failed' });
    }
    return reply(200, { ok: true });
  } catch {
    console.error('Contact delivery unavailable');
    return reply(502, { ok: false, error: 'delivery_failed' });
  }
}
