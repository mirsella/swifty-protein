<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as $3Dmol from '3dmol'

const loading = ref(true)
const viewerContainer = ref(null)
const route = useRoute()
const ligand = route.params.ligand
interface AtomInfo {
  serial: number
  element: string
  bonds: number
  x: string
  y: string
  z: string
}

const selectedAtom = ref<AtomInfo | null>(null)
let viewer: $3Dmol.GLViewer | null = null

onMounted(async () => {
  try {
    const url = `https://files.rcsb.org/ligands/download/${ligand}_ideal.sdf`
    const response = await fetch(url)
    const data = await response.text()

    // Create viewer
    viewer = $3Dmol.createViewer(viewerContainer.value, {
      backgroundColor: 'white',
    })

    viewer.addModel(data, 'sdf')
    viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } })

    // Add click handler for atoms
    viewer.setClickable({}, true, (atom) => {

      console.log('Atom clicked:', atom);

      selectedAtom.value = {
        serial: atom.serial,
        element: atom.elem,
        bonds: atom.bonds?.length || 0,
        x: atom.x.toFixed(2),
        y: atom.y.toFixed(2),
        z: atom.z.toFixed(2),
      }

      // Highlight the selected atom
      viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } })
      viewer.setStyle({ serial: atom.serial }, {
        stick: {},
        sphere: { scale: 0.5, color: 'yellow' }
      })

      viewer.render()
    })

    viewer.zoomTo()
    viewer.render()
    loading.value = false

    // Detect click on canvas to close infos display
    const canvas = viewerContainer.value.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('pointerdown', (event: PointerEvent) => {
        viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } })
        viewer.render()
        selectedAtom.value = null
      })
    }

  } catch (e) {
    console.error(e)
    loading.value = false
  }
})

</script>

<template>
  <div class="flex flex-col items-center justify-center mx-4 min-h-[25rem]">
    <div v-if="loading" class="text-center p-4">Loading 3D View...</div>

    <div ref="viewerContainer"
      class="relative flex justify-center w-full max-w-4xl min-h-[25rem] bg-base-200 rounded shadow"></div>

    <div v-if="selectedAtom" class="mt-4 p-4 border rounded bg-gray-100 w-full max-w-4xl">
      <h3 class="text-lg font-bold mb-2">Atom Information</h3>
      <div class="grid grid-cols-2 gap-2">
        <div><strong>Element:</strong> {{ selectedAtom.element }}</div>
        <div><strong>Serial:</strong> {{ selectedAtom.serial }}</div>
        <div><strong>Bonds:</strong> {{ selectedAtom.bonds }}</div>
        <div><strong>Position:</strong> ({{ selectedAtom.x }}, {{ selectedAtom.y }}, {{ selectedAtom.z }})</div>
      </div>
    </div>
  </div>
</template>
