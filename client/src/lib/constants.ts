export const CATEGORY_GROUPS = [
  {
    key: 'cham-soc-da',
    label: 'Chăm sóc da',
    categorySlugs: ['cham-soc-da'],
    topBrands: ["Cocoon", "La Roche-Posay", "Vichy", "Kiehl's"],
  },
  {
    key: 'trang-diem',
    label: 'Trang điểm',
    categorySlugs: ['trang-diem'],
    topBrands: ["Maybelline", "L'Oreal", "M.A.C", "NARS"],
  },
  {
    key: 'cham-soc-toc',
    label: 'Chăm sóc tóc',
    categorySlugs: ['cham-soc-toc'],
    topBrands: ["TRESemmé", "Pantene", "L'Oreal", "Dove"],
  },
  {
    key: 'cham-soc-co-the',
    label: 'Chăm sóc cơ thể',
    categorySlugs: ['cham-soc-co-the'],
    topBrands: ["Vaseline", "Nivea", "Dove", "P/S"],
  },
  {
    key: 'nuoc-hoa',
    label: 'Nước hoa',
    categorySlugs: ['nuoc-hoa'],
    topBrands: ["Dior", "Chanel", "Versace", "Gucci"],
  },
] as const;

export type GroupKey = typeof CATEGORY_GROUPS[number]['key'];

