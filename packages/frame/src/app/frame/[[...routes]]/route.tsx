/** @jsxImportSource frog/jsx */

import { bidTransaction } from "@/app/frame/bid";
import { ChoicesImage } from "@/app/frame/images/ChoicesImage";
import { HomeImage } from "@/app/frame/images/HomeImage";
import { OptionImage } from "@/app/frame/images/OptionImage";
import { Choices } from "@/app/frame/screens/Choices";
import { Home } from "@/app/frame/screens/Home";
import { Success } from "@/app/frame/screens/Success";
import { vars } from "@/app/frame/ui";
import { Frog } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";

const app = new Frog({
  title: "Fandom Fight",
  assetsPath: "/",
  basePath: "/frame",
  ui: { vars },
  imageOptions: {
    debug: false,
  },
});

devtools(app, { serveStatic });

app.frame("/:address", (ctx) => Home({ ctx }));
app.frame("/:address/choices", (ctx) => Choices({ ctx }));
app.frame("/:address/success/:choice", (ctx) => Success({ ctx }));

app.transaction("/:address/bid/:choice", (ctx) => bidTransaction({ ctx }));

app.image("/:address/images/home", (ctx) => HomeImage({ ctx }));
app.image("/:address/images/choices", (ctx) => ChoicesImage({ ctx }));
app.image("/:address/images/choices/:choiceId", (ctx) => OptionImage({ ctx }));

export const GET = handle(app);
export const POST = handle(app);
