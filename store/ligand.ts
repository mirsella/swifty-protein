// store/ligand.ts
import { ref } from 'vue';
import { navigateTo } from '#app';

export const ligandData = ref<string | null>(null);
export const ligandId = ref<string | null>(null);
export const isLoading = ref<string | null>(null);
export const errorMessage = ref<string | null>(null);

export async function fetchLigand(ligand: string) {
    if (isLoading.value === ligand) {
        return;
    }

    isLoading.value = ligand;
    ligandId.value = ligand;
    errorMessage.value = null;

    try {
        const response = await fetch(
            `https://files.rcsb.org/ligands/download/${ligand}.cif`,
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch ligand: ${response.statusText}`);
        }

        const data = await response.text();
        ligandData.value = data;

        // Navigate to visualizer page after data is loaded
        navigateTo('/visualizer');
    } catch (e) {
        console.error(e);
        errorMessage.value = (e as Error).message;
        ligandData.value = null;
    } finally {
        isLoading.value = null;
    }
}