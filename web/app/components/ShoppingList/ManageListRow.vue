<script setup lang="ts">
import { mdiDragVertical, mdiSquareEditOutline, mdiTrashCan } from '@mdi/js'
import { makeSortableItem } from '@vue-dnd-kit/core'
import type { List } from '~/types/state'

const props = defineProps<{
  list: List
  position: number
  last: boolean
  canReorder: boolean
  deleteDisabled: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const listStore = useListStore()
const row = useTemplateRef<HTMLElement>('row')

makeSortableItem(row, {
  item: () => props.list,
  label: () => props.list.name,
  handle: '.list-drag-handle',
})
</script>

<template>
  <div ref="row">
    <v-list-item class="mb-0" @click="emit('edit')">
      <template #prepend>
        <button
          type="button"
          class="list-drag-handle mr-2"
          :disabled="!canReorder"
          :aria-label="$t('list.reorderList', { name: list.name })"
          @click.stop
          @keydown.stop
        >
          <v-icon :icon="mdiDragVertical" aria-hidden="true" />
        </button>
        <v-icon :icon="listStore.listIcon(list.icon)" />
      </template>
      <v-list-item-title>{{ position }}. {{ list.name }}</v-list-item-title>
      <v-list-item-subtitle>
        {{
          list.items.length === 1
            ? $t('list.itemCountSingular', { count: list.items.length })
            : $t('list.itemCount', { count: list.items.length })
        }}
      </v-list-item-subtitle>
      <template #append>
        <div class="d-flex">
          <v-tooltip location="bottom">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                :icon="mdiSquareEditOutline"
                color="info"
                class="mr-2"
                v-bind="tooltipProps"
                variant="text"
                @click.stop="emit('edit')"
              />
            </template>
            <span>{{ $t('common.edit', { name: list.name }) }}</span>
          </v-tooltip>
          <v-tooltip location="bottom">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                :icon="mdiTrashCan"
                color="error"
                variant="text"
                v-bind="tooltipProps"
                class="ml-2"
                :disabled="deleteDisabled"
                @click.stop="emit('delete')"
              />
            </template>
            <span>{{ $t('common.deleteItem', { name: list.name }) }}</span>
          </v-tooltip>
        </div>
      </template>
    </v-list-item>
    <v-divider v-if="!last" />
  </div>
</template>

<style scoped>
.list-drag-handle {
  display: grid;
  place-items: center;
  width: 36px;
  height: 44px;
  cursor: grab;
}

.list-drag-handle:active {
  cursor: grabbing;
}

.list-drag-handle:disabled {
  cursor: default;
  opacity: 0.38;
}
</style>
