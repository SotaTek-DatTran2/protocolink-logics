import { SwapTokenLogic, SwapTokenLogicFields, SwapTokenLogicOptions } from './logic.swap-token';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { getTokenListUrls } from './configs';
import dotenv from 'dotenv';
dotenv.config();
const chainId = Number(process.env.CHAIN_ID) || 1;

describe('BEX SwapTokenLogic', function () {
  it('Test getTokenListUrls', async () => {
    const urls = getTokenListUrls(chainId);
    console.log(urls);
    expect(urls).to.have.lengthOf.above(0);
  });
  it('should logic get token list', async function () {
    const logic = new SwapTokenLogic(chainId);
    const tokenList = await logic.getTokenList();
    // console.log(tokenList);
    expect(tokenList).to.have.lengthOf.above(0);
  });
  it('should query pair price', async () => {
    const logic = new SwapTokenLogic(chainId);
    console.log(
      await logic.queryPrice(
        '0x0e4aaf1351de4c0264c5c7056ef3777b41bd8e03',
        '0x7507c1dc16935b82698e4c63f2746a2fcf994df8',
        36000
      )
    );
  });
  it('should get swap token quotation', async () => {
    const logic = new SwapTokenLogic(chainId);
    const tokenList = await logic.getTokenList();
    const tokenIn = tokenList[9]; //HONEY
    const tokenOut = tokenList[7]; //WBERA
    console.log(
      await logic.quote({
        input: new common.TokenAmount(
          {
            chainId: tokenIn.chainId,
            address: tokenIn.address,
            decimals: tokenIn.decimals,
            symbol: tokenIn.symbol,
            name: tokenIn.name,
          },
          '1'
        ),
        tokenOut: new common.Token({
          chainId: tokenOut.chainId,
          address: tokenOut.address,
          decimals: tokenOut.decimals,
          symbol: tokenOut.symbol,
          name: tokenOut.name,
        }),
        poolIdx: 36000,
      })
    );
  });
  it('should build transaction', async () => {
    const logic = new SwapTokenLogic(chainId);
    const tokenList = await logic.getTokenList();
    const tokenIn = tokenList[9]; //HONEY
    const tokenOut = tokenList[7]; //WBERA
    const quotation = await logic.quote({
      input: new common.TokenAmount(
        {
          chainId: tokenIn.chainId,
          address: tokenIn.address,
          decimals: tokenIn.decimals,
          symbol: tokenIn.symbol,
          name: tokenIn.name,
        },
        '1000'
      ),
      tokenOut: new common.Token({
        chainId: tokenOut.chainId,
        address: tokenOut.address,
        decimals: tokenOut.decimals,
        symbol: tokenOut.symbol,
        name: tokenOut.name,
      }),
      poolIdx: 36000,
    });
    console.log(await logic.build(quotation));
  });
});
