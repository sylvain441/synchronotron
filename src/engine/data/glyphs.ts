export interface Glyph {
  id: number
  colorId: number | null
  name: string
  bmu: number
}

export const glyphs: Glyph[] = [
  {   id: 1,   colorId: 1,   name: 'imix',   bmu: 108 },
  {   id: 2,   colorId: 2,   name: 'ik',   bmu: 144 },
  {   id: 3,   colorId: 3,   name: 'akbal',   bmu: 126 },
  {   id: 4,   colorId: 4,   name: 'kan',   bmu: 90 },
  {   id: 5,   colorId: 1,   name: 'chicchan',   bmu: 288 },
  {   id: 6,   colorId: 2,   name: 'cimi',   bmu: 294 },
  {   id: 7,   colorId: 3,   name: 'manik',   bmu: 291 },
  {   id: 8,   colorId: 4,   name: 'lamat',   bmu: 300 },
  {   id: 9,   colorId: 1,   name: 'muluc',   bmu: 306 },
  {   id: 10,   colorId: 2,   name: 'oc',   bmu: 303 },
  {   id: 11,   colorId: 3,   name: 'chuen',   bmu: 312 },
  {   id: 12,   colorId: 4,   name: 'eb',   bmu: 318 },
  {   id: 13,   colorId: 1,   name: 'ben',   bmu: 315 },
  {   id: 14,   colorId: 2,   name: 'ix',   bmu: 276 },
  {   id: 15,   colorId: 3,   name: 'men',   bmu: 282 },
  {   id: 16,   colorId: 4,   name: 'cib',   bmu: 279 },
  {   id: 17,   colorId: 1,   name: 'caban',   bmu: 396 },
  {   id: 18,   colorId: 2,   name: 'etznab',   bmu: 402 },
  {   id: 19,   colorId: 3,   name: 'cauac',   bmu: 408 },
  {   id: 20,   colorId: 4,   name: 'ahau',   bmu: 414 },
  {   id: 21,   colorId: null,   name: 'hunab ku',   bmu: 441 },
]
