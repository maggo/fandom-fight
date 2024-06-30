/** @jsxImportSource frog/jsx */

import { FandomFightABI } from "@/abi/FandomFightABI";
import { client } from "@/config";
import { formatAmount } from "@/lib/format";
import { Button, TextInput, type FrameContext } from "frog";
import { getAddress, getContract } from "viem";

export async function Bid({
  ctx,
  choice,
}: {
  ctx: FrameContext;
  choice: number;
}) {
  const { req } = ctx;

  const address = getAddress(req.param("address") ?? "");

  const fandomFight = getContract({
    address,
    abi: FandomFightABI,
    client,
  });

  const minimumPrice = await fandomFight.read.getCurrentMinimumPrice();
  const choices = await fandomFight.read.getAllChoices();

  const currentChoice = choices.at(choice);

  if (!currentChoice) return ctx.error({ message: "Invalid choice." });

  return ctx.res({
    action: `/${address}/success/${choice}`,
    image: `/${address}/images/choices/${choice}`,
    intents: [
      <TextInput
        placeholder={`Ether amount, minimum ${formatAmount(minimumPrice)}`}
      />,
      <Button action={`/${address}/choices`}>Back</Button>,
      <Button.Transaction target={`/${address}/bid/${choice}`}>
        Bid
      </Button.Transaction>,
    ],
  });
}
