<script setup lang="ts">
import ligands_text from "@/assets/ligands.txt?raw";
const ligands = ref(ligands_text.trim().split("\n"));

const ligands_filtered = computed(() => {
  return ligands;
});
</script>
<template>
  <div class="flex flex-col items-center justify-center mx-4">
    <div class="input input-secondary mb-4">
      <span class="i-carbon-search">Ligands</span>
      <input type="search" class="grow" placeholder="Search" />
    </div>
    <div class="flex gap-2 flex-wrap w-full justify-center items-center">
      <button
        v-for="ligand in ligands_filtered.value"
        class="btn btn-secondary"
      >
        {{ ligand }}
      </button>
    </div>
  </div>
</template>
