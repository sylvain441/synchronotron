<script setup lang="ts">
import { computed } from 'vue'
import { NaturalDate } from 'natural-time-js'
import type { KinResult, DateMode } from '../../engine/types'

const props = defineProps<{
  kinResult: KinResult | null
  dateMode: DateMode
  year: number
  month: number
  day: number
}>()

defineEmits<{
  prevDay: []
  nextDay: []
  today: []
}>()

const GREGORIAN_MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const MOON_NAMES = [
  '', 'Magnetic', 'Lunar', 'Electric', 'Self-Existing', 'Overtone', 'Rhythmic',
  'Resonant', 'Galactic', 'Solar', 'Planetary', 'Spectral', 'Crystal', 'Cosmic',
]

const dateLabel = computed(() => {
  const k = props.kinResult
  if (!k) return '—'

  switch (props.dateMode) {
    case 'gregorian':
      return `${GREGORIAN_MONTHS[props.month]} ${props.day}, ${props.year}`
    case '13moon':
      return `${MOON_NAMES[k.moon] || ''} Moon, Day ${k.dayOfMoon}`
    case 'natural': {
      try {
        const nd = new NaturalDate(new Date(props.year, props.month - 1, props.day, 12), 0)
        if (nd.isRainbowDay) return 'Rainbow Day'
        return nd.toDateString()
      } catch {
        return '—'
      }
    }
    default:
      return '—'
  }
})

const kinLabel = computed(() => {
  const k = props.kinResult
  if (!k) return ''
  return `Kin ${k.kin} — ${k.kinToneName} ${k.kinGlyphName}`
})
</script>

<template>
  <div class="date-bar">
    <button class="bar-btn" @click="$emit('prevDay')" aria-label="Previous day">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
    </button>

    <div class="bar-center" @click="$emit('today')" role="button" tabindex="0" title="Go to today">
      <span class="bar-date">{{ dateLabel }}</span>
      <span class="bar-kin">{{ kinLabel }}</span>
    </div>

    <button class="bar-btn" @click="$emit('nextDay')" aria-label="Next day">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
    </button>
  </div>
</template>

<style scoped>
.date-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
}

.bar-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  color: inherit;
  cursor: pointer;
  transition: all 0.15s;
  opacity: 0.6;
}

.bar-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.bar-btn:active {
  transform: scale(0.92);
}

.bar-center {
  flex: 1;
  text-align: center;
  cursor: pointer;
  transition: opacity 0.15s;
  min-width: 0;
}

.bar-center:hover {
  opacity: 0.7;
}

.bar-date {
  display: block;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0.02em;
  opacity: 0.85;
}

.bar-kin {
  display: block;
  font-size: 11px;
  opacity: 0.4;
  margin-top: 2px;
  letter-spacing: 0.03em;
}
</style>
