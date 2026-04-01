<script setup lang="ts">
import { computed } from 'vue'
import { NaturalDate } from 'natural-time-js'
import type { DateMode } from '../../engine/types'

const props = defineProps<{
  dateMode: DateMode
  year: number
  month: number
  day: number
  moon: number
  dayOfMoon: number
  error: string | null
}>()

const emit = defineEmits<{
  'update:year': [value: number]
  'update:month': [value: number]
  'update:day': [value: number]
  'setMoonDate': [moon: number, dayOfMoon: number]
  'setDate': [year: number, month: number, day: number]
}>()

const DAYS_PER_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

// Natural Time computed from current gregorian date
const naturalDate = computed(() => {
  try {
    return new NaturalDate(new Date(props.year, props.month - 1, props.day, 12, 0, 0), 0)
  } catch {
    return null
  }
})

const ntYear = computed(() => naturalDate.value?.year ?? 1)
const ntMoon = computed(() => naturalDate.value?.moon ?? 1)
const ntDayOfMoon = computed(() => naturalDate.value?.dayOfMoon ?? 1)
const ntIsRainbow = computed(() => naturalDate.value?.isRainbowDay ?? false)

// --- Helpers ---

function parseInput(e: Event): number | null {
  const raw = (e.target as HTMLInputElement).value.trim()
  if (raw === '') return null
  const n = parseInt(raw)
  return isNaN(n) ? null : n
}

function clampDay(m: number, d: number): number {
  return Math.min(d, DAYS_PER_MONTH[m] || 31)
}

// --- Gregorian handlers ---

function onYearChange(e: Event) {
  const v = parseInput(e)
  if (v === null) return
  emit('update:year', Math.max(v, 1582))
}

function onMonthChange(e: Event) {
  const v = parseInput(e)
  if (v === null) return
  const m = Math.min(Math.max(v, 1), 12)
  emit('update:month', m)
  emit('update:day', clampDay(m, props.day))
}

function onDayChange(e: Event) {
  const v = parseInput(e)
  if (v === null) return
  const maxDay = DAYS_PER_MONTH[props.month] || 31
  emit('update:day', Math.min(Math.max(v, 1), maxDay))
}

// --- 13 Moon handlers ---

function onMoonChange(e: Event) {
  const v = parseInput(e)
  if (v === null) return
  emit('setMoonDate', Math.min(Math.max(v, 1), 13), props.dayOfMoon)
}

function onDayOfMoonChange(e: Event) {
  const v = parseInput(e)
  if (v === null) return
  emit('setMoonDate', props.moon, Math.min(Math.max(v, 1), 28))
}

// --- Natural Time handlers ---

function ntToGregorian(ntYr: number, ntMn: number, ntDay: number): Date | null {
  try {
    const approxDate = new Date(2011 + ntYr, 5, 1, 12, 0, 0)
    const probe = new NaturalDate(approxDate, 0)
    const dayOfYear = (ntMn - 1) * 28 + ntDay
    const targetMs = probe.yearStart + (dayOfYear - 1) * NaturalDate.MILLISECONDS_PER_DAY
    return new Date(targetMs + 12 * 3600000)
  } catch {
    return null
  }
}

function applyNtDate(ntYr: number, ntMn: number, ntDay: number) {
  const greg = ntToGregorian(ntYr, ntMn, ntDay)
  if (!greg) return
  emit('setDate', greg.getFullYear(), greg.getMonth() + 1, greg.getDate())
}

function onNtYearChange(e: Event) {
  const v = parseInput(e)
  if (v === null || v < 1) return
  applyNtDate(v, ntMoon.value, ntDayOfMoon.value)
}

function onNtMoonChange(e: Event) {
  const v = parseInput(e)
  if (v === null) return
  applyNtDate(ntYear.value, Math.min(Math.max(v, 1), 13), ntDayOfMoon.value)
}

function onNtDayChange(e: Event) {
  const v = parseInput(e)
  if (v === null) return
  applyNtDate(ntYear.value, ntMoon.value, Math.min(Math.max(v, 1), 28))
}
</script>

<template>
  <div class="date-picker">
    <!-- Gregorian inputs -->
    <div v-if="dateMode === 'gregorian'" class="date-inputs">
      <label>
        <span>Year</span>
        <input type="number" :value="year" min="1582" @change="onYearChange" />
      </label>
      <label>
        <span>Month</span>
        <input type="number" :value="month" min="1" max="12" @change="onMonthChange" />
      </label>
      <label>
        <span>Day</span>
        <input type="number" :value="day" min="1" :max="DAYS_PER_MONTH[month]" @change="onDayChange" />
      </label>
    </div>

    <!-- 13 Moon inputs (no year — 13 Moon calendar doesn't number years) -->
    <div v-else-if="dateMode === '13moon'" class="date-inputs">
      <label>
        <span>Moon</span>
        <input type="number" :value="moon" min="1" max="13" @change="onMoonChange" />
      </label>
      <label>
        <span>Day</span>
        <input type="number" :value="dayOfMoon" min="1" max="28" @change="onDayOfMoonChange" />
      </label>
    </div>

    <!-- Natural Time inputs -->
    <div v-else class="date-inputs">
      <label>
        <span>Year</span>
        <input type="number" :value="ntYear" min="1" @change="onNtYearChange" />
      </label>
      <label>
        <span>Moon</span>
        <input type="number" :value="ntMoon" min="1" max="13" @change="onNtMoonChange" />
      </label>
      <label>
        <span>Day</span>
        <input type="number" :value="ntDayOfMoon" min="1" max="28" @change="onNtDayChange" />
      </label>
    </div>

    <!-- Rainbow day indicator for NT mode -->
    <div v-if="dateMode === 'natural' && ntIsRainbow" class="rainbow-hint">
      <span class="rainbow-badge">Rainbow Day</span>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<style scoped>
.date-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-inputs {
  display: flex;
  gap: 6px;
  align-items: flex-end;
}

.date-inputs label {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.date-inputs label span {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.5;
}

.date-inputs input {
  width: 100%;
  padding: 5px 7px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
  font-size: 14px;
  font-family: inherit;
}

.date-inputs input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.35);
}

.rainbow-hint {
  text-align: center;
  padding: 4px 0;
}

.rainbow-badge {
  background: linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #9b59b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
  font-size: 12px;
}

.error {
  padding: 6px 10px;
  background: rgba(220, 50, 50, 0.15);
  border: 1px solid rgba(220, 50, 50, 0.3);
  border-radius: 4px;
  font-size: 12px;
  color: #f5a0a0;
}
</style>
