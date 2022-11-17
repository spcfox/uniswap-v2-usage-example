import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { abi as UniswapV2FactoryAbi } from '@uniswap/v2-core/build/UniswapV2Factory.json';
import { abi as UniswapV2FactoryPair } from '@uniswap/v2-core/build/UniswapV2Pair.json';
import { ChainId, Token, TokenAmount, Pair } from '@uniswap/sdk';
import UsdtAbi from '../resources/UsdtAbi.json';

const signerAddress = '0x5041ed759Dd4aFc3a72b8192C143F72f4724081A';
const uniswapV2FactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

describe('MyTokenTest', function() {
    async function deploy() {
        const signer = await ethers.getImpersonatedSigner(signerAddress);

        const decimals = 18;
        const count = 1000;
        const amount = BigNumber.from(10).pow(decimals).mul(count);

        const MyToken = await ethers.getContractFactory('MyToken');
        const myToken = await MyToken.connect(signer).deploy(amount);

        return { myToken, amount, signer: signer };
    }

    describe('Deployment', function() {
        it('Should mint the right amount', async function() {
            const { myToken, amount, signer } = await loadFixture(deploy);

            console.log(`MyToken was deployed at ${myToken.address}`);

            expect(amount)
                .to.equal(await myToken.connect(signer).totalSupply(), 'total supply should be equals amount')
                .to.equal(await myToken.connect(signer).balanceOf(signer.address), 'owner balance should be equals amount');
        });
    });

    describe('Uniswap pair MYTKN/USDT', function() {
        it('Test', async function() {
            const myTokenLiquidityAmount = 5_000_000;
            const usdtLiquidityAmount = 3_000_000;
            const myTokenSwapAmount = 1_000_000;

            const { myToken, signer } = await loadFixture(deploy);

            console.log(`MyToken was deployed at ${myToken.address}`);

            const usdt = await ethers.getContractAt(UsdtAbi, usdtAddress);
            const uniswapFactory = await ethers.getContractAt(UniswapV2FactoryAbi, uniswapV2FactoryAddress);

            console.log(`Uniswap address: ${uniswapFactory.address}`);

            const [token0, token1] = myToken.address < usdt.address ? [myToken, usdt] : [usdt, myToken];
            const token0Symbol = await token0.symbol();
            const token1Symbol = await token1.symbol();

            const myTokenUniswap = new Token(ChainId.MAINNET, myToken.address, await myToken.decimals());
            const usdtUniswap = new Token(ChainId.MAINNET, usdt.address, await usdt.decimals());

            const pairAddressBeforeCreate = await uniswapFactory.connect(signer).getPair(token0.address, token1.address);
            expect(pairAddressBeforeCreate).to.equal('0x0000000000000000000000000000000000000000', 'Pair should not exist');

            await uniswapFactory.connect(signer).createPair(myToken.address, usdt.address);
            const pairAddress = await uniswapFactory.connect(signer).getPair(myToken.address, usdt.address);
            expect(pairAddress).to.equal(Pair.getAddress(myTokenUniswap, usdtUniswap), 'invalid pair address');

            console.log(`Pair was created at ${pairAddress}`);

            const pairContract = await ethers.getContractAt(UniswapV2FactoryPair, pairAddress);
            expect(await pairContract.connect(signer).token0()).to.equal(token0.address, 'invalid token0 address');
            expect(await pairContract.connect(signer).token1()).to.equal(token1.address, 'invalid token1 address');

            const pairToken0 = await pairContract.connect(signer).token0();
            const pairToken1 = await pairContract.connect(signer).token1();
            expect(pairToken0).to.equal(token0.address, 'invalid token0 address');
            expect(pairToken1).to.equal(token1.address, 'invalid token1 address');

            async function printBalances(title: string) {
                const [reserve0, reserve1] = await pairContract.connect(signer).getReserves();
                console.log('------------------');
                console.log(`${title}:`);
                console.log(`\tMy ${token0Symbol} balance: ${await token0.connect(signer).balanceOf(signer.address)}`);
                console.log(`\tMy ${token1Symbol} balance: ${await token1.connect(signer).balanceOf(signer.address)}`);
                console.log(`\tPair ${token0Symbol} balance: ${await token0.connect(signer).balanceOf(pairAddress)}`);
                console.log(`\tPair ${token1Symbol} balance: ${await token1.connect(signer).balanceOf(pairAddress)}`);
                console.log(`\tPair ${token0Symbol} reserved: ${reserve0}`);
                console.log(`\tPair ${token1Symbol} reserved: ${reserve1}`);
                console.log(`\tLiquidity tokens: ${await pairContract.connect(signer).balanceOf(signer.address)}`);
            }

            await printBalances('Before add liquidity');

            await myToken.connect(signer).transfer(pairContract.address, myTokenLiquidityAmount);
            await usdt.connect(signer).transfer(pairContract.address, usdtLiquidityAmount);

            await printBalances('After transfer liquidity');

            await pairContract.connect(signer).mint(signer.address);
            await printBalances('After mint');

            await myToken.connect(signer).transfer(pairContract.address, myTokenSwapAmount);
            await printBalances('After transfer 2');

            const pair = new Pair(
                new TokenAmount(myTokenUniswap, myTokenLiquidityAmount.toString()),
                new TokenAmount(usdtUniswap, usdtLiquidityAmount.toString())
            );
            const usdtAmount = pair.getOutputAmount(new TokenAmount(myTokenUniswap, myTokenSwapAmount.toString()))[0].raw.toString();

            const [amount0Out, amount1Out] = token0.address === myToken.address ? [0, usdtAmount] : [usdtAmount, 0];

            await pairContract.connect(signer).swap(amount0Out, amount1Out, signer.address, '0x');
            await printBalances(`Swap ${myTokenSwapAmount} ${token0Symbol} for ${usdtAmount} ${token1Symbol}`);

            const liquidityTokens = await pairContract.connect(signer).balanceOf(signer.address);
            await pairContract.connect(signer).transfer(pairContract.address, liquidityTokens);
            await pairContract.connect(signer).burn(signer.address);
            await printBalances('After burn');

            expect(await pairContract.balanceOf(signer.address)).to.equal(0, 'Liquidity tokens should be zero');
            expect(await pairContract.totalSupply())
                .to.equal(await pairContract.MINIMUM_LIQUIDITY(), 'Total supply should be equals MINIMUM_LIQUIDITY');
        });
    });
});
