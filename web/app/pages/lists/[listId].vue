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
const isEnterPressed = ref(false)
const comboboxMenu = ref(false)
const addFormQuantity = ref(0)
const selectedItem = ref<null | number>(-1)
let lastCommittedItem = ''

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

function onComboboxKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.isComposing) {
    isEnterPressed.value = true
    setTimeout(() => { isEnterPressed.value = false }, 0)
  }
}

function hasQuantity(value: string): boolean {
  const nameQuantity = parseFloat(value.split(' ')[0]!)
  return !isNaN(nameQuantity) && nameQuantity > 0
}

function itemFilter(value: string, query: string, _item?: any): boolean {
  if (value == null || query == null) return false
  if (hasQuantity(query)) {
    addFormQuantity.value = parseFloat(query.split(' ')[0]!)
    query = query.split(' ').slice(1).join(' ')
  } else {
    addFormQuantity.value = 0
  }
  return value.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) > -1
}

function onChange(chosenItem: string | SelectItem | null) {
  if (!chosenItem) return

  let itemToAdd = ''
  let valueAfterAdd = ''

  if (typeof chosenItem === 'object' && 'title' in chosenItem) {
    // Object = dropdown selection or auto-select-first → always add
    itemToAdd = (addFormQuantity.value > 0 ? addFormQuantity.value + ' ' : '') + chosenItem.title
  } else if (typeof chosenItem === 'string' && isEnterPressed.value && !isBlur.value) {
    // String + Enter pressed = user committed typed text → add
    const trimmed = chosenItem.trim()
    if (!trimmed) return
    if (trimmed.length > 15) {
      valueAfterAdd = trimmed
    }
    itemToAdd = chosenItem
  } else {
    // String without Enter = just typing (keystroke) → ignore
    return
  }

  // Prevent double-fire (auto-select-first emits object then string for same Enter)
  const normalized = itemToAdd.trim().toLowerCase()
  if (lastCommittedItem === normalized) return
  lastCommittedItem = normalized
  setTimeout(() => { lastCommittedItem = '' }, 0)

  listStore.addItem(itemToAdd)
  comboboxMenu.value = false

  nextTick(() => {
    itemName.value = valueAfterAdd
    // Blur input to prevent menu from reopening after click selection
    const input = document.querySelector('#add-item-input input') as HTMLInputElement | null
    input?.blur()
  })
}

function onClearCart() {
  listStore.emptyCartItems(listStore.selectedList.id)
}

// Animation state
const ANIMATION_DURATION = 200
const leavingItems = ref(new Set<string>())
const enteringItems = ref(new Set<string>())

function onAddToCart(itemId: string) {
  leavingItems.value = new Set([...leavingItems.value, itemId])
  setTimeout(() => {
    leavingItems.value = new Set([...leavingItems.value].filter(id => id !== itemId))
    listStore.addToCart(itemId)
    enteringItems.value = new Set([...enteringItems.value, itemId])
    setTimeout(() => {
      enteringItems.value = new Set([...enteringItems.value].filter(id => id !== itemId))
    }, ANIMATION_DURATION)
  }, ANIMATION_DURATION)
}

function onRemoveFromCart(itemId: string) {
  leavingItems.value = new Set([...leavingItems.value, itemId])
  setTimeout(() => {
    leavingItems.value = new Set([...leavingItems.value].filter(id => id !== itemId))
    listStore.removeFromCart(itemId)
    enteringItems.value = new Set([...enteringItems.value, itemId])
    setTimeout(() => {
      enteringItems.value = new Set([...enteringItems.value].filter(id => id !== itemId))
    }, ANIMATION_DURATION)
  }, ANIMATION_DURATION)
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
            v-model:menu="comboboxMenu"
            @update:model-value="onChange"
            @keydown.enter.capture="onComboboxKeydown"
            @blur="onBlur"
            @focus="onFocus"
            :items="itemStore.autocompleteItems"
            color="primary"
            variant="solo"
            :auto-select-first="true"
            v-model="itemName"
            :placeholder="$t('list.addItem')"
            :prepend-inner-icon="mdiPlus"
            autocomplete="off"
          >
            <template #item="{ item, props: itemProps }">
              <v-list-item v-bind="itemProps" :title="undefined">
                <v-list-item-title>
                  {{ item.title }}
                  <span v-if="addFormQuantity > 0" class="text-medium-emphasis">
                    ({{ addFormQuantity.toString() + (item.unit ? ' ' + itemStore.itemUnitName(item.unit, addFormQuantity) : '') }})
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
                  <v-list-subheader class="text-label-large text-uppercase font-weight-bold" :class="categoryClass(categoryItem.category)">
                    {{ categoryItem.category.name }}
                  </v-list-subheader>
                </div>
                <v-list-item
                  v-for="(item, listIndex) in categoryItem.items"
                  :key="item.item.id"
                  :class="{ 'list-item-leaving': leavingItems.has(item.item.id), 'list-item-entering': enteringItems.has(item.item.id) }"
                  @click="itemClicked(item)"
                >
                    <template #prepend>
                      <v-list-item-action start>
                        <div :id="'list-item-checkbox-' + index + '-' + listIndex">
                          <v-checkbox-btn
                              @click.stop
                              color="primary"
                              @update:model-value="onAddToCart(item.item.id)"
                              :disabled="uiStore.saving"
                              :model-value="false"
                          />
                        </div>
                      </v-list-item-action>
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
                  density="compact"
                  :prepend-icon="mdiNotificationClearAll"
                  @click="onClearCart"
                >
                  {{ $t('list.clearCart') }}
                </v-btn>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="px-0">
              <v-list class="mb-n4 pb-0 mx-n6 mt-n4" lines="two">
                <template v-for="categoryItem in listStore.cartMaterializedItems" :key="'cart-' + categoryItem.category.id">
                  <v-list-item
                    v-for="item in categoryItem.items"
                    :key="item.item.id"
                    :class="{ 'cart-item-leaving': leavingItems.has(item.item.id), 'cart-item-entering': enteringItems.has(item.item.id) }"
                    @click="itemClicked(item)"
                  >
                    <template #prepend>
                      <v-list-item-action start>
                        <v-checkbox-btn
                            @click.stop
                            color="primary"
                            :disabled="uiStore.saving"
                            :model-value="true"
                            @update:model-value="onRemoveFromCart(item.item.id)"
                        />
                      </v-list-item-action>
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
                    <p class="text-label-large text-uppercase text-medium-emphasis">{{ $t('list.listTotal') }}</p>
                    <p class="text-title-large mt-n2">{{ settingsStore.formatCurrency(listStore.listTotal) }}</p>
                  </div>
                  <v-spacer />
                  <div>
                    <p class="text-label-large text-uppercase text-right text-medium-emphasis">{{ $t('list.cartTotal') }}</p>
                    <p class="text-title-large mt-n2">{{ settingsStore.formatCurrency(listStore.cartTotal) }}</p>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit item dialog -->
    <v-dialog v-model="dialog" class="dialog-responsive" opacity="0.8" transition="scale-transition" :style="{ paddingLeft: uiStore.navDrawerOpen ? '256px' : '0', transition: 'padding-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }">
      <v-card>
        <v-card-text>
          <v-form class="mt-2" v-model="formValid" lazy-validation>
            <div class="d-flex mt-n4 mb-2 mr-n4">
              <v-spacer />
              <v-btn density="compact" :icon="mdiClose" variant="text" color="info" @click="closePopup" />
            </div>
            <v-text-field
              aria-required="true"
              :disabled="uiStore.saving"
              v-model="formName"
              :rules="formNameRules"
              :label="$t('common.name')"
              counter="50"
              color="primary"
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
                class="w-50"
                type="number"
                color="primary"
                persistent-placeholder
                :placeholder="$t('common.placeholderQuantity')"
                variant="outlined"
              />
              <v-select
                class="ml-3 w-50"
                :disabled="uiStore.saving"
                :items="itemStore.itemUnitSelectItems"
                v-model="formUnit"
                color="primary"
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
              color="primary"
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
              v-model="formCategoryId"
              color="primary"
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
              color="primary"
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

<style scoped>
/* List item leaving: slide down + fade out */
.list-item-leaving {
  animation: slide-down-fade-out 0.2s ease-out forwards;
}

/* List item entering: slide up from below + fade in */
.list-item-entering {
  animation: slide-up-fade-in 0.2s ease-out;
}

/* Cart item leaving: slide up + fade out */
.cart-item-leaving {
  animation: slide-up-fade-out 0.2s ease-out forwards;
}

/* Cart item entering: slide down from above + fade in */
.cart-item-entering {
  animation: slide-down-fade-in 0.2s ease-out;
}

@keyframes slide-down-fade-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(20px); }
}

@keyframes slide-up-fade-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-20px); }
}

@keyframes slide-down-fade-in {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-up-fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.dialog-responsive {
  width: 100%;
}

/* md breakpoint (960px+): match container (900px) × md="8" (8/12) ≈ 600px */
@media (min-width: 960px) {
  .dialog-responsive {
    width: 600px;
  }
}

/* lg breakpoint (1280px+): match container (1185px) × lg="6" (6/12) ≈ 592px */
@media (min-width: 1280px) {
  .dialog-responsive {
    width: 592px;
  }
}
</style>
