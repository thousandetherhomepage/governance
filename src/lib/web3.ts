import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

import type { Abi, AbiFunction } from 'abitype'

export const provider = createPublicClient({
  chain: mainnet,
  transport: http("https://mainnet.infura.io/v3/fa9f29a052924745babfc1d119465148"),
});

type Address = `0x${string}`

export function multicallViews(address: Address, abi: Abi): Promise<Record<string, any>> {
    // Load all views with no inputs
    const contracts = abi.filter((a: Abi[0]) => (
      a.type === 'function' &&
      a.stateMutability === 'view' &&
      a.inputs.length === 0
    )).map((a) => {
      return {
        address,
        abi: [a] as AbiFunction[],
        functionName: (a as AbiFunction).name,
      } as const
    });
    const keys = contracts.map((c) => c.functionName);
    return provider.multicall({
      contracts
    }).then(results => {
        return Object.fromEntries(
          keys.
            filter((_, i) => results[i].status === 'success').
            map((k, i) => [k, results[i].result])
        )
    });
  }

