export type FormatDateOption = {
    separator?: string;
    type?: 'all' | 'date' | 'time';
    sep?: string;
};

/**
 * @description: 获取对象类型
 */
export function getType(o: any): string {
    return Object.prototype.toString.call(o).slice(8, -1);
}

export function isString(o: any): o is string {
    return typeof o === 'string';
}

export function isBoolean(o: any): o is boolean {
    return typeof o === 'boolean';
}

export function isNumber(o: any): o is number {
    return typeof o === 'number';
}

export function isFunction(o: any): o is Function {
    return typeof o === 'function';
}

export function isUndefined(o: any): o is undefined {
    return typeof o === 'undefined';
}

export function isNull(o: any): o is null {
    return getType(o) === 'Null';
}

export function isObject(o: any): o is object {
    return getType(o) === 'Object';
}

export function isArray(o: any): o is any[] {
    return getType(o) === 'Array';
}

/**
 * @description: 向下查找匹配条件的值
 * @param {Array} sources: 待查找的数据源
 * @param {Object} value: 匹配值
 * @param {String} childrenKey?: 匹配值
 *
 * @return {Object | Undefined}
 */
export function getMatch<T extends Record<string, any>, K extends keyof T>(
    sources: T[],
    value: Partial<T>,
    childrenKey: K = 'children' as any,
): T | undefined {
    for (const v of sources) {
        for (const [k, val] of Object.entries(value)) {
            if (v[k] === val) return v;
            if (v[childrenKey] && v[childrenKey].length) {
                const result = getMatch(v[childrenKey], value, childrenKey);
                if (result) return result;
            }
        }
    }
}

/**
 * @description: 递归, 并执行回调
 * @param {Array} data: 数据源
 * @param {Function} callback: 执行的回调
 * @param {String} childrenKey?: 子级键, 默认 children
 */
export function recursion<T extends Record<string, any>, K extends keyof T>(
    data: T[],
    callback: (v: T) => void,
    childrenKey: K = 'children' as any,
) {
    return data.every((v) => {
        callback(v);
        if (v[childrenKey] && v[childrenKey].length) recursion(v[childrenKey], callback, childrenKey);
        return true;
    });
}

/**
 * @description: 深度递归优先, 并执行回调
 * @param {Array} data: 数据源
 * @param {Function} callback: 执行的回调
 * @param {String} childrenKey?: 子级键, 默认 children
 */
export function deepRecursion<T extends Record<string, any>, K extends keyof T>(
    data: T[],
    callback: (v: T) => void,
    childrenKey: K = 'children' as any,
) {
    return data.every((v) => {
        if (v[childrenKey] && v[childrenKey].length) deepRecursion(v[childrenKey], callback, childrenKey);
        callback(v);
        return true;
    });
}

/**
 * @description: 寻找匹配条件值并执行回调
 * @param {Array} sources: 待查找的数据源
 * @param {Object} value: 匹配值
 * @param {Function} callback: 执行的回调
 * @param {String} childrenKey: 子级的 key, 默认 children
 */
export function carryChained<T extends Record<string, any>>(
    sources: T[],
    value: Partial<T>,
    callback: (data: T, isDeep?: boolean) => void,
    childrenKey = 'children',
): boolean | undefined {
    const conditions = Object.entries(value);
    for (const v of sources) {
        const status = conditions.every(([k, val]) => val === v[k]);
        if (status) {
            callback(v, true);
            return true;
        }
        if (v[childrenKey] && v[childrenKey].length) {
            const result = carryChained(v[childrenKey], value, callback, childrenKey);
            if (result) {
                callback(v);
                return true;
            }
        }
    }
}

/**
 * @description: 根据指定值获取树形链
 * @param {Array} sources: 待查找的数据源
 * @param {Object} value: 匹配值
 * @param {String} childrenKey: 子级的 key, 默认 children
 */
export function getChained<T extends Record<string, any>>(
    sources: T[],
    value: Partial<T>,
    childrenKey = 'children',
): T[] {
    const result: T[] = [];
    carryChained(
        sources,
        value,
        (data) => {
            result.unshift(data);
        },
        childrenKey,
    );
    return result;
}

/**
 * @description: 字符串补全长度
 * @param {String | Number} str: 待补全的变量
 * @param {Number} num: 需要补全的数量
 * @param {String | Number} z: 占位符
 */
export function padStart(str: string | number, num: number, z: string | number) {
    const _z = Array(num).join(z.toString());
    return `${_z}${str}`.slice(-num);
}

/**
 * @description: 格式化录音时间
 * @param {Number | String} times: 待格式化的时间
 *
 * @return {String}
 */
export function formatTime(times: number | string): string {
    const _times = Number(times);
    if (isNaN(_times)) return (times as string) || '00:00:00';
    const hour = ~~(_times / 60 / 60);
    const minute = ~~(_times / 60) % 60;
    const second = ~~(_times % 60);
    return `${padStart(hour, 2, 0)}:${padStart(minute, 2, 0)}:${padStart(second, 2, 0)}`;
}

/**
 * @description: 获取指定值的深度(树形结构)
 * @param {Array} data: 数据源
 * @param {String} key: 待查找的键
 * @param {String} value: 带查找的值
 * @param {String} childrenKey: 子级 key
 */
export function getDepth<T extends Record<string, any>, K extends keyof T>(
    data: T[],
    key: K,
    value: T[K],
    childrenKey = 'children',
): number | -1 {
    if (!isArray(data)) return -1;
    for (const item of data) {
        if (item[key] === value) return 0;
        if (item[childrenKey] && item[childrenKey].length) {
            const r = getDepth(item[childrenKey], key, value, childrenKey);
            if (r !== undefined) return r + 1;
        }
    }
    return -1;
}

/**
 * @description: 缓存函数
 * @param {Function} calcFunc: 执行函数
 * @param {Boolean} isAbandon: 执行函数是否舍弃第一个参数(即标记参数)
 */
export function cacheCalc<T extends (...args: any) => any, P extends boolean>(calcFunc: T, isAbandon?: P) {
    const caches: Record<string, any> = {};
    return function cacheFunc(
        this: any,
        sign: number | string,
        ...args: P extends true ? Parameters<T> : Tail<T>
    ): ReturnType<T> {
        if (caches[sign]) return caches[sign];
        const result = calcFunc.apply(this, isAbandon ? args : [sign].concat(args));
        result !== undefined && (caches[sign] = result);
        return result;
    };
}

/**
 * @description: 将一维数组转换成树
 * @param {Array} source: 数据源
 * @param {Object} option: 配置项
 * @param {String} option.uniqueKey: 唯一键
 * @param {String} option.parentKey: 父级键(用来判断父子结构的)
 * @param {String} option.childrenKey?: 子级
 * @param {Boolean} option.retainChildrenKey?: 是否始终保留子级的为数组
 */
export function toTree<T extends Record<string, any>, K extends string & keyof T>(
    source: T[],
    option: {
        uniqueKey: K;
        parentKey: K;
        childrenKey?: K;
        retainChildrenKey?: boolean;
    },
): T[] {
    const result: T[] = [];
    const templ: Record<string, any> = {};
    const { uniqueKey, parentKey, childrenKey = 'children', retainChildrenKey } = option;
    source.every((_v) => {
        const v = { ..._v };
        // @ts-expect-error
        retainChildrenKey && (v[childrenKey] = v[childrenKey] || []);
        if (v[parentKey]) {
            if (templ[v[parentKey]]) {
                templ[v[parentKey]][childrenKey] = templ[v[parentKey]][childrenKey] || [];
            } else {
                templ[v[parentKey]] = { [childrenKey]: [] };
            }
            templ[v[parentKey]][childrenKey].push(v);
        } else {
            result.push(v);
            templ[v[uniqueKey]] && (v[childrenKey] = templ[v[uniqueKey]][childrenKey]);
        }
        templ[v[uniqueKey]] = v;
        return true;
    });
    return result;
}
/**
 * @description 是否为谷歌浏览器
 * @returns true ---> 谷歌浏览器 false----> 其他
 */
export function isChrome() {
    const userAgent = navigator.userAgent;
    // if(userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1){
    //   return 'Opera';
    // }
    // else if(userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1){
    //   return 'IE';
    // }
    // else if(userAgent.indexOf("Edge") > -1){
    //    return 'Edge';
    // }
    // else if(userAgent.indexOf("Firefox") > -1){
    //    return 'Firefox';
    // }
    // else if(userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1){
    //   return 'Safari';
    // }
    // else
    if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1) {
        return true;
    }
    return false;
    // else if(!!window.ActiveXObject || "ActiveXObject" in window){
    //    return 'IE>=11';
    // }
    // else{
    //  return 'Unkonwn';
    // }
}
/**
 * @description:下载文件流(兼容IE10)
 * @param {Blob}blob:待下载的数据流文件
 * @param {string}fileName:文件名称
 */

export function downLoadFile(blob: Blob, fileName: string) {
    //@ts-ignore
    if (window.navigator.msSaveOrOpenBlob) {
        //IE10
        // @ts-ignore
        navigator.msSaveBlob(blob, fileName);
    } else {
        let link = document.createElement('a');
        link.style.display = 'none';
        link.href = URL.createObjectURL(blob); //创建一个指向该参数对象的URL
        link.download = fileName;
        link.click(); //触发下载
        URL.revokeObjectURL(link.href); //释放通过URL.createObjectURL()创建的URL
    }
}
