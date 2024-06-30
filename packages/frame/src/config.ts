import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

export const CHAIN = baseSepolia;
export const client = createPublicClient({
  chain: CHAIN,
  transport: http(),
});
