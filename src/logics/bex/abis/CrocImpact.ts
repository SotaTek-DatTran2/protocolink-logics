export const CrocImpactAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'dex',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'calcImpact',
    inputs: [
      {
        name: 'base',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'quote',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'poolIdx',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'isBuy',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'inBaseQty',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'qty',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'poolTip',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: 'limitPrice',
        type: 'uint128',
        internalType: 'uint128',
      },
    ],
    outputs: [
      {
        name: 'baseFlow',
        type: 'int128',
        internalType: 'int128',
      },
      {
        name: 'quoteFlow',
        type: 'int128',
        internalType: 'int128',
      },
      {
        name: 'finalPrice',
        type: 'uint128',
        internalType: 'uint128',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'dex_',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
];
