import { getFrameMetadata } from "frog/next";
import type { Metadata } from "next";

type Props = {
  params: { contractAddress: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const frameTags = await getFrameMetadata(
    `${process.env.VERCEL_URL || "http://localhost:3000"}/frame/${
      params.contractAddress
    }`
  );
  return {
    other: frameTags,
  };
}

export default function FandomFightPage({ params }: Props) {
  return <h1>Fandom Fight {params.contractAddress}</h1>;
}
