/** @jsxImportSource frog/jsx */

import { Button, type FrameContext } from "frog";
import { getAddress } from "viem";

export async function Home({ ctx }: { ctx: FrameContext }) {
  const { req } = ctx;
  const address = getAddress(req.param("address") ?? "");

  return ctx.res({
    image: `/${address}/images/home`,
    intents: [<Button action={`/${address}/choices`}>Start</Button>],
  });
}
