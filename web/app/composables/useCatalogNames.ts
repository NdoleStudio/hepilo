import catalog from '~/assets/categories.json'

const catalogIds = {
  items: new Set(
    Object.values(catalog)
      .flat()
      .map((name) => name.toLowerCase()),
  ),
  categories: new Set(['uncategorized', ...Object.keys(catalog).map((name) => name.toLowerCase())]),
}

type Entry = { id: string; name: string; customName?: boolean }

export function useCatalogNames(kind: keyof typeof catalogIds) {
  const { $i18n } = useNuxtApp()

  function displayName(entry: Entry): string {
    // Older saved catalogs have no provenance flag; match their original ID and name.
    if (
      entry.customName ||
      entry.name.toLowerCase() !== entry.id ||
      !catalogIds[kind].has(entry.id)
    )
      return entry.name
    if (kind === 'categories' && entry.id === 'uncategorized')
      return $i18n.t('category.uncategorized')
    const key = `catalog.${kind}.${entry.id.replace(/[^a-z0-9]+/g, '_')}`
    return $i18n.te(key) ? $i18n.t(key) : entry.name
  }

  function storedName(entry: Entry | undefined, input: string): string {
    const name = input.trim()
    return entry && name === displayName(entry) ? entry.name : name
  }

  return { displayName, storedName }
}
