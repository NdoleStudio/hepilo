<script setup lang="ts">
import { mdiCheck } from '@mdi/js'

const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const settingsStore = useSettingsStore()
const uiStore = useUIStore()
const theme = useVTheme()

const isDark = computed(() => theme.global.current.value.dark)

const availableLocales = computed(() => locales.value.filter((l) => typeof l !== 'string'))

function setTheme(newTheme: string) {
  theme.change(newTheme)
  if (import.meta.client) {
    localStorage.setItem('hepilo-theme', newTheme)
  }
}

useHead({
  title: () => t('settings.title'),
})

definePageMeta({
  layout: 'default'
})

const dialogDelete = ref(false)
const formValid = ref(false)
const formCurrency = ref(settingsStore.currency)

onMounted(() => {
  uiStore.setTitle(t('settings.title'))
  formCurrency.value = settingsStore.currency
})

function closeDeleteDialog() {
  dialogDelete.value = false
  nextTick(() => clearForm())
}

function clearForm() {
  formCurrency.value = settingsStore.currency
}

function onSave() {
  settingsStore.setCurrency(formCurrency.value)
  clearForm()
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <v-card class="mb-4">
          <v-card-title>{{ $t('settings.appearance') }}</v-card-title>
          <v-card-text>
            <v-select
              :model-value="locale"
              class="mt-4"
              :items="availableLocales.map((l) => ({ title: l.name, value: l.code }))"
              density="compact"
              color="primary"
              variant="outlined"
              :label="$t('settings.language')"
              @update:model-value="(code) => navigateTo(switchLocalePath(code))"
            />
            <v-select
              :model-value="isDark ? 'dark' : 'light'"
              :items="[
                { title: $t('settings.darkMode'), value: 'dark' },
                { title: $t('settings.lightMode'), value: 'light' },
              ]"
              density="compact"
              color="primary"
              variant="outlined"
              :label="$t('settings.theme')"
              @update:model-value="setTheme"
            />
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-title>{{ $t('settings.accountSettings') }}</v-card-title>
          <v-card-text>
            <v-form v-model="formValid" lazy-validation>
              <v-select
                v-model="formCurrency"
                class="mt-4"
                :disabled="uiStore.saving"
                :items="settingsStore.currencySelectItems"
                density="compact"
                color="primary"
                variant="outlined"
                :label="$t('common.currency')"
              >
                <template #selection="{ item }">
                  <span class="text-medium-emphasis me-2">{{ item.value }}</span>
                  <span>{{ item.title }}</span>
                </template>
                <template #item="{ item, props: itemProps }">
                  <v-list-item v-bind="itemProps" :title="undefined">
                    <template #default>
                      <div class="d-flex align-center w-100">
                        <span class="text-medium-emphasis me-2">{{ item.value }}</span>
                        <span>{{ item.title }}</span>
                        <v-spacer />
                        <v-icon
                          v-if="item.value === formCurrency"
                          :icon="mdiCheck"
                          color="primary"
                          size="small"
                        />
                      </div>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-form>
          </v-card-text>
          <v-card-actions class="mt-n5 pb-5 ml-2">
            <v-btn
              variant="flat"
              color="primary"
              :disabled="!formValid || uiStore.saving"
              @click="onSave"
            >
              {{ $t('settings.saveSettings') }}
            </v-btn>
            <v-spacer />
          </v-card-actions>
        </v-card>
        <div class="text-center mt-4">
          <BackButton />
        </div>

        <v-dialog v-model="dialogDelete" max-width="500" width="400">
          <v-card>
            <v-card-title class="text-headline-small">
              {{ $t('settings.deleteAccountConfirmation') }}
            </v-card-title>
            <v-card-text>
              {{ $t('settings.deleteAccountWarning') }}
            </v-card-text>
            <v-card-actions>
              <v-btn color="info" variant="text" @click="closeDeleteDialog">
                {{ $t('common.no') }}
              </v-btn>
              <v-spacer />
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>
