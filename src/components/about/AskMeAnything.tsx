"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { ui } from "@/i18n/ui";

type Reaction = "nod" | "wink" | "laugh" | "doubletake";

/** Questions people ask, and how I'd answer: drafts from the rest of the site, to be put in my own words */
const QUESTIONS: { q: string; a: string; react: Reaction }[] = [
  {
    q: "How did you get into design?",
    a: "I fell for design and creative coding before college, and never stopped. Every course, every tutorial I could find. A CS degree later, I'm still at it, and still learning.",
    react: "nod",
  },
  {
    q: "Designer or developer?",
    a: "Both, on purpose. I research it, design it and build it myself, so nothing gets lost in hand-off. The thing you approve in Figma is the thing that ships.",
    react: "wink",
  },
  {
    q: "Figma or code first?",
    a: "Figma first, always. I'd rather solve the hard problems while they're cheap to change. Once the design is right, I build exactly that, down to the last pixel.",
    react: "nod",
  },
  {
    q: "What does your process look like?",
    a: "Research, design, build. First I find out what people actually need and what they think of what's already out there. Then I design the version they'll choose, and build it fast and live.",
    react: "nod",
  },
  {
    q: "What do you build with?",
    a: "Figma for design. React and Next.js for most builds, with Tailwind, Vue, Node.js or Flutter when the project calls for it. Picking up a new framework is half the fun.",
    react: "nod",
  },
  {
    q: "Who have you worked with?",
    a: "60+ clients across 5+ regions: government authorities, funds, agencies and startups. Big or small, the brief is always the same. Make something people want to use.",
    react: "wink",
  },
  {
    q: "Why does research matter so much?",
    a: "Freelancing taught me the hard way. A product only works when it's planned around its users, not around what we assume they want. Research is how you stop guessing.",
    react: "doubletake",
  },
  {
    q: "Why Arsenal?",
    a: "The Invincibles, 2003–04. A whole season unbeaten, and I was hooked for life. It's been a rollercoaster since, but I'm a Gooner through and through.",
    react: "laugh",
  },
  {
    q: "A book you'd recommend?",
    a: "Atomic Habits. Tiny changes, done every day, add up to a different you. It started my whole “better me” thing: a new book, a new skill, a new hobby.",
    react: "nod",
  },
  {
    q: "What do you do off the clock?",
    a: "Gaming, mostly, which is sneaky research too. Great games are masterclasses in how an interaction should feel. Then football, books, and whatever I'm learning that month.",
    react: "laugh",
  },
  {
    q: "Favourite project?",
    a: "Whichever I'm building right now. Today, that's SlyDive: moving it off an old WordPress site onto Next.js took it to a 92 mobile score on PageSpeed.",
    react: "wink",
  },
  {
    q: "Can we work together?",
    a: "Yes, I'd love that. Landing pages, web apps, mobile apps, branding or research. Tell me about it on the contact page and I'll get back to you.",
    react: "wink",
  },
];

/** The same questions in Egyptian Arabic, same order, same reactions */
const QUESTIONS_AR: { q: string; a: string; react: Reaction }[] = [
  {
    q: "دخلت مجال التصميم إزاي؟",
    a: "حبيت التصميم والكود الإبداعي من قبل الجامعة، ومن ساعتها موقفتش. كل كورس وكل تيوتوريال كنت بلاقيه. وبعد شهادة علوم حاسب، لسه مكمّل ولسه بتعلم.",
    react: "nod",
  },
  {
    q: "مصمم ولا مطوّر؟",
    a: "الاتنين، وبقصد. بعمل البحث والتصميم والبناء بنفسي، فمفيش حاجة بتضيع في التسليم. اللي بتوافق عليه في Figma هو بالظبط اللي بينزل.",
    react: "wink",
  },
  {
    q: "Figma الأول ولا الكود؟",
    a: "Figma الأول، دايماً. أحب أحل المشاكل الصعبة وهي لسه رخيصة في التغيير. ولما التصميم يبقى مظبوط، ببنيه زي ما هو بالظبط، لحد آخر بكسل.",
    react: "nod",
  },
  {
    q: "بتشتغل إزاي؟",
    a: "بحث، تصميم، بناء. الأول بعرف الناس محتاجة إيه فعلاً ورأيهم في الموجود. بعدين بصمم النسخة اللي هيختاروها، وببنيها بسرعة وتنزل لايف.",
    react: "nod",
  },
  {
    q: "بتبني بإيه؟",
    a: "Figma للتصميم. React وNext.js لمعظم الشغل، ومعاهم Tailwind أو Vue أو Node.js أو Flutter لما المشروع يحتاج. وإني أتعلم فريم ورك جديد ده نص المتعة.",
    react: "nod",
  },
  {
    q: "اشتغلت مع مين؟",
    a: "أكتر من 60 عميل في أكتر من 5 مناطق: جهات حكومية، صناديق، وكالات وستارت أبس. كبير أو صغير، الطلب دايماً واحد: نعمل حاجة الناس تحب تستخدمها.",
    react: "wink",
  },
  {
    q: "ليه البحث مهم أوي كده؟",
    a: "الفريلانس علمني بالطريقة الصعبة. المنتج بينجح بس لما يتخطط حوالين المستخدمين، مش حوالين اللي إحنا فاكرين إنهم عايزينه. البحث هو اللي بيبطّلك تخمين.",
    react: "doubletake",
  },
  {
    q: "ليه Arsenal؟",
    a: "الـInvincibles، موسم 2003–04. موسم كامل من غير خسارة، واتعلقت بيهم للأبد. من ساعتها والموضوع رولر كوستر، بس أنا أرسنالي لآخر نفس.",
    react: "laugh",
  },
  {
    q: "كتاب تنصح بيه؟",
    a: "Atomic Habits. تغييرات صغيرة كل يوم بتعمل منك واحد تاني. ده اللي بدأ موضوع «نسخة أحسن مني» كله: كتاب جديد، مهارة جديدة، هواية جديدة.",
    react: "nod",
  },
  {
    q: "بتعمل إيه بعيد عن الشغل؟",
    a: "جيمنج غالباً، وده بحث في السر برضه. الألعاب الحلوة درس في إزاي الإنتراكشن المفروض يتحس. وبعدها كورة، كتب، وأي حاجة بتعلمها الشهر ده.",
    react: "laugh",
  },
  {
    q: "أكتر مشروع بتحبه؟",
    a: "أي مشروع شغال عليه دلوقتي. النهارده هو SlyDive: نقلته من موقع WordPress قديم لـNext.js، ووصل لـ92 على الموبايل في PageSpeed.",
    react: "wink",
  },
  {
    q: "ينفع نشتغل سوا؟",
    a: "أكيد، يا ريت. لاندينج بيدجز، تطبيقات ويب، تطبيقات موبايل، براندنج أو بحث. احكيلي عنه في صفحة «كلمني» وهرجعلك.",
    react: "wink",
  },
];

/**
 * Ask me anything: pick a question and the avatar answers it, in its speech line beside the page (see
 * AboutGuide) with a reaction to match. On phones, where the avatar sits in a corner, the answer shows
 * here under the questions.
 */
export default function AskMeAnything() {
  const lang = useLang();
  const questions = lang === "ar" ? QUESTIONS_AR : QUESTIONS;
  const [asked, setAsked] = useState<number | null>(null);
  const answerRef = useRef<HTMLParagraphElement>(null);

  // On phones the answer shows under the questions, so bring it into view (clear of the docked avatar)
  useEffect(() => {
    if (asked === null || window.matchMedia("(min-width: 1024px)").matches) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    answerRef.current?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [asked]);

  const ask = (i: number) => {
    setAsked(i);
    const { a, react } = questions[i];
    window.dispatchEvent(new CustomEvent("avatar:say", { detail: { say: a, react } }));
  };

  return (
    <div className="mt-12">
      <ul className="flex flex-wrap gap-3">
        {questions.map((question, i) => (
          <li key={question.q}>
            <button
              type="button"
              onClick={() => ask(i)}
              aria-pressed={asked === i}
              className={`rounded-full px-5 py-3 text-base font-semibold transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 md:px-6 md:py-3.5 md:text-lg ${
                asked === i ? "bg-ink text-bg" : "bg-surface text-ink hover:bg-surface-2"
              }`}
            >
              {question.q}
            </button>
          </li>
        ))}
      </ul>
      {/* Read out for screen readers, shown on phones */}
      {/* Always in the page (empty until asked), so the first answer is announced too */}
      <p ref={answerRef} aria-live="polite" className={`mt-8 scroll-mb-32 rounded-[24px] text-xl leading-snug font-medium lg:sr-only ${asked === null ? "sr-only" : "bg-surface/70 px-6 py-5 backdrop-blur-xl"}`}>
        {asked !== null ? questions[asked].a : ""}
      </p>
      <p className="mt-8 hidden text-sm text-muted lg:block">{ui(lang).aboutPage.pick}</p>
    </div>
  );
}
