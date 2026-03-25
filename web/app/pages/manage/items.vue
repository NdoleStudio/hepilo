<script setup lang="ts">
import { mdiPlus, mdiClose, mdiMagnify, mdiSquareEditOutline, mdiSync, mdiTrashCan } from '@mdi/js'
import { CATEGORY_ID_UNCATEGORIZED } from '~/stores/category'
import type { Item, UpsertItemRequest } from '~/types/state'

const { t } = useI18n()
const itemStore = useItemStore()
const categoryStore = useCategoryStore()
const listStore = useListStore()
const settingsStore = useSettingsStore()
const uiStore = useUIStore()

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const formValid = ref(false)
const formQuery = ref('')
const itemSize = ref(20)
const dialog = ref(false)
const dialogDelete = ref(false)
const synchronizing = ref(false)

const defaultItem: UpsertItemRequest = {
  name: '',
  unit: '',
  itemId: '',
  pricePerUnit: 0,
  categoryId: CATEGORY_ID_UNCATEGORIZED,
}
const editedItem = ref<UpsertItemRequest>({ ...defaultItem })

const formNameRules = [
  (value: string | null): boolean | string =>
    (!!value && value.trim() !== '') || t('errors.categoryNameRequired'),
  (value: string | null): boolean | string =>
    (!!value && value.length <= 15) || t('errors.categoryNameTooLong'),
]

const formPricePerUnitRules = [
  (value: number | null | string): boolean | string =>
    (!Number.isNaN(value) && value != null && value !== '' && Number(value) >= 0) ||
    t('errors.pricePerUnitMin', { min: settingsStore.formatCurrency(0) }),
]

const filteredItems = computed(() => {
  const query = formQuery.value.trim().toLowerCase()
  if (query === '') return itemStore.items
  return itemStore.items.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      itemStore.findCategoryNameByItemId(item.id).toLowerCase().includes(query),
  )
})

const canLoadMore = computed(() => filteredItems.value.length > itemSize.value)

const formTitle = computed(() =>
  editedItem.value.itemId === defaultItem.itemId
    ? t('item.addItem')
    : t('item.editItem'),
)

onMounted(() => {
  listStore.loadState()
  uiStore.setTitle(t('nav.manageItems'))
})

function closePopup() {
  clearForm()
  dialog.value = false
}

function closeDeleteDialog() {
  dialogDelete.value = false
  nextTick(() => clearForm())
}

async function onSave() {
  await itemStore.upsertItem({ ...editedItem.value })
  dialog.value = false
  clearForm()
}

function onDeleteItem(item: Item) {
  editedItem.value = { ...item, itemId: item.id }
  dialogDelete.value = true
}

function onDeleteItemConfirm() {
  itemStore.deleteItem(editedItem.value.itemId)
  closeDeleteDialog()
}

function onEditItem(item: Item) {
  editedItem.value = { ...item, itemId: item.id }
  dialog.value = true
}

async function onSync() {
  synchronizing.value = true
  await itemStore.syncItems()
  synchronizing.value = false
}

function clearForm() {
  editedItem.value = { ...defaultItem }
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <ShoppingListDemoBanner />
        <div
          class="d-flex"
          :class="{ 'justify-center': itemStore.items.length === 0 && $vuetify.display.mdAndDown }"
        >
          <v-text-field
            :prepend-inner-icon="mdiMagnify"
            variant="solo-inverted"
            :placeholder="$t('item.searchItems')"
            density="compact"
            v-model="formQuery"
            class="mb-n2 mr-5"
          />
          <v-btn @click="onSync" :disabled="synchronizing">
            <v-icon v-if="$vuetify.display.lgAndUp" :icon="mdiSync" />
            {{ $t('item.synchronize') }}
          </v-btn>
          <v-spacer />
          <v-dialog v-model="dialog" max-width="500">
            <template #activator="{ props: activatorProps }">
              <v-btn color="primary" v-bind="activatorProps" class="mb-4">
                <v-icon v-if="$vuetify.display.mdAndUp" :icon="mdiPlus" />
                {{ $t('item.addItem') }}
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                {{ formTitle }}
                <v-spacer />
                <v-btn color="info" icon @click="closePopup">
                  <v-icon :icon="mdiClose" />
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-form v-model="formValid" lazy-validation>
                  <v-text-field
                    class="mt-2"
                    aria-required="true"
                    :disabled="uiStore.saving"
                    v-model="editedItem.name"
                    :rules="formNameRules"
                    :label="$t('common.name')"
                    counter="15"
                    persistent-placeholder
                    :placeholder="$t('common.placeholderItemName')"
                    variant="outlined"
                  />
                  <v-text-field
                    class="mt-2"
                    :disabled="uiStore.saving"
                    aria-required="true"
                    v-model="editedItem.pricePerUnit"
                    :rules="formPricePerUnitRules"
                    :label="$t('common.pricePerUnit')"
                    type="number"
                    :prefix="settingsStore.currencySymbol"
                    persistent-placeholder
                    :placeholder="$t('common.placeholderPrice')"
                    variant="outlined"
                  />
                  <v-select
                    class="mt-2"
                    :disabled="uiStore.saving"
                    :items="categoryStore.categorySelectItems"
                    item-title="text"
                    item-value="value"
                    v-model="editedItem.categoryId"
                    variant="outlined"
                    :label="$t('common.category')"
                  />
                  <v-select
                    :disabled="uiStore.saving"
                    :items="itemStore.itemUnitSelectItems"
                    item-title="text"
                    item-value="value"
                    v-model="editedItem.unit"
                    variant="outlined"
                    clearable
                    :label="$t('common.unit')"
                  />
                </v-form>
              </v-card-text>
              <v-card-actions class="mt-n8">
                <v-btn
                  variant="text"
                  color="success"
                  :disabled="!formValid || uiStore.saving"
                  @click="onSave"
                >
                  {{ $t('common.save') }}
                </v-btn>
                <v-spacer />
                <v-btn color="info" variant="text" @click="closePopup">
                  {{ $t('common.cancel') }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>

        <v-card flat>
          <v-card-text class="px-0 py-0">
            <v-list lines="two" class="pb-0 px-0" nav>
              <template v-for="(item, index) in filteredItems.slice(0, itemSize)" :key="item.id">
                <v-list-item @click="onEditItem(item)" class="mb-0">
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    <span class="text-label-small text-uppercase">
                      {{ itemStore.findCategoryNameByItemId(item.id) }}
                    </span>
                    -
                    <span class="text-high-emphasis">
                      {{ settingsStore.formatCurrency(item.pricePerUnit) }}
                    </span>
                  </v-list-item-subtitle>
                  <template #append>
                    <div class="d-flex">
                      <v-tooltip location="bottom">
                        <template #activator="{ props: tooltipProps }">
                          <v-btn
                            @click="onEditItem(item)"
                            color="info"
                            class="mr-2"
                            v-bind="tooltipProps"
                            icon
                          >
                            <v-icon :icon="mdiSquareEditOutline" />
                          </v-btn>
                        </template>
                        <span>{{ $t('common.edit', { name: item.name }) }}</span>
                      </v-tooltip>
                      <v-tooltip location="bottom">
                        <template #activator="{ props: tooltipProps }">
                          <v-btn
                            @click.stop="onDeleteItem(item)"
                            color="error"
                            icon
                            v-bind="tooltipProps"
                            class="ml-2"
                          >
                            <v-icon :icon="mdiTrashCan" />
                          </v-btn>
                        </template>
                        <span>{{ $t('common.deleteItem', { name: item.name }) }}</span>
                      </v-tooltip>
                    </div>
                  </template>
                </v-list-item>
                <v-divider v-if="index < filteredItems.length - 1" />
              </template>
            </v-list>
          </v-card-text>
        </v-card>

        <div class="text-center mt-4 mb-4" v-if="canLoadMore" @click="itemSize += 20">
          <v-btn color="primary">{{ $t('item.loadMore') }}</v-btn>
        </div>

        <v-dialog v-model="dialogDelete" max-width="500" width="400">
          <v-card>
            <v-card-title class="text-headline-small">
              <div class="text-break">
                {{ $t('list.deleteConfirmation') }}
                <code class="d-inline-block">{{ editedItem.name }}</code>?
              </div>
            </v-card-title>
            <v-card-actions>
              <v-btn color="info" variant="text" @click="closeDeleteDialog">
                {{ $t('common.no') }}
              </v-btn>
              <v-spacer />
              <v-btn color="error" variant="text" @click="onDeleteItemConfirm">
                {{ $t('common.yes') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>
