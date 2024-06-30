import { FandomFightABI } from "@/abi/FandomFightABI";
import { CHAIN, client } from "@/config";
import { parseEther, type TransactionContext } from "frog";
import { getAddress, getContract } from "viem";

export async function bidTransaction({ ctx }: { ctx: TransactionContext }) {
  const { inputText, req } = ctx;
  const address = getAddress(req.param("address") ?? "");
  const choice = parseInt(req.param("choice") ?? "");

  const fandomFight = getContract({
    address,
    abi: FandomFightABI,
    client,
  });

  const currentMinimumPrice = await fandomFight.read.getCurrentMinimumPrice();
  let amount: bigint;

  if (!inputText) {
    amount = currentMinimumPrice;
  } else {
    try {
      amount = parseEther(inputText);
    } catch (e) {
      return ctx.error({ message: "Please enter a valid amount" });
    }
  }

  if (isNaN(choice))
    return ctx.error({ message: "Please select a valid choice" });

  if (amount < currentMinimumPrice)
    return ctx.error({ message: "Amount must be larger than current minimum" });

  return ctx.contract({
    chainId: `eip155:${CHAIN.id}`,
    to: address,
    abi: FandomFightABI,
    functionName: "bid",
    args: [choice],
    value: amount,
  });
}
