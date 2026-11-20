<script setup lang="ts">
import { makeSortableList } from '@vue-dnd-kit/core'
import { captureSentryError } from '~/plugins/sentry.client'
import type { List } from '~/types/state'

const emit = defineEmits<{
  edit: [list: List]
  delete: [list: List]
}>()

const { t } = useI18n()
const listStore = useListStore()
const uiStore = useUIStore()
const container = useTemplateRef<HTMLElement>('container')
const canReorder = computed(() => listStore.lists.length > 1 && !uiStore.saving)

const { items } = makeSortableList(container, {
  items: () => listStore.lists,
  label: () => t('nav.manageLists'),
  disabled: () => !canReorder.value,
  dropOutside: 'cancel',
  onDrop(event) {
    event.preventDefault()
    const order = event.result.get(event.to.list)
    if (order) {
      void listStore.reorderLists(order.map((list) => list.id)).catch((error) => {
        captureSentryError(error)
        uiStore.addNotification({ type: 'error', message: t('list.reorderFailed') })
      })
    }
  },
})
</script>

<template>
  <v-list lines="two" class="pa-0">
    <div ref="container">
      <ShoppingListManageListRow
        v-for="(list, index) in items"
        :key="list.id"
        :list="list"
        :position="index + 1"
        :last="index === items.length - 1"
        :can-reorder="canReorder"
        :delete-disabled="items.length < 2"
        @edit="emit('edit', list)"
        @delete="emit('delete', list)"
      />
    </div>
  </v-list>
</template>
