import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "hardhat-storage-layout";
import "hardhat-contract-sizer";
import "hardhat-abi-exporter";
import "hardhat-gas-reporter";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 534351,
      forking: {
        enabled: true,
        url: process.env.BASE_SEPOLIA_URL as string,
        blockNumber: 1624600,
      },
      blockGasLimit: 10_000_000,
      accounts: {
        count: 10,
      },
    },
    base: {
      chainId: 8453,
      url: process.env.BASE_URL as string,
      accounts: [process.env.MAINNET_PK as string],
    },
    baseSepolia: {
      chainId: 84532,
      url: process.env.BASE_SEPOLIA_URL as string,
      accounts: [process.env.MAINNET_PK as string],
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 1,
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY as string,
      base: process.env.BASESCAN_API_KEY as string,
      baseSepolia: process.env.BASESCAN_API_KEY as string,
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true,
  },
  abiExporter: {
    path: "./exported/abi",
    runOnCompile: true,
    clear: true,
    flat: true,
    only: ["FandomFight", "FandomFightFactory"],
    except: ["test/*"],
  },
};

export default config;
