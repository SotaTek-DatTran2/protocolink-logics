import { SwapTokenLogic, SwapTokenLogicFields, SwapTokenLogicOptions } from './logic.swap-token';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { getTokenListUrls } from './configs';
import { providers } from 'ethers';
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
});
