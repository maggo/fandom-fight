/** @jsxImportSource frog/jsx */

import { FandomFightABI } from "@/abi/FandomFightABI";
import { Box, Heading, Text, VStack, Image } from "@/app/frame/ui";
import { CHAIN, client } from "@/config";
import { Button, type FrameContext } from "frog";
import { getAddress, getContract } from "viem";

export async function Success({ ctx }: { ctx: FrameContext }) {
  const { transactionId, req } = ctx;
  const address = getAddress(req.param("address") ?? "");
  const choice = parseInt(req.param("choice") ?? "");

  const fandomFight = getContract({
    address,
    abi: FandomFightABI,
    client,
  });
  const choices = await fandomFight.read.getAllChoices();
  const currentChoice = choices[choice];

  return ctx.res({
    image: (
      <Box
        grow
        alignHorizontal="center"
        alignVertical="center"
        backgroundColor="background"
        padding="32"
        lineHeight={{ custom: "1.5em" }}
        textAlign="center"
      >
        <VStack gap="8" alignHorizontal="center">
          <Heading align="center">Success!</Heading>
          <Image
            src="/checkmark.png"
            width="160"
            height="160"
            objectFit="contain"
          />
          <Text wrap="balance" color="text" size="12">
            {currentChoice.title} is the now the favorite fandom, thanks for
            supporting our channel!
          </Text>
        </VStack>
      </Box>
    ),
    intents: [
      <Button.Reset>Reset</Button.Reset>,
      <Button.Link
        href={`${CHAIN.blockExplorers.default.url}/tx/${transactionId}`}
      >
        TX
      </Button.Link>,
      <Button.Link href="https://fandomfight.com">
        About Fandom Fight
      </Button.Link>,
    ],
  });
}
