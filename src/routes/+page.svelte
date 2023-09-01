<script lang="ts">
  import Baubles from '$lib/Baubles.svelte';
  import Sortition from '$lib/Sortition.svelte';
  import Publisher from '$lib/Publisher.svelte';
</script>
  
<h2>Governance dashboard for the <a href="https://thousandetherhomepage.com">ThousandEtherHomepage</a></h2>


<section>
  <article>
    <Baubles />
  </article>

  <article>
    <Sortition />
  </article>

  <article>
    <Publisher />
  </article>
</section>

<style lang="scss">
section {
  display: flex;
  flex-wrap: wrap;
}

article {
  flex: 1;
  min-width: 600px;
  max-width: 600px;
  padding: 10px;
  margin: 10px;
  border: 1px solid rgba(0,0,0,0.2);
  flex-direction: column;
}

footer {
}
</style>
