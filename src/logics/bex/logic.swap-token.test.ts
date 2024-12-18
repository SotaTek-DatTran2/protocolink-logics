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
const provider = new providers.JsonRpcProvider(process.env.CHAIN_ID || '');
const nativeToken = new common.Token(
  chainId,
  '0x7507c1dc16935b82698e4c63f2746a2fcf994df8',
  18,
  'BERA',
  'Berachain Token',
  'https://artio-static-asset-public.s3.ap-southeast-1.amazonaws.com/assets/bera.png'
);
describe('BEX SwapTokenLogic', function () {
  it('Test getTokenListUrls', async () => {
    const urls = getTokenListUrls(chainId);
    console.log(urls);
    expect(urls).to.have.lengthOf.above(0);
  });
  it(`network: ${common.toNetworkId(chainId)}`, async function () {
    const logic = new SwapTokenLogic(chainId);
    const tokenList = await logic.getTokenList();
    console.log(tokenList);
    expect(tokenList).to.have.lengthOf.above(0);
  });
});
