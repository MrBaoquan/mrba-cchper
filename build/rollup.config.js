const path = require("path")
const commonjs = require("@rollup/plugin-commonjs")
const typescript = require("@wessberg/rollup-plugin-ts")
const {nodeResolve} = require("@rollup/plugin-node-resolve")

const resolveFile = function(filePath){
    return path.join(__dirname,"..",filePath)
}

const plugins = [
    nodeResolve(),
    commonjs(),
    typescript({
        browserslist: false
    })
];

const external = [
    'moment','cc'
]

module.exports = [
    {
        input: resolveFile("src/index.ts"),
        output:{
            file:resolveFile("dist/esm/index.mjs"),
            format:"esm",   // cjs  system
        },
        plugins,
        external
    },
    {
        input: resolveFile("src/index.ts"),
        output:{
            file:resolveFile("dist/cjs/index.js"),
            format:"cjs",   // cjs  system
        },
        plugins,
        external
    }
]