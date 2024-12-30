import { axios } from 'src/utils';
import Web3 from 'web3';
import { TokenList } from '@uniswap/token-lists';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { ethers } from 'ethers';
import { AbiItem } from 'web3-utils';
import { getTokenListUrls, supportedChainIds, getContractAddress } from './configs';
import dotenv from 'dotenv';
import CrocSwapDexAbi from './abis/CrocSwapDex';
import CrocQueryAbi from './abis/CrocQuery';
import { MAX_SQRT_PRICE, MIN_SQRT_PRICE } from './constants';
import { CrocSurplusFlags, encodeSurplusArg } from './encoding/flags';
import CrocImpactAbi from './abis/CrocImpact';
import { roundQty, toDisplayQty } from './utils';
import { AbiCoder } from 'ethers/lib/utils';
dotenv.config();

export type SwapTokenLogicTokenList = common.Token[];
export type SwapTokenLogicParams = core.TokenToTokenExactInParams<{
  slippage?: number;
  poolIdx: number;
}>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<{
  baseToken: common.Token;
  quoteToken: common.Token;
  poolIdx: number;
  isBuy: boolean;
  inBaseQty: boolean;
  qty: number;
  limitPrice: number;
  minOut: number;
  reserveFlags: number;
}>;

export type SwapTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class SwapTokenLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'swap-token';
  static protocolId = 'bex';
  static readonly supportedChainIds = supportedChainIds;
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
    const { input, tokenOut } = params;
    const [base, quote] = this.isInputBase(input.token.address, tokenOut.address)
      ? [input.token, tokenOut]
      : [tokenOut, input.token];
    const isBuy = base === input.token;
    const inBaseQty = isBuy;
    const qty = Number(input.amount);
    const { slippage = DFLT_SWAP_ARGS.slippage, poolIdx } = params;
    const surplusFlags = [false, false];
    const maskSurplusArgs = encodeSurplusArg(surplusFlags as CrocSurplusFlags);
    //const amountOut = 10;
    const amountOut = await this.calcSlipQty(base, quote, poolIdx, isBuy, inBaseQty, qty, slippage);
    const output = new common.TokenAmount(tokenOut).setWei(amountOut);
    return {
      input,
      output,
      baseToken: base,
      quoteToken: quote,
      poolIdx,
      isBuy,
      inBaseQty,
      qty,
      limitPrice: await this.calcLimitPrice(isBuy),
      minOut: 0,
      reserveFlags: maskSurplusArgs,
    };
  }
  async build(fields: SwapTokenLogicFields, options?: SwapTokenLogicOptions) {
    const { input, baseToken, quoteToken, poolIdx, isBuy, inBaseQty, qty, limitPrice, minOut, reserveFlags } = fields;
    const HOT_PROXY_IDX = 1;
    const TIP = 0;
    const abi = new AbiCoder();
    const cmd = abi.encode(
      ['address', 'address', 'uint256', 'bool', 'bool', 'uint128', 'uint16', 'uint128', 'uint128', 'uint8'],
      [baseToken.address, quoteToken.address, poolIdx, isBuy, inBaseQty, qty, TIP, limitPrice, minOut, reserveFlags]
    );

    const inputs = [core.newLogicInput({ input: new common.TokenAmount(input.token, qty.toString()) })];
    const iface = new ethers.utils.Interface(CrocSwapDexAbi);
    const data = iface.encodeFunctionData('userCmd', [HOT_PROXY_IDX, cmd]);
    return core.newLogic({ to: getContractAddress(this.chainId, 'CrocSwapDex'), data, inputs });
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
    const impact = await this.crocImpact.methods
      .calcImpact(baseToken.address, quoteToken.address, poolIdx, isBuy, inBaseQty, qty, TIP, limitPrice)
      .call();
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
