<script setup lang="ts">
import type { KinResult } from '../../engine/types'
import KinCard from './KinCard.vue'

defineProps<{
  results: KinResult[]
}>()
</script>

<template>
  <div class="heptad-view">
    <KinCard
      v-for="(kin, i) in results"
      :key="i"
      :kin="kin"
      :show-cumulative="true"
    />
  </div>
</template>

<style scoped>
.heptad-view {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 4px 0;
}
</style>
