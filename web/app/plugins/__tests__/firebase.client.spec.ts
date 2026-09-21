import { beforeEach, describe, expect, it, vi } from 'vitest'

const { firebaseApp, initializeFirestoreMock } = vi.hoisted(() => ({
  firebaseApp: { name: '[DEFAULT]' },
  initializeFirestoreMock: vi.fn(),
}))

vi.mock('firebase/app', () => ({
  getApps: vi.fn(() => []),
  initializeApp: vi.fn(() => firebaseApp),
}))

vi.mock('firebase/app-check', () => ({
  initializeAppCheck: vi.fn(),
  ReCaptchaV3Provider: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => 'auth'),
  onAuthStateChanged: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  initializeFirestore: initializeFirestoreMock,
}))

vi.stubGlobal('defineNuxtPlugin', (plugin: () => void) => plugin)
vi.stubGlobal('useRuntimeConfig', () => ({
  public: { recaptchaSiteKey: '' },
}))
vi.stubGlobal('useAuthStore', () => ({
  setUser: vi.fn(),
}))

const firebasePlugin = (await import('../firebase.client')).default

describe('Firebase plugin', () => {
  beforeEach(() => {
    initializeFirestoreMock.mockClear()
  })

  it('uses long polling for Firestore WebChannel compatibility', () => {
    firebasePlugin({} as Parameters<typeof firebasePlugin>[0])

    expect(initializeFirestoreMock).toHaveBeenCalledWith(firebaseApp, {
      experimentalForceLongPolling: true,
    })
  })
})
