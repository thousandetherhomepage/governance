<script lang="ts">
  import { onMount } from 'svelte';

  import { createPublicClient, http, parseAbi } from 'viem';
  import { mainnet } from 'viem/chains';

  import type { Abi, AbiFunction } from 'abitype'

  const client = createPublicClient({
    chain: mainnet,
    transport: http("https://mainnet.infura.io/v3/fa9f29a052924745babfc1d119465148"),
  });

  const sortitionABI = parseAbi([
    "function termExpires() view returns (uint256)",
    "function termNumber() view returns (uint256)",
    "function getMagistrate() view returns (address)",
    "function state() view returns (uint8)",
    "function nominatedPixels() view returns (uint256)",
    "function nominatedTokens() view returns (uint256[])",
  ]);

  type Address = `0x${string}`

  async function multicallViews(address: Address, abi: Abi): Promise<Record<string, any>> {
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
    return client.multicall({
      contracts
    }).then(results => {
        return Object.fromEntries(
          keys.
            filter((_, i) => results[i].status === 'success').
            map((k, i) => [k, results[i].result])
        )
    });
  }

  export let result : Record<string, any> = {};

  onMount(() => {
    multicallViews("0xa9a57f7d2A54C1E172a7dC546fEE6e03afdD28E2", sortitionABI).then((r) => {
      result = r;
    })
  })
</script>

<h2>Sortition</h2>

<ul>
  {#each Object.entries(result) as [key, value]}
    <li>{key}: {value}</li>
  {/each}
</ul>


<style lang="scss">
</style>
