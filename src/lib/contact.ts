// Shared by the contact form and the route that sends it, so both check the same rules.

export const TOPICS = ["Mobile app", "Web app", "Landing page", "UX research", "Branding & logo", "Something else"] as const;

export type ContactMessage = { name: string; email: string; topic: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactMessage, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate({ name, email, topic, message }: ContactMessage): ContactErrors {
  const errors: ContactErrors = {};
  if (!name.trim()) errors.name = "Your name, please.";
  else if (name.length > 100) errors.name = "That's a long name. 100 characters at most.";
  if (!EMAIL.test(email.trim())) errors.email = "An email I can reply to.";
  if (!TOPICS.includes(topic as (typeof TOPICS)[number])) errors.topic = "Pick what it's about.";
  if (message.trim().length < 10) errors.message = "A few more words, so I know where to start.";
  else if (message.length > 5000) errors.message = "5,000 characters at most.";
  return errors;
}
