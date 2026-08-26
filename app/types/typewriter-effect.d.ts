declare module 'typewriter-effect/dist/core' {
  interface TypewriterOptions {
    strings?: string | string[]
    autoStart?: boolean
    loop?: boolean
    delay?: number | 'natural'
    cursor?: string
    [key: string]: unknown
  }

  export default class Typewriter {
    constructor(element: string | HTMLElement, options?: TypewriterOptions)
    start(): this
    stop(): this
    pauseFor(ms: number): this
    typeString(str: string): this
    deleteAll(speed?: number | 'natural'): this
  }
}
