import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-config-prettier'

// Nuxt-generated flat config, with Prettier turning off formatting-related
// rules so ESLint and Prettier don't fight over style.
export default withNuxt(
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  prettier,
)
