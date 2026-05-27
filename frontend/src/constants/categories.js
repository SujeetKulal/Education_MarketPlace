/** Subject categories — must match backend Material.Category choices */
export const MATERIAL_CATEGORIES = [
  { value: 'Management', label: 'Management' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Entrepreneurship', label: 'Entrepreneurship' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Science', label: 'Science' },
  { value: 'Arts', label: 'Arts' },
  { value: 'Social Sciences', label: 'Social Sciences' },
  { value: 'Business', label: 'Business' },
  { value: 'Law', label: 'Law' },
  { value: 'Medicine', label: 'Medicine' },
  { value: 'Pharmacy', label: 'Pharmacy' },
  { value: 'Other', label: 'Other' },
]

/** Sidebar shows All + categories through Operations; rest expand on "View All" */
export const MARKETPLACE_SIDEBAR_VISIBLE_COUNT = 6

export const CATEGORY_FILTER_OPTIONS = [
  { id: '', label: 'All Categories' },
  ...MATERIAL_CATEGORIES.map((c) => ({ id: c.value, label: c.label })),
]
