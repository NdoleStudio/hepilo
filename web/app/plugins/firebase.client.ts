import { initializeApp, getApps } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { User } from '~/types/state'

export default defineNuxtPlugin(() => {
  const firebaseConfig = {
    apiKey: 'AIzaSyAoeOz6cobux6wPOw7XzBJ8wxywjeawpX0',
    authDomain: 'hepilo-f5cd4.firebaseapp.com',
    projectId: 'hepilo-f5cd4',
    storageBucket: 'hepilo-f5cd4.appspot.com',
    messagingSenderId: '188406853589',
    appId: '1:188406853589:web:44027cc012b25de293175c',
    measurementId: 'G-20SNSQ62TF',
  }

  if (!getApps().length) {
    const app = initializeApp(firebaseConfig)

    // App Check with ReCAPTCHA v3
    const recaptchaKey = useRuntimeConfig().public.recaptchaSiteKey as string
    if (recaptchaKey) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaKey),
        isTokenAutoRefreshEnabled: true,
      })
    }
  }

  // Keep auth store in sync with Firebase auth state (persists across reloads)
  const authStore = useAuthStore()
  const auth = getAuth()
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      const stateUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      }
      authStore.setUser(stateUser)
    }
    else {
      authStore.setUser(null)
    }
  })
})
