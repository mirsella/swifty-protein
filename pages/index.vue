<script setup lang="ts">
import ligands_text from "@/assets/ligands.txt?raw";
const ligands = ref(ligands_text.trim().split("\n"));

const ligands_filtered = computed(() => {
  if (search.value.length > 0) {
    return ligands.value.filter((l) =>
      l.toLowerCase().includes(search.value.toLowerCase()),
    );
  }
  return ligands.value;
});

const search = ref("");
</script>
<template>
  <div class="flex flex-col items-center justify-center mx-4">
    <div class="input input-secondary mb-4">
      <span class="i-carbon-search">Ligands</span>
      <input type="search" v-model="search" class="grow" placeholder="Search" />
      <button
        class="i-carbon-trash-can size-8 hover:cursor-pointer hover:scale-105 transition-all duration-100 hover:bg-primary"
        @click="search = ''"
      ></button>
    </div>
    <div class="flex gap-2 flex-wrap w-full justify-center items-center">
      <button v-for="ligand in ligands_filtered" class="btn btn-secondary">
        {{ ligand }}
      </button>
    </div>
  </div>
</template>
