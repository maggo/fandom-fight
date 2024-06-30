/** @jsxImportSource frog/jsx */

import { FandomFightABI } from "@/abi/FandomFightABI";
import { Bid } from "@/app/frame/screens/Bid";
import { client } from "@/config";
import { Button, TextInput, type FrameContext } from "frog";
import { getAddress, getContract } from "viem";

export async function Choices({ ctx }: { ctx: FrameContext }) {
  const { inputText, buttonValue, req } = ctx;

  const address = getAddress(req.param("address") ?? "");

  const fandomFight = getContract({
    address,
    abi: FandomFightABI,
    client,
  });

  const choices = await fandomFight.read.getAllChoices();
  const selectedChoice =
    inputText !== undefined
      ? parseInt(inputText) - 1
      : buttonValue !== undefined
      ? parseInt(buttonValue)
      : null;

  if (selectedChoice !== null) {
    if (selectedChoice < 0 || selectedChoice >= choices.length) {
      return ctx.error({ message: "Invalid choice." });
    } else {
      return Bid({ ctx, choice: selectedChoice });
    }
  }

  return ctx.res({
    image: `/${address}/images/choices`,
    intents:
      choices.length <= 4
        ? choices.map((choice, index) => (
            <Button value={index.toString()}>
              Select {(index + 1).toString()}
            </Button>
          ))
        : [
            <TextInput placeholder="Option Number, eg. 1" />,
            <Button>Select</Button>,
          ],
  });
}
