import * as common from '@protocolink/common';
import dotenv from 'dotenv';
dotenv.config();

export interface Config {
  chainId: number;
  tokenTransferProxyAddress: string;
  tokenListUrls: string[];
}

const chainId = Number(process.env.CHAIN_ID) || 1;
export const configs: Config[] = [
  {
    chainId: chainId,
    tokenTransferProxyAddress: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
    tokenListUrls: [
      'https://raw.githubusercontent.com/berachain/default-lists/refs/heads/main/src/tokens/bartio/defaultTokenList.json',
    ],
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
