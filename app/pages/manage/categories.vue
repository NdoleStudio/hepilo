<script setup lang="ts">
import { mdiPlus, mdiClose, mdiSquare, mdiSquareEditOutline, mdiSync, mdiTrashCan } from '@mdi/js'
import { CATEGORY_COLOR_TEAL, useCategoryStore } from '~/stores/category'
import type { Category, UpsertCategoryRequest } from '~/types/state'

const { t } = useI18n()
const categoryStore = useCategoryStore()
const listStore = useListStore()
const uiStore = useUIStore()

useHead({
  title: () => t('nav.manageCategories'),
})

definePageMeta({
  layout: 'default',
  middleware: 'demo-or-auth',
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
  uiStore.addNotification({
    type: 'success',
    message: t('category.syncSuccess'),
  })
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
          :class="{
            'justify-center':
              categoryStore.editableCategories.length === 0 && $vuetify.display.mdAndDown,
          }"
        >
          <v-btn :disabled="synchronizing" @click="onSync" variant="tonal">
            <v-icon v-if="$vuetify.display.lgAndUp" :icon="mdiSync" start />
            {{ $t('category.synchronize') }}
          </v-btn>
          <v-spacer />
          <v-dialog
            v-model="dialog"
            class="dialog-responsive"
            opacity="0.8"
            transition="scale-transition"
            :style="{
              paddingLeft: uiStore.navDrawerOpen ? '256px' : '0',
              transition: 'padding-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }"
          >
            <template #activator="{ props: activatorProps }">
              <v-btn color="primary" v-bind="activatorProps" class="mb-4">
                <v-icon v-if="$vuetify.display.mdAndUp" :icon="mdiPlus" start />
                {{ $t('category.addCategory') }}
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="d-flex align-center ga-2">
                {{ formTitle }}
                <v-spacer />
                <v-btn
                  :icon="mdiClose"
                  color="warning"
                  variant="text"
                  density="comfortable"
                  class="mr-n2"
                  @click="closePopup"
                />
              </v-card-title>
              <v-card-text>
                <v-form v-model="formValid" lazy-validation>
                  <v-text-field
                    v-model="editedCategory.name"
                    class="mt-2"
                    aria-required="true"
                    :disabled="uiStore.saving"
                    :rules="formNameRules"
                    :label="$t('common.name')"
                    counter="15"
                    color="primary"
                    persistent-placeholder
                    :placeholder="$t('common.placeholderCategoryName')"
                    variant="outlined"
                  />
                  <v-select
                    v-model="editedCategory.color"
                    class="mt-2"
                    :disabled="uiStore.saving"
                    :items="categoryStore.categoryColorSelectItems"
                    color="primary"
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
                  variant="flat"
                  color="primary"
                  :disabled="!formValid || uiStore.saving"
                  @click="onSave"
                >
                  {{ $t('common.save') }}
                </v-btn>
                <v-spacer />
                <v-btn color="warning" variant="text" @click="closePopup">
                  {{ $t('common.cancel') }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>

        <v-card flat>
          <v-card-text class="px-0 py-0">
            <v-list lines="two" class="pa-0">
              <template
                v-for="(category, index) in categoryStore.editableCategories"
                :key="category.id"
              >
                <v-list-item class="mb-0" @click="onEditCategory(category)">
                  <template #prepend>
                    <v-icon :color="category.color" size="x-large" :icon="mdiSquare" />
                  </template>
                  <v-list-item-title class="text-uppercase">{{ category.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{
                      categoryStore.categoryItemsCount(category.id) === 1
                        ? $t('list.itemCountSingular', {
                            count: categoryStore.categoryItemsCount(category.id),
                          })
                        : $t('list.itemCount', {
                            count: categoryStore.categoryItemsCount(category.id),
                          })
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
                            @click="onEditCategory(category)"
                          />
                        </template>
                        <span>{{ $t('common.edit', { name: category.name }) }}</span>
                      </v-tooltip>
                      <v-tooltip location="bottom">
                        <template #activator="{ props: tooltipProps }">
                          <v-btn
                            :icon="mdiTrashCan"
                            color="error"
                            variant="text"
                            v-bind="tooltipProps"
                            class="ml-2"
                            @click.stop="onDeleteCategory(category)"
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

        <v-dialog
          v-model="dialogDelete"
          class="dialog-responsive"
          opacity="0.8"
          transition="scale-transition"
          :style="{
            paddingLeft: uiStore.navDrawerOpen ? '256px' : '0',
            transition: 'padding-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }"
        >
          <v-card>
            <v-card-title class="text-headline-small">
              <div class="d-flex align-center mb-1 mr-n2">
                <v-spacer />
                <v-btn
                  density="compact"
                  :icon="mdiClose"
                  variant="text"
                  color="warning"
                  @click="closeDeleteDialog"
                />
              </div>
              <div class="text-break">
                {{ $t('list.deleteConfirmation') }}
                <v-code>{{ editedCategory.name }}</v-code
                >?
              </div>
            </v-card-title>
            <v-card-actions>
              <v-btn color="primary" variant="flat" @click="closeDeleteDialog">
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

<style scoped>
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

/* Ensure long content in dialog titles wraps instead of overflowing */
.dialog-responsive :deep(.v-card-title) {
  white-space: normal;
  word-break: break-word;
}
</style>
