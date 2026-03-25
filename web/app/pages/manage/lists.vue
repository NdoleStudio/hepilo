<script setup lang="ts">
import { mdiPlus, mdiClose, mdiSquareEditOutline, mdiTrashCan } from '@mdi/js'
import shortUUID from 'short-uuid'
import { LIST_ICON_DEFAULT, useListStore } from '~/stores/list'
import type { List, UpsertListRequest } from '~/types/state'

const { t } = useI18n()
const listStore = useListStore()
const uiStore = useUIStore()

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
  editedList.value.id === defaultList.id
    ? t('list.createList')
    : t('list.editList'),
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
    id: editedList.value.id || shortUUID.generate(),
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
          <v-dialog v-model="dialog" max-width="500">
            <template #activator="{ props: activatorProps }">
              <v-btn color="primary" v-bind="activatorProps" class="mb-4">
                <v-icon :icon="mdiPlus" />
                {{ $t('list.addList') }}
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
                    v-model="editedList.name"
                    :rules="formNameRules"
                    :label="$t('common.name')"
                    counter="15"
                    persistent-placeholder
                    :placeholder="$t('common.placeholderListName')"
                    variant="outlined"
                  />
                  <v-select
                    class="mt-2"
                    :disabled="uiStore.saving"
                    :items="listStore.listIconSelectItems"
                    item-title="text"
                    item-value="value"
                    v-model="editedList.icon"
                    :append-inner-icon="prependIcon"
                    variant="outlined"
                    :label="$t('common.icon')"
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
              <template v-for="(list, index) in listStore.lists" :key="list.id">
                <v-list-item @click="onEditList(list)" class="mb-0">
                  <template #prepend>
                    <v-avatar rounded>
                      <v-icon :icon="listStore.listIcon(list.icon)" />
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ list.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ list.items.length === 1 ? $t('list.itemCountSingular', { count: list.items.length }) : $t('list.itemCount', { count: list.items.length }) }}
                  </v-list-item-subtitle>
                  <template #append>
                    <div class="d-flex">
                      <v-tooltip location="bottom">
                        <template #activator="{ props: tooltipProps }">
                          <v-btn
                            @click="onEditList(list)"
                            color="info"
                            class="mr-2"
                            v-bind="tooltipProps"
                            icon
                          >
                            <v-icon :icon="mdiSquareEditOutline" />
                          </v-btn>
                        </template>
                        <span>{{ $t('common.edit', { name: list.name }) }}</span>
                      </v-tooltip>
                      <v-tooltip location="bottom">
                        <template #activator="{ props: tooltipProps }">
                          <v-btn
                            @click.stop="onDeleteList(list)"
                            color="error"
                            icon
                            v-bind="tooltipProps"
                            class="ml-2"
                            :disabled="deleteDisabled"
                          >
                            <v-icon :icon="mdiTrashCan" />
                          </v-btn>
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

        <v-dialog v-model="dialogDelete" max-width="500" width="400">
          <v-card>
            <v-card-title class="text-headline-small">
              <div class="text-break">
                {{ $t('list.deleteConfirmation') }}
                <code class="d-inline-block">{{ editedList.name }}</code>?
              </div>
            </v-card-title>
            <v-card-actions>
              <v-btn color="info" variant="text" @click="closeDeleteDialog">
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
