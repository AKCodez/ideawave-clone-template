import type { Direction } from "../types";
import { brutal } from "./brutal";
import { craft } from "./craft";
import { editorial } from "./editorial";
import { luminous } from "./luminous";
import type { DirectionSpec } from "./spec";

export type { DirectionSpec, TypeStep, TypeToken, RadiusRamp, ShadowRecipe, MotionRecipe } from "./spec";
export { TYPE_TOKENS } from "./spec";

/** Every art direction the kit ships. A brand names one; the rest never render. */
export const DIRECTION_SPECS: Record<Direction, DirectionSpec> = { editorial, luminous, brutal, craft };

export function directionSpec(direction: Direction): DirectionSpec {
  return DIRECTION_SPECS[direction];
}
