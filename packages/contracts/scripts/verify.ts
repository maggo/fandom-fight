import hre from "hardhat";
import { encodeFunctionData, type Address, type Hex } from "viem";
import { FEE_BPS, FEE_RECEIVER } from "./deploy";

const FANDOMFIGHT_IMPL_ADDRESS = "0xC8f22807A2213AD7BDc7AF046D35Fe214687093d";
const FANDOMFIGHT_FACTORY_IMPL_ADDRESS =
  "0x0B13095A4c163a4fE5998823fc41AD633E10E49d";
const FANDOMFIGHT_FACTORY_PROXY_ADDRESS =
  "0x0381Ec029CaA2e30e080F9fc505Ad797cd94787b";

async function main() {
  try {
    await hre.run("verify:verify", {
      address: FANDOMFIGHT_IMPL_ADDRESS,
    });
  } catch (e) {
    console.error(e);
  }

  try {
    await hre.run("verify:verify", {
      address: FANDOMFIGHT_FACTORY_IMPL_ADDRESS,
    });
  } catch (e) {
    console.error(e);
  }

  try {
    const fandomFightFactoryProxyArgs: [Address, Hex] = [
      FANDOMFIGHT_IMPL_ADDRESS,
      encodeFunctionData({
        abi: (
          await hre.viem.getContractAt(
            "FandomFightFactory",
            FANDOMFIGHT_FACTORY_IMPL_ADDRESS
          )
        ).abi,
        functionName: "init",
        args: [FANDOMFIGHT_IMPL_ADDRESS, FEE_RECEIVER, FEE_BPS],
      }),
    ];

    await hre.run("verify:verify", {
      address: FANDOMFIGHT_FACTORY_PROXY_ADDRESS,
      constructorArguments: fandomFightFactoryProxyArgs,
    });
  } catch (e) {
    console.error(e);
  }
}

main()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
