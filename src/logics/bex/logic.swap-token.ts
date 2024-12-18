import { BuildSwapTxInput, SwapSide, constructSimpleSDK } from '@paraswap/sdk';
import { BigNumber, constants, providers } from 'ethers';
import { axios } from 'src/utils';

import { TokenList } from '@uniswap/token-lists';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { ethers } from 'ethers';
import { getTokenListUrls, supportedChainIds } from './configs';
import dotenv from 'dotenv';
dotenv.config();

export type SwapTokenLogicTokenList = common.Token[];
export type SwapTokenLogicParams = core.TokenToTokenParams<{ slippage?: number; excludeDEXS?: string[] }>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<
  Pick<BuildSwapTxInput, 'partner' | 'partnerAddress' | 'takeSurplus'> & { slippage?: number; excludeDEXS?: string[] }
>;

export type SwapTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class SwapTokenLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  quote(params: any) {
    throw new Error('Method not implemented.');
  }
  build(fields: any, options?: any): Promise<core.DataType.LogicStruct> {
    throw new Error('Method not implemented.');
  }
  static id = 'swap-token';
  static protocolId = 'bex';
  static readonly supportedChainIds = supportedChainIds;
  get sdk() {
    return constructSimpleSDK({ chainId: this.chainId, axios });
  }
  static chainId = process.env.CHAIN_ID;
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
}
