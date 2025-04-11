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
  <div class="flex-grow flex flex-col items-center justify-center mx-4 my-4">
    <div v-if="loading" class="text-center p-4">Loading 3D View...</div>

    <div ref="viewerContainer"
      class="flex-grow relative flex justify-end w-full max-w-4xl h-80 bg-base-200 rounded shadow">
      <div v-if="selectedAtom" class="absolute bottom-0 z-10 m-1 p-1 border rounded bg-base-100 shadow-lg">
        <h3 class="text-lg font-bold">Atom Informations</h3>
        <div class="grid grid-cols-2 gap-1 text-sm">
          <div><strong>Element:</strong> {{ selectedAtom.element }}</div>
          <div><strong>Serial:</strong> {{ selectedAtom.serial }}</div>
          <div><strong>Bonds:</strong> {{ selectedAtom.bonds }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
