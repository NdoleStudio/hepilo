import { IncomingMessage, ServerResponse } from 'node:http'
import { createRequire } from 'node:module'
import { Socket } from 'node:net'
import { pathToFileURL } from 'node:url'
import { expect, it } from 'vitest'

const projectRequire = createRequire(import.meta.url)
const nuxtRequire = createRequire(projectRequire.resolve('nuxt/package.json'))
const nitroRequire = createRequire(nuxtRequire.resolve('@nuxt/nitro-server/package.json'))
const vuetifyRequire = createRequire(projectRequire.resolve('vuetify-nuxt-module'))

it('writes Vuetify client-hint headers to a Nuxt request event', async () => {
  const { createEvent } = nitroRequire('h3')
  const { setResponseHeader } = await import(pathToFileURL(vuetifyRequire.resolve('h3')).href)
  const request = new IncomingMessage(new Socket())
  const response = new ServerResponse(request)
  const event = createEvent(request, response)

  setResponseHeader(event, 'Accept-CH', ['Sec-CH-Viewport-Height', 'Sec-CH-Viewport-Width'])

  expect(response.getHeader('Accept-CH')).toEqual([
    'Sec-CH-Viewport-Height',
    'Sec-CH-Viewport-Width',
  ])
})
