export function getMaterialToolbarActions(hidden: boolean) {
  if (hidden) {
    return ['restore'] as const
  }

  return ['market', 'hide'] as const
}

export function shouldShowMaterialToolbarMenu(hidden: boolean) {
  return !hidden
}
