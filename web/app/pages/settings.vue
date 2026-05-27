<script setup lang="ts">
import { getAuth } from 'firebase/auth'
import { mdiCheck } from '@mdi/js'

const { t } = useI18n()
const localePath = useLocalePath()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const uiStore = useUIStore()

definePageMeta({
  layout: 'default',
  middleware: 'auth',
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

function onDeleteAccount() {
  dialogDelete.value = true
}

async function onDeleteAccountConfirm() {
  try {
    const auth = getAuth()
    await authStore.deleteAccount(auth.currentUser?.uid as string)
    await auth.currentUser?.delete()
  } catch (e: any) {
    if (e.code !== 'auth/requires-recent-login') {
      throw e
    }
    const auth = getAuth()
    auth.signOut().then(() => {
      uiStore.addNotification({
        type: 'info',
        message: t('auth.reLoginToDelete'),
      })
      navigateTo(localePath('/login'))
    })
    return
  }
  closeDeleteDialog()
  navigateTo(localePath('/'))
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
        <v-card>
          <v-card-title>{{ $t('settings.accountSettings') }}</v-card-title>
          <v-card-text>
            <v-form v-model="formValid" lazy-validation>
              <v-select
                class="mt-4"
                :disabled="uiStore.saving"
                :items="settingsStore.currencySelectItems"
                v-model="formCurrency"
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
            <v-btn
              color="error"
              variant="text"
              @click="onDeleteAccount"
              :disabled="!authStore.isLoggedIn"
            >
              {{ $t('settings.deleteAccount') }}
            </v-btn>
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
              <v-btn color="error" variant="text" @click="onDeleteAccountConfirm">
                {{ $t('common.yes') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>
