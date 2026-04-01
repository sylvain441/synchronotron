/**
 * Synchronotron modulo reduction.
 * Maps value into range [1..modulus] instead of [0..modulus-1].
 * Port of synchronotron_reduce() from www/application/helpers/441_helper.php
 */
export function syncReduce(modulus: number, value: number): number {
  // Add large offset to avoid negative results (matching PHP behavior)
  const adjusted = Math.floor(value) + modulus * 100
  const remainder = adjusted % modulus
  return remainder === 0 ? modulus : remainder
}

/** Format grid coordinates as "(V{v}.H{h})" */
export function coordinatesString(v: number, h: number): string {
  return `(V${v}.H${h})`
}

/** Format calculation as "timeUnit + spaceUnit + syncUnit" */
export function calculationString(timeUnit: number, spaceUnit: number, syncUnit: number): string {
  return `${timeUnit} + ${spaceUnit} + ${syncUnit}`
}
