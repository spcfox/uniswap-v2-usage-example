import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const ALCHEMY_KEY = 'PUT_YOUR_API_KEY_HERE';
const BLOCK_NUMBER = 15984035;

const config: HardhatUserConfig = {
    solidity: '0.8.17',
    networks: {
        hardhat: {
            forking: {
                url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
                blockNumber: BLOCK_NUMBER,
            },
        },
    }
};

export default config;
