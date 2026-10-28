"use client";

import { useState } from "react";
import { type ContactErrors, type ContactMessage, TOPICS, validate } from "@/lib/contact";

type Status = { state: "idle" | "sending" | "sent" } | { state: "error"; message: string };

const EMPTY: ContactMessage = { name: "", email: "", topic: "", message: "" };

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-muted">{label}</span>
      {children}
      <span aria-live="polite" className="min-h-5 text-sm font-medium text-coral">
        {error}
      </span>
    </label>
  );
}

const INPUT =
  "w-full rounded-2xl border border-line bg-bg/40 px-5 py-4 text-lg text-ink outline-none transition-colors duration-300 placeholder:text-muted/60 hover:border-ink/30 focus:border-violet aria-[invalid=true]:border-coral";

/**
 * The contact form. Checks itself as you go (after a first attempt), sends to /api/contact, and
 * swaps itself for a thank-you once the message is on its way.
 */
export default function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const update = (field: keyof ContactMessage, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (tried) setErrors(validate(next));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTried(true);
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus({ state: "sending" });
    const website = (new FormData(e.currentTarget).get("website") as string) ?? "";
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, website }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string; errors?: ContactErrors } | null;

    if (res?.ok && data?.ok) {
      setStatus({ state: "sent" });
      return;
    }
    if (data?.errors) setErrors(data.errors);
    setStatus({ state: "error", message: data?.error ?? "Couldn't reach the server. Check your connection and try again." });
  };

  if (status.state === "sent") {
    return (
      <div className="flex min-h-[420px] flex-col items-start justify-center gap-5 animate-rise">
        <span className="grid size-16 place-items-center rounded-full text-2xl text-bg" style={{ background: "var(--spectrum)" }}>
          ✓
        </span>
        <h2 className="font-display text-4xl leading-[0.95] font-bold tracking-[-0.04em] uppercase md:text-5xl">
          Message
          <br />
          <span className="text-spectrum">sent.</span>
        </h2>
        <p className="max-w-sm text-lg text-muted">
          Thanks, {values.name.split(" ")[0]}. I&apos;ll reply to {values.email}.
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(EMPTY);
            setTried(false);
            setStatus({ state: "idle" });
          }}
          className="text-sm font-semibold text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Send another
        </button>
      </div>
    );
  }

  const sending = status.state === "sending";
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
        <Field label="Name" error={errors.name}>
          <input
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
            placeholder="Your name"
            className={INPUT}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
            placeholder="you@company.com"
            className={INPUT}
          />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold text-muted">What&apos;s it about?</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <label key={topic} className="cursor-pointer">
              <input
                type="radio"
                name="topic"
                value={topic}
                checked={values.topic === topic}
                onChange={() => update("topic", topic)}
                className="peer sr-only"
              />
              <span className="block rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-muted transition-colors duration-300 peer-checked:border-transparent peer-checked:bg-ink peer-checked:text-bg peer-focus-visible:ring-2 peer-focus-visible:ring-violet hover:border-ink/40 hover:text-ink">
                {topic}
              </span>
            </label>
          ))}
        </div>
        <span aria-live="polite" className="min-h-5 text-sm font-medium text-coral">
          {errors.topic}
        </span>
      </fieldset>

      <Field label="Message" error={errors.message}>
        <textarea
          name="message"
          rows={6}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={!!errors.message}
          placeholder="What are you building, and where can I help?"
          className={`${INPUT} resize-y`}
        />
      </Field>

      {/* Bots fill every field; people never see this one */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0" />

      <div className="mt-2 flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={sending}
          className="group inline-flex items-center gap-4 rounded-full bg-ink py-2.5 pr-2.5 pl-8 text-lg font-semibold text-bg transition-transform duration-300 hover:scale-[1.03] disabled:pointer-events-none disabled:opacity-70"
        >
          {sending ? "Sending…" : "Send message"}
          <span
            aria-hidden
            className={`grid size-11 place-items-center rounded-full text-ink transition-transform duration-500 group-hover:rotate-45 ${sending ? "animate-spin" : ""}`}
            style={{ background: "var(--spectrum)" }}
          >
            {sending ? "◌" : "↗"}
          </span>
        </button>
        {status.state === "error" ? (
          <p role="alert" className="max-w-sm text-sm font-medium text-coral">
            {status.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
