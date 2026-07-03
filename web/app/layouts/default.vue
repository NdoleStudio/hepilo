<template>
  <v-app>
    <v-layout>
      <v-app-bar>
        <v-app-bar-nav-icon @click="uiStore.toggleNavDrawer()" />

        <v-container
          class="position-absolute h-100 d-flex align-center"
          :style="{
            pointerEvents: 'none',
            left: navDrawerOpen && mdAndUp ? '256px' : '0',
            right: '0',
            transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }"
        >
          <v-row>
            <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
              <span
                :class="{ 'ml-9 text-headline-large': !mdAndUp, 'text-display-small': mdAndUp }"
                style="pointer-events: auto"
                >{{ uiStore.title }}</span
              >
            </v-col>
          </v-row>
        </v-container>

        <v-spacer />

        <LanguageSwitcher v-if="mdAndUp" />

        <v-btn v-if="mdAndUp" icon @click="toggleTheme">
          <v-icon :icon="isDark ? mdiWeatherSunny : mdiWeatherNight" />
        </v-btn>

        <v-progress-circular
          v-if="uiStore.saving"
          indeterminate
          size="24"
          width="2"
          color="primary"
          class="mr-4"
        />

        <!-- Avatar dropdown menu -->
        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn icon v-bind="props" class="mr-2">
              <v-avatar size="36" color="primary">
                <v-img v-if="user?.photoURL" :src="user.photoURL" :alt="user.displayName || ''" />
                <span v-else class="text-body-large">{{ userInitial }}</span>
              </v-avatar>
            </v-btn>
          </template>
          <v-list class="pa-0">
            <v-list-item color="primary" :to="localePath('/settings')">
              <template #prepend>
                <v-icon :icon="mdiAccountCog" />
              </template>
              <v-list-item-title class="pr-16">{{ t('nav.settings') }}</v-list-item-title>
            </v-list-item>
            <v-list-item color="primary" @click="logout">
              <template #prepend>
                <v-icon :icon="mdiLogout" />
              </template>
              <v-list-item-title class="pr-16">
                {{ isAnonymous ? t('nav.exitDemo') : t('nav.logout') }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar>

      <v-navigation-drawer v-model="navDrawerOpen">
        <!-- Shopping lists -->
        <v-list nav color="primary">
          <v-list-item
            v-for="list in lists"
            :key="list.id"
            :to="localePath(`/lists/${list.id}`)"
            lines="two"
            color="primary"
            link
          >
            <template #prepend>
              <v-icon size="x-large">{{ iconMap(list.icon) }}</v-icon>
            </template>
            <v-list-item-title class="text-body-large">{{ list.name }}</v-list-item-title>
            <v-list-item-subtitle>
              {{
                list.items.length === 1
                  ? t('list.itemCountSingular', { count: 1 })
                  : t('list.itemCount', { count: list.items.length })
              }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <v-divider class="my-2" />

        <!-- Add List button -->
        <div class="w-100 text-center my-4">
          <AddListButton />
        </div>

        <v-divider />

        <!-- Manage navigation items -->
        <v-list nav rounded color="primary">
          <v-list-item :to="localePath('/manage/lists')" link>
            <template #prepend>
              <v-icon :icon="mdiPlaylistEdit" />
            </template>
            <v-list-item-title class="text-body-large">{{
              t('nav.manageLists')
            }}</v-list-item-title>
          </v-list-item>

          <v-list-item :to="localePath('/manage/categories')" link>
            <template #prepend>
              <v-icon :icon="mdiShapeOutline" />
            </template>
            <v-list-item-title class="text-body-large">
              {{ t('nav.manageCategories') }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item :to="localePath('/manage/items')" link>
            <template #prepend>
              <v-icon :icon="mdiArchiveCogOutline" />
            </template>
            <v-list-item-title class="text-body-large">{{
              t('nav.manageItems')
            }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-divider />

        <!-- Blog & Feedback -->
        <v-list nav rounded color="primary">
          <v-list-item :href="`mailto:${config.public.siteEmail}`" link>
            <template #prepend>
              <v-icon :icon="mdiEmail" />
            </template>
            <v-list-item-title class="text-body-large">{{
              t('nav.sendFeedback')
            }}</v-list-item-title>
          </v-list-item>

          <v-list-item :to="localePath('/blog')" link>
            <template #prepend>
              <v-icon :icon="mdiTagText" />
            </template>
            <v-list-item-title class="text-body-large">{{ t('nav.blog') }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-divider />

        <!-- GitHub stars -->
        <div class="d-flex flex-column align-center mt-8 mb-4">
          <a :href="config.public.githubLink as string" target="_blank">
            <img
              alt="GitHub Repo stars"
              src="https://img.shields.io/github/stars/NdoleStudio/hepilo"
            />
          </a>
        </div>
      </v-navigation-drawer>

      <v-main>
        <slot />

        <v-snackbar
          v-model="uiStore.isNotificationActive"
          :color="uiStore.notification.type"
          :timeout="uiStore.notification.timeout"
          variant="tonal"
        >
          <v-icon
            v-if="uiStore.notification.type === 'success'"
            :icon="mdiCheck"
            :color="uiStore.notification.type"
            class="mr-2"
          />
          <v-icon
            v-if="uiStore.notification.type === 'info'"
            :icon="mdiInformation"
            :color="uiStore.notification.type"
            class="mr-2"
          />
          {{ uiStore.notification.message }}

          <template #actions>
            <v-btn
              :color="uiStore.notification.type"
              variant="text"
              @click="uiStore.disableNotification()"
            >
              {{ t('common.close') }}
            </v-btn>
          </template>
        </v-snackbar>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import {
  mdiArchiveCogOutline,
  mdiCheck,
  mdiAccountCog,
  mdiEmail,
  mdiInformation,
  mdiLogout,
  mdiPlaylistEdit,
  mdiShapeOutline,
  mdiTagText,
  mdiWeatherSunny,
  mdiWeatherNight,
} from '@mdi/js'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'

const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const router = useRouter()
const uiStore = useUIStore()
const { mdAndUp } = useDisplay()
const { getFirebaseAuth } = useFirebase()
const theme = useTheme()

const isDark = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  const newTheme = isDark.value ? 'light' : 'dark'
  theme.change(newTheme)
  if (import.meta.client) {
    localStorage.setItem('hepilo-theme', newTheme)
  }
}

const user = ref<FirebaseUser | null>(null)
const isAnonymous = computed(() => user.value?.isAnonymous ?? false)
const userInitial = computed(() => user.value?.displayName?.charAt(0) || 'A')

const listStore = useListStore()
const authStore = useAuthStore()
const lists = computed(() => listStore.lists)

const navDrawerOpen = computed({
  get: () => uiStore.navDrawerOpen,
  set: (value: boolean) => {
    uiStore.setNavDrawer(value)
  },
})

const iconMap = (iconName: string): string => listStore.listIcon(iconName)

async function logout() {
  try {
    await authStore.logout()
    uiStore.addNotification({
      type: 'info',
      message: t('auth.logoutSuccess'),
    })
    await router.push(localePath('/'))
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

onMounted(async () => {
  // Restore saved theme
  const savedTheme = localStorage.getItem('hepilo-theme')
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    theme.change(savedTheme)
  }

  const auth = getFirebaseAuth()
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser
  })

  // Load state so the nav drawer lists are populated
  await listStore.loadState()
})
</script>
