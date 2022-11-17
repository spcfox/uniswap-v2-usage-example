# Uniswap V2 usage example

This is a simple example of how to create your own token and use it with Uniswap V2.

## Run
To use, you need to install [Node.js](https://nodejs.org)
and get API key for [Alchemy](https://www.alchemy.com)

1. Put your Alchemy API key in [hardhat.config.ts](hardhat.config.ts)
2. `npm install`
3. `npx hardhat test`

## Output example
```
  MyTokenTest
    Deployment
MyToken was deployed at 0x88dEbB694C18a45D33399eb843BcA8E5626211f9
      ✔ Should mint the right amount (11592ms)
    Uniswap pair MYTKN/USDT
MyToken was deployed at 0x88dEbB694C18a45D33399eb843BcA8E5626211f9
Uniswap address: 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
Pair was created at 0x340376735D5A1ED4b2a54A7849F8667C8A3B6c28
------------------
Before add liquidity:
        My MYTKN balance: 1000000000000000000000
        My USDT balance: 1621601985181101
        Pair MYTKN balance: 0
        Pair USDT balance: 0
        Pair MYTKN reserved: 0
        Pair USDT reserved: 0
        Liquidity tokens: 0
------------------
After transfer liquidity:
        My MYTKN balance: 999999999999995000000
        My USDT balance: 1621601982181101
        Pair MYTKN balance: 5000000
        Pair USDT balance: 3000000
        Pair MYTKN reserved: 0
        Pair USDT reserved: 0
        Liquidity tokens: 0
------------------
After mint:
        My MYTKN balance: 999999999999995000000
        My USDT balance: 1621601982181101
        Pair MYTKN balance: 5000000
        Pair USDT balance: 3000000
        Pair MYTKN reserved: 5000000
        Pair USDT reserved: 3000000
        Liquidity tokens: 3871983
------------------
After transfer 2:
        My MYTKN balance: 999999999999994000000
        My USDT balance: 1621601982181101
        Pair MYTKN balance: 6000000
        Pair USDT balance: 3000000
        Pair MYTKN reserved: 5000000
        Pair USDT reserved: 3000000
        Liquidity tokens: 3871983
------------------
Swap 1000000 MYTKN for 498749 USDT:
        My MYTKN balance: 999999999999994000000
        My USDT balance: 1621601982679850
        Pair MYTKN balance: 6000000
        Pair USDT balance: 2501251
        Pair MYTKN reserved: 6000000
        Pair USDT reserved: 2501251
        Liquidity tokens: 3871983
------------------
After burn:
        My MYTKN balance: 999999999999999998450
        My USDT balance: 1621601985180455
        Pair MYTKN balance: 1550
        Pair USDT balance: 646
        Pair MYTKN reserved: 1550
        Pair USDT reserved: 646
        Liquidity tokens: 0
      ✔ Test (1022ms)


  2 passing (13s)
```
