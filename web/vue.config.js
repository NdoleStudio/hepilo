// eslint-disable-next-line @typescript-eslint/no-var-requires
const { GitRevisionPlugin } = require("git-revision-webpack-plugin");

module.exports = {
  transpileDependencies: ["vuetify"],
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "Hepilo - Shopping List";
      return args;
    });
    config.plugin("VuetifyLoaderPlugin").tap(() => [
      {
        progressiveImages: true,
      },
    ]);
    config.plugin("define").tap((args) => {
      const gitRevisionPlugin = new GitRevisionPlugin();
      args[0]["process.env"]["VUE_APP_COMMIT_HASH"] = JSON.stringify(
        gitRevisionPlugin.commithash()
      );
      return args;
    });
  },
  pluginOptions: {
    sitemap: {
      baseURL: "https://hepilo.com",
      routes: [
        {
          path: "/terms-and-conditions",
        },
        {
          path: "/privacy-policy",
        },
        {
          path: "/demo",
        },
        {
          path: "/",
        },
        {
          path: "/blog",
        },
        {
          path: "/login",
        },
        {
          path: "/blog/meet-hepilo-the-ultimate-shopping-list-app",
        },
      ],
    },
  },
  pwa: {
    appleMobileWebAppCapable: "yes",
    name: "Hepilo - Shopping List",
    themeColor: "#C6FF00",
    manifestOptions: {
      ["theme_color"]: "#C6FF00",
      ["background_color"]: "#C6FF00",
      ["short_name"]: "Hepilo",
    },
  },
};
