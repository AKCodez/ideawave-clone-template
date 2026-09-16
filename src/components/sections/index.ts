/**
 * The kit's sections: one import for every block a page may be built from.
 *
 * A page composes these and passes them content. Adding a section means adding
 * it to KIT_SECTIONS in src/design/types.ts as well, because that list is the
 * contract Clone Studio plans against.
 *
 * Every section is a server component. The motion inside them is not.
 */

export { Bento, type BentoProps } from "./bento";
export { Compare, type CompareProps } from "./compare";
export { CtaBand, type CtaBandProps } from "./cta-band";
export { Faq, type FaqProps } from "./faq";
export { Footer, IdeaWaveBadge } from "./footer";
export { Hero, type HeroAction, type HeroProps } from "./hero";
export { HeroBrutal } from "./hero-brutal";
export { HeroCraft } from "./hero-craft";
export { HeroEditorial } from "./hero-editorial";
export { HeroLuminous } from "./hero-luminous";
export { Pricing, type PricingProps } from "./pricing";
export {
  ProductFrame,
  ProductFrameSection,
  type ProductFrameChrome,
  type ProductFrameProps,
  type ProductFrameSectionProps,
} from "./product-frame";
export {
  Section,
  SectionHeader,
  type SectionHeaderProps,
  type SectionProps,
  type SectionSpace,
  type SectionTone,
  type SectionWidth,
} from "./section";
export { SiteHeader } from "@/components/site-header";
export { Stats, type StatsProps } from "./stats";
export { Steps, type StepsProps } from "./steps";
