// Shared by the contact form and the route that sends it, so both check the same rules (in the visitor's language).
import type { Lang } from "@/i18n/lang";
import { ui } from "@/i18n/ui";

export const TOPICS = ["Mobile app", "Web app", "Landing page", "UX research", "Branding & logo", "Something else"] as const;

export type ContactMessage = { name: string; email: string; topic: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactMessage, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate({ name, email, topic, message }: ContactMessage, lang: Lang = "en"): ContactErrors {
  const say = ui(lang).form.errors;
  const errors: ContactErrors = {};
  if (!name.trim()) errors.name = say.name;
  else if (name.length > 100) errors.name = say.nameLong;
  if (!EMAIL.test(email.trim())) errors.email = say.email;
  if (!TOPICS.includes(topic as (typeof TOPICS)[number])) errors.topic = say.topic;
  if (message.trim().length < 10) errors.message = say.message;
  else if (message.length > 5000) errors.message = say.messageLong;
  return errors;
}
