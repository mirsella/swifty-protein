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

const error = ref("");
const error_modal = useTemplateRef("error_modal");
onMounted(() => {
  error_modal.value?.addEventListener("close", () => {
    error.value = "";
  });
});
watch(error, () => {
  if (error.value.length > 0) {
    error_modal.value?.showModal();
  }
});

const search = ref("");
const loading = ref<null | string>(null);
const ligandData = useLigandData()

async function fetchLigand(ligand: string) {
  if (loading.value === ligand) {
    return;
  }
  loading.value = ligand;
  try {
    const response = await fetch(
      `https://files.rcsb.org/ligands/download/${ligand}_ideal.sdf`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch ligand: ${response.statusText}`);
    }
    ligandData.value = await response.text();
    navigateTo(`/visualizer/${ligand}`);
  } catch (e) {
    console.error(e);
    error.value = (e as Error).message;
  } finally {
    loading.value = null;
  }
}
</script>
<template>
  <div class="flex flex-col items-center justify-center mx-4">
    <dialog ref="error_modal" class="modal">
      <div class="modal-box space-y-4 !px-20 max-w-lg">
        <h3 class="text-lg font-bold text-center">
          Loading ligand {{ loading }} failed
        </h3>
        <h1 class="font-semibold text-error text-center">Error: {{ error }}</h1>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

    <div class="input input-secondary my-2">
      <span class="i-carbon-search">Ligands</span>
      <input type="search" v-model="search" class="grow" placeholder="Search" />
      <button
        class="i-carbon-trash-can size-8 hover:cursor-pointer hover:scale-105 transition-all duration-100 hover:bg-primary"
        @click="search = ''"></button>
    </div>

    <div class="flex gap-2 flex-wrap w-full justify-center items-center my-2">
      <button v-for="ligand in ligands_filtered" class="btn btn-secondary"
        :disabled="loading !== ligand && loading !== null" @click="fetchLigand(ligand)">
        <span :class="{ 'loading loading-spinner': loading === ligand }">
          {{ ligand }}
        </span>
      </button>
    </div>
  </div>
</template>
