import { formatUnits, parseUnits } from 'ethers/lib/utils';
export type TokenQty = bigint | string | number;
export function fromDisplayQty(qty: string, tokenDecimals: number): bigint {
  try {
    // First try to directly parse the string, so there's no loss of precision for
    // long fixed strings.
    return BigInt(parseUnits(qty, tokenDecimals).toString());
  } catch {
    // If that fails (e.g. with scientific notation floats), then cast to float and
    // back to fixed string
    const sanitQty = parseFloat(qty).toFixed(tokenDecimals);
    return BigInt(parseUnits(sanitQty, tokenDecimals).toString());
  }
}

export function toDisplayQty(qty: string | number | bigint, tokenDecimals: number): string {
  // formatUnits is temperamental with Javascript numbers, so convert string to
  // fullwide string to avoid scientific notation (which BigInt pukes on)
  if (typeof qty === 'number') {
    const qtyString = qty.toLocaleString('fullwide', { useGrouping: false });
    return toDisplayQty(qtyString, tokenDecimals);
  }

  return formatUnits(qty, tokenDecimals);
}

export function roundQty(qty: string | number | bigint, decimals: number): bigint {
  if (typeof qty === 'number' || typeof qty === 'string') {
    return normQty(truncFraction(qty, decimals), decimals);
  } else {
    return qty;
  }
}

function truncFraction(qty: string | number, decimals: number): number {
  if (typeof qty === 'number') {
    const exp = Math.pow(10, decimals);
    return Math.floor(qty * exp) / exp;
  } else {
    return truncFraction(parseFloat(qty), decimals);
  }
}

function normQty(qty: bigint | string | number, decimals: number): bigint {
  if (typeof qty === 'number' || typeof qty === 'string') {
    return fromDisplayQty(qty.toString(), decimals);
  } else {
    return qty;
  }
}
