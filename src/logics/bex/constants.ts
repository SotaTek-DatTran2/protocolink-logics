export const MAX_SQRT_PRICE: bigint = BigInt('21267430153580247136652501917186561138') - BigInt(1);
export const MIN_SQRT_PRICE: bigint = BigInt('65538') - BigInt(1);
// Default slippage is set to 1%. User should evaluate this carefully for low liquidity
// pools of when swapping large amounts.
export const DFLT_SWAP_ARGS = {
  slippage: 0.01,
};
