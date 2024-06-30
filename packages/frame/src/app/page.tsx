import { getFrameMetadata } from "frog/next";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const frameTags = await getFrameMetadata(
    `${process.env.VERCEL_URL || "http://localhost:3000"}/frame`
  );
  return {
    other: frameTags,
  };
}

export default function Home() {
  return <h1>Fandom Fight</h1>;
}
