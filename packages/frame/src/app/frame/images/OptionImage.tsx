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
import { type ImageContext } from "frog";
import { getAddress, getContract } from "viem";

export async function OptionImage({ ctx }: { ctx: ImageContext }) {
  const { req } = ctx;

  const address = getAddress(req.param("address") ?? "");
  const choice = parseInt(req.param("choiceId") ?? "");

  const fandomFight = getContract({
    address,
    abi: FandomFightABI,
    client,
  });

  const minimumPrice = await fandomFight.read.getCurrentMinimumPrice();
  const choices = await fandomFight.read.getAllChoices();

  const currentChoice = choices.at(choice);

  if (!currentChoice) throw new Error();

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
        <VStack gap="8">
          <Heading align="center" size="18">
            Option {choice + 1} selected!
          </Heading>
          <Columns gap="32" alignHorizontal="center" alignVertical="center">
            <Column width="1/2" alignVertical="center">
              <Text size="10">Name:</Text>
              <Text size="10" color="highlight">
                {currentChoice.title}
              </Text>
              <Spacer size="8" />
              <Text size="10">Min donation:</Text>
              <Text size="10" color="highlight">
                {formatAmount(minimumPrice)} ETH
              </Text>
              <Spacer size="8" />
              <Text size="10">URL:</Text>
              <div style={{ display: "flex" }}>
                <Text size="10" color="highlight">
                  {currentChoice.url}
                </Text>
              </div>
            </Column>
            <Column width="1/2" alignVertical="center">
              <Image
                width="100%"
                height="160"
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
  });
}
