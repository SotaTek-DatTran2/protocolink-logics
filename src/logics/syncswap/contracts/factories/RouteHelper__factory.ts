/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from 'ethers';
import type { Provider } from '@ethersproject/providers';
import type { RouteHelper, RouteHelperInterface } from '../RouteHelper';

const _abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenA',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'tokenB',
        type: 'address',
      },
      {
        internalType: 'address[]',
        name: 'factories',
        type: 'address[]',
      },
      {
        internalType: 'address[]',
        name: 'baseTokens',
        type: 'address[]',
      },
      {
        internalType: 'address',
        name: 'master',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'getRoutePools',
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'address',
                name: 'pool',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'tokenA',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'tokenB',
                type: 'address',
              },
              {
                internalType: 'uint16',
                name: 'poolType',
                type: 'uint16',
              },
              {
                internalType: 'uint256',
                name: 'reserveA',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'reserveB',
                type: 'uint256',
              },
              {
                internalType: 'uint24',
                name: 'swapFeeAB',
                type: 'uint24',
              },
              {
                internalType: 'uint24',
                name: 'swapFeeBA',
                type: 'uint24',
              },
            ],
            internalType: 'struct RouteHelper.RoutePool[]',
            name: 'poolsDirect',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'pool',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'tokenA',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'tokenB',
                type: 'address',
              },
              {
                internalType: 'uint16',
                name: 'poolType',
                type: 'uint16',
              },
              {
                internalType: 'uint256',
                name: 'reserveA',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'reserveB',
                type: 'uint256',
              },
              {
                internalType: 'uint24',
                name: 'swapFeeAB',
                type: 'uint24',
              },
              {
                internalType: 'uint24',
                name: 'swapFeeBA',
                type: 'uint24',
              },
            ],
            internalType: 'struct RouteHelper.RoutePool[]',
            name: 'poolsA',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'pool',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'tokenA',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'tokenB',
                type: 'address',
              },
              {
                internalType: 'uint16',
                name: 'poolType',
                type: 'uint16',
              },
              {
                internalType: 'uint256',
                name: 'reserveA',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'reserveB',
                type: 'uint256',
              },
              {
                internalType: 'uint24',
                name: 'swapFeeAB',
                type: 'uint24',
              },
              {
                internalType: 'uint24',
                name: 'swapFeeBA',
                type: 'uint24',
              },
            ],
            internalType: 'struct RouteHelper.RoutePool[]',
            name: 'poolsB',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'pool',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'tokenA',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'tokenB',
                type: 'address',
              },
              {
                internalType: 'uint16',
                name: 'poolType',
                type: 'uint16',
              },
              {
                internalType: 'uint256',
                name: 'reserveA',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'reserveB',
                type: 'uint256',
              },
              {
                internalType: 'uint24',
                name: 'swapFeeAB',
                type: 'uint24',
              },
              {
                internalType: 'uint24',
                name: 'swapFeeBA',
                type: 'uint24',
              },
            ],
            internalType: 'struct RouteHelper.RoutePool[]',
            name: 'poolsBase',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct RouteHelper.RoutePools',
        name: 'routePools',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export class RouteHelper__factory {
  static readonly abi = _abi;
  static createInterface(): RouteHelperInterface {
    return new utils.Interface(_abi) as RouteHelperInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): RouteHelper {
    return new Contract(address, _abi, signerOrProvider) as RouteHelper;
  }
}
