<script setup lang="ts">
import { mdiPlus, mdiClose, mdiSquareEditOutline, mdiTrashCan } from '@mdi/js'
import { generate as generateShortUUID } from 'short-uuid'
import { LIST_ICON_DEFAULT, useListStore } from '~/stores/list'
import type { List, UpsertListRequest } from '~/types/state'

const { t } = useI18n()
const listStore = useListStore()
const uiStore = useUIStore()

useHead({
  title: () => t('nav.manageLists'),
})

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const formValid = ref(false)
const dialog = ref(false)
const dialogDelete = ref(false)

const defaultList: UpsertListRequest = { name: '', id: '', icon: LIST_ICON_DEFAULT }
const editedList = ref<UpsertListRequest>({ ...defaultList })

const formNameRules = [
  (value: string | null): boolean | string =>
    (!!value && value.trim() !== '') || t('errors.nameRequired'),
  (value: string | null): boolean | string =>
    (!!value && value.length <= 15) || t('errors.nameTooLong15'),
]

const deleteDisabled = computed(() => listStore.lists.length < 2)

const formTitle = computed(() =>
  editedList.value.id === defaultList.id ? t('list.createList') : t('list.editList'),
)

const prependIcon = computed(() => listStore.listIcon(editedList.value.icon))

onMounted(() => {
  listStore.loadState()
  uiStore.setTitle(t('nav.manageLists'))
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
  await listStore.upsertList({
    name: editedList.value.name,
    icon: editedList.value.icon,
    id: editedList.value.id || generateShortUUID(),
  })
  dialog.value = false
  clearForm()
}

function onDeleteList(list: List) {
  editedList.value = { ...list }
  dialogDelete.value = true
}

function onDeleteListConfirm() {
  listStore.deleteList(editedList.value.id)
  closeDeleteDialog()
}

function onEditList(list: List) {
  editedList.value = { ...list }
  dialog.value = true
}

function clearForm() {
  editedList.value = { ...defaultList }
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <ShoppingListDemoBanner />
        <div
          class="d-flex"
          :class="{ 'justify-center': listStore.lists.length === 0 && $vuetify.display.mdAndDown }"
        >
          <v-spacer v-if="listStore.lists.length" />
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
                {{ $t('list.addList') }}
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
                    v-model="editedList.name"
                    class="mt-2"
                    aria-required="true"
                    :disabled="uiStore.saving"
                    :rules="formNameRules"
                    :label="$t('common.name')"
                    counter="15"
                    color="primary"
                    persistent-placeholder
                    :placeholder="$t('common.placeholderListName')"
                    variant="outlined"
                  />
                  <v-select
                    v-model="editedList.icon"
                    class="mt-2"
                    :disabled="uiStore.saving"
                    :items="listStore.listIconSelectItems"
                    :append-inner-icon="prependIcon"
                    color="primary"
                    variant="outlined"
                    :label="$t('common.icon')"
                  />
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
              <template v-for="(list, index) in listStore.lists" :key="list.id">
                <v-list-item class="mb-0" @click="onEditList(list)">
                  <template #prepend>
                    <v-icon :icon="listStore.listIcon(list.icon)" />
                  </template>
                  <v-list-item-title>{{ list.name }}</v-list-item-title>
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
                            @click="onEditList(list)"
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
                            @click.stop="onDeleteList(list)"
                          />
                        </template>
                        <span>{{ $t('common.deleteItem', { name: list.name }) }}</span>
                      </v-tooltip>
                    </div>
                  </template>
                </v-list-item>
                <v-divider v-if="index < listStore.lists.length - 1" />
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
                <v-code>{{ editedList.name }}</v-code
                >?
              </div>
            </v-card-title>
            <v-card-actions>
              <v-btn color="primary" variant="flat" @click="closeDeleteDialog">
                {{ $t('common.no') }}
              </v-btn>
              <v-spacer />
              <v-btn color="error" variant="text" @click="onDeleteListConfirm">
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
