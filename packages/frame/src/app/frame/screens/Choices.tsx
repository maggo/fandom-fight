/** @jsxImportSource frog/jsx */

import { FandomFightABI } from "@/abi/FandomFightABI";
import { Bid } from "@/app/frame/screens/Bid";
import {
  Box,
  Column,
  Columns,
  Heading,
  Image,
  Text,
  VStack,
  vars,
} from "@/app/frame/ui";
import { client } from "@/config";
import { formatAmount } from "@/lib/format";
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

  const minimumPrice = await fandomFight.read.getCurrentMinimumPrice();
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
    image: (
      <Box
        grow
        alignHorizontal="center"
        alignVertical="center"
        backgroundColor="background"
        padding="24"
        lineHeight="56"
      >
        <VStack gap="20">
          <Heading align="center" size="18">
            Which is better?
          </Heading>
          <Columns gap="32" alignHorizontal="center">
            {choices.map((choice, i) => (
              <Column width="1/3">
                <Box marginBottom="4">
                  <Text align="center" color="text200" size="12">
                    Option {i + 1}
                  </Text>
                </Box>

                <Image
                  width="100%"
                  height="96"
                  objectFit="contain"
                  src={choice.imageURI.replace(
                    "ipfs://",
                    "https://ipfs.filebase.io/ipfs/"
                  )}
                />
              </Column>
            ))}
          </Columns>

          <VStack gap="4">
            <Text size="12" align="center">
              Current minimum donation{" "}
              <span style={{ color: vars.colors.highlight }}>
                {formatAmount(minimumPrice)} ETH
              </span>
            </Text>
            <Text size="10" color="text200" align="center">
              70% of donations go to supporting the channel, <br />
              10% goes to last donator, and 20% to frame devs
            </Text>
          </VStack>
        </VStack>
      </Box>
    ),
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
