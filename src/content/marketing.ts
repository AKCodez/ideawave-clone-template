/**
 * Every word on the public pages, in one file.
 *
 * REPLACE THIS with your product's copy. The shape is the point: one promise,
 * one sentence, a frame showing the product actually working, then proof,
 * process, numbers, price and questions. Keep claims to things you can source -
 * the numbers below are counted from this repository, not estimated.
 *
 * Copy rules: plain hyphens, short sentences, no invented testimonials, no user
 * counts, no revenue claims. Say what it does, not what category it is in.
 */

export type Benefit = { title: string; body: string; span?: 1 | 2 };
export type Step = { title: string; body: string };
export type Stat = { value: number; label: string; suffix?: string; prefix?: string };
export type Faq = { question: string; answer: string };
export type Plan = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: readonly string[];
  featured?: boolean;
};

export const hero = {
  eyebrow: "Design kit",
  headline: "Ship the thing people came for, on day one.",
  sub: "Auth, billing, email, the database and a complete design system are wired and verified. What is left is the loop your users come back for.",
  primaryCta: { label: "Create an account", href: "/sign-up" },
  secondaryCta: { label: "See how it compares", href: "/compare" },
  /** Sits under the CTAs. Short, factual, no exclamation marks. */
  note: "No credit card. The demo below is the real product, running on seeded data.",
} as const;

export const frame = {
  eyebrow: "The example feature",
  title: "Paste something long. Get it back short.",
  body: "This is the working loop that ships with the kit: a snippet goes in, a summary and tags come back, and the same rows you see here are what a signed-in account is seeded with.",
} as const;

export const benefits: readonly Benefit[] = [
  {
    title: "One brand file, every pixel",
    body: "Colour, type, radius, shadow, rhythm and motion are all derived from src/brand.ts. Change the accent hue and the OG image, the icon, the emails and the focus ring all move with it.",
    span: 2,
  },
  {
    title: "Contrast is solved, not hoped for",
    body: "Body text clears 12:1 and secondary text 4.6:1 on every scheme, because the generator refuses to write a palette that does not.",
  },
  {
    title: "Four art directions",
    body: "Editorial, luminous, brutal and craft. Each one owns its own corners, strokes, shadows and motion, so two builds never look like the same template.",
  },
  {
    title: "Motion that respects the reader",
    body: "Scroll effects are CSS timelines, not listeners. Reduced motion removes movement rather than shortening it, and nothing is invisible without JavaScript.",
    span: 2,
  },
];

export const steps: readonly Step[] = [
  {
    title: "Name it",
    body: "The brand file carries the name, the voice and the palette. Everything downstream reads from it, so nothing has to be renamed twice.",
  },
  {
    title: "Build the loop",
    body: "One schema, one server action, one page. The auth check lives inside the action, and the dashboard reads the database on the server.",
  },
  {
    title: "Compose the page",
    body: "Pick sections from the kit and pass them your copy. There is no blank canvas and no component library to install.",
  },
  {
    title: "Verify, then ship",
    body: "Typecheck, lint, the design check and a production build all run from one command. A file being written is not verification.",
  },
];

/** Counted from this repository. Update the number if you change the thing. */
export const stats: readonly Stat[] = [
  { value: 17, label: "Semantic colours, per scheme" },
  { value: 8, label: "Type steps, each with its own leading" },
  { value: 15, label: "Motion primitives" },
  { value: 3, label: "Font files loaded, never more" },
];

export const plans: readonly Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Everything you need to build and run the loop.",
    features: ["The full design kit", "Unlimited snippets", "Email and password sign in"],
  },
  {
    name: "Premium",
    price: "See Stripe",
    cadence: "per month",
    description: "For when the free plan stops being enough.",
    features: ["Everything in Free", "Priority email support", "Cancel from the billing portal"],
    featured: true,
  },
];

export const pricingNote =
  "The amount comes from Stripe, so changing the price there changes it here. This page never hardcodes a number.";

export const faqs: readonly Faq[] = [
  {
    question: "Is this a component library?",
    answer:
      "No. Every primitive is in src/components/ui and you own all of it. There is nothing to upgrade and nothing to fight when a design does not fit.",
  },
  {
    question: "Can I change the look?",
    answer:
      "Edit src/brand.ts and run the generator. Direction, scheme, accent hue, fonts, motion intensity and voice all live there, and the generated CSS refuses to ship a combination that fails contrast.",
  },
  {
    question: "What happens without credentials?",
    answer:
      "It builds and runs. A missing database, Stripe key or email key turns that feature off with a message that says which variable is missing, rather than crashing a page.",
  },
  {
    question: "Does it work without JavaScript?",
    answer:
      "The pages render and the links work. Entrance animations hold at their final frame instead of leaving content invisible, and forms are progressively enhanced server actions.",
  },
];

export const ctaBand = {
  title: "Start with the loop, not the layout.",
  body: "Create an account and the seeded demo data is already there.",
  primary: { label: "Create an account", href: "/sign-up" },
  secondary: { label: "Read the design kit", href: "/compare" },
} as const;
