/* -- constants -- */
// 小程序内部属性的判断正则
const innerAttrRe = /^__.*__$/

export const COMMON_PROP = {
    enumerable: true,
    configurable: true,
}

// 每个对象上挂载自己路径前缀的 key
export const __TUA_PATH = '__TUA_PATH'

/* -- functions -- */
export const isFn = fn => typeof fn === 'function'

export const hasProtoInObj = obj => '__proto__' in obj

export const isNotInnerAttr = key => !innerAttrRe.test(key)

// 根据路径前缀和 key 得到当前路径
export const getPathByPrefix = (prefix, key) =>
    prefix === '' ? key : `${prefix}.${key}`

/**
 * 将 source 上的属性代理到 target 上
 * @param {Object} source 被代理对象
 * @param {Object} target 被代理目标
 */
export const proxyData = (source, target) => {
    Object.keys(source).forEach((key) => {
        Object.defineProperty(
            target,
            key,
            Object.getOwnPropertyDescriptor(source, key)
        )
    })
}

/**
 * 将对象属性路径字符串转换成路径数组
 * @param {String} str
 * @returns {Array}
 */
export const pathStr2Arr = (str) => str
    .split('.')
    .map(x => x
        .split(/\[(.*?)\]/)
        .filter(x => x)
    )
    .reduce((acc, cur) => acc.concat(cur), [])

/**
 * 根据 path 将目标值 val 设置到目标对象 obj 上
 * @param {Object} obj 目标对象
 * @param {String} path 路径字符串
 * @param {any} val 目标值
 * @returns {Object} obj
 */
export const setObjByPath = ({ obj, path, val }) => pathStr2Arr(path)
    .reduce((acc, cur, idx, { length }) => {
        if (idx === length - 1) {
            acc[cur] = val
            return
        }

        // 当前属性在目标对象上并不存在
        if (!acc[cur]) {
            acc[cur] = /\d/.test(cur) ? [] : {}
        }

        return acc[cur]
    }, obj)