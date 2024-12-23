import { BuildSwapTxInput, SwapSide, constructSimpleSDK } from '@paraswap/sdk';
import { BigNumber, constants, providers } from 'ethers';
import { axios } from 'src/utils';
import Web3 from 'web3';
import { TokenList } from '@uniswap/token-lists';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { ethers } from 'ethers';
import { AbiItem } from 'web3-utils';
import { getTokenListUrls, supportedChainIds } from './configs';
import invariant from 'tiny-invariant';
import dotenv from 'dotenv';

import CrocQueryAbi from './abis/CrocQuery';
dotenv.config();

export type SwapTokenLogicTokenList = common.Token[];
export type SwapTokenLogicParams = core.TokenToTokenParams<{ slippage?: number; tip?: number; reserveFlags?: number }>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<
  Pick<BuildSwapTxInput, 'partner' | 'partnerAddress' | 'takeSurplus'> & {
    slippage?: number;
    tip: number;
    reserveFlags: number;
  }
>;

export type SwapTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class SwapTokenLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'swap-token';
  static protocolId = 'bex';
  static readonly supportedChainIds = supportedChainIds;
  get sdk() {
    return constructSimpleSDK({ chainId: this.chainId, axios });
  }

  web3 = new Web3(process.env.HTTP_RPC_URL!);
  crocQuery = new this.web3.eth.Contract(CrocQueryAbi as AbiItem[], process.env.CROC_QUERY_CONTRACT!);
  async getTokenList(): Promise<SwapTokenLogicTokenList> {
    const tokenListUrls = getTokenListUrls(this.chainId);
    const tokenLists: TokenList[] = [];
    await Promise.all(
      tokenListUrls.map(async (tokenListUrl) => {
        try {
          const resp = await axios.get(tokenListUrl);
          let data = resp.data;
          if ((resp.headers['content-type'] as string).includes('text/plain') && typeof data === 'string') {
            data = JSON.parse(data);
          }
          tokenLists.push(data);
        } catch {}
      })
    );

    const tmp: Record<string, boolean> = { [this.nativeToken.address]: true };
    const tokenList: SwapTokenLogicTokenList = [this.nativeToken];
    for (const { tokens } of tokenLists) {
      for (const { chainId, address, decimals, symbol, name, logoURI } of tokens) {
        const lowerCaseAddress = address.toLowerCase();

        if (
          tmp[lowerCaseAddress] ||
          chainId !== this.chainId ||
          !name ||
          !symbol ||
          !decimals ||
          !ethers.utils.isAddress(address)
        )
          continue;
        tokenList.push(new common.Token(chainId, address, decimals, symbol, name, logoURI));
        tmp[lowerCaseAddress] = true;
      }
    }

    return tokenList;
  }

  async quote(params: SwapTokenLogicParams) {
    try {
      // xd base, quote token
      let base: common.Token;
      let quote: common.Token;
      let isBuy: boolean;
      let inBaseQty: boolean;
      let qty: BigInt;
      if (core.isTokenToTokenExactInParams(params)) {
        const { input, tokenOut } = params;
        isBuy = isInputBase(input.token.address,tokenOut.address);
        inBaseQty = isBuy;
        [base, quote] = isBuy ? [input.token, tokenOut] : [tokenOut, input.token];
        qty = BigInt(input.amount);
      } else {
        const { tokenIn, output } = params;
        isBuy = isInputBase(tokenIn.address, output.token.address);
        [base, quote] = isBuy ? [tokenIn, output.token] : [output.token, tokenIn];
      }
      // xd isBuy, inBaseQty
      // xd pool address -> poolIdx
    } catch {
      invariant(false, 'no route found or price impact too high');
    }
  }
  async queryPrice(base: string, quote: string, poolIdx: number) {
    const price = await this.crocQuery.methods.queryPrice(base, quote, poolIdx).call();
    return price;
  }
  
  function isInputBase(input: string, output: string): boolean {
    return input.toLowerCase() < output.toLowerCase();
  }
}
