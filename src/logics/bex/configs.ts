import * as common from '@protocolink/common';
import dotenv from 'dotenv';
dotenv.config();

export type ContractNames = 'CrocSwapDex' | 'CrocQuery' | 'CrocImpact';

export interface Config {
  chainId: number;
  tokenTransferProxyAddress: string;
  tokenListUrls: string[];
  contract: Record<ContractNames, string>;
}

const chainId = Number(process.env.CHAIN_ID) || 1;
export const configs: Config[] = [
  {
    chainId: chainId,
    tokenTransferProxyAddress: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
    tokenListUrls: [
      'https://raw.githubusercontent.com/berachain/default-lists/refs/heads/main/src/tokens/bartio/defaultTokenList.json',
    ],
    contract: {
      CrocSwapDex: '0xAB827b1Cc3535A9e549EE387A6E9C3F02F481B49',
      CrocQuery: '0xCfEa3579a06e2e9a596D311486D12B3a49a919Cd',
      CrocImpact: '0x31DAc06019D983f79cEAc819fAAC0612518597D7',
    },
  },
];

export const [supportedChainIds, configMap] = configs.reduce(
  (accumulator, config) => {
    accumulator[0].push(config.chainId);
    accumulator[1][config.chainId] = config;
    return accumulator;
  },
  [[], {}] as [number[], Record<number, Config>]
);

export function getTokenListUrls(chainId: number) {
  return configMap[chainId].tokenListUrls;
}

export function getTokenTransferProxyAddress(chainId: number) {
  return configMap[chainId].tokenTransferProxyAddress;
}

export function getContractAddress(chainId: number, name: ContractNames) {
  return configMap[chainId].contract[name];
}
