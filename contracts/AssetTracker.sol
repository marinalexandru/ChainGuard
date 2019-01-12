pragma solidity 0.5.0;


/**
 * @title Asset tracker
 * @notice Traces digital assets back to their owner.
 * @dev Traceback functionality is provided by assigning an owner address to an asset.
 */
contract AssetTracker {

    /**
    * @dev Fired when an Asset is first registered in the system or it's beeing re-registered after an unregister.
    */
    event AssetRegistered(bytes32 indexed _hash);

    /**
    * @dev Fired when the last owner of an asset decided to unregister the asset. 
    */
    event AssetUnregistered(bytes32 indexed _hash);
    
    /**
    * @dev Fired when someone transferred the asset. 
    */
    event AssetOwnershipTransferred(bytes32 indexed _hash, address _from, address _to);

    struct Asset {
        bytes32 hash;
        address assetOwner;
        bytes32 shortDescription;
        uint256 createdAt;
        bool owned;
    }

    /**
     * @dev The unique key is the hash of the asset.
     */
    mapping (bytes32 => Asset) public assets;

    /**
    * @param _hash Sha3 hash of a digital uploaded asset.
    * @param _shortDescription 32 Byte description of the registered asset.
    */
    function registerAsset(bytes32 _hash, bytes32 _shortDescription) external {
        require(!assets[_hash].owned);
       
        assets[_hash] = Asset(_hash, msg.sender, _shortDescription, now, true);
       
        emit AssetRegistered(_hash);
    }

    /**
    * @param _hash Sha3 hash of a digital owned asset.
    */
    function unregisterAsset(bytes32 _hash) external onlyOwnerOfAsset(_hash) {
        delete assets[_hash];
        emit AssetUnregistered(_hash);
    }

    /**
    * @notice Action is irreversible!
    * @param _hash Sha3 hash of a digital owned asset.
    * @param _newOwner The new owner of the asset.
    */
    function transferAssetOwnership(bytes32 _hash, address _newOwner) external onlyOwnerOfAsset(_hash) {
        
        assets[_hash].assetOwner = _newOwner;

        emit AssetOwnershipTransferred(_hash, msg.sender, _newOwner);
    }

    /**
    * @dev The caller of a function that has this modifier must be the asset owner.
    */
    modifier onlyOwnerOfAsset(bytes32 _hash) {
        require(msg.sender == assets[_hash].assetOwner);
        _;
    }

}