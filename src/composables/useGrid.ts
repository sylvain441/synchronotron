import { computed } from 'vue'
import type { Ref } from 'vue'
import type { KinResult, HighlightedCell, GridConnection } from '../engine/types'
import { lookupGridByBaseUnit, lookupGridBySyncUnit } from '../engine/lookup'

export function useGrid(kinResult: Ref<KinResult | null>) {
  const highlightedCells = computed<HighlightedCell[]>(() => {
    const kin = kinResult.value
    if (!kin) return []

    const cells: HighlightedCell[] = []

    // 1. Time cell
    cells.push({
      v: kin.timeCell.v,
      h: kin.timeCell.h,
      dimension: 'time',
      label: 'Time',
      value: kin.timeCell.total,
    })

    // 2. Space cell
    cells.push({
      v: kin.spaceCell.v,
      h: kin.spaceCell.h,
      dimension: 'space',
      label: 'Space',
      value: kin.spaceCell.total,
    })

    // 3. Sync cell
    cells.push({
      v: kin.syncCell.v,
      h: kin.syncCell.h,
      dimension: 'sync',
      label: 'Sync',
      value: kin.syncCell.total,
    })

    // 4. TFI Hunab Ku cell
    try {
      const tfiHkCell = lookupGridByBaseUnit(kin.tfiHunabKuBmu)
      cells.push({
        v: tfiHkCell.v,
        h: tfiHkCell.h,
        dimension: 'tfiHunabKu',
        label: 'TFI HK',
        value: kin.tfiHunabKuBmu,
      })
    } catch { /* skip if not found */ }

    // 5. TFI MCF cell
    try {
      const tfiMcfCell = lookupGridByBaseUnit(kin.tfiMcfBmu)
      cells.push({
        v: tfiMcfCell.v,
        h: tfiMcfCell.h,
        dimension: 'tfiMcf',
        label: 'TFI MCF',
        value: kin.tfiMcfBmu,
      })
    } catch { /* skip */ }

    // 6. Equivalent Kin cell
    if (kin.equivalentKinV && kin.equivalentKinH) {
      cells.push({
        v: kin.equivalentKinV,
        h: kin.equivalentKinH,
        dimension: 'equivalentKin',
        label: 'Eq. Kin',
        value: kin.equivalentKin,
      })
    }

    // 7. Psi Chrono cell
    if (kin.psiChronoUnitV && kin.psiChronoUnitH) {
      cells.push({
        v: kin.psiChronoUnitV,
        h: kin.psiChronoUnitH,
        dimension: 'psiChrono',
        label: 'Psi',
        value: kin.psiChronoUnit,
      })
    }

    return cells
  })

  const connections = computed<GridConnection[]>(() => {
    const cells = highlightedCells.value
    const conns: GridConnection[] = []

    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const a = cells[i]
        const b = cells[j]

        // Horizontal alignment (same row)
        if (a.v === b.v) {
          conns.push({
            from: { v: a.v, h: a.h },
            to: { v: b.v, h: b.h },
            type: 'horizontal',
            dimensions: `${a.dimension}-${b.dimension}`,
          })
        }

        // Vertical alignment (same column)
        if (a.h === b.h) {
          conns.push({
            from: { v: a.v, h: a.h },
            to: { v: b.v, h: b.h },
            type: 'vertical',
            dimensions: `${a.dimension}-${b.dimension}`,
          })
        }

        // Diagonal alignment
        if (Math.abs(a.v - b.v) === Math.abs(a.h - b.h) && a.v !== b.v) {
          conns.push({
            from: { v: a.v, h: a.h },
            to: { v: b.v, h: b.h },
            type: 'diagonal',
            dimensions: `${a.dimension}-${b.dimension}`,
          })
        }
      }
    }

    return conns
  })

  return { highlightedCells, connections }
}
