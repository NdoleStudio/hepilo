<script setup lang="ts">
import { mdiPlus, mdiClose, mdiSquare, mdiSquareEditOutline, mdiSync, mdiTrashCan } from '@mdi/js'
import { CATEGORY_COLOR_TEAL, useCategoryStore } from '~/stores/category'
import type { Category, UpsertCategoryRequest } from '~/types/state'

const { t } = useI18n()
const categoryStore = useCategoryStore()
const itemStore = useItemStore()
const listStore = useListStore()
const uiStore = useUIStore()

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const formValid = ref(false)
const dialog = ref(false)
const dialogDelete = ref(false)
const synchronizing = ref(false)

const defaultCategory: UpsertCategoryRequest = { name: '', id: '', color: CATEGORY_COLOR_TEAL }
const editedCategory = ref<UpsertCategoryRequest>({ ...defaultCategory })

const formNameRules = [
  (value: string | null): boolean | string =>
    (!!value && value.trim() !== '') || t('errors.categoryNameRequired'),
  (value: string | null): boolean | string =>
    (!!value && value.length <= 15) || t('errors.categoryNameTooLong'),
]

const formTitle = computed(() =>
  editedCategory.value.id === defaultCategory.id
    ? t('category.addCategory')
    : t('category.editCategory'),
)

onMounted(() => {
  listStore.loadState()
  uiStore.setTitle(t('nav.manageCategories'))
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
  await categoryStore.upsertCategory({
    name: editedCategory.value.name,
    id: editedCategory.value.id,
    color: editedCategory.value.color,
  })
  dialog.value = false
  clearForm()
}

function onDeleteCategory(category: Category) {
  editedCategory.value = { ...category }
  dialogDelete.value = true
}

function onDeleteCategoryConfirm() {
  categoryStore.deleteCategory(editedCategory.value.id)
  closeDeleteDialog()
}

function onEditCategory(category: Category) {
  editedCategory.value = { ...category }
  dialog.value = true
}

async function onSync() {
  synchronizing.value = true
  await categoryStore.syncCategories()
  synchronizing.value = false
}

function clearForm() {
  editedCategory.value = { ...defaultCategory }
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <ShoppingListDemoBanner />
        <div
          class="d-flex"
          :class="{ 'justify-center': categoryStore.editableCategories.length === 0 && $vuetify.display.mdAndDown }"
        >
          <v-btn @click="onSync" :disabled="synchronizing">
            <v-icon v-if="$vuetify.display.lgAndUp" :icon="mdiSync" />
            {{ $t('category.synchronize') }}
          </v-btn>
          <v-spacer />
          <v-dialog v-model="dialog" max-width="500">
            <template #activator="{ props: activatorProps }">
              <v-btn color="primary" v-bind="activatorProps" class="mb-4">
                <v-icon v-if="$vuetify.display.lgAndUp" :icon="mdiPlus" />
                {{ $t('category.addCategory') }}
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                {{ formTitle }}
                <v-spacer />
                <v-btn :icon="mdiClose" color="info" variant="text" @click="closePopup" />
              </v-card-title>
              <v-card-text>
                <v-form v-model="formValid" lazy-validation>
                  <v-text-field
                    class="mt-2"
                    aria-required="true"
                    :disabled="uiStore.saving"
                    v-model="editedCategory.name"
                    :rules="formNameRules"
                    :label="$t('common.name')"
                    counter="15"
                    persistent-placeholder
                    :placeholder="$t('common.placeholderCategoryName')"
                    variant="outlined"
                  />
                  <v-select
                    class="mt-2"
                    :disabled="uiStore.saving"
                    :items="categoryStore.categoryColorSelectItems"
                    item-title="text"
                    item-value="value"
                    v-model="editedCategory.color"
                    variant="outlined"
                    :label="$t('common.color')"
                  >
                    <template #item="{ item: selectItem, props: itemProps }">
                      <v-list-item v-bind="itemProps">
                        <template #append>
                          <v-icon :color="selectItem.value" :icon="mdiSquare" />
                        </template>
                      </v-list-item>
                    </template>
                    <template #append-inner>
                      <v-icon :color="editedCategory.color" :icon="mdiSquare" />
                    </template>
                  </v-select>
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
              <template v-for="(category, index) in categoryStore.editableCategories" :key="category.id">
                <v-list-item @click="onEditCategory(category)" class="mb-0">
                  <template #prepend>
                    <v-avatar rounded>
                      <v-icon :color="category.color" :icon="mdiSquare" />
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-label-small text-uppercase">{{ category.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ categoryStore.categoryItemsCount(category.id) === 1
                      ? $t('list.itemCountSingular', { count: categoryStore.categoryItemsCount(category.id) })
                      : $t('list.itemCount', { count: categoryStore.categoryItemsCount(category.id) }) }}
                  </v-list-item-subtitle>
                  <template #append>
                    <div class="d-flex">
                      <v-tooltip location="bottom">
                        <template #activator="{ props: tooltipProps }">
                          <v-btn
                            :icon="mdiSquareEditOutline"
                            @click="onEditCategory(category)"
                            color="info"
                            class="mr-2"
                            v-bind="tooltipProps"
                            variant="text"
                          />
                        </template>
                        <span>{{ $t('common.edit', { name: category.name }) }}</span>
                      </v-tooltip>
                      <v-tooltip location="bottom">
                        <template #activator="{ props: tooltipProps }">
                          <v-btn
                            :icon="mdiTrashCan"
                            @click.stop="onDeleteCategory(category)"
                            color="error"
                            variant="text"
                            v-bind="tooltipProps"
                            class="ml-2"
                          />
                        </template>
                        <span>{{ $t('common.deleteItem', { name: category.name }) }}</span>
                      </v-tooltip>
                    </div>
                  </template>
                </v-list-item>
                <v-divider v-if="index < categoryStore.editableCategories.length - 1" />
              </template>
            </v-list>
          </v-card-text>
        </v-card>

        <v-dialog v-model="dialogDelete" max-width="500" width="400">
          <v-card>
            <v-card-title class="text-headline-small">
              <div class="text-break">
                {{ $t('list.deleteConfirmation') }}
                <code class="d-inline-block">{{ editedCategory.name }}</code>?
              </div>
            </v-card-title>
            <v-card-actions>
              <v-btn color="info" variant="text" @click="closeDeleteDialog">
                {{ $t('common.no') }}
              </v-btn>
              <v-spacer />
              <v-btn color="error" variant="text" @click="onDeleteCategoryConfirm">
                {{ $t('common.yes') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>
