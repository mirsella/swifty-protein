<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as $3Dmol from '3dmol'
import { Share } from '@capacitor/share'
import { Filesystem, Directory } from '@capacitor/filesystem'

const loading = ref(true)
const viewerContainer = ref(null)
const route = useRoute()
const ligand = route.params.ligand
const ligandData = useLigandData()

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

const currentStyle = ref('stick')

const switchStyle = (style: string) => {
  currentStyle.value = style
  if (!viewer) return

  // Apply selected style and highlight selected atom
  switch (style) {
    case 'stick':
      viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } })
      if (selectedAtom.value) {
        viewer.setStyle({ serial: selectedAtom.value.serial }, {
          stick: {},
          sphere: { scale: 0.5, color: 'yellow' }
        })
      }
      break
    case 'ball-stick':
      viewer.setStyle({}, { stick: { radius: 0.2 }, sphere: { scale: 0.5 } })
      if (selectedAtom.value) {
        viewer.setStyle({ serial: selectedAtom.value.serial }, {
          stick: { radius: 0.3 },
          sphere: { scale: 0.7, color: 'yellow' }
        })
      }
      break
    case 'sphere':
      viewer.setStyle({}, { sphere: { scale: 1 } })
      if (selectedAtom.value) {
        viewer.setStyle({ serial: selectedAtom.value.serial }, {
          sphere: { scale: 1.2, color: 'yellow' }
        })
      }
      break
    case 'wireframe':
      viewer.setStyle({}, { line: { linewidth: 2 } })
      if (selectedAtom.value) {
        viewer.setStyle({ serial: selectedAtom.value.serial }, {
          line: { linewidth: 4, color: 'yellow' }
        })
      }
      break
  }

  viewer.render()
}

const takeAndShareScreenshot = async () => {
  try {
    console.log('Capture Screenshot')

    const canvas: HTMLCanvasElement | null = viewerContainer.value?.querySelector('canvas')

    const dataURL = canvas.toDataURL('image/png')
    const base64 = dataURL.split(',')[1]

    const fileName = `molecule-${ligand}-${Date.now()}.png`
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache,
      encoding: Filesystem.Encoding.Base64,
    })

    console.log('Saved canvas screenS', savedFile.uri)

    // before sharing
    let formattedUri = savedFile.uri
    if (!formattedUri.startsWith('file://') && !formattedUri.startsWith('content://')) {
      formattedUri = `file://${formattedUri}`
    }

    const shareText = selectedAtom.value
      ? `Check out this ${ligand} molecule! Selected atom: ${selectedAtom.value.element} (${selectedAtom.value.serial})`
      : `Check out this ${ligand} molecule!`

    await Share.share({
      title: `${ligand} Molecule Viewer`,
      text: shareText,
      files: [formattedUri],
      dialogTitle: 'Share this molecule'
    })

  } catch (error) {
    console.error('Error capturing and sharing screenshot:', error)
  }
}

onMounted(async () => {
  try {
    if (!ligandData.value) {
      throw new Error('No ligand data available')
    }

    // Create viewer
    viewer = $3Dmol.createViewer(viewerContainer.value, {
      backgroundColor: 'white',
    })

    viewer.addModel(ligandData.value, 'sdf')
    switchStyle('stick') // apply default style

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

      // Apply Selected style and selected atom
      switchStyle(currentStyle.value)

      viewer.render()
    })

    viewer.zoomTo()
    viewer.render()
    loading.value = false

    // Detect click on canvas to close infos display
    const canvas = viewerContainer.value.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('pointerdown', (event: PointerEvent) => {
        switchStyle(currentStyle.value) // Reapply style
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

    <div class="flex-grow relative w-full max-w-4xl h-80 overflow-hidden rounded-box">
      <div ref="viewerContainer" class="absolute inset-0 w-full h-full"></div>

      <template v-if="!loading">
        <div
          class="rounded-br-lg w-1/4 absolute top-0 left-0 z-10 flex justify-center items-center gap-2 bg-base-200 p-2">
          <h3 class="text-lg font-bold text-center">{{ ligand }}</h3>
        </div>

        <div class="absolute bottom-2 left-2 z-10 flex gap-2">
          <button v-for="style in ['stick', 'ball-stick', 'sphere', 'wireframe']" :key="style"
            @click="switchStyle(style)" class="btn btn-sm" :class="{ 'btn-primary': currentStyle === style }">
            {{ style }}
          </button>
        </div>

        <div class="absolute bottom-2 right-2 z-10 flex gap-2">
          <button @click="takeAndShareScreenshot" class="btn btn-circle btn-sm">
            <i class="i-carbon-share w-5 h-5"></i>
          </button>
        </div>

        <div v-if="selectedAtom" class="absolute top-0 right-0 z-10 m-1 p-1 border rounded shadow-lg bg-base-100">
          <h3 class="text-lg font-bold">Atom Informations</h3>
          <div class="grid grid-cols-2 gap-1 text-sm">
            <div><strong>Element:</strong> {{ selectedAtom.element }}</div>
            <div><strong>Serial:</strong> {{ selectedAtom.serial }}</div>
            <div><strong>Bonds:</strong> {{ selectedAtom.bonds }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>