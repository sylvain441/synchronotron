<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { getAllGridCells } from '../../engine/lookup'
import type { HighlightedCell, GridConnection } from '../../engine/types'

export type GridOverlay = 'none' | 'baseUnit' | 'timeUnit' | 'spaceUnit' | 'syncUnit'

const props = withDefaults(defineProps<{
  highlightedCells: HighlightedCell[]
  connections: GridConnection[]
  overlay?: GridOverlay
}>(), {
  overlay: 'baseUnit',
})

const emit = defineEmits<{
  cellHover: [v: number, h: number]
  cellLeave: []
  cellClick: [v: number, h: number]
}>()

const R = 13
const GAP = 2
const CELL_SIZE = R * 2 + GAP
const PADDING = 28
const GRID_SIZE = 21
const TOTAL_SIZE = GRID_SIZE * CELL_SIZE + PADDING * 2

const gridCells = getAllGridCells()

const hoveredCell = ref<{ v: number; h: number } | null>(null)

const animKey = ref(0)
const linesReady = ref(false)

watch(() => props.highlightedCells, () => {
  animKey.value++
  linesReady.value = false
  nextTick(() => {
    requestAnimationFrame(() => {
      linesReady.value = true
    })
  })
}, { deep: true })

nextTick(() => { linesReady.value = true })

const highlightMap = computed(() => {
  const map = new Map<string, HighlightedCell>()
  for (const c of props.highlightedCells) {
    map.set(`${c.v},${c.h}`, c)
  }
  return map
})

function cellCX(h: number) { return (h - 1) * CELL_SIZE + PADDING + R }
function cellCY(v: number) { return (v - 1) * CELL_SIZE + PADDING + R }
// Top-left corner of a cell's bounding box
function cellX(h: number) { return (h - 1) * CELL_SIZE + PADDING }
function cellY(v: number) { return (v - 1) * CELL_SIZE + PADDING }

function getHighlight(v: number, h: number): HighlightedCell | undefined {
  return highlightMap.value.get(`${v},${h}`)
}

function isCenter(v: number, h: number) {
  return v === 11 && h === 11
}

// Dimension colors
const dimensionColors: Record<string, string> = {
  time: '#ff9f43',
  space: '#54a0ff',
  sync: '#9b59b6',
  tfiHunabKu: '#f9ca24',
  tfiMcf: '#00cec9',
  equivalentKin: '#fd79a8',
  psiChrono: '#6ab04c',
}

// Background zone colors based on the reference image
// Vertical zones: 4D (V1-V7), 5D (V8-V14), 3D (V15-V21)
// Horizontal zones: coroa (H1-H4,H18-H21), coração (H8-H14), raiz sections
function getZoneColor(v: number, h: number): string {
  // Determine vertical body zone
  const is4D = h >= 1 && h <= 7
  const is5D = h >= 8 && h <= 14
  const is3D = h >= 15 && h <= 21

  // Axis lines (V11 and H11) get slightly brighter
  const isAxis = v === 11 || h === 11

  // Inner band (H5-H17 = rows 5 to 17)
  const isInner = v >= 5 && v <= 17

  if (is5D) {
    // Center zone: warm rose/red tones
    if (isAxis) return 'rgba(200, 80, 80, 0.15)'
    if (isInner) return 'rgba(200, 80, 80, 0.08)'
    return 'rgba(200, 80, 80, 0.05)'
  }
  if (is4D) {
    // Left zone: green tones
    if (isAxis) return 'rgba(80, 180, 80, 0.15)'
    if (isInner) return 'rgba(80, 180, 80, 0.08)'
    return 'rgba(80, 180, 80, 0.05)'
  }
  if (is3D) {
    // Right zone: blue tones
    if (isAxis) return 'rgba(70, 130, 220, 0.15)'
    if (isInner) return 'rgba(70, 130, 220, 0.08)'
    return 'rgba(70, 130, 220, 0.05)'
  }
  return 'rgba(255,255,255,0.02)'
}

function getCellFill(v: number, h: number): string {
  const hl = getHighlight(v, h)
  if (hl) return dimensionColors[hl.dimension] || '#fff'
  if (isCenter(v, h)) return 'rgba(255,255,255,0.08)'
  // Empty circles: mostly transparent
  return 'rgba(255,255,255,0.03)'
}

function getCellStroke(v: number, h: number): string {
  const hl = getHighlight(v, h)
  if (hl) return dimensionColors[hl.dimension] || '#666'
  if (isCenter(v, h)) return 'rgba(255,255,255,0.4)'
  if (v === 11 || h === 11) return 'rgba(255,255,255,0.2)'
  return 'rgba(255,255,255,0.1)'
}

function getCellNumber(cell: { baseUnit: number; timeUnit: number; spaceUnit: number; syncUnit: number }): number {
  switch (props.overlay) {
    case 'timeUnit': return cell.timeUnit
    case 'spaceUnit': return cell.spaceUnit
    case 'syncUnit': return cell.syncUnit
    case 'baseUnit': return cell.baseUnit
    default: return cell.baseUnit
  }
}

function lineColor(conn: GridConnection): string {
  const dim = conn.dimensions.split('-')[0]
  return dimensionColors[dim] || '#888'
}

function lineLength(conn: GridConnection): number {
  const dx = cellCX(conn.to.h) - cellCX(conn.from.h)
  const dy = cellCY(conn.to.v) - cellCY(conn.from.v)
  return Math.sqrt(dx * dx + dy * dy)
}

function lineDash(conn: GridConnection): string {
  if (conn.type === 'diagonal') return '6 4'
  if (conn.type === 'vertical') return '3 3'
  return 'none'
}

function onCellEnter(v: number, h: number) {
  hoveredCell.value = { v, h }
  emit('cellHover', v, h)
}

function onCellLeave() {
  hoveredCell.value = null
  emit('cellLeave')
}

const tooltipCell = computed(() => {
  if (!hoveredCell.value) return null
  const { v, h } = hoveredCell.value
  const cell = gridCells.find(c => c.v === v && c.h === h)
  if (!cell) return null
  const hl = getHighlight(v, h)
  return {
    x: cellCX(h) + R + 8,
    y: cellCY(v) - 35,
    baseUnit: cell.baseUnit,
    timeUnit: cell.timeUnit,
    spaceUnit: cell.spaceUnit,
    syncUnit: cell.syncUnit,
    total: cell.timeUnit + cell.spaceUnit + cell.syncUnit,
    v, h,
    dimension: hl?.dimension,
    label: hl?.label,
  }
})

// Zone background rects — computed once
const zoneRects = computed(() => {
  const rects: { x: number; y: number; w: number; h: number; fill: string }[] = []
  for (let v = 1; v <= 21; v++) {
    for (let h = 1; h <= 21; h++) {
      rects.push({
        x: cellX(h),
        y: cellY(v),
        w: CELL_SIZE,
        h: CELL_SIZE,
        fill: getZoneColor(v, h),
      })
    }
  }
  return rects
})

// Zone separator lines
const gridOriginX = cellX(1)
const gridOriginY = cellY(1)
const gridEndX = cellX(21) + CELL_SIZE
const gridEndY = cellY(21) + CELL_SIZE
const zone5DStartX = cellX(8)
const zone3DStartX = cellX(15)
const innerStartY = cellY(5)
const innerEndY = cellY(17) + CELL_SIZE
</script>

<template>
  <div class="sync-grid-wrapper">
    <svg
      :viewBox="`0 0 ${TOTAL_SIZE} ${TOTAL_SIZE}`"
      class="sync-grid"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Background zone fills -->
      <rect
        v-for="(zr, i) in zoneRects"
        :key="'zone-' + i"
        :x="zr.x"
        :y="zr.y"
        :width="zr.w"
        :height="zr.h"
        :fill="zr.fill"
      />

      <!-- Zone separator lines (vertical: 4D|5D|3D) -->
      <line :x1="zone5DStartX" :y1="gridOriginY" :x2="zone5DStartX" :y2="gridEndY"
            stroke="rgba(255,255,255,0.12)" stroke-width="1" />
      <line :x1="zone3DStartX" :y1="gridOriginY" :x2="zone3DStartX" :y2="gridEndY"
            stroke="rgba(255,255,255,0.12)" stroke-width="1" />

      <!-- Inner band borders (H5–H17) -->
      <line :x1="gridOriginX" :y1="innerStartY" :x2="gridEndX" :y2="innerStartY"
            stroke="rgba(255,255,255,0.1)" stroke-width="0.5" stroke-dasharray="4 3" />
      <line :x1="gridOriginX" :y1="innerEndY" :x2="gridEndX" :y2="innerEndY"
            stroke="rgba(255,255,255,0.1)" stroke-width="0.5" stroke-dasharray="4 3" />

      <!-- Axis cross lines -->
      <line :x1="gridOriginX" :y1="cellCY(11)" :x2="gridEndX" :y2="cellCY(11)"
            stroke="rgba(255,255,255,0.06)" stroke-width="0.5" />
      <line :x1="cellCX(11)" :y1="gridOriginY" :x2="cellCX(11)" :y2="gridEndY"
            stroke="rgba(255,255,255,0.06)" stroke-width="0.5" />

      <!-- Grid axis labels -->
      <text
        v-for="i in 21"
        :key="'h' + i"
        :x="cellCX(i)"
        :y="PADDING - 6"
        text-anchor="middle"
        class="axis-label"
      >V{{ i }}</text>
      <text
        v-for="i in 21"
        :key="'v' + i"
        :x="PADDING - 6"
        :y="cellCY(i) + 3"
        text-anchor="middle"
        class="axis-label"
      >H{{ i }}</text>

      <!-- Zone labels -->
      <text :x="cellCX(4)" :y="gridOriginY - 14" text-anchor="middle" class="zone-label zone-4d">4D</text>
      <text :x="cellCX(11)" :y="gridOriginY - 14" text-anchor="middle" class="zone-label zone-5d">5D</text>
      <text :x="cellCX(18)" :y="gridOriginY - 14" text-anchor="middle" class="zone-label zone-3d">3D</text>

      <!-- Grid cells: circles -->
      <g
        v-for="cell in gridCells"
        :key="cell.id"
        class="grid-cell"
        :class="{
          highlighted: !!getHighlight(cell.v, cell.h),
          hovered: hoveredCell?.v === cell.v && hoveredCell?.h === cell.h,
          center: isCenter(cell.v, cell.h),
        }"
        @mouseenter="onCellEnter(cell.v, cell.h)"
        @mouseleave="onCellLeave"
        @click="$emit('cellClick', cell.v, cell.h)"
      >
        <!-- Center cell: larger circle -->
        <circle
          v-if="isCenter(cell.v, cell.h)"
          :cx="cellCX(cell.h)"
          :cy="cellCY(cell.v)"
          :r="R + 2"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.25)"
          stroke-width="1.5"
          class="cell-circle"
        />
        <circle
          :cx="cellCX(cell.h)"
          :cy="cellCY(cell.v)"
          :r="R - 1"
          :fill="getCellFill(cell.v, cell.h)"
          :stroke="getCellStroke(cell.v, cell.h)"
          :stroke-width="getHighlight(cell.v, cell.h) ? 1.5 : 0.8"
          class="cell-circle"
        />
        <text
          v-if="overlay !== 'none'"
          :x="cellCX(cell.h)"
          :y="cellCY(cell.v) + 3"
          text-anchor="middle"
          :class="['cell-text', { 'cell-highlighted': !!getHighlight(cell.v, cell.h) }]"
        >{{ getCellNumber(cell) }}</text>
      </g>

      <!-- Connection lines with draw-in animation -->
      <line
        v-for="(conn, i) in connections"
        :key="'conn-' + animKey + '-' + i"
        :x1="cellCX(conn.from.h)"
        :y1="cellCY(conn.from.v)"
        :x2="cellCX(conn.to.h)"
        :y2="cellCY(conn.to.v)"
        :stroke="lineColor(conn)"
        stroke-opacity="0.6"
        stroke-width="2"
        :stroke-dasharray="lineDash(conn) === 'none' ? lineLength(conn) : lineDash(conn)"
        :stroke-dashoffset="lineDash(conn) === 'none' ? (linesReady ? 0 : lineLength(conn)) : 0"
        stroke-linecap="round"
        class="connection-line"
        :class="{ 'line-animated': lineDash(conn) === 'none' }"
        :style="{
          opacity: linesReady ? 0.6 : 0,
          transitionDelay: `${i * 80}ms`,
        }"
      />

      <!-- (highlight dots removed — cell circles already show dimension color) -->

      <!-- Dimension labels above highlighted cells -->
      <text
        v-for="cell in highlightedCells"
        :key="'lbl-' + cell.dimension"
        :x="cellCX(cell.h)"
        :y="cellCY(cell.v) - R - 3"
        text-anchor="middle"
        class="dim-label"
        :fill="dimensionColors[cell.dimension]"
        :style="{ opacity: linesReady ? 0.85 : 0 }"
      >{{ cell.label }}</text>

      <!-- Tooltip -->
      <g v-if="tooltipCell" class="tooltip-group">
        <rect
          :x="Math.min(tooltipCell.x, TOTAL_SIZE - 130)"
          :y="tooltipCell.y"
          width="120"
          height="70"
          fill="rgba(20,20,30,0.92)"
          stroke="rgba(255,255,255,0.15)"
          stroke-width="0.5"
          rx="6"
        />
        <text :x="Math.min(tooltipCell.x, TOTAL_SIZE - 130) + 8" :y="tooltipCell.y + 16" class="tooltip-text bold">
          (V{{ tooltipCell.v }}.H{{ tooltipCell.h }}) #{{ tooltipCell.baseUnit }}
        </text>
        <text :x="Math.min(tooltipCell.x, TOTAL_SIZE - 130) + 8" :y="tooltipCell.y + 30" class="tooltip-text">
          Time: {{ tooltipCell.timeUnit }}
        </text>
        <text :x="Math.min(tooltipCell.x, TOTAL_SIZE - 130) + 8" :y="tooltipCell.y + 42" class="tooltip-text">
          Space: {{ tooltipCell.spaceUnit }}
        </text>
        <text :x="Math.min(tooltipCell.x, TOTAL_SIZE - 130) + 8" :y="tooltipCell.y + 54" class="tooltip-text">
          Sync: {{ tooltipCell.syncUnit }}
        </text>
        <text :x="Math.min(tooltipCell.x, TOTAL_SIZE - 130) + 8" :y="tooltipCell.y + 66" class="tooltip-text bold">
          {{ tooltipCell.label ? tooltipCell.label + ' | ' : '' }}Total: {{ tooltipCell.total }}
        </text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.sync-grid-wrapper {
  width: 100%;
}

.sync-grid {
  width: 100%;
  height: auto;
}

.axis-label {
  font-size: 7px;
  fill: rgba(255, 255, 255, 0.3);
  font-family: monospace;
}

.zone-label {
  font-size: 10px;
  font-weight: 700;
  font-family: monospace;
  letter-spacing: 0.05em;
}

.zone-4d { fill: rgba(80, 180, 80, 0.6); }
.zone-5d { fill: rgba(200, 80, 80, 0.6); }
.zone-3d { fill: rgba(70, 130, 220, 0.6); }

.grid-cell {
  cursor: pointer;
}

.grid-cell:hover circle {
  stroke-width: 1.5;
  stroke: rgba(255, 255, 255, 0.6);
}

.cell-circle {
  transition: fill 0.4s ease, stroke 0.4s ease;
}

.cell-text {
  font-size: 7px;
  fill: rgba(255, 255, 255, 0.45);
  pointer-events: none;
  font-family: monospace;
  transition: fill 0.3s ease;
}

.cell-text.cell-highlighted {
  fill: rgba(0, 0, 0, 0.85);
  font-weight: 700;
  font-size: 8px;
}

.connection-line {
  pointer-events: none;
  transition: stroke-dashoffset 0.6s ease-out, opacity 0.4s ease;
}

.line-animated {
  transition: stroke-dashoffset 0.6s ease-out, opacity 0.4s ease;
}

.highlight-dot {
  pointer-events: none;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.4));
  transition: cx 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
              cy 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
              r 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dim-label {
  font-size: 7px;
  font-weight: 600;
  font-family: monospace;
  pointer-events: none;
  transition: opacity 0.4s ease 0.3s;
}

.tooltip-group {
  pointer-events: none;
}

.tooltip-text {
  font-size: 9px;
  fill: rgba(255, 255, 255, 0.85);
  font-family: monospace;
}

.tooltip-text.bold {
  font-weight: 600;
  fill: rgba(255, 255, 255, 0.95);
}
</style>
