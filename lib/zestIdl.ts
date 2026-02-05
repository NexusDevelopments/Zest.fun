import { Idl } from '@coral-xyz/anchor';

const zestIdl: Idl = {
  version: '0.1.0',
  name: 'zest',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        { name: 'launchpad', isMut: true, isSigner: false },
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'treasury', isMut: true, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'bondingCurveConstant', type: 'u64' }],
    },
    {
      name: 'createToken',
      accounts: [
        { name: 'launchpad', isMut: true, isSigner: false },
        { name: 'tokenInfo', isMut: true, isSigner: false },
        { name: 'tokenMint', isMut: true, isSigner: false },
        { name: 'creatorTokenAccount', isMut: true, isSigner: false },
        { name: 'creator', isMut: true, isSigner: true },
        { name: 'associatedTokenProgram', isMut: false, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'name', type: 'string' },
        { name: 'symbol', type: 'string' },
        { name: 'uri', type: 'string' },
        { name: 'bondingCurveConstant', type: 'u64' },
      ],
    },
    {
      name: 'mintToken',
      accounts: [
        { name: 'launchpad', isMut: true, isSigner: false },
        { name: 'userAccount', isMut: true, isSigner: false },
        { name: 'tokenInfo', isMut: true, isSigner: false },
        { name: 'tokenMint', isMut: true, isSigner: false },
        { name: 'userTokenAccount', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'treasury', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'amount', type: 'u64' }],
    },
  ],
  accounts: [
    {
      name: 'launchpad',
      type: {
        kind: 'struct',
        fields: [
          { name: 'authority', type: 'publicKey' },
          { name: 'treasury', type: 'publicKey' },
          { name: 'bondingCurveConstant', type: 'u64' },
          { name: 'totalSupply', type: 'u64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'tokenInfo',
      type: {
        kind: 'struct',
        fields: [
          { name: 'creator', type: 'publicKey' },
          { name: 'mint', type: 'publicKey' },
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
          { name: 'uri', type: 'string' },
          { name: 'bondingCurveConstant', type: 'u64' },
          { name: 'totalSupply', type: 'u64' },
          { name: 'createdAt', type: 'i64' },
        ],
      },
    },
  ],
} as const;

export default zestIdl;
