<script setup lang="ts">
import type { KinResult } from '../../engine/types'
import { coordinatesString, calculationString } from '../../engine/syncReduce'

const props = defineProps<{
  kin: KinResult
}>()

const COLOR_LABELS: Record<number, string> = {
  1: 'Red', 2: 'White', 3: 'Blue', 4: 'Yellow',
}

const PLASMA_NAMES: Record<number, string> = {
  1: 'Dali', 2: 'Seli', 3: 'Gamma', 4: 'Kali',
  5: 'Alpha', 6: 'Limi', 7: 'Silio',
}

const MOON_NAMES: Record<number, string> = {
  1: 'Magnetic', 2: 'Lunar', 3: 'Electric', 4: 'Self-Existing',
  5: 'Overtone', 6: 'Rhythmic', 7: 'Resonant', 8: 'Galactic',
  9: 'Solar', 10: 'Planetary', 11: 'Spectral', 12: 'Crystal', 13: 'Cosmic',
}
</script>

<template>
  <div class="kin-detail">
    <!-- Identity Banner -->
    <div :class="['kin-banner', `color-${kin.kinColor}`]">
      <div class="banner-main">
        <span class="kin-number">Kin {{ kin.kin }}</span>
        <span class="kin-name">{{ kin.kinToneName }} {{ kin.kinGlyphName }}</span>
      </div>
      <div class="banner-sub">
        {{ COLOR_LABELS[kin.kinColor] }} &middot; Tone {{ kin.kinTone }} &middot; Glyph {{ kin.kinGlyph }}
      </div>
    </div>

    <!-- Calendar Info -->
    <div class="section">
      <div class="section-title">Calendar</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Gregorian</span>
          <span class="info-value">{{ kin.gregorianDateString }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">13 Moon</span>
          <span class="info-value">{{ MOON_NAMES[kin.moon] }} Moon, Day {{ kin.dayOfMoon }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Plasma</span>
          <span class="info-value">{{ PLASMA_NAMES[kin.plasma] }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Heptad</span>
          <span class="info-value">#{{ kin.heptad }}</span>
        </div>
        <div v-if="kin.newSiriusDate" class="info-item">
          <span class="info-label">New Sirius</span>
          <span class="info-value">NS {{ kin.newSiriusDate }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">I Ching</span>
          <span class="info-value">Hexagram {{ kin.iChing }}</span>
        </div>
      </div>
    </div>

    <!-- BMU Cross (Hunab Ku 21) -->
    <div class="section">
      <div class="section-title">BMU Cross <span class="dim">(Hunab Ku 21)</span></div>
      <div class="bmu-cross">
        <div class="bmu-row">
          <span class="bmu-cell empty"></span>
          <span class="bmu-cell label-cell">Plasma</span>
          <span class="bmu-cell empty"></span>
        </div>
        <div class="bmu-row">
          <span class="bmu-cell label-cell">Guide</span>
          <span class="bmu-cell center-cell">{{ kin.plasmaBmu }}</span>
          <span class="bmu-cell label-cell">Analog</span>
        </div>
        <div class="bmu-row values">
          <span class="bmu-cell">{{ kin.kinGuideBmu }}</span>
          <span class="bmu-cell kin-cell">{{ kin.kinBmu }}</span>
          <span class="bmu-cell">{{ kin.kinAnalogBmu }}</span>
        </div>
        <div class="bmu-row">
          <span class="bmu-cell label-cell">Antipod</span>
          <span class="bmu-cell empty"></span>
          <span class="bmu-cell label-cell">Occult</span>
        </div>
        <div class="bmu-row values">
          <span class="bmu-cell">{{ kin.kinAntipodBmu }}</span>
          <span class="bmu-cell empty"></span>
          <span class="bmu-cell">{{ kin.kinOccultBmu }}</span>
        </div>
      </div>
      <div class="tfi-result">
        <span class="tfi-label">TFI HK-21</span>
        <span class="tfi-calc">{{ kin.plasmaBmu }} + {{ kin.kinBmu }} + {{ kin.kinAnalogBmu }} + {{ kin.kinGuideBmu }} + {{ kin.kinAntipodBmu }} + {{ kin.kinOccultBmu }} = {{ kin.tfiHunabKuTotal }}</span>
        <span class="tfi-bmu">BMU {{ kin.tfiHunabKuBmu }}</span>
      </div>
    </div>

    <!-- Time / Space / Sync Dimensions -->
    <div class="section">
      <div class="section-title">Dimensions <span class="dim">(441 Matrix)</span></div>
      <div class="dims-table">
        <div class="dims-header">
          <span></span>
          <span>Coords</span>
          <span>Calculation</span>
          <span>Total</span>
        </div>
        <div class="dims-row time">
          <span class="dims-label">Time</span>
          <span class="dims-coords">{{ coordinatesString(kin.timeCell.v, kin.timeCell.h) }}</span>
          <span class="dims-calc">{{ calculationString(kin.timeCell.timeUnit, kin.timeCell.spaceUnit, kin.timeCell.syncUnit) }}</span>
          <span class="dims-total">{{ kin.timeCell.total }}</span>
        </div>
        <div class="dims-row space">
          <span class="dims-label">Space</span>
          <span class="dims-coords">{{ coordinatesString(kin.spaceCell.v, kin.spaceCell.h) }}</span>
          <span class="dims-calc">{{ calculationString(kin.spaceCell.timeUnit, kin.spaceCell.spaceUnit, kin.spaceCell.syncUnit) }}</span>
          <span class="dims-total">{{ kin.spaceCell.total }}</span>
        </div>
        <div class="dims-row sync">
          <span class="dims-label">Sync</span>
          <span class="dims-coords">{{ coordinatesString(kin.syncCell.v, kin.syncCell.h) }}</span>
          <span class="dims-calc">{{ calculationString(kin.syncCell.timeUnit, kin.syncCell.spaceUnit, kin.syncCell.syncUnit) }}</span>
          <span class="dims-total">{{ kin.syncCell.total }}</span>
        </div>
      </div>
    </div>

    <!-- TFI MCF -->
    <div class="section">
      <div class="section-title">Master Coordinating Frequency</div>
      <div class="tfi-result">
        <span class="tfi-label">TFI MCF</span>
        <span class="tfi-calc">{{ kin.timeCell.total }} + {{ kin.spaceCell.total }} + {{ kin.syncCell.total }} = {{ kin.tfiMcfTotal }}</span>
        <span class="tfi-bmu">BMU {{ kin.tfiMcfBmu }}</span>
      </div>
    </div>

    <!-- Equivalent Kin -->
    <div class="section">
      <div class="section-title">Equivalent Kin</div>
      <div class="eq-grid">
        <div class="info-item">
          <span class="info-label">Kin</span>
          <span class="info-value accent">{{ kin.equivalentKin }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Position</span>
          <span class="info-value">{{ coordinatesString(kin.equivalentKinV, kin.equivalentKinH) }}</span>
        </div>
      </div>
    </div>

    <!-- Psi Chrono -->
    <div class="section">
      <div class="section-title">Psi Chrono Unit</div>
      <div class="eq-grid">
        <div class="info-item">
          <span class="info-label">Unit</span>
          <span class="info-value accent">{{ kin.psiChronoUnit }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">BMU</span>
          <span class="info-value">{{ kin.psiChronoUnitBmu }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Position</span>
          <span class="info-value">{{ coordinatesString(kin.psiChronoUnitV, kin.psiChronoUnitH) }}</span>
        </div>
      </div>
    </div>

    <!-- Heptad Tollan + Reciprocals -->
    <div class="section">
      <div class="section-title">Heptad Tollan & Reciprocals</div>
      <div class="eq-grid">
        <div class="info-item">
          <span class="info-label">From BMU</span>
          <span class="info-value">{{ kin.heptadFromBmu }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">To BMU</span>
          <span class="info-value">{{ kin.heptadToBmu }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Interval</span>
          <span class="info-value">{{ kin.reciprocalInterval }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Sum</span>
          <span class="info-value">{{ kin.reciprocalSum }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Composite</span>
          <span class="info-value">{{ kin.reciprocalComposite }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kin-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Banner */
.kin-banner {
  border-radius: 6px;
  padding: 14px 16px;
  text-align: center;
}

.color-1 { background: rgba(245, 147, 147, 0.2); border: 1px solid rgba(245, 147, 147, 0.3); }
.color-2 { background: rgba(242, 242, 242, 0.12); border: 1px solid rgba(242, 242, 242, 0.2); }
.color-3 { background: rgba(147, 179, 245, 0.2); border: 1px solid rgba(147, 179, 245, 0.3); }
.color-4 { background: rgba(245, 242, 147, 0.2); border: 1px solid rgba(245, 242, 147, 0.3); }

.banner-main {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 10px;
}

.kin-number {
  font-size: 22px;
  font-weight: 300;
  letter-spacing: 0.04em;
}

.kin-name {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.85;
}

.banner-sub {
  font-size: 11px;
  opacity: 0.5;
  margin-top: 4px;
  letter-spacing: 0.03em;
}

/* Sections */
.section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 12px;
}

.section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.5;
  margin-bottom: 10px;
}

.section-title .dim {
  opacity: 0.6;
  text-transform: none;
}

/* Info grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.eq-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.eq-grid .info-item {
  flex: 1;
  min-width: 80px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.4;
}

.info-value {
  font-size: 13px;
  font-weight: 400;
}

.info-value.accent {
  font-weight: 600;
  font-size: 16px;
}

/* BMU Cross */
.bmu-cross {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-bottom: 10px;
}

.bmu-row {
  display: flex;
  gap: 2px;
  text-align: center;
}

.bmu-cell {
  width: 60px;
  padding: 4px 0;
  font-size: 12px;
}

.bmu-cell.empty {
  visibility: hidden;
}

.bmu-cell.label-cell {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.35;
  padding: 2px 0;
}

.bmu-cell.center-cell {
  font-weight: 600;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
}

.bmu-cell.kin-cell {
  font-weight: 600;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
}

.bmu-row.values .bmu-cell {
  font-weight: 500;
  font-size: 13px;
}

/* TFI Result */
.tfi-result {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
}

.tfi-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.5;
  font-weight: 600;
}

.tfi-calc {
  font-size: 12px;
  opacity: 0.6;
  font-family: monospace;
}

.tfi-bmu {
  font-size: 14px;
  font-weight: 600;
  margin-left: auto;
}

/* Dimensions Table */
.dims-table {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dims-header {
  display: grid;
  grid-template-columns: 50px 85px 1fr 50px;
  gap: 4px;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.3;
  padding: 0 6px 4px;
}

.dims-row {
  display: grid;
  grid-template-columns: 50px 85px 1fr 50px;
  gap: 4px;
  padding: 6px;
  border-radius: 3px;
  font-size: 12px;
}

.dims-row.time { background: rgba(255, 159, 67, 0.08); }
.dims-row.space { background: rgba(84, 160, 255, 0.08); }
.dims-row.sync { background: rgba(155, 89, 182, 0.08); }

.dims-label {
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.dims-row.time .dims-label { color: #ff9f43; }
.dims-row.space .dims-label { color: #54a0ff; }
.dims-row.sync .dims-label { color: #9b59b6; }

.dims-coords {
  font-family: monospace;
  font-size: 11px;
  opacity: 0.7;
}

.dims-calc {
  font-family: monospace;
  font-size: 11px;
  opacity: 0.6;
}

.dims-total {
  font-weight: 600;
  text-align: right;
}
</style>
