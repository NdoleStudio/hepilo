import { type FirebaseApp, initializeApp, getApps } from 'firebase/app'
import { type Auth, getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

const firebaseConfig = {
  apiKey: 'AIzaSyAoeOz6cobux6wPOw7XzBJ8wxywjeawpX0',
  authDomain: 'hepilo-f5cd4.firebaseapp.com',
  projectId: 'hepilo-f5cd4',
  storageBucket: 'hepilo-f5cd4.appspot.com',
  messagingSenderId: '188406853589',
  appId: '1:188406853589:web:44027cc012b25de293175c',
  measurementId: 'G-20SNSQ62TF',
}

let firebaseApp: FirebaseApp | undefined
let appCheckInitialized = false

const ensureApp = (): FirebaseApp => {
  if (!firebaseApp) {
    const existingApps = getApps()
    firebaseApp = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig)
  }
  return firebaseApp
}

const ensureAppCheck = (app: FirebaseApp): void => {
  if (appCheckInitialized) return
  if (!import.meta.client) return

  const config = useRuntimeConfig()
  const siteKey = config.public.recaptchaSiteKey as string
  if (siteKey) {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    })
  }
  appCheckInitialized = true
}

export const getFirebaseAuth = (): Auth => {
  const app = ensureApp()
  ensureAppCheck(app)
  return getAuth(app)
}

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      getFirebaseAuth(),
      (user) => {
        unsubscribe()
        resolve(user)
      },
      reject,
    )
  })
}

export const useFirebase = () => {
  return {
    getFirebaseAuth,
    getCurrentUser,
  }
}
