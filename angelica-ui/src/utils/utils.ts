export type StorageType = 'localStorage' | 'sessionStorage';

/**
 * @description: 获取对象类型
 */
export function getType(o: any): string {
    return Object.prototype.toString.call(o).slice(8, -1);
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
 * @description: 从树中获取存在指定值的对象
 * @param {Array} sources: 待查找的数据源
 * @param {Object} value: 匹配值
 * @param {String} childrenKey: 子级的 key, 默认 children
 *
 * @return {* | null}
 */
export function getValue<T>(sources: T[], value: Partial<T>, childrenKey: keyof T = 'children' as any) {
    if (!(sources && sources.length)) return null;
    const conditions = Object.entries(value);
    const a = sources.slice();
    let v = a.shift();
    while (v) {
        const status = conditions.every(([k, val]) => val === v![k as keyof T]);
        if (status) return v;
        if (v[childrenKey] && (v[childrenKey] as unknown as T[]).length) {
            a.push(...(v[childrenKey] as unknown as T[]));
        }
        v = a.shift();
    }
    return null;
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
 * @description:下载文件流(兼容IE10)
 * @param {Blob}blob:待下载的数据流文件
 * @param {string}fileName:文件名称
 */

export function downLoadFile(blob: Blob, fileName: string) {
    //@ts-ignore
    if (window.navigator.msSaveOrOpenBlob) {
        // IE10
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

/**
 * @description: 添加存储内容到指定的类型
 * @param {String|Number} key: 添加的键
 * @param {any} value: 添加的值
 * @param {StorageType} type: 存储的类型
 */
export function setStorage(key: number | string, value: any, type: StorageType = 'localStorage'): void {
    window[type].setItem(key.toString(), JSON.stringify(value));
}

/**
 * @description: 获取指定的存储内容
 * @param {String|Number} key: 添加的键
 * @param {StorageType} type: 存储的类型
 */
export function getStorage<T extends any = any>(key: number | string, type: StorageType = 'localStorage'): T | '' {
    try {
        const result = window[type].getItem(key.toString());
        return result ? JSON.parse(result) : '';
    } catch (error) {
        console.log('error: 读取本地数据失败 ', key);
        return '';
    }
}

/**
 * @description: 删除指定类型中存储的值
 * @param {String|Number} key: 添加的键
 * @param {StorageType} type: 存储的类型
 */
export function removeStorage(key: string, type: StorageType = 'localStorage'): void {
    window[type].removeItem(key);
}
