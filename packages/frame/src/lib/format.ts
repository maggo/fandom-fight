import { formatEther, type Address } from "viem";

const formatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 5,
  // @ts-ignore
  roundingMode: "ceil",
});

export function formatAmount(amount: bigint) {
  const parsedAmount = parseFloat(formatEther(amount));

  return formatter.format(parsedAmount);
}

export function formatAddress(address: Address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
