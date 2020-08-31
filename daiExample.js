import Maker from '@makerdao/dai';
import pkg from '@makerdao/dai-plugin-mcd';
const { McdPlugin, ETH, DAI } = pkg;

// you provide these values
const infuraKey = '';     // from infura.io
const myPrivateKey = '';  // Wallet private key
const ownerAddress = '';  // Wallet address

async function runMakeVault() {

    const maker = await Maker.create('http', {
	    plugins: [McdPlugin],
	    url: `https://kovan.infura.io/v3/${infuraKey}`,
	    privateKey: myPrivateKey
	});

    // verify that the private key was read correctly
    console.log('get addr');
    console.log(maker.currentAddress());

    // make sure the current account owns a proxy contract;
    // create it if needed. the proxy contract is used to 
    // perform multiple operations in a single transaction
    try {
	await maker.service('proxy').ensureProxy();
    } catch(e) {
	console.log('error', e);
	throw e;
    }

    console.log('get service');

    // use the "vault manager" service to work with vaults
    const manager = maker.service('mcd:cdpManager');

    console.log('get service', manager);
  
    // ETH-A is the name of the collateral type; in the future,
    // there could be multiple collateral types for a token with
    // different risk parameters
    let vault;
    try {
	vault = await manager.openLockAndDraw(
					      'ETH-A', 
					      ETH(1), 
					      DAI(100)
					      );
    } catch(e) {
	console.log('error on openLockAndDraw', e);
	throw e;
    }

    console.log('vault id', vault.id);
    console.log('vault debt value', vault.debtValue); // '1000.00 DAI'
}


async function runGetBalance() {
    const maker = await Maker.create('http', {
	    plugins: [McdPlugin],
	    url: `https://kovan.infura.io/v3/${infuraKey}`
	});

    const manager = maker.service('mcd:cdpManager');
    const proxyAddress = await maker.service('proxy').getProxyAddress(ownerAddress);
    console.log('proxyAddress', proxyAddress);
    const data = await manager.getCdpIds(proxyAddress); // returns list of { id, ilk } objects
    const vault = await manager.getCdp(data[0].id);

    console.log('Collateral:', vault.collateralAmount.toString());
    console.log('Debt value:', vault.debtValue.toString());
    console.log('Liquididation price:', vault.liquidationPrice.toString());

    // console.log([
    //   vault.collateralAmount, // amount of collateral tokens
    //   vault.collateralValue,  // value in USD, using current price feed values
    //   vault.debtValue,        // amount of Dai debt
    //   vault.collateralizationRatio, // collateralValue / debt
    //   vault.liquidationPrice  // vault becomes unsafe at this price
    // ].map(x => x.toString());

}

runGetBalance();
