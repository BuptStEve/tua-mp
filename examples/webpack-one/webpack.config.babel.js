import fs from 'fs'
import path from 'path'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import EslintFriendlyFormatter from 'eslint-friendly-formatter'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'

const join = (...urls) => path.join(__dirname, ...urls)
const resolve = (...urls) => path.resolve(__dirname, ...urls)

const getEntry = (files, base) => files
    .map((path) => ({
        path,
        url: join(base, path)
    }))
    .filter(({ url }) => fs.statSync(url).isDirectory())
    .reduce((acc, { path, url }) => ({
        ...acc,
        // 生成类似 pages/index/index
        // 这样的路径作为 name
        [`${base.split('/')[1]}/${path}/${path}`]: url,
    }), {})

const pageBase = 'src/pages'
const pages = fs.readdirSync(resolve(pageBase))
const pageEntry = getEntry(pages, pageBase)

export default ({ isDev }) => ({
    mode: isDev ? 'development' : 'production',
    stats: isDev ? 'none' : {
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    },
    devtool: isDev && 'source-map',
    entry: {
        // app 应用入口
        app: 'src/app',
        // pages 页面入口
        ...pageEntry,
    },
    output: {
        filename: `[name].js`,
        publicPath: '/assets/',
        path: join('dist'),
        globalObject: 'global',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                include: [resolve('src')],
                options: {
                    formatter: EslintFriendlyFormatter,
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [resolve('src')],
            },
        ],
    },
    resolve: {
        modules: [
            resolve(__dirname),
            'node_modules',
        ],
        alias: {
            '@': join('src'),
        },
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'src/app.json', to: 'app.json' },
            { from: 'src/app.wxss', to: 'app.wxss' },
            { from: 'src/pages/*/*.wxml', to: `pages/[name]/[name].wxml` },
            { from: 'src/pages/*/*.json', to: `pages/[name]/[name].json` },
            { from: 'src/pages/*/*.wxss', to: `pages/[name]/[name].wxss` },
        ]),
        new FriendlyErrorsWebpackPlugin(),
    ],
    watchOptions: {
        aggregateTimeout: 300,
    },
})
