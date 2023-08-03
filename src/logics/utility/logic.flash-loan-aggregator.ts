import * as aavev2 from '../aave-v2';
import * as aavev3 from '../aave-v3';
import * as balancerv2 from '../balancer-v2';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';

export const supportedFlashLoanLogics = [aavev2.FlashLoanLogic, aavev3.FlashLoanLogic, balancerv2.FlashLoanLogic];

export type FlashLoanAggregatorLogicTokenList = common.Token[];

export type FlashLoanAggregatorLogicParams = core.TokensOutFields;

export type FlashLoanAggregatorLogicQuotation = {
  protocolId: string;
  loans: common.TokenAmounts;
  repays: common.TokenAmounts;
  fees: common.TokenAmounts;
  feeBps: number;
  callback: string;
};

export type FlashLoanAggregatorLogicFields = core.FlashLoanFields<{ protocolId: string; referralCode?: number }>;

@core.LogicDefinitionDecorator()
export class FlashLoanAggregatorLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicBuilderInterface
{
  static readonly supportedChainIds = Array.from(
    supportedFlashLoanLogics.reduce((accumulator, FlashLoanLogic) => {
      for (const chainId of FlashLoanLogic.supportedChainIds) {
        accumulator.add(chainId);
      }
      return accumulator;
    }, new Set<number>())
  );

  async getTokenList() {
    const flashLoanLogics = supportedFlashLoanLogics.filter((FlashLoanLogic) =>
      FlashLoanLogic.supportedChainIds.includes(this.chainId)
    );
    const allTokens = await Promise.all(
      flashLoanLogics.map((FlashLoanLogic) => {
        const flashLoanLogic = new FlashLoanLogic(this.chainId, this.provider);
        return flashLoanLogic.getTokenList();
      })
    );
    const tmp: Record<string, boolean> = {};
    const tokenList: FlashLoanAggregatorLogicTokenList = [];
    for (const tokens of allTokens) {
      for (const token of tokens) {
        if (tmp[token.address]) continue;
        tokenList.push(token);
        tmp[token.address] = true;
      }
    }

    return tokenList;
  }

  async quote(params: FlashLoanAggregatorLogicParams) {
    const flashLoanLogics = supportedFlashLoanLogics.filter((FlashLoanLogic) =>
      FlashLoanLogic.supportedChainIds.includes(this.chainId)
    );

    const quotations: FlashLoanAggregatorLogicQuotation[] = [];
    await Promise.all(
      flashLoanLogics.map(async (FlashLoanLogic) => {
        const flashLoanLogic = new FlashLoanLogic(this.chainId, this.provider);
        try {
          const quotation = await flashLoanLogic.quote(params);
          quotations.push({
            protocolId: FlashLoanLogic.protocolId,
            callback: flashLoanLogic.callbackAddress,
            ...quotation,
          });
        } catch {}
      })
    );

    let quotation = quotations[0];
    for (let i = 1; i < quotations.length; i++) {
      if (quotations[i].feeBps < quotation.feeBps) {
        quotation = quotations[i];
      }
    }

    return quotation;
  }

  async build(fields: FlashLoanAggregatorLogicFields) {
    const { protocolId, ...others } = fields;
    const FlashLoanLogic = supportedFlashLoanLogics.find((Logic) => Logic.protocolId === protocolId)!;
    const routerLogic = await new FlashLoanLogic(this.chainId, this.provider).build(others);

    return routerLogic;
  }
}