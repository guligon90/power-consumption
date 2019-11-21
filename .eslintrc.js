module.exports = {
  "extends": [
    "node",
    "plugin:node/recommended",
    "plugin:prettier/recommended"
  ],
  "env": {
    "node": true,
    "jest/globals": true
  },
  "plugins": [
    "jest"
  ],
  "parser": "babel-eslint",
  "rules": {
    "no-sync": 0,
    "no-process-exit": 0,
    "no-unmodified-loop-condition": 0,
    "import/no-commonjs": ["error", {
      "allowRequire": true,
      "allowPrimitiveModules": true
    }],
    "import/no-extraneous-dependencies": ["error", { "devDependencies": true }],
    "import/prefer-default-export": "off",
    "import/no-nodejs-modules": ["error", { "allow": ["path", "http", "fs"] }],
    "linebreak-style": ["error", "unix"],
    "no-console": ["error", { "allow": ["error", "warn"] }],
    "no-nested-ternary": "off",
    "no-underscore-dangle": ["error", { "allow": ["__typename"] }],
    "no-unused-expressions": ["error", { "allowTernary": true }]
  }
}
