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
import { MAX_SQRT_PRICE, MIN_SQRT_PRICE } from './constants';
import { CrocSurplusFlags, encodeSurplusArg } from './encoding/flags';
import CrocImpactAbi from './abis/CrocImpact';
import { roundQty, toDisplayQty } from './utils';
dotenv.config();

export type SwapTokenLogicTokenList = common.Token[];
export type SwapTokenLogicParams = core.TokenToTokenParams<{
  slippage?: number;
  poolTypeIdx: number;
}>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<{
  baseToken: common.Token;
  quoteToken: common.Token;
  poolTypeIdx: number;
  isBuy: boolean;
  inBaseQty: boolean;
  qty: number;
  reserveFlags: number;
  slippage?: number;
}>;

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
  crocImpact = new this.web3.eth.Contract(CrocImpactAbi as AbiItem[], process.env.CROC_IMPACT_CONTRACT!);

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
    let base: common.Token;
    let quote: common.Token;
    let isBuy: boolean;
    let inBaseQty: boolean;
    let qty: bigint;
    try {
      if (core.isTokenToTokenExactInParams(params)) {
        const { input, tokenOut } = params;

        [base, quote] = this.isInputBase(input.token.address, tokenOut.address)
          ? [input.token, tokenOut]
          : [tokenOut, input.token];
        isBuy = base === input.token;
        inBaseQty = isBuy;
        qty = BigInt(input.amount);
      } else {
        const { tokenIn, output } = params;
        [base, quote] = this.isInputBase(tokenIn.address, output.token.address)
          ? [tokenIn, output.token]
          : [output.token, tokenIn];
        isBuy = base == tokenIn;
        inBaseQty = isBuy;
        qty = BigInt(output.amount);
      }
    } catch {
      invariant(false, 'no route found or price impact too high');
    }
    const { slippage } = params;
    const surplusFlags = [false, false];
    const maskSurplusArgs = encodeSurplusArg(surplusFlags as CrocSurplusFlags);
    return {
      baseToken: base,
      quoteToken: quote,
      isBuy,
      inBaseQty,
      qty,
      slippage: slippage || DFLT_SWAP_ARGS.slippage,
      maskSurplusArgs,
    };
  }

  async queryPrice(base: string, quote: string, poolIdx: number) {
    const price = await this.crocQuery.methods.queryPrice(base, quote, poolIdx).call();
    return price;
  }

  isInputBase(input: string, output: string): boolean {
    return input.toLowerCase() < output.toLowerCase();
  }

  async calcLimitPrice(isBuy: boolean): Promise<bigint> {
    return isBuy ? MAX_SQRT_PRICE : MIN_SQRT_PRICE;
  }

  async calcSlipQty(
    baseToken: common.Token,
    quoteToken: common.Token,
    poolIdx: number,
    isBuy: boolean,
    inBaseQty: boolean,
    qty: number,
    slippage: number
  ): Promise<bigint> {
    const TIP = 0;
    const qtyIsBuy = isBuy === inBaseQty;
    const limitPrice = isBuy ? MAX_SQRT_PRICE : MIN_SQRT_PRICE;
    const impact = await this.crocImpact.methods.calcImpact(
      baseToken.address,
      quoteToken.address,
      poolIdx,
      isBuy,
      inBaseQty,
      qty,
      TIP,
      limitPrice
    );
    const baseQty = toDisplayQty(impact[0] < 0 ? -impact[0] : impact[0], baseToken.decimals);
    const quoteQty = toDisplayQty(impact[1] < 0 ? -impact[1] : impact[1], quoteToken.decimals);
    const sellQty = isBuy ? baseQty : quoteQty;
    const buyQty = isBuy ? quoteQty : baseQty;
    const slipQty = !qtyIsBuy ? parseFloat(sellQty) * (1 + slippage) : parseFloat(buyQty) * (1 - slippage);

    return !inBaseQty ? roundQty(slipQty, baseToken.decimals) : roundQty(slipQty, quoteToken.decimals);
  }
}

// Default slippage is set to 1%. User should evaluate this carefully for low liquidity
// pools of when swapping large amounts.
const DFLT_SWAP_ARGS = {
  slippage: 0.01,
};
