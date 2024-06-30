import { colors, createSystem, defaultVars, units } from "frog/ui";

export const {
  Box,
  Columns,
  Column,
  Heading,
  HStack,
  Rows,
  Row,
  Spacer,
  Text,
  VStack,
  Image,
  vars,
} = createSystem({
  colors: { ...colors.dark, background: "#004FAC", highlight: "#FAEF01" },
  fontSizes: {
    ...defaultVars.fontSizes,
    "10": units["10"],
  },
  fonts: {
    default: [
      {
        name: "Press Start 2P",
        source: "google",
        weight: 400,
      },
    ],
  },
  text: {},
});
