/** @jsxImportSource frog/jsx */

import { FandomFightABI } from "@/abi/FandomFightABI";
import { client } from "@/config";
import { Button, type FrameContext } from "frog";
import { getAddress, getContract } from "viem";

export async function Home({ ctx }: { ctx: FrameContext }) {
  const { req } = ctx;
  const address = getAddress(req.param("address") ?? "");

  const fandomFight = getContract({
    address,
    abi: FandomFightABI,
    client,
  });

  const [, , lastBidChoice] = await fandomFight.read.lastBid();
  const choices = await fandomFight.read.getAllChoices();

  const currentChoice = choices.at(lastBidChoice);

  return ctx.res({
    image: `/${address}/images/home`,
    intents: [
      <Button action={`/${address}/choices`}>Donate to pick</Button>,
      currentChoice ? (
        <Button.Link href={currentChoice.url}>
          Visit {currentChoice.title}
        </Button.Link>
      ) : undefined,
    ],
  });
}
