export function useSeoDefaults(options: { title: string; description: string; path: string }) {
  const head = useLocaleHead({ addSeoAttributes: true })

  useSeoMeta({
    title: options.title,
    ogTitle: options.title,
    description: options.description,
    ogDescription: options.description,
    ogUrl: `https://hepilo.com${options.path}`,
    ogType: 'website',
    ogSiteName: 'Hepilo',
    twitterCard: 'summary_large_image',
  })

  useHead({
    htmlAttrs: { lang: head.value.htmlAttrs?.lang },
    link: [...(head.value.link || [])],
    meta: [...(head.value.meta || [])],
  })
}
