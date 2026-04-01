<script setup lang="ts">
import { ref } from 'vue'
import { useCalculator } from './composables/useCalculator'
import { useGrid } from './composables/useGrid'
import type { DateMode } from './engine/types'
import type { GridOverlay } from './components/grid/SyncGrid.vue'
import DatePicker from './components/form/DatePicker.vue'
import DateBar from './components/form/DateBar.vue'
import SyncGrid from './components/grid/SyncGrid.vue'
import KinDetail from './components/results/KinDetail.vue'

const {
  year, month, day, error,
  kinResult,
  setDate, setToday, setMoonDate, nextDay, prevDay,
} = useCalculator()

const { highlightedCells, connections } = useGrid(kinResult)

const dateMode = ref<DateMode>('gregorian')
const gridOverlay = ref<GridOverlay>('baseUnit')

const overlayOptions: { value: GridOverlay; label: string }[] = [
  { value: 'baseUnit', label: 'Base' },
  { value: 'timeUnit', label: 'Time' },
  { value: 'spaceUnit', label: 'Space' },
  { value: 'syncUnit', label: 'Sync' },
  { value: 'none', label: 'None' },
]

const dimensionColors: Record<string, { color: string; label: string }> = {
  time: { color: '#ff9f43', label: 'Time' },
  space: { color: '#54a0ff', label: 'Space' },
  sync: { color: '#9b59b6', label: 'Sync' },
  tfiHunabKu: { color: '#f9ca24', label: 'TFI HK-21' },
  tfiMcf: { color: '#00cec9', label: 'TFI MCF' },
  equivalentKin: { color: '#fd79a8', label: 'Eq. Kin' },
  psiChrono: { color: '#6ab04c', label: 'Psi Chrono' },
}
</script>

<template>
  <div class="app">
    <main class="main">
      <!-- Sidebar (LEFT, always visible, full height) -->
      <aside class="sidebar">
        <!-- Title -->
        <div class="sidebar-header">
          <h1 class="app-title">Synchronotron <span class="dim">441</span></h1>
        </div>

        <div class="sidebar-content">
          <!-- Mode toggle -->
          <div class="mode-toggle">
            <button
              :class="['toggle-btn', { active: dateMode === 'gregorian' }]"
              @click="dateMode = 'gregorian'"
            >Gregorian</button>
            <button
              :class="['toggle-btn', { active: dateMode === '13moon' }]"
              @click="dateMode = '13moon'"
            >13 Moons</button>
            <button
              :class="['toggle-btn', { active: dateMode === 'natural' }]"
              @click="dateMode = 'natural'"
            >Natural</button>
          </div>

          <!-- Date inputs -->
          <DatePicker
            :date-mode="dateMode"
            :year="year"
            :month="month"
            :day="day"
            :moon="kinResult?.moon ?? 1"
            :day-of-moon="kinResult?.dayOfMoon ?? 1"
            :error="error"
            @update:year="year = $event"
            @update:month="month = $event"
            @update:day="day = $event"
            @set-moon-date="setMoonDate"
            @set-date="setDate"
          />

          <!-- Kin details -->
          <KinDetail v-if="kinResult" :kin="kinResult" />
        </div>
      </aside>

      <!-- Grid area (maximized, constrained to viewport height) -->
      <section class="grid-area">
        <!-- Overlay selector (top-right of grid area) -->
        <div class="overlay-toggle">
          <button
            v-for="opt in overlayOptions"
            :key="opt.value"
            :class="['overlay-btn', { active: gridOverlay === opt.value }]"
            @click="gridOverlay = opt.value"
          >{{ opt.label }}</button>
        </div>

        <div class="grid-container">
          <SyncGrid
            :highlighted-cells="highlightedCells"
            :connections="connections"
            :overlay="gridOverlay"
          />
        </div>
        <DateBar
          :kin-result="kinResult"
          :date-mode="dateMode"
          :year="year"
          :month="month"
          :day="day"
          @prev-day="prevDay"
          @next-day="nextDay"
          @today="setToday"
        />
        <!-- Legend centered below grid -->
        <div class="grid-legend">
          <div
            v-for="(info, dim) in dimensionColors"
            :key="dim"
            class="legend-item"
          >
            <span class="legend-dot" :style="{ background: info.color }"></span>
            <span class="legend-label">{{ info.label }}</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style>
:root {
  --bg: #0e0e14;
  --surface: rgba(255, 255, 255, 0.04);
  --border: rgba(255, 255, 255, 0.08);
  --text: #e8e8f0;
  --text-dim: rgba(255, 255, 255, 0.45);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

#app {
  height: 100vh;
  overflow: hidden;
}

@media (max-width: 768px) {
  #app {
    height: auto;
    overflow: auto;
  }
}
</style>

<style scoped>
.app {
  height: 100vh;
  overflow: hidden;
}

/* --- Main flex layout --- */
.main {
  display: flex;
  height: 100vh;
}

/* --- Sidebar (LEFT, always visible, full height, flush edges) --- */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid var(--border);
}

.sidebar-header {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-content::-webkit-scrollbar { width: 4px; }
.sidebar-content::-webkit-scrollbar-track { background: transparent; }
.sidebar-content::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 2px; }

.app-title {
  font-size: 16px;
  font-weight: 300;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.app-title .dim {
  opacity: 0.3;
  font-weight: 200;
}

/* --- Grid area (fills remaining space, vertically constrained) --- */
.grid-area {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
}

/* Grid container: grows but constrained so SVG never overflows viewport */
.grid-container {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-container :deep(.sync-grid-wrapper) {
  width: 100%;
  max-height: 100%;
}

.grid-container :deep(.sync-grid) {
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 120px);
}

/* --- Mode toggle --- */
.mode-toggle {
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 2px;
}

.toggle-btn {
  flex: 1;
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.5;
  transition: all 0.15s;
}

.toggle-btn:hover {
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.04);
}

.toggle-btn.active {
  opacity: 1;
  background: rgba(255, 255, 255, 0.12);
}

/* --- Overlay toggle (top of grid area) --- */
.overlay-toggle {
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 5px;
  padding: 2px;
  flex-shrink: 0;
  align-self: flex-end;
}

.overlay-btn {
  padding: 3px 8px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 10px;
  opacity: 0.4;
  transition: all 0.15s;
  font-family: monospace;
}

.overlay-btn:hover {
  opacity: 0.6;
  background: rgba(255, 255, 255, 0.04);
}

.overlay-btn.active {
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.1);
}

/* --- Legend (centered below grid in grid-area) --- */
.grid-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
  padding: 6px 0;
  flex-shrink: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  opacity: 0.5;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  white-space: nowrap;
}

/* --- Small screens: sidebar below grid, normal scroll --- */
@media (max-width: 768px) {
  .app {
    height: auto;
    overflow: auto;
  }

  .main {
    flex-direction: column;
    height: auto;
  }

  .sidebar {
    width: 100%;
    height: auto;
    order: 2;
    border-right: none;
    border-top: 1px solid var(--border);
  }

  .grid-area {
    order: 1;
  }

  .sidebar-content {
    overflow-y: visible;
  }

  .grid-area {
    order: 1;
    height: auto;
  }

  .grid-container {
    flex: none;
  }

  .grid-container :deep(.sync-grid) {
    max-height: none;
  }
}
</style>
