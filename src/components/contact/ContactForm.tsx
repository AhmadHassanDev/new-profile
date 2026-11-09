"use client";

import { useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { track } from "@/lib/analytics";
import { type ContactErrors, type ContactMessage, TOPICS, validate } from "@/lib/contact";

type Status = { state: "idle" | "sending" | "sent" } | { state: "error"; message: string };

const EMPTY: ContactMessage = { name: "", email: "", topic: "", message: "" };

const FIELDS = ["name", "email", "topic", "message"] as const;

// The error sits beside the label, not inside it, so it reaches screen readers as the field's description (via
// aria-describedby) rather than as part of its name. No live region: a failed submit moves focus to the field instead.
function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-muted">
        {label}
      </label>
      {children}
      <span id={`${id}-error`} className="min-h-5 text-sm font-medium text-coral">
        {error}
      </span>
    </div>
  );
}

// A 2px violet outline, set off from the field, so keyboard focus is unmistakable; outline (not a shadow ring) survives forced colours
const INPUT =
  "w-full rounded-2xl border border-line bg-bg/40 px-5 py-4 text-lg text-ink outline-offset-2 transition-colors duration-300 placeholder:text-muted hover:border-ink/30 focus:border-violet focus-visible:outline-2 focus-visible:outline-violet aria-[invalid=true]:border-coral";

/**
 * The contact form. Checks itself as you go (after a first attempt), sends to /api/contact, and
 * swaps itself for a thank-you once the message is on its way.
 */
export default function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const uid = useId();
  const idOf = (field: keyof ContactMessage) => `${uid}-${field}`;
  const describe = (field: keyof ContactMessage) => (errors[field] ? `${idOf(field)}-error` : undefined);
  const sentHeading = useRef<HTMLHeadingElement>(null);

  // The form is swapped out on success, so take focus to the confirmation rather than letting it fall to <body>
  useEffect(() => {
    if (status.state === "sent") sentHeading.current?.focus();
  }, [status.state]);

  // Commit the errors first so the field is already marked invalid and described when focus lands on it
  const showErrors = (found: ContactErrors) => {
    flushSync(() => setErrors(found));
    const first = FIELDS.find((field) => found[field]);
    if (first) document.getElementById(first === "topic" ? `${idOf("topic")}-0` : idOf(first))?.focus();
  };

  const update = (field: keyof ContactMessage, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (tried) setErrors(validate(next));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTried(true);
    const found = validate(values);
    showErrors(found);
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
      // GA4's recommended event for a lead; the topic says what kind of project it is
      track("generate_lead", { method: "contact_form", topic: values.topic });
      setStatus({ state: "sent" });
      return;
    }
    if (data?.errors) showErrors(data.errors);
    setStatus({ state: "error", message: data?.error ?? "Couldn't reach the server. Check your connection and try again." });
  };

  if (status.state === "sent") {
    return (
      <div className="flex min-h-[420px] flex-col items-start justify-center gap-5 animate-rise">
        <span aria-hidden className="grid size-16 place-items-center rounded-full text-2xl text-bg" style={{ background: "var(--spectrum)" }}>
          ✓
        </span>
        <h2 ref={sentHeading} tabIndex={-1} className="font-display text-4xl outline-none leading-[0.95] font-bold uppercase md:text-5xl">
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
            flushSync(() => {
              setValues(EMPTY);
              setErrors({});
              setTried(false);
              setStatus({ state: "idle" });
            });
            document.getElementById(idOf("name"))?.focus();
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
        <Field id={idOf("name")} label="Name" error={errors.name}>
          <input
            id={idOf("name")}
            name="name"
            autoComplete="name"
            required
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={describe("name")}
            placeholder="Your name"
            className={INPUT}
          />
        </Field>
        <Field id={idOf("email")} label="Email" error={errors.email}>
          <input
            id={idOf("email")}
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            required
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={describe("email")}
            placeholder="you@company.com"
            className={INPUT}
          />
        </Field>
      </div>

      {/* A radiogroup rather than a fieldset: it's the role that carries aria-invalid, and its error is read on entering the group */}
      <div
        role="radiogroup"
        aria-labelledby={`${idOf("topic")}-label`}
        aria-invalid={!!errors.topic}
        aria-describedby={describe("topic")}
        className="group/topic flex flex-col gap-2"
      >
        <span id={`${idOf("topic")}-label`} className="mb-2 text-sm font-semibold text-muted">
          What&apos;s it about?
        </span>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic, i) => (
            <label key={topic} className="cursor-pointer">
              <input
                id={`${idOf("topic")}-${i}`}
                type="radio"
                name="topic"
                value={topic}
                required
                checked={values.topic === topic}
                onChange={() => update("topic", topic)}
                className="peer sr-only"
              />
              <span className="block rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-muted transition-colors duration-300 peer-checked:border-transparent peer-checked:bg-ink peer-checked:text-bg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet group-aria-[invalid=true]/topic:border-coral/60 hover:border-ink/40 hover:text-ink">
                {topic}
              </span>
            </label>
          ))}
        </div>
        <span id={`${idOf("topic")}-error`} className="min-h-5 text-sm font-medium text-coral">
          {errors.topic}
        </span>
      </div>

      <Field id={idOf("message")} label="Message" error={errors.message}>
        <textarea
          id={idOf("message")}
          name="message"
          rows={6}
          required
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={describe("message")}
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
