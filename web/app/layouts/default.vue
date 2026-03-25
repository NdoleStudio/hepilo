<template>
  <v-app>
    <v-navigation-drawer v-model="navDrawerOpen">
      <!-- User profile section -->
      <div v-if="user" class="pa-4 text-center">
        <v-avatar size="64" color="primary">
          <v-img
            v-if="user.photoURL"
            :src="user.photoURL"
            :alt="user.name || ''"
          />
          <span v-else class="text-headline-small">{{ userInitial }}</span>
        </v-avatar>
        <div class="mt-2 text-title-medium font-weight-medium">
          {{ user.name }}
        </div>
      </div>

      <v-divider v-if="user" />

      <!-- Shopping lists -->
      <v-list nav density="compact">
        <v-list-item
          v-for="list in lists"
          :key="list.id"
          :to="localePath(`/lists/${list.id}`)"
          lines="two"
        >
          <template #prepend>
            <v-avatar rounded>
              <v-icon>{{ getListIcon(list.icon) }}</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title>{{ list.name }}</v-list-item-title>
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

      <!-- Add List button (placeholder until AddListButton component is ready) -->
      <div class="w-100 text-center my-4">
        <v-btn color="primary" variant="tonal" prepend-icon="$plus">
          {{ t('list.addList') }}
        </v-btn>
      </div>

      <v-divider />

      <!-- Navigation items -->
      <v-list nav>
        <v-list-item :to="localePath('/manage/lists')">
          <template #prepend>
            <v-icon :icon="mdiPlaylistEdit" />
          </template>
          <v-list-item-title>{{ t('nav.manageLists') }}</v-list-item-title>
        </v-list-item>

        <v-list-item :to="localePath('/manage/categories')">
          <template #prepend>
            <v-icon :icon="mdiShapeOutline" />
          </template>
          <v-list-item-title>
            {{ t('nav.manageCategories') }}
          </v-list-item-title>
        </v-list-item>

        <v-list-item :to="localePath('/manage/items')">
          <template #prepend>
            <v-icon :icon="mdiArchiveCogOutline" />
          </template>
          <v-list-item-title>{{ t('nav.manageItems') }}</v-list-item-title>
        </v-list-item>

        <v-list-item :to="localePath('/settings')">
          <template #prepend>
            <v-icon :icon="mdiCog" />
          </template>
          <v-list-item-title>{{ t('nav.settings') }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider />

      <!-- Blog & Feedback -->
      <v-list nav>
        <v-list-item :href="`mailto:${config.public.siteEmail}`">
          <template #prepend>
            <v-icon :icon="mdiEmail" />
          </template>
          <v-list-item-title>{{ t('nav.sendFeedback') }}</v-list-item-title>
        </v-list-item>

        <v-list-item :to="localePath('/blog')">
          <template #prepend>
            <v-icon :icon="mdiTagText" />
          </template>
          <v-list-item-title>{{ t('nav.blog') }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider />

      <!-- Language switcher placeholder -->
      <div class="pa-4 text-center">
        <v-btn variant="text" size="small" prepend-icon="$translate">
          {{ locale.toUpperCase() }}
        </v-btn>
      </div>

      <v-divider />

      <!-- Logout / Exit Demo -->
      <v-list v-if="user" nav>
        <v-list-item @click="logout">
          <template #prepend>
            <v-icon :icon="mdiLogout" />
          </template>
          <v-list-item-title>
            {{ isAnonymous ? t('nav.exitDemo') : t('nav.logout') }}
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- GitHub stars -->
      <div class="d-flex flex-column align-center mt-8 mb-4">
        <a :href="config.public.githubLink as string" target="_blank">
          <img
            alt="GitHub Repo stars"
            src="https://img.shields.io/github/stars/NdoleStudio/hepilo?style=social"
          />
        </a>
      </div>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="uiStore.toggleNavDrawer()" />

      <v-app-bar-title>{{ uiStore.title }}</v-app-bar-title>

      <LanguageSwitcher />

      <v-btn
        icon
        @click="toggleTheme"
      >
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
    </v-app-bar>

    <v-main>
      <slot />

      <v-snackbar
        v-model="uiStore.isNotificationActive"
        :color="uiStore.notification.type"
        :timeout="uiStore.notification.timeout"
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
  </v-app>
</template>

<script setup lang="ts">
import {
  mdiArchiveCogOutline,
  mdiCheck,
  mdiCog,
  mdiEmail,
  mdiInformation,
  mdiLogout,
  mdiPlaylistEdit,
  mdiShapeOutline,
  mdiTagText,
  mdiCart,
  mdiWeatherSunny,
  mdiWeatherNight,
} from '@mdi/js'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import type { List } from '~/types/state'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const router = useRouter()
const uiStore = useUIStore()
const { getFirebaseAuth, getCurrentUser } = useFirebase()
const theme = useTheme()

const isDark = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
  if (import.meta.client) {
    localStorage.setItem('hepilo-theme', theme.global.name.value)
  }
}

const user = ref<FirebaseUser | null>(null)
const isAnonymous = computed(() => user.value?.isAnonymous ?? false)
const userInitial = computed(() => user.value?.displayName?.charAt(0) || 'A')

// TODO: Replace with app store once state management is implemented
const lists = ref<List[]>([])

const navDrawerOpen = computed({
  get: () => uiStore.navDrawerOpen,
  set: (value: boolean) => uiStore.setNavDrawer(value),
})

const iconMap: Record<string, string> = {
  mdiCart,
}

function getListIcon(iconName: string): string {
  return iconMap[iconName] || mdiCart
}

async function logout() {
  try {
    const auth = getFirebaseAuth()
    await auth.signOut()
    uiStore.addNotification({
      type: 'info',
      message: t('auth.logoutSuccess'),
    })
    await router.push(localePath('/'))
  }
  catch (error) {
    console.error('Logout failed:', error)
  }
}

onMounted(() => {
  // Restore saved theme
  const savedTheme = localStorage.getItem('hepilo-theme')
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    theme.global.name.value = savedTheme
  }

  const auth = getFirebaseAuth()
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser
  })
})
</script>
