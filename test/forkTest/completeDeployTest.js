const { ethers } = require("hardhat");
const { deployGMXTestSystem } = require("../../scripts/core/deployGMXComplete")


describe.only('test to see if deploy works in the gmx repo', () => {
  it("basic test to see if the contracts actually deploy", async () => {
    const [wallet, minter, tokenManager, mintReceiver] = await hre.ethers.getSigners();
    const testSystem = await deployGMXTestSystem(minter, wallet, tokenManager, mintReceiver);
    console.log(Object.keys(testSystem));
  });
})