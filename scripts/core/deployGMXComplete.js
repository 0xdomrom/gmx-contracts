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
  let bnb
  let bnbPriceFeed
  let btc
  let btcPriceFeed
  let eth
  let ethPriceFeed
  let dai
  let daiPriceFeed
  let distributor0
  let yieldTracker0
  let fastPriceFeed
  let fastPriceEvents
  let shortsTracker

  bnb = await deployContract("Token", [])
  bnbPriceFeed = await deployContract("PriceFeed", [])
  await bnb.connect(minter).deposit({ value: expandDecimals(100, 18) })

  btc = await deployContract("Token", [])
  btcPriceFeed = await deployContract("PriceFeed", [])

  eth = await deployContract("Token", [])
  ethPriceFeed = await deployContract("PriceFeed", [])

  dai = await deployContract("Token", [])
  daiPriceFeed = await deployContract("PriceFeed", [])

  busd = await deployContract("Token", [])
  busdPriceFeed = await deployContract("PriceFeed", [])

  vault = await deployContract("Vault", [])
  timelock = await deployContract("Timelock", [
    wallet.address,
    5 * 24 * 60 * 60,
    AddressZero,
    tokenManager.address,
    mintReceiver.address,
    expandDecimals(1000, 18),
    10, // marginFeeBasisPoints 0.1%
    500, // maxMarginFeeBasisPoints 5%
  ])

  usdg = await deployContract("USDG", [vault.address])
  router = await deployContract("Router", [vault.address, usdg.address, bnb.address])

  shortsTracker = await deployContract("ShortsTracker", [vault.address])

  positionRouter = await deployContract("PositionRouter", [vault.address, router.address, bnb.address, shortsTracker.address, depositFee, minExecutionFee])
  referralStorage = await deployContract("ReferralStorage", [])
  const vaultPriceFeed = await deployContract("VaultPriceFeed", [])
  distributor0 = await deployContract("TimeDistributor", [])
  yieldTracker0 = await deployContract("YieldTracker", [usdg.address])

  reader = await deployContract("Reader", [])

  fastPriceEvents = await deployContract("FastPriceEvents", [])
  fastPriceFeed = await deployContract("FastPriceFeed", [
    5 * 60, // _priceDuration
    120 * 60, // _maxPriceUpdateDelay
    2, // _minBlockInterval
    250, // _maxDeviationBasisPoints
    fastPriceEvents.address, // _fastPriceEvents
    tokenManager.address, // _tokenManager
    positionRouter.address // _positionRouter
  ])
 
  return {
    bnb, 
    btc,
    eth,
    dai,
    busd,
    vault, 
    timelock,
    usdg,
    router,
    shortsTracker,
    positionRouter,
    referralStorage, 
    distributor0,
    reader,
    vaultPriceFeed,
    daiPriceFeed,
    btcPriceFeed,
    fastPriceEvents,
    fastPriceFeed,
  }
}

module.exports = { deployGMXTestSystem };