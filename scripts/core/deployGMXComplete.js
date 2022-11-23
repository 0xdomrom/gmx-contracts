const { deployContract } = require("../shared/helpers")
const { expandDecimals, getBlockTime, increaseTime, mineBlock, reportGasUsed, newWallet } = require("../../test/shared/utilities");
const { toUsd } = require("../../test/shared/units")
const { initVault, getBnbConfig, getBtcConfig, getDaiConfig } = require("../../test/core/Vault/helpers");
const { toChainlinkPrice } = require("../../test/shared/chainlink");


async function deployGMXTestSystem(minter, wallet, tokenManager, mintReceiver) {
  const { AddressZero, HashZero } = ethers.constants
  const provider = waffle.provider
  // const [wallet, minter, tokenManager, mintReceiver] = await hre.ethers.getSigners()
  const depositFee = 50;
  const minExecutionFee = 4000;
  let vault
  let timelock
  let usdg
  let positionRouter
  let router
  let referralStorage
  let btc
  let btcPriceFeed
  let eth
  let ethPriceFeed
  let distributor
  let yieldTracker
  let fastPriceFeed
  let fastPriceEvents
  let shortsTracker

  USDC = await deployContract("Token", [])
  USDCPriceFeed = await deployContract("PriceFeed", [])
  // await USDC.connect(minter).deposit({ value: expandDecimals(100, 18) })

  btc = await deployContract("Token", [])
  btcPriceFeed = await deployContract("PriceFeed", [])

  eth = await deployContract("Token", [])
  ethPriceFeed = await deployContract("PriceFeed", [])

  vault = await deployContract("Vault", [])
  timelock = await deployContract("Timelock", [
    wallet.address,
    5 * 24 * 60 * 60,
    wallet.address,
    tokenManager.address,
    mintReceiver.address,
    expandDecimals(1000, 18),
    10, // marginFeeBasisPoints 0.1%
    500, // maxMarginFeeBasisPoints 5%
  ])

  usdg = await deployContract("USDG", [vault.address])
  router = await deployContract("Router", [vault.address, usdg.address, USDC.address])

  shortsTracker = await deployContract("ShortsTracker", [vault.address])

  positionRouter = await deployContract("PositionRouter", [vault.address, router.address, USDC.address, shortsTracker.address, depositFee, minExecutionFee])
  referralStorage = await deployContract("ReferralStorage", [])
  const vaultPriceFeed = await deployContract("VaultPriceFeed", [])
  distributor = await deployContract("TimeDistributor", [])
  yieldTracker = await deployContract("YieldTracker", [usdg.address])

  reader = await deployContract("Reader", [])

  fastPriceEvents = await deployContract("FastPriceEvents", [])
  fastPriceFeed = await deployContract("FastPriceFeed", [
    5 * 60, // _priceDuration
    120 * 60, // _maxPriceUpdateDelay
    0, // _minBlockInterval
    250, // _maxDeviationBasisPoints
    fastPriceEvents.address, // _fastPriceEvents
    tokenManager.address, // _tokenManager
    positionRouter.address // _positionRouter
  ])

  // vault utils
  vaultUtils = await deployContract("VaultUtils", [vault.address]);

  return {
    USDC,
    btc,
    eth,
    vault,
    timelock,
    usdg,
    router,
    shortsTracker,
    positionRouter,
    referralStorage,
    distributor,
    reader,
    vaultPriceFeed,
    USDCPriceFeed,
    ethPriceFeed,
    btcPriceFeed,
    fastPriceEvents,
    fastPriceFeed,
    yieldTracker,
    vaultUtils
  }
}

module.exports = { deployGMXTestSystem };
