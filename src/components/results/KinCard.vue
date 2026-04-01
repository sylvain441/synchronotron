<script setup lang="ts">
import type { KinResult } from '../../engine/types'
import { coordinatesString, calculationString } from '../../engine/syncReduce'

const props = defineProps<{
  kin: KinResult
  showCumulative?: boolean
}>()

const colorMap: Record<number, string> = {
  1: 'red',
  2: 'white',
  3: 'blue',
  4: 'yellow',
}

const plasmaNames: Record<number, string> = {
  1: 'Dali', 2: 'Seli', 3: 'Gamma', 4: 'Kali',
  5: 'Alpha', 6: 'Limi', 7: 'Silio',
}
</script>

<template>
  <div :class="['kin-card', `color-${kin.kinColor}`, { selected: kin.selected }]">
    <div class="card-header">
      {{ plasmaNames[kin.plasma] || kin.plasma }}
    </div>

    <!-- BMU Cross -->
    <div class="bmu-grid">
      <div class="bmu-row">
        <span class="bmu-empty"></span>
        <span class="bmu-val">{{ kin.plasmaBmu }}</span>
        <span class="bmu-val wide">{{ kin.kinBmu }}</span>
        <span class="bmu-val">{{ kin.kinAnalogBmu }}</span>
        <span class="bmu-empty"></span>
      </div>
      <div class="bmu-row">
        <span class="bmu-empty"></span>
        <span class="bmu-val">{{ kin.kinGuideBmu }}</span>
        <span class="bmu-val wide">{{ kin.kinAntipodBmu }}</span>
        <span class="bmu-val">{{ kin.kinOccultBmu }}</span>
        <span class="bmu-empty"></span>
      </div>
    </div>

    <!-- TFI Hunab Ku -->
    <div class="tfi-row">
      <span>{{ kin.tfiHunabKuTotal }}</span>
      <span v-if="showCumulative">{{ kin.cumulativeTfiHunabKuTotal }}</span>
    </div>
    <div class="tfi-row bold">
      <span>{{ kin.tfiHunabKuBmu }}</span>
      <span v-if="showCumulative">{{ kin.cumulativeTfiHunabKuBmu }}</span>
    </div>

    <!-- Time / Space / Sync -->
    <template v-for="dim in ['time', 'space', 'sync'] as const" :key="dim">
      <div class="dim-label-row">
        <span class="dim-label">{{ dim }}</span>
        <span class="coordinates">{{
          coordinatesString(
            dim === 'time' ? kin.timeCell.v : dim === 'space' ? kin.spaceCell.v : kin.syncCell.v,
            dim === 'time' ? kin.timeCell.h : dim === 'space' ? kin.spaceCell.h : kin.syncCell.h,
          )
        }}</span>
      </div>
      <div class="calc-row">
        <span class="calc">{{
          calculationString(
            dim === 'time' ? kin.timeCell.timeUnit : dim === 'space' ? kin.spaceCell.timeUnit : kin.syncCell.timeUnit,
            dim === 'time' ? kin.timeCell.spaceUnit : dim === 'space' ? kin.spaceCell.spaceUnit : kin.syncCell.spaceUnit,
            dim === 'time' ? kin.timeCell.syncUnit : dim === 'space' ? kin.spaceCell.syncUnit : kin.syncCell.syncUnit,
          )
        }}</span>
        <span class="total">{{
          dim === 'time' ? kin.timeCell.total : dim === 'space' ? kin.spaceCell.total : kin.syncCell.total
        }}</span>
      </div>
    </template>

    <!-- TFI MCF -->
    <div class="tfi-row">
      <span>{{ kin.tfiMcfTotal }}</span>
      <span v-if="showCumulative">{{ kin.cumulativeTfiMcfTotal }}</span>
    </div>
    <div class="tfi-row bold">
      <span>{{ kin.tfiMcfBmu }}</span>
      <span v-if="showCumulative">{{ kin.cumulativeTfiMcfBmu }}</span>
    </div>

    <!-- Equivalent Kin -->
    <div class="eq-row">
      <span>{{ kin.equivalentKin }}</span>
      <span class="coordinates">{{ coordinatesString(kin.equivalentKinV, kin.equivalentKinH) }}</span>
      <template v-if="showCumulative">
        <span>{{ kin.cumulativeEquivalentKin }}</span>
        <span class="coordinates">{{ coordinatesString(kin.cumulativeEquivalentKinV, kin.cumulativeEquivalentKinH) }}</span>
      </template>
    </div>

    <!-- Psi Chrono -->
    <div class="detail-row">
      <span>psi</span>
      <span>{{ kin.psiChronoUnit }}</span>
      <span class="coordinates">{{ coordinatesString(kin.psiChronoUnitV, kin.psiChronoUnitH) }}</span>
    </div>

    <!-- Heptad + Reciprocals -->
    <div class="detail-row">
      <span>#{{ kin.heptad }}</span>
      <span class="bold">{{ kin.heptadFromBmu }}</span>
      <span class="bold">{{ kin.heptadToBmu }}</span>
    </div>
    <div class="detail-row bold">
      <span>{{ kin.reciprocalInterval }}</span>
      <span>{{ kin.reciprocalSum }}</span>
      <span>{{ kin.reciprocalComposite }}</span>
    </div>

    <!-- I Ching -->
    <div class="detail-row">
      <span>i ching</span>
      <span class="bold">{{ kin.iChing }}</span>
    </div>

    <!-- Kin info footer -->
    <div class="kin-footer">
      <div>kin:{{ kin.kin }} tone:{{ kin.kinTone }} glyph:{{ kin.kinGlyph }}</div>
      <div>{{ colorMap[kin.kinColor] }} {{ kin.kinToneName }} {{ kin.kinGlyphName }}</div>
      <div>{{ kin.gregorianDateString }}</div>
      <div v-if="kin.newSiriusDate">NS {{ kin.newSiriusDate }}</div>
    </div>
  </div>
</template>

<style scoped>
.kin-card {
  width: 160px;
  font-size: 12px;
  text-align: center;
  border-radius: 0 0 4px 4px;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}

.kin-card.selected {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
}

.color-1 { background: #f59393; color: #2f2f2f; }
.color-2 { background: #f2f2f2; color: #2f2f2f; }
.color-3 { background: #93b3f5; color: #2f2f2f; }
.color-4 { background: #f5f293; color: #2f2f2f; }

.card-header {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 6px 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.bmu-grid {
  padding: 2px 0;
}

.bmu-row {
  display: flex;
  justify-content: center;
  gap: 2px;
}

.bmu-val {
  width: 28px;
  padding: 2px 0;
  font-weight: 500;
}

.bmu-val.wide {
  width: 42px;
}

.bmu-empty {
  width: 28px;
}

.tfi-row {
  display: flex;
  justify-content: space-around;
  padding: 2px 8px;
}

.tfi-row.bold {
  font-weight: 600;
  background: rgba(0, 0, 0, 0.04);
}

.dim-label-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 8px;
}

.dim-label {
  font-size: 11px;
}

.coordinates {
  font-size: 10px;
  font-weight: 600;
  line-height: 10px;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 8px;
}

.calc {
  font-size: 11px;
}

.total {
  font-weight: 500;
}

.eq-row {
  display: flex;
  justify-content: space-around;
  padding: 2px 8px;
  flex-wrap: wrap;
  gap: 2px;
}

.detail-row {
  display: flex;
  justify-content: space-around;
  padding: 2px 8px;
}

.detail-row.bold span {
  font-weight: 600;
}

.bold {
  font-weight: 600;
}

.kin-footer {
  font-size: 11px;
  font-style: italic;
  padding: 6px 4px;
  line-height: 1.4;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
