import {
  loadFixture,
  setBalance,
  time,
} from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import {
  decodeEventLog,
  encodeFunctionData,
  getAddress,
  parseEther,
} from "viem";

describe("FandomFight", () => {
  async function deployFandomFightFixture() {
    const publicClient = await hre.viem.getPublicClient();
    // Contracts are deployed using the first signer/account by default
    const [deployer, alice, bob, carl] = await hre.viem.getWalletClients();

    const fandomFightImpl = await hre.viem.deployContract("FandomFight");
    const fandomFightFactoryImpl = await hre.viem.deployContract(
      "FandomFightFactory"
    );
    const fandomFightFactoryProxy = await hre.viem.deployContract(
      "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy",
      [
        fandomFightFactoryImpl.address,
        encodeFunctionData({
          abi: fandomFightFactoryImpl.abi,
          functionName: "init",
          args: [fandomFightImpl.address, carl.account.address, 2000n],
        }),
      ]
    );

    const fandomFightFactory = await hre.viem.getContractAt(
      "FandomFightFactory",
      fandomFightFactoryProxy.address
    );

    const exampleFandomFightDeployTx = await fandomFightFactory.write.create([
      [
        { imageURI: "ipfs://abc", title: "abc", url: "https://example.com" },
        { imageURI: "ipfs://def", title: "def", url: "https://example.com" },
      ],
      parseEther("0.1"), // 0.1 ETH minimum price
      1000n, // 10% minimum price increase
      1n * 60n * 60n, // 1 hour purchase delay
      2n * 60n * 60n, // 2 hours falloff delay
      1n * 60n * 60n, // 1 hour falloff duration
      alice.account.address, // beneficiary
    ]);

    const data = await publicClient.waitForTransactionReceipt({
      hash: exampleFandomFightDeployTx,
    });

    const exampleFandomFightAddress = data.logs
      .filter((log) => log.address === fandomFightFactory.address)
      .map((log) =>
        decodeEventLog({
          abi: fandomFightFactory.abi,
          eventName: "FandomFightCreated",
          ...log,
        })
      )
      .at(0)?.args?.fandomFightProxy;

    if (!exampleFandomFightAddress) {
      throw new Error("Failed to get example FandomFight address");
    }

    const fandomFight = await hre.viem.getContractAt(
      "FandomFight",
      exampleFandomFightAddress
    );

    return {
      fandomFightImpl,
      fandomFightFactory,
      publicClient,
      deployer,
      alice,
      bob,
      carl,
      fandomFight,
    };
  }

  it("should set the right minimum price", async () => {
    const { fandomFight } = await loadFixture(deployFandomFightFixture);

    expect(await fandomFight.read.getCurrentMinimumPrice()).to.equal(
      parseEther("0.1")
    );

    await fandomFight.write.bid([0], { value: parseEther("0.1") });

    expect(await fandomFight.read.getCurrentMinimumPrice()).to.equal(
      parseEther("0.11")
    );

    // Increase time by 1 hour
    await time.increase(1 * 60 * 60);

    await fandomFight.write.bid([0], { value: parseEther("0.11") });

    expect(await fandomFight.read.getCurrentMinimumPrice()).to.equal(
      parseEther("0.121")
    );
  });

  it("should transfer all fees", async () => {
    const { fandomFight, alice, bob, carl, publicClient } = await loadFixture(
      deployFandomFightFixture
    );

    await fandomFight.write.bid([0], {
      value: parseEther("0.1"),
      account: bob.account,
    });

    // 20% fee
    expect(await publicClient.getBalance(carl.account)).to.equal(
      parseEther("10000.02")
    );

    // Remainder
    expect(await publicClient.getBalance(alice.account)).to.equal(
      parseEther("10000.08")
    );

    // Increase time by 3 hours
    await time.increase(3 * 60 * 60);

    await setBalance(alice.account.address, parseEther("10000"));
    await setBalance(bob.account.address, parseEther("10000"));
    await setBalance(carl.account.address, parseEther("10000"));

    await fandomFight.write.bid([0], {
      value: parseEther("0.1"),
    });

    // 20% fee
    expect(await publicClient.getBalance(carl.account)).to.equal(
      parseEther("10000.02")
    );

    // 10% cashback
    expect(await publicClient.getBalance(bob.account)).to.equal(
      parseEther("10000.01")
    );

    // Remainder
    expect(await publicClient.getBalance(alice.account)).to.equal(
      parseEther("10000.07")
    );
  });

  it("should set the right bid choice", async () => {
    const { fandomFight, deployer } = await loadFixture(
      deployFandomFightFixture
    );

    await fandomFight.write.bid([0], { value: parseEther("0.1") });

    const timestamp = await time.latest();

    await time.increase(1 * 60 * 60);

    await fandomFight.write.bid([1], { value: parseEther("0.11") });

    const lastBid = await fandomFight.read.lastBid();

    expect(lastBid).to.deep.equal([
      getAddress(deployer.account.address),
      parseEther("0.11"),
      1,
      BigInt(timestamp + 1 + 1 * 60 * 60),
    ]);
  });

  it("should not allow to bid before bid delay has passed", async () => {
    const { fandomFight } = await loadFixture(deployFandomFightFixture);

    await fandomFight.write.bid([0], { value: parseEther("0.1") });

    await expect(
      fandomFight.write.bid([0], { value: parseEther("0.11") })
    ).to.be.rejectedWith("Can only bid after delay has passed");
  });

  it("should not allow prices below current minimum", async () => {
    const { fandomFight } = await loadFixture(deployFandomFightFixture);

    await expect(
      fandomFight.write.bid([0], { value: parseEther("0.01") })
    ).to.be.rejectedWith(
      "Bid must be greater than or equal to current minimum price"
    );

    await fandomFight.write.bid([0], { value: parseEther("0.1") });

    await time.increase(1 * 60 * 60);

    await expect(
      fandomFight.write.bid([0], { value: parseEther("0.1") })
    ).to.be.rejectedWith(
      "Bid must be greater than or equal to current minimum price"
    );
  });

  it("should decrease minimum price after falloff delay has passed", async () => {
    const { fandomFight } = await loadFixture(deployFandomFightFixture);

    await fandomFight.write.bid([0], { value: parseEther("0.1") });

    await time.increase(2 * 60 * 60);

    // Falloff starts now
    expect(await fandomFight.read.getCurrentMinimumPrice()).to.equal(
      parseEther("0.11")
    );

    // 1 second into falloff
    await time.increase(1);

    expect(await fandomFight.read.getCurrentMinimumPrice()).to.equal(
      parseEther("0.109997222222222222")
    );

    // 1 hour - 1 second into falloff
    await time.increase(3598);

    expect(await fandomFight.read.getCurrentMinimumPrice()).to.equal(
      parseEther("0.100002777777777777")
    );

    // Falloff completed
    await time.increase(1);

    expect(await fandomFight.read.getCurrentMinimumPrice()).to.equal(
      parseEther("0.1")
    );

    // Still uses min price in the far future
    await time.increase(10000000);

    expect(await fandomFight.read.getCurrentMinimumPrice()).to.equal(
      parseEther("0.1")
    );
  });
});
