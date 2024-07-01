/** @jsxImportSource frog/jsx */

import { FandomFightABI } from "@/abi/FandomFightABI";
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
import { type ImageContext } from "frog";
import { getAddress, getContract } from "viem";

export async function ChoicesImage({ ctx }: { ctx: ImageContext }) {
  const { req } = ctx;

  const address = getAddress(req.param("address") ?? "");

  const fandomFight = getContract({
    address,
    abi: FandomFightABI,
    client,
  });

  const minimumPrice = await fandomFight.read.getCurrentMinimumPrice();
  const choices = await fandomFight.read.getAllChoices();

  return ctx.res({
    headers: {
      "cache-control": "public, max-age=5",
    },
    image: (
      <Box
        grow
        alignHorizontal="center"
        alignVertical="center"
        backgroundColor="background"
        padding="24"
        lineHeight="56"
      >
        <VStack gap="12">
          <Heading align="center" size="18">
            Which is better?
          </Heading>
          <Columns gap="32" alignHorizontal="center">
            {choices.map((choice, i) => (
              <Column width="1/3">
                <Text align="center" color="text200" size="12">
                  Option {i + 1}
                </Text>

                <Box
                  textAlign="center"
                  height="36"
                  marginTop="4"
                  marginBottom="4"
                >
                  <Text align="center" color="highlight" size="14">
                    {choice.title}
                  </Text>
                </Box>

                <Image
                  width="100%"
                  height="80"
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
  });
}
