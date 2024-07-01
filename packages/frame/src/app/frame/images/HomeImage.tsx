/** @jsxImportSource frog/jsx */

import { FandomFightABI } from "@/abi/FandomFightABI";
import { Box, Column, Columns, Image, Text, VStack } from "@/app/frame/ui";
import { client } from "@/config";
import { formatAddress, formatAmount } from "@/lib/format";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { type ImageContext } from "frog";
import { getAddress, getContract, zeroAddress, type Address } from "viem";

const neynar = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

export async function HomeImage({ ctx }: { ctx: ImageContext }) {
  const { req } = ctx;
  const address = getAddress(req.param("address") ?? "");

  const fandomFight = getContract({
    address,
    abi: FandomFightABI,
    client,
  });

  const [lastBidAddress, lastBidAmount, lastBidChoice, lastBidTimestamp] =
    await fandomFight.read.lastBid();
  const choices = await fandomFight.read.getAllChoices();

  const currentChoice = choices.at(lastBidChoice);

  const hasBid = lastBidAddress !== zeroAddress;

  const user = hasBid ? await getUser(lastBidAddress) : null;

  return ctx.res({
    headers: {
      "cache-control": "public, max-age=5",
    },
    image: (
      <Box grow>
        {hasBid && !!currentChoice && (
          <Box position="absolute" left="0" top="0" width="100%" height="100%">
            <Image
              width="100%"
              height="100%"
              objectFit="cover"
              src={currentChoice.imageURI.replace(
                "ipfs://",
                "https://ipfs.filebase.io/ipfs/"
              )}
            />
          </Box>
        )}
        <Box
          position="absolute"
          left="32"
          bottom="16"
          width={{ custom: "700px" }}
          height="42"
          paddingLeft="48"
          borderWidth="2"
          borderColor="text"
          backgroundColor="background"
          lineHeight={{ custom: "1.5em" }}
          alignVertical="center"
          paddingTop="6"
        >
          <Box
            position="absolute"
            left={{ custom: "-30px" }}
            top={{ custom: "-20px" }}
          >
            <Image src="/logo.png" width="56" height="56" />
          </Box>

          <Columns gap="8" alignVertical="center">
            <Column alignVertical="center">
              <VStack gap="4">
                <Text align="center" color="text" size="10">
                  Current bid:
                </Text>
                <Text align="center" color="highlight" size="10">
                  {formatAmount(lastBidAmount)} ETH
                </Text>
              </VStack>
            </Column>
            <Column alignVertical="center">
              <VStack gap="4">
                <Text align="center" color="text" size="10">
                  Last donation:
                </Text>
                <Text align="center" color="highlight" size="10">
                  {user?.username
                    ? `@${user.username}`
                    : formatAddress(lastBidAddress)}
                </Text>
              </VStack>
            </Column>
          </Columns>
        </Box>
      </Box>
    ),
  });
}

async function getUser(address: Address) {
  if (!address) return null;
  try {
    const user = await neynar.fetchBulkUsersByEthereumAddress([address]);
    return Object.values(user).at(0)?.at(0) ?? null;
  } catch (e) {
    return null;
  }
}