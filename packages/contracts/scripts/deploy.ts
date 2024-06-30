import hre from "hardhat";
import { encodeFunctionData, type Address, type Hex } from "viem";

const FEE_RECEIVER = "0xA2C8fA8e889418CE2514657289DFA60cF9F285Ba";
const FEE_BPS = 2000n; // 20%

async function main() {
  console.log("Deploying FandomFightFactory…");

  const fandomFightImpl = await hre.viem.deployContract("FandomFight");

  console.log("FandomFightImpl deployed at:", fandomFightImpl.address);

  const fandomFightFactoryImpl = await hre.viem.deployContract(
    "FandomFightFactory"
  );

  console.log(
    "FandomFightFactoryImpl deployed at:",
    fandomFightFactoryImpl.address
  );

  const fandomFightFactoryProxyArgs: [Address, Hex] = [
    fandomFightFactoryImpl.address,
    encodeFunctionData({
      abi: fandomFightFactoryImpl.abi,
      functionName: "init",
      args: [fandomFightImpl.address, FEE_RECEIVER, FEE_BPS],
    }),
  ];

  const fandomFightFactoryProxy = await hre.viem.deployContract(
    "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy",
    fandomFightFactoryProxyArgs
  );

  console.log(
    "FandomFightFactory deployed at:",
    fandomFightFactoryProxy.address
  );

  console.log("Verifying contracts…");

  await new Promise((resolve) => setTimeout(resolve, 30_000));

  await hre.run("verify:verify", {
    address: fandomFightImpl.address,
    constructorArguments: [],
  });
  await hre.run("verify:verify", {
    address: fandomFightFactoryImpl.address,
    constructorArguments: [],
  });
  await hre.run("verify:verify", {
    address: fandomFightFactoryProxy.address,
    constructorArguments: fandomFightFactoryProxyArgs,
  });
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
