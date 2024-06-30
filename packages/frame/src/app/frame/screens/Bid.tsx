/** @jsxImportSource frog/jsx */

import { FandomFightABI } from "@/abi/FandomFightABI";
import {
  Box,
  Column,
  Columns,
  Heading,
  Image,
  Spacer,
  Text,
  VStack,
} from "@/app/frame/ui";
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
    image: (
      <Box
        grow
        alignHorizontal="center"
        alignVertical="center"
        backgroundColor="background"
        padding="24"
        lineHeight="56"
      >
        <VStack gap="16">
          <Heading align="center" size="18">
            Option {choice} selected!
          </Heading>
          <Columns gap="32" alignHorizontal="center" alignVertical="center">
            <Column width="1/2">
              <Text size="10">Name:</Text>
              <Text size="10" color="highlight">
                {currentChoice.title}
              </Text>
              <Spacer size="12" />
              <Text size="10">Min donation:</Text>
              <Text size="10" color="highlight">
                {formatAmount(minimumPrice)} ETH
              </Text>
            </Column>
            <Column width="1/2">
              <Image
                width="100%"
                height="96"
                objectFit="contain"
                src={currentChoice.imageURI.replace(
                  "ipfs://",
                  "https://ipfs.filebase.io/ipfs/"
                )}
              />
            </Column>
          </Columns>
          <Text size="10" color="text200" align="center">
            70% of donations go to supporting the channel, <br />
            10% goes to last donator, and 20% to frame devs
          </Text>
        </VStack>
      </Box>
    ),
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
