// import { bloctoWallet } from '../index';

// /*
//     Basic tests to make sure basic variables and functions are defined on the wallet
// */

// describe('BloctoWallet', () => {
//     const chains = [{
//         name: 'Ethereum',
//         id: 1,
//         network: 'mainnet',
//         nativeCurrency: { name: 'Ether', decimals: 18, symbol: 'ETH' },
//         rpcUrls: { default: { http: ['https://mainnet.infura.io/v3/'] }, public: { http: ['https://mainnet.infura.io/v3/'] } },
//     }]
//     const wallet = bloctoWallet({ chains });

//     test('defines name', () => {
//         expect(typeof wallet.name).toBe('string');
//     });

//     test('defines id', () => {
//         expect(typeof wallet.id).toBe('string');
//     });

//     test('defines icon', () => {
//         expect(typeof wallet.iconUrl).toBe('string');
//     });

//     test('defines connect()', () => {
//         expect(typeof wallet.connect).toBe('function');
//     });

//     test('defines account()', () => {
//         expect(typeof wallet.account).toBe('function');
//     });

//     test('defines disconnect()', () => {
//         expect(typeof wallet.disconnect).toBe('function');
//     });

//     test('defines signAndSubmitTransaction()', () => {
//         expect(typeof wallet.signAndSubmitTransaction).toBe('function');
//     });

//     test('defines signMessage()', () => {
//         expect(typeof wallet.signMessage).toBe('function');
//     });

//     test('defines onNetworkChange()', () => {
//         expect(typeof wallet.onNetworkChange).toBe('function');
//     });

//     test('defines onAccountChange()', () => {
//         expect(typeof wallet.onAccountChange).toBe('function');
//     });

//     test('defines network()', () => {
//         expect(typeof wallet.network).toBe('function');
//     });
// });
