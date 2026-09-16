import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge has to be told about this kit's scales.
 *
 * Out of the box it classifies `text-small` and `text-h2` as text COLOURS,
 * because they are not t-shirt sizes - so `cn("text-small", "text-critical")`
 * silently returned only `text-critical` and the whole type scale disappeared
 * wherever a colour sat in the same class string. Declaring the eight type
 * steps as font sizes fixes that, and declaring the radius and shadow ramps
 * makes a later override actually win.
 */
const merge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "h1", "h2", "h3", "lead", "body", "small", "caption"] }],
      rounded: [{ rounded: ["input"] }],
      shadow: [{ shadow: ["1", "2", "3", "4", "hard", "glow"] }],
    },
  },
});

/** Merge conditional class names, letting later utilities win. */
export function cn(...inputs: ClassValue[]): string {
  return merge(clsx(inputs));
}
