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

let _mapTarget = (_target)=>{
    return {
        input: resolveFile("src/index.ts"),
        output:{
            file:resolveFile(`dist/${_target}/index.mjs`),
            format:_target,   // cjs  system
        },
        plugins,
        external    
    }
}

export default 
    process.env.NODE_ENV==="production"
    ?["esm","cjs"].map(_mapTarget)
    :["esm"].map(_mapTarget);