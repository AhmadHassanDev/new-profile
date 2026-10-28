import { type ContactMessage, validate } from "@/lib/contact";

// Delivers contact form messages through Resend (https://resend.com). Needs RESEND_API_KEY;
// CONTACT_TO is the inbox and CONTACT_FROM a sender on a domain verified in Resend.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as (Partial<ContactMessage> & { website?: string }) | null;
  if (!body) return Response.json({ error: "Couldn't read the message." }, { status: 400 });

  // The hidden "website" field is only ever filled in by bots: pretend it worked
  if (body.website) return Response.json({ ok: true });

  const message: ContactMessage = {
    name: String(body.name ?? "").trim(),
    email: String(body.email ?? "").trim(),
    topic: String(body.topic ?? ""),
    message: String(body.message ?? "").trim(),
  };
  const errors = validate(message);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (!key || !to) {
    return Response.json({ error: "The form isn't connected yet. Please use WhatsApp or email for now." }, { status: 503 });
  }

  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>",
      to,
      reply_to: message.email,
      subject: `${message.topic}: ${message.name}`,
      text: `${message.message}\n\n— ${message.name} <${message.email}>\nAbout: ${message.topic}`,
    }),
  }).catch(() => null);

  if (!sent?.ok) {
    return Response.json({ error: "Something went wrong sending that. Please try again or use WhatsApp." }, { status: 502 });
  }
  return Response.json({ ok: true });
}
