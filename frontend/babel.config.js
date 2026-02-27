module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@services": "./src/services",
            "@utils": "./src/utils",
            "@types": "./src/types",
            "@contexts": "./src/contexts",
            "@config": "./src/config",
            "@hooks": "./src/hooks",
            "@constants": "./src/constants",
            "@assets": "./assets",
            "@stores": "./src/stores",
          },
          extensions: [
            ".ios.js",
            ".android.js",
            ".js",
            ".jsx",
            ".json",
            ".tsx",
            ".ts",
          ],
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
