import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

export const CHAIN = base;
export const client = createPublicClient({
  chain: CHAIN,
  transport: http(),
});
