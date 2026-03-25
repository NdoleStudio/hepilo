<script setup lang="ts">
import { mdiPlus, mdiClose } from '@mdi/js'
import shortUUID from 'short-uuid'
import { LIST_ICON_DEFAULT, useListStore } from '~/stores/list'

const { t } = useI18n()
const localePath = useLocalePath()
const listStore = useListStore()
const uiStore = useUIStore()

const dialog = ref(false)
const formValid = ref(false)
const formName = ref('')
const formIcon = ref(LIST_ICON_DEFAULT)

const formNameRules = [
  (value: string | null): boolean | string =>
    (!!value && value.trim() !== '') || t('errors.nameRequired'),
  (value: string | null): boolean | string =>
    (!!value && value.length <= 15) || t('errors.nameTooLong15'),
]

const prependIcon = computed(() => listStore.listIcon(formIcon.value))

function closePopup() {
  clearForm()
  dialog.value = false
}

function clearForm() {
  formName.value = ''
  formIcon.value = LIST_ICON_DEFAULT
}

async function onSave() {
  await listStore.upsertList({
    name: formName.value,
    icon: formIcon.value,
    id: shortUUID.generate(),
  })
  dialog.value = false
  clearForm()

  const lists = listStore.lists
  if (lists.length > 0) {
    navigateTo(localePath(`/lists/${lists[lists.length - 1].id}`))
  }
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="90%" width="500" transition="scale-transition">
    <template #activator="{ props: activatorProps }">
      <v-btn color="primary" v-bind="activatorProps" class="mx-auto">
        <v-icon :icon="mdiPlus" />
        {{ $t('list.createNewList') }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        {{ $t('list.createNewList') }}
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
            v-model="formName"
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
            v-model="formIcon"
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
</template>
