const { deployContract } = require("../shared/helpers")
const { expandDecimals, getBlockTime, increaseTime, mineBlock, reportGasUsed, newWallet } = require("../../test/shared/utilities");
const { toUsd } = require("../../test/shared/units")
const { initVault, getBnbConfig, getBtcConfig, getDaiConfig } = require("../../test/core/Vault/helpers");
const { toChainlinkPrice } = require("../../test/shared/chainlink");


async function deployGMXTestSystem(minter, wallet, tokenManager, mintReceiver, overrides) {
  const depositFee = 50;
  const minExecutionFee = 4000;

  let USDC = overrides?.USDC || await deployContract("Token", [])
  let usdcPriceFeed = overrides?.usdcPriceFeed || await deployContract("PriceFeed", [])
  // await USDC.connect(minter).deposit({ value: expandDecimals(100, 18) })

  let btc = overrides?.btc || await deployContract("Token", [])
  let btcPriceFeed = overrides?.btcPriceFeed || await deployContract("PriceFeed", [])

  let eth = overrides?.eth || await deployContract("Token", [])
  let ethPriceFeed = overrides?.ethPriceFeed || await deployContract("PriceFeed", [])

  let vault = await deployContract("Vault", [])
  let timelock = await deployContract("Timelock", [
    wallet.address,
    5 * 24 * 60 * 60,
    wallet.address,
    tokenManager.address,
    mintReceiver.address,
    expandDecimals(1000, 18),
    10, // marginFeeBasisPoints 0.1%
    500, // maxMarginFeeBasisPoints 5%
  ])

  let usdg = await deployContract("USDG", [vault.address])
  let router = await deployContract("Router", [vault.address, usdg.address, USDC.address])

  let shortsTracker = await deployContract("ShortsTracker", [vault.address])

  let positionRouter = await deployContract("PositionRouter", [vault.address, router.address, USDC.address, shortsTracker.address, depositFee, minExecutionFee])
  let referralStorage = await deployContract("ReferralStorage", [])
  const vaultPriceFeed = await deployContract("VaultPriceFeed", [])
  let distributor = await deployContract("TimeDistributor", [])
  let yieldTracker = await deployContract("YieldTracker", [usdg.address])

  let reader = await deployContract("Reader", [])

  let fastPriceEvents = await deployContract("FastPriceEvents", [])
  let fastPriceFeed = await deployContract("FastPriceFeed", [
    5 * 60, // _priceDuration
    120 * 60, // _maxPriceUpdateDelay
    0, // _minBlockInterval
    250, // _maxDeviationBasisPoints
    fastPriceEvents.address, // _fastPriceEvents
    tokenManager.address, // _tokenManager
    positionRouter.address // _positionRouter
  ])

  // vault utils
  // vaultUtils = await deployContract("VaultUtils", [vault.address]);

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
    usdcPriceFeed,
    ethPriceFeed,
    btcPriceFeed,
    fastPriceEvents,
    fastPriceFeed,
    yieldTracker,
    // vaultUtils
  }
}

module.exports = { deployGMXTestSystem };
