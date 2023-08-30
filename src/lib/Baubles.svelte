<script lang="ts">
  import { onMount } from 'svelte';

  export const messages = [] as string[];

  export const baubles = {
    balances: [] as BaublesBalances["Ethereum"]["TokenBalance"],
  };

  import { GraphQLClient, gql } from 'graphql-request'

  const AIRSTACK_ENDPOINT = "https://api.airstack.xyz/gql";
  const client = new GraphQLClient(AIRSTACK_ENDPOINT);

  //const address = "baubles.kether.eth";
  const address = "0x6b175474e89094c44da98b954eedeac495271d0f"; // XXX

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

  onMount(() => {
    client.request(query).then(data => {
      if (!data) {
        messages.push("No data");
        return;
      }
      baubles.balances = (data as BaublesBalances).Ethereum.TokenBalance;
    }).catch(err => {
      messages.push(err.message);
    })
  })
</script>

<h2>Baubles</h2>

{#if messages.length > 0}
  <ul class="messages">
    {#each messages as message}
      <li>{message}</li>
    {/each}
  </ul>
{/if}

{#if baubles.balances.length > 0}
  <ul class="balances">
    {#each baubles.balances as balance}
      <li><a href="https://etherscan.io/address/{balance.owner.addresses[0]}"><code>{balance.owner.addresses[0]}</code></a> {balance.amount}</li>
    {/each}
  </ul>
{/if}


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

.messages {
  padding: 0;
  margin: 0;
  color: orange;
}
</style>
