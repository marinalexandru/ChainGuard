web3.providers.HttpProvider.prototype.sendAsync = web3.providers.HttpProvider.prototype.send

const UtilsExpectThrow = require('../node_modules/zeppelin-solidity/test/helpers/expectThrow')
const UtilsExpectEvent = require('../node_modules/zeppelin-solidity/test/helpers/expectEvent')

const BigNumber = web3.utils.BN
const AssetTracker = artifacts.require('./AssetTracker.sol')

require('chai')
    .use(require('chai-as-promised'))
    .use(require('bn-chai')(BigNumber))
    .should()

const hash1 = web3.utils.sha3("asset1")
const description1 = web3.utils.toHex("small description1")

const hash2 = web3.utils.sha3("asset2")
const description2 = web3.utils.toHex("small description2")

contract('AssetTracker', (
    [owner,holder1, holder2]) => {
        
        var mAssetTracker 

        beforeEach("deploy contract(s)", async () => {
            mAssetTracker = await AssetTracker.new({from: owner})
            await mAssetTracker.registerAsset(hash1, description1, {from: holder1})
        })

        it("should test asset sanity", async () => {
            assert.equal((await mAssetTracker.assets(hash1)).hash, hash1)            
            assert.equal((await mAssetTracker.assets(hash1)).assetOwner, holder1)            
            assert.equal((await mAssetTracker.assets(hash1)).shortDescription, padRight(description1,66))            
            assert.equal((await mAssetTracker.assets(hash1)).owned, true)
        })

        it ("should test that a registered asset cannot be registered again", async () => {
            const tx = mAssetTracker.registerAsset(hash1, description1, {from: holder2})
            await UtilsExpectThrow.expectThrow(tx)
        })
        
        it("should test that the asset can be unregistered by holder1", async () => {
            await mAssetTracker.unregisterAsset(hash1, {from: holder1})
            assert.equal((await mAssetTracker.assets(hash1)).owned, false)
        })

        it("should test that the asset can not be unregistered by holder2", async () => {
            const tx = mAssetTracker.unregisterAsset(hash1, {from: holder2})
            await UtilsExpectThrow.expectThrow(tx)
        })

        it("should test that asset can be transferred to holder 2", async () => {
            await mAssetTracker.transferAssetOwnership(hash1,holder2, {from: holder1})
            assert.equal((await mAssetTracker.assets(hash1)).assetOwner, holder2)
        })

        it("should test that holder 2 cannot call transfer asset", async () => {
            const tx = mAssetTracker.transferAssetOwnership(hash1,holder2, {from: holder2})
            await UtilsExpectThrow.expectThrow(tx)
        })

        it("should test event emission when registering", async () => {
            const tx = mAssetTracker.registerAsset(hash2, description2, {from: holder1});
            await UtilsExpectEvent.inTransaction(tx, "AssetRegistered")
        })

        it("should test event emission when unregistering", async () => {
            const tx = mAssetTracker.unregisterAsset(hash1, {from: holder1});
            await UtilsExpectEvent.inTransaction(tx, "AssetUnregistered")
        })

        it("should test event emission when transferring", async () => {
            const tx = mAssetTracker.transferAssetOwnership(hash1,holder2, {from: holder1})
            await UtilsExpectEvent.inTransaction(tx, "AssetOwnershipTransferred")            
        })
        
        function padRight(s, n , str) {
            return s + Array(n - String(s).length + 1).join(str || '0');
        }
        
    }

)