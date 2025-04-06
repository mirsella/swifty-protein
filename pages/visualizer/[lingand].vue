<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as $3Dmol from '3dmol'

const loading = ref(true)
const viewerContainer = ref(null)
const route = useRoute()
const lingand = route.params.lingand

onMounted(async () => {
  try {
    // await nextTick() 
    const url = `https://files.rcsb.org/ligands/download/${lingand}_ideal.sdf`
    const response = await fetch(url)
    const data = await response.text()
    console.log(data)

    const viewer = $3Dmol.createViewer(viewerContainer.value, {
      backgroundColor: 'white'
    })

    viewer.addModel(data, 'sdf')
    viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } })
    viewer.zoomTo()
    viewer.render()
    loading.value = false
  } catch (e) {
    console.error(e);
  }
})

</script>

<template>
  <div v-if="loading">Loading 3D View ...</div>
  <div ref="viewerContainer" style="width: 100%; height: 500px;"></div>
</template>
