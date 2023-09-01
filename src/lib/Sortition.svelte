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
    "function termStarted() view returns (uint256)",
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

  const ELECTION_STATES = [
    //  { NOMINATING, WAITING_FOR_ENTROPY, GOT_ENTROPY }
    "Accepting Nominations",
    "Election Called: Tabulating Results",
    "Election Completed: New term ready to begin",
  ]
</script>

<h2>👑 Sortition</h2>

<dl>
  <dt>Acting Magistrate</dt>
  <dd><a href="https://etherscan.io/address/{result['getMagistrate']}">{result['getMagistrate']}</a>
      for {((+new Date() - Number(result['termStarted'])*1000) / (60*60*24*1000)).toFixed(1)} days
  </dd>
  <dt>Current Term</dt>
  <dd>#{Number(result['termNumber'])+1}</dd>
  <dt>Current Term expires:</dt>
  <dd>
    {new Date(Number(result['termExpires']) * 1000)}
    {#if result['termExpires'] < Date.now() / 1000}
      <strong style="color: red;">(Expired)</strong>
    {/if}
  </dd>
  <dt>Election Phase</dt>
  <dd>{ELECTION_STATES[result['state']]}</dd>
  <dt>Total pixels nominated</dt>
  <dd>{result['nominatedPixels']}</dd>
</dl>

<p>
    📝 <a href="https://medium.com/@ketherhomepage/thousand-ether-homepage-sortition-instructions-6ef7a11e3d14">Sortition Instructions</a>
</p>

<style lang="scss">
  dd {
    font-weight: bold;
    padding: 0.5 1em;
  }
  dt {
    margin-top: 0.5em;
  }
</style>
