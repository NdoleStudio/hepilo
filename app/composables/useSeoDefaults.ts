const SITE_URL = 'https://hepilo.com'
const DEFAULT_OG_IMAGE = '/img/header.png'

export function useSeoDefaults(options: {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
}) {
  const head = useLocaleHead()

  const rawImage = options.image ?? DEFAULT_OG_IMAGE
  const image = rawImage.startsWith('http') ? rawImage : `${SITE_URL}${rawImage}`

  useSeoMeta({
    title: options.title,
    ogTitle: options.title,
    description: options.description,
    ogDescription: options.description,
    ogType: options.type ?? 'website',
    ogSiteName: 'Hepilo',
    ogImage: image,
    ogImageAlt: options.title,
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: image,
    ...(options.type === 'article' && options.publishedTime
      ? { articlePublishedTime: options.publishedTime }
      : {}),
  })

  // Canonical URL, hreflang alternates, og:url and og:locale are provided
  // per-locale by @nuxtjs/i18n's useLocaleHead(), so normalize its broad
  // attribute types instead of hardcoding a URL that would miss the locale prefix.
  useHead(() => ({
    htmlAttrs: { lang: head.value.htmlAttrs?.lang },
    link: [
      ...(head.value.link ?? []).flatMap((attrs) =>
        attrs.rel === 'canonical' && attrs.href
          ? [{ id: attrs.id, rel: 'canonical' as const, href: attrs.href }]
          : [],
      ),
      ...(head.value.link ?? []).flatMap((attrs) =>
        attrs.rel === 'alternate' && attrs.href && attrs.hreflang
          ? [
              {
                id: attrs.id,
                rel: 'alternate' as const,
                href: attrs.href,
                hreflang: attrs.hreflang,
              },
            ]
          : [],
      ),
    ],
    meta: (head.value.meta ?? []).flatMap((attrs) => {
      const property = attrs.property
      const content = attrs.content
      if (!property || !content) return []

      return [{ id: attrs.id, property, content }]
    }),
  }))
}
