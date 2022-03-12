// eslint-disable-next-line @typescript-eslint/no-var-requires
const { GitRevisionPlugin } = require("git-revision-webpack-plugin");

module.exports = {
  transpileDependencies: ["vuetify"],
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "Hepilo";
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
  pwa: {
    appleMobileWebAppCapable: "yes",
    name: "Hepilo - Shopping List",
    themeColor: "#1a237e",
    manifestOptions: {
      ["theme_color"]: "#1a237e",
      ["background_color"]: "#1a237e",
      ["short_name"]: "Hepilo",
    },
  },
};
