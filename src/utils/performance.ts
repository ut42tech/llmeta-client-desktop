/**
 * Round a number to the specified decimal places
 * @param value - The number to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded number
 */
export const roundToDecimals = (value: number, decimals = 2): number => {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
};
