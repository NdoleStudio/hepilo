<script setup lang="ts">
import {
  mdiCart,
  mdiClose,
  mdiDelete,
  mdiPlus,
  mdiNoteTextOutline,
  mdiNotificationClearAll,
} from '@mdi/js'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { CATEGORY_ID_UNCATEGORIZED } from '~/stores/category'
import type {
  Category,
  MaterializedListItem,
  SelectItem,
  UpdateItemRequest,
} from '~/types/state'
import emptyListSvg from '~/assets/images/empty-list.svg'

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const listStore = useListStore()
const itemStore = useItemStore()
const categoryStore = useCategoryStore()
const settingsStore = useSettingsStore()
const uiStore = useUIStore()

definePageMeta({
  layout: 'default',
  middleware: 'auth',
  key: route => String(route.params.listId),
})

// Combobox / add item
const itemName = ref('')
const isBlur = ref(false)
const addFormQuantity = ref(0)
const selectedItem = ref<null | number>(-1)

// Edit dialog
const dialog = ref(false)
const formValid = ref(false)
const formItemId = ref('')
const formName = ref('')
const formAddedToCart = ref(false)
const formCategoryId = ref(CATEGORY_ID_UNCATEGORIZED)
const formUnit = ref('')
const formQuantity = ref(1)
const formPricePerUnit = ref(0.0)
const formNotes = ref('')

const formNameRules = [
  (value: string | null): boolean | string =>
    (!!value && value.trim() !== '') || t('errors.nameRequired'),
  (value: string | null): boolean | string =>
    (!!value && value.length <= 50) || t('errors.nameTooLong50'),
]
const formQuantityRules = [
  (value: number | null): boolean | string =>
    !!value || t('errors.quantityRequired'),
  (value: number | null | string): boolean | string =>
    value === '' || value == null || (Number(value) > 0 && Number(value) <= 999) || t('errors.quantityRange'),
]
const formPricePerUnitRules = [
  (value: number | null | string): boolean | string =>
    value === null || value === '' || Number(value) >= 0 || t('errors.pricePerUnitMoreThan', { min: settingsStore.formatCurrency(0) }),
]
const formNotesRules = [
  (value: string | null): boolean | string =>
    !value || value.length <= 1000 || t('errors.notesTooLong'),
]

const totalPrice = computed(() => formPricePerUnit.value * formQuantity.value)

function categoryClass(category: Category): Record<string, boolean> {
  return { [`text-${category.color || 'teal'}`]: true }
}

function closePopup() {
  clearForm()
  dialog.value = false
}

function onPopupDelete() {
  listStore.deleteListItem(formItemId.value)
  closePopup()
}

function clearForm() {
  formName.value = ''
  formQuantity.value = 1
  formNotes.value = ''
  formItemId.value = ''
  formCategoryId.value = CATEGORY_ID_UNCATEGORIZED
  formPricePerUnit.value = 0.0
  formAddedToCart.value = false
  formUnit.value = ''
}

function setFormItem(item: MaterializedListItem) {
  formItemId.value = item.item.id
  formName.value = item.item.name
  formQuantity.value = item.listItem.quantity
  formNotes.value = item.listItem.notes
  formCategoryId.value = item.item.categoryId
  formPricePerUnit.value = item.item.pricePerUnit
  formAddedToCart.value = item.listItem.addedToCart
  formUnit.value = item.item.unit ?? ''
}

function itemClicked(item: MaterializedListItem) {
  setFormItem(item)
  dialog.value = true
  setTimeout(() => {
    selectedItem.value = null
  }, 200)
}

function onFocus() {
  addFormQuantity.value = 0
  isBlur.value = false
}

function onBlur() {
  isBlur.value = true
}

function hasQuantity(value: string): boolean {
  const nameQuantity = parseFloat(value.split(' ')[0])
  return !isNaN(nameQuantity) && nameQuantity > 0
}

function itemFilter(item: any, queryText: string, _itemText: string): boolean {
  const text = typeof item === 'string' ? item : (item?.text ?? item?.title ?? '')
  if (hasQuantity(queryText)) {
    addFormQuantity.value = parseFloat(queryText.split(' ')[0])
    queryText = queryText.split(' ').slice(1).join(' ')
  } else {
    addFormQuantity.value = 0
  }
  return text.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
}

function onChange(chosenItem: string | SelectItem) {
  let old = ''
  if (!isBlur.value) {
    if (typeof chosenItem === 'string') {
      if (chosenItem.trim().length > 15) {
        old = chosenItem.trim()
      }
      listStore.addItem(chosenItem)
    } else {
      listStore.addItem(
        (addFormQuantity.value > 0 ? addFormQuantity.value + ' ' : '') + chosenItem.text,
      )
    }
  }

  nextTick(() => {
    itemName.value = old
    nextTick(() => {
      document.getElementById('page-title')?.click()
    })
  })
}

function onClearCart() {
  listStore.emptyCartItems(listStore.selectedList.id)
}

function onSave() {
  listStore.updateItem({
    itemId: formItemId.value,
    name: formName.value,
    categoryId: formCategoryId.value,
    quantity: formQuantity.value,
    notes: formNotes.value,
    unit: formUnit.value,
    pricePerUnit: formPricePerUnit.value,
    addedToCart: formAddedToCart.value,
  })
  dialog.value = false
  clearForm()
}

function loadIntroductions() {
  const d = driver({
    onDestroyed: () => {
      settingsStore.setShowIntro(false)
    },
    steps: [
      {
        element: '#add-item-input',
        popover: {
          title: t('intro.addItemTitle'),
          description: t('intro.addItemDescription'),
        },
      },
      {
        element: '#list-category-title-0',
        popover: {
          title: t('intro.categoriesTitle'),
          description: t('intro.categoriesDescription'),
        },
      },
      {
        element: '#list-item-details-0-0',
        popover: {
          title: t('intro.editItemTitle'),
          description: t('intro.editItemDescription'),
        },
      },
      {
        element: '#list-item-checkbox-0-0',
        popover: {
          title: t('intro.moveToCartTitle'),
          description: t('intro.moveToCartDescription'),
        },
      },
      {
        element: '#list-item-delete-0-0',
        popover: {
          title: t('intro.deleteItemTitle'),
          description: t('intro.deleteItemDescription'),
        },
      },
      {
        element: '#header-drawer-btn',
        popover: {
          title: t('intro.listSettingsTitle'),
          side: 'right' as const,
          description: t('intro.listSettingsDescription'),
        },
      },
      {
        element: '#header-account-settings',
        popover: {
          title: t('intro.accountSettingsTitle'),
          description: t('intro.accountSettingsDescription'),
          side: 'left' as const,
        },
      },
    ],
  })
  d.drive()
}

let introTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  await listStore.loadState()
  const listId = route.params.listId as string

  if (listStore.selectedList.id !== listId) {
    if (!listStore.listExists(listId)) {
      navigateTo(localePath(`/lists/${listStore.selectedList.id}`))
      return
    }
    await listStore.setSelectedListId(listId)
  }

  listStore.setTitleByListId(listId)

  if (settingsStore.showIntro) {
    introTimeout = setTimeout(() => {
      loadIntroductions()
    }, 5000)
  }
})

onUnmounted(() => {
  if (introTimeout) {
    clearTimeout(introTimeout)
  }
})
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <ShoppingListDemoBanner />
        <div id="add-item-input">
          <v-combobox
            :custom-filter="itemFilter"
            @update:model-value="onChange"
            @blur="onBlur"
            @focus="onFocus"
            :items="itemStore.autocompleteItems"
            item-title="text"
            item-value="value"
            variant="solo"
            :auto-select-first="true"
            v-model="itemName"
            :placeholder="$t('list.addItem')"
            :prepend-inner-icon="mdiPlus"
          >
            <template #item="{ item: selectItem, props: itemProps }">
              <v-list-item v-bind="itemProps">
                <v-list-item-title>
                  {{ selectItem.raw.text }}
                  <span v-if="addFormQuantity > 0" class="text-medium-emphasis">
                    ({{ addFormQuantity.toString() + (selectItem.raw.unit ? ' ' + itemStore.itemUnitName(selectItem.raw.unit, addFormQuantity) : '') }})
                  </span>
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-combobox>
        </div>
      </v-col>
    </v-row>

    <!-- Loading spinner -->
    <v-progress-circular
      class="mx-auto d-block my-16"
      :size="100"
      :width="5"
      v-if="!listStore.stateLoaded"
      color="lime"
      indeterminate
    />

    <!-- Empty state -->
    <v-row v-if="listStore.listMaterializedItems.length === 0 && listStore.cartMaterializedItems.length === 0 && listStore.stateLoaded">
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <div class="text-center">
          <v-img
            class="mx-auto mb-4"
            max-height="150"
            :src="emptyListSvg"
          />
          <h3 class="text-title-large">{{ $t('list.emptyTitle') }}</h3>
          <p class="text-medium-emphasis">{{ $t('list.emptyDescription') }}</p>
        </div>
      </v-col>
    </v-row>

    <!-- Shopping list items -->
    <v-row v-if="listStore.listMaterializedItems.length > 0">
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <v-card flat tile>
          <v-card-text class="px-0 py-0">
            <v-list class="pb-0" lines="two">
              <v-progress-linear
                :active="uiStore.saving"
                :indeterminate="uiStore.saving"
                v-if="uiStore.saving"
                color="lime"
              />
              <template v-for="(categoryItem, index) in listStore.listMaterializedItems" :key="'header-' + categoryItem.category.id">
                <div :id="'list-category-title-' + index">
                  <v-list-subheader class="text-label-large text-uppercase" :class="categoryClass(categoryItem.category)">
                    {{ categoryItem.category.name }}
                  </v-list-subheader>
                </div>
                <v-list-item
                  v-for="(item, listIndex) in categoryItem.items"
                  :key="item.item.id"
                  @click="itemClicked(item)"
                >
                  <template #prepend>
                    <div :id="'list-item-checkbox-' + index + '-' + listIndex">
                      <v-checkbox-btn
                        @click.stop
                        @update:model-value="listStore.addToCart(item.item.id)"
                        :disabled="uiStore.saving"
                        :model-value="false"
                      />
                    </div>
                  </template>
                  <div :id="'list-item-details-' + index + '-' + listIndex">
                    <v-list-item-title>
                      {{ item.item.name }}
                      <span v-if="item.listItem.quantity > 1 || item.item.unit" class="text-medium-emphasis">
                        ({{ item.listItem.quantity + (item.item.unit ? ' ' + itemStore.itemUnitName(item.item.unit, item.listItem.quantity) : '') }})
                      </span>
                      <span v-if="item.listItem.notes.trim()">
                        <v-icon size="small" class="mt-n1" color="#afb42b" :icon="mdiNoteTextOutline" />
                      </span>
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-small">
                      {{ settingsStore.formatCurrency(item.listItem.quantity * item.item.pricePerUnit) }}
                    </v-list-item-subtitle>
                  </div>
                  <template #append>
                    <div :id="'list-item-delete-' + index + '-' + listIndex">
                      <v-tooltip location="bottom">
                        <template #activator="{ props: tooltipProps }">
                          <v-btn
                            v-bind="tooltipProps"
                            :icon="mdiDelete"
                            variant="text"
                            color="error"
                            @click.stop="listStore.deleteListItem(item.listItem.itemId)"
                          />
                        </template>
                        <span>{{ $t('common.delete') }}</span>
                      </v-tooltip>
                    </div>
                  </template>
                </v-list-item>
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Cart -->
    <v-row v-if="listStore.cartMaterializedItems.length > 0">
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <v-expansion-panels :model-value="listStore.cartPanel" flat>
          <v-expansion-panel @group:selected="listStore.toggleCartPanel()">
            <v-expansion-panel-title class="text-label-large text-uppercase pl-4">
              <div>
                {{ $t('list.cart') }}
                <v-icon size="small" :icon="mdiCart" />
                <v-btn
                  v-if="listStore.cartMaterializedItems.length"
                  @click.stop.prevent
                  class="ml-4"
                  color="success"
                  variant="text"
                  size="small"
                  :prepend-icon="mdiNotificationClearAll"
                  @click="onClearCart"
                >
                  {{ $t('list.clearCart') }}
                </v-btn>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-list class="mb-n4 pb-0 mx-n4" lines="two">
                <template v-for="categoryItem in listStore.cartMaterializedItems" :key="'cart-' + categoryItem.category.id">
                  <v-list-item
                    v-for="item in categoryItem.items"
                    :key="item.item.id"
                    @click="itemClicked(item)"
                  >
                    <template #prepend>
                      <v-checkbox-btn
                        @click.stop
                        :disabled="uiStore.saving"
                        :model-value="true"
                        @update:model-value="listStore.removeFromCart(item.item.id)"
                      />
                    </template>
                    <v-list-item-title class="text-decoration-line-through text-medium-emphasis">
                      {{ item.item.name }}
                      <span v-if="item.listItem.quantity > 1 || item.item.unit" class="text-medium-emphasis">
                        ({{ item.listItem.quantity + (item.item.unit ? ' ' + itemStore.itemUnitName(item.item.unit, item.listItem.quantity) : '') }})
                      </span>
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-small">
                      {{ settingsStore.formatCurrency(item.listItem.quantity * item.item.pricePerUnit) }}
                    </v-list-item-subtitle>
                    <template #append>
                      <v-btn :icon="mdiDelete" variant="text" color="error" @click.stop="listStore.deleteListItem(item.listItem.itemId)" />
                    </template>
                  </v-list-item>
                </template>
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <!-- Totals -->
    <v-row v-if="listStore.cartTotal > 0.0 || listStore.listTotal > 0.0">
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <v-card flat>
          <v-card-text class="pb-0">
            <v-row>
              <v-col>
                <div class="d-flex mb-n2" style="width: 100%">
                  <div>
                    <p class="text-label-large text-uppercase">{{ $t('list.listTotal') }}</p>
                    <p class="text-title-large mt-n5">{{ settingsStore.formatCurrency(listStore.listTotal) }}</p>
                  </div>
                  <v-spacer />
                  <div>
                    <p class="text-label-large text-uppercase text-right">{{ $t('list.cartTotal') }}</p>
                    <p class="text-title-large mt-n5">{{ settingsStore.formatCurrency(listStore.cartTotal) }}</p>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit item dialog -->
    <v-dialog v-model="dialog" max-width="90%" width="500" transition="scale-transition">
      <v-card>
        <v-card-title>
          <v-btn variant="text" color="success" :disabled="!formValid || uiStore.saving" @click="onSave">
            {{ $t('common.save') }}
          </v-btn>
          <v-spacer />
          <v-btn :icon="mdiClose" variant="text" color="info" @click="closePopup" />
        </v-card-title>
        <v-card-text>
          <v-form class="mt-2" v-model="formValid" lazy-validation>
            <v-text-field
              aria-required="true"
              :disabled="uiStore.saving"
              v-model="formName"
              :rules="formNameRules"
              :label="$t('common.name')"
              counter="50"
              persistent-placeholder
              :placeholder="$t('common.placeholderItemNameShoppingList')"
              variant="outlined"
            />
            <div class="d-flex mt-2">
              <v-text-field
                :disabled="uiStore.saving"
                aria-required="true"
                v-model="formQuantity"
                :rules="formQuantityRules"
                :label="$t('common.quantity')"
                type="number"
                persistent-placeholder
                :placeholder="$t('common.placeholderQuantity')"
                variant="outlined"
              />
              <v-select
                class="ml-3"
                :disabled="uiStore.saving"
                :items="itemStore.itemUnitSelectItems"
                item-title="text"
                item-value="value"
                v-model="formUnit"
                variant="outlined"
                clearable
                :label="$t('common.unit')"
              />
            </div>
            <v-text-field
              class="mt-2"
              :disabled="uiStore.saving"
              aria-required="true"
              v-model="formPricePerUnit"
              :rules="formPricePerUnitRules"
              :label="$t('common.pricePerUnit')"
              type="number"
              :prefix="settingsStore.currencySymbol"
              persistent-placeholder
              :placeholder="$t('common.placeholderPrice')"
              :hint="$t('list.totalPriceHint', { price: settingsStore.formatCurrency(totalPrice) })"
              :persistent-hint="totalPrice > 0"
              variant="outlined"
            />
            <v-select
              class="mt-2"
              :disabled="uiStore.saving"
              :items="categoryStore.categorySelectItems"
              item-title="text"
              item-value="value"
              v-model="formCategoryId"
              variant="outlined"
              :label="$t('common.category')"
            />
            <v-textarea
              class="mt-2"
              :disabled="uiStore.saving"
              counter="1000"
              v-model="formNotes"
              :rules="formNotesRules"
              :label="$t('common.notes')"
              persistent-placeholder
              placeholder=""
              variant="outlined"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="mt-n4">
          <v-btn variant="text" color="success" :disabled="!formValid || uiStore.saving" @click="onSave">
            {{ $t('common.save') }}
          </v-btn>
          <v-spacer />
          <v-btn color="error" variant="text" @click="onPopupDelete">
            {{ $t('common.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
