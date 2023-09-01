<script lang="ts">
  import { onMount } from 'svelte';

  import { parseAbi } from 'viem';
  import { provider, multicallViews } from './web3';

  export const messages = [] as string[];

  export const baubles = {
    balances: [] as BaublesBalances["Ethereum"]["TokenBalance"],
  };

  const baublesABI = parseAbi([
    "function totalSupply() view returns (uint256)",
    "function lastMintedTerm() view returns (uint256)",
  ]);

  import { GraphQLClient, gql } from 'graphql-request'

  const AIRSTACK_ENDPOINT = "https://api.airstack.xyz/gql";
  const client = new GraphQLClient(AIRSTACK_ENDPOINT);

  const address = "0xF383C0E93D14790a81F85B565EDfda4BAa6F9437"; // "baubles.kether.eth";
  //const address = "0x6b175474e89094c44da98b954eedeac495271d0f"; // DAI placeholder

  const query = gql`query BaublesBalances {
    Ethereum: TokenBalances(
      input: {filter: {tokenAddress: {_eq: "${address}"}, tokenType: {_eq: ERC20}}, blockchain: ethereum, limit: 50}
      ) {
      TokenBalance {
        owner {
          addresses
        }
        amount
      }
    }
  }
  `;

  interface BaublesBalances {
    Ethereum: {
      TokenBalance: {
        owner: {
          addresses: string[];
        };
        amount: string;
      }[];
    };
  }

  export let result : Record<string, any> = {};


  onMount(() => {
    client.request(query).then(data => {
      data = data as BaublesBalances;
      if (!data || !data.Ethereum.TokenBalance) {
        messages.push("No data");
        return;
      }
      baubles.balances = data.Ethereum.TokenBalance;
    }).catch(err => {
      messages.push(err.message);
    })

    multicallViews(address, baublesABI).then((r) => {
          console.log(r);
      result = r;
    })
  })
</script>

<h2>🎊 Baubles</h2>

<dt>Contract</dt>
<dd><a href="https://etherscan.com/address/baubles.kether.eth">baubles.kether.eth</a></dd>
<dt>Total Supply</dt>
<dd>{result['totalSupply']}</dd>
<dt>Last Minted Term</dt>
<dd>{result['lastMintedTerm']} <aside>Note: 1621 BAUB can be minted per term</aside></dd>

{#if messages.length > 0}
  <ul class="messages">
    {#each messages as message}
      <li>{message}</li>
    {/each}
  </ul>
{/if}

<h3>Balances</h3>
{#if baubles.balances.length > 0}
  <ul class="balances">
    {#each baubles.balances as balance}
      <li><a href="https://etherscan.io/address/{balance.owner.addresses[0]}"><code>{balance.owner.addresses[0]}</code></a> {balance.amount}</li>
    {/each}
  </ul>
{:else}
  <ul class="balances"><li>No holders.</li></ul>
{/if}

<p>
    📝 <a href="https://medium.com/@ketherhomepage/thousand-ether-homepage-age-of-the-jubilee-963fd69c5d7">Baubles Instructions</a>
</p>

<style lang="scss">
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.balances {
  text-align: left;

  code { 
    margin-right: 1em;
  }
}

dd {
  font-weight: bold;
  margin-left: 0.5em;
  padding: 0.5em;
}
dt {
  margin-top: 0.5em;
}

aside {
  display: inline-block;
  margin-left: 2em;
  font-size: 0.8em;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.6);
}

.messages {
  padding: 0;
  margin: 0;
  color: orange;
}
</style>
