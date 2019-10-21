module.exports = (api) => {
  const env = api.env()
  const caller = api.caller((inst) => (inst && inst.name) || "any")

  const isBundler = caller === "rollup-plugin-babel"
  const isCli = caller === "@babel/node"
  const isTest = (/\b(test)\b/).exec(env)
  const modules = (isTest && !isBundler) || isCli ? "commonjs" : false
  const isUmd = (/\b(umd)\b/).exec(env)

  return {
    sourceMaps: true,
    plugins: [
      isUmd ?
        null :
        [
          "@babel/transform-runtime",
          {
            corejs: 3
          }
        ]
    ].filter(Boolean),
    presets: [
      [
        "@babel/env",
        {
          useBuiltIns: "usage",
          corejs: 3,
          loose: true,
          modules
        }
      ],
      [
        "@babel/typescript",
        {
          allExtensions: true,
          isTSX: false
        }
      ]
    ]
  }
}
