import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { setStorage, getStorage, removeStorage } from '../utils/utils';

// 检验两个参数是否一致
export function isEqual(query1: Record<string, any>, query2: Record<string, any>): boolean {
    return Object.entries(query1).every(([k, v]) => {
        if (typeof v === 'object' && typeof query2[k] === 'object') {
            return isEqual(v, query2[k]);
        } else {
            /* eslint-disable eqeqeq */
            return v == query2[k];
            /* eslint-enable eqeqeq */
        }
    });
}

// 设置路由参数 mixin
export const listBaseMixin = {
    props: {
        // 判断是否是路由组件
        isRouteComp: { type: Boolean },
        // 该组件所拥有的权限
        auth: { type: Array },
    },
    computed: {
        // @ts-ignore
        finalAuth() {
            // @ts-ignore
            const { auth } = this;
            return (auth || []).filter((v: any) => v.menuType === 'F');
        },
        // @ts-ignore
        authObj() {
            const { finalAuth } = this;
            // @ts-ignore
            return finalAuth.reduce((p, v) => {
                p[v.perms] = v;
                return p;
            }, {});
        },
    },
    methods: {
        /**
         * @description: 设置路由 query 参数
         * @param {Object} param
         */
        setRouteQuery(param: Record<string, any>) {
            const {
                // @ts-ignore
                isRouteComp,
                // @ts-ignore
                $route: { query },
            } = this;
            if (!isRouteComp) return;
            // @ts-ignore
            isEqual(param, query) || this.$router.replace({ query: param });
        },
        /**
         * @description: 判断传递进来的参数是否一致
         * @param {Object} param1?: 比对参数1
         * @param {Object} param2?: 比对参数2
         * @param {Boolean}
         */
        isEqual(param1?: Record<string, any>, param2?: Record<string, any>) {
            if (!(param1 && param2)) return false;
            return isEqual(param1, param2);
        },
    },
};

// 列表的 mixin
export const listMixin = {
    props: {
        // 是否是多选列表
        multiple: { type: Boolean },
    },
    mixins: [listBaseMixin],
    data: () => ({
        list: {
            list: [],
            page: { pageSize: 20, pageNum: 1, count: 1, countPage: 1 },
        },
        pageInfo: { pageNum: 1, pageSize: 20 },
        query: {},
        columns: [],
    }),
    computed: {
        // @ts-ignore
        parameter() {
            // @ts-ignore
            const { pageInfo, query } = this;
            return { ...query, ...pageInfo };
        },
        // @ts-ignore
        selection() {
            const {
                // @ts-ignore
                multiple,
                // @ts-ignore
                columns,
                // @ts-ignore
                columns: { length },
            } = this;
            if (!multiple) return [];
            return length && columns[length - 1].type === 'selection' ? [] : [{ type: 'selection' }];
        },
        // @ts-ignore
        finalColumns() {
            const {
                // @ts-ignore
                isRouteComp,
                // @ts-ignore
                selection,
                // @ts-ignore
                columns,
                // @ts-ignore
                columns: { length },
            } = this;
            // @ts-ignore
            const _cols = selection.concat(columns);
            return !isRouteComp && length && columns[length - 1].label === '操作' ? _cols.slice(0, -1) : _cols;
        },
    },
    methods: {
        /**
         * @description: 获取列表事件 - 外部定义
         * @param {Object} params: 请求的参数
         */
        // @ts-ignore
        async getList({ ...params } = this.parameter) {},
        /**
         * @description: 数据被删除后对分页进行处理, 防止请求超出页
         */
        deletedUpdatePageInfo() {
            const {
                // @ts-ignore
                list: {
                    list: { length },
                },
                // @ts-ignore
                pageInfo,
                // @ts-ignore
                pageInfo: { pageNum },
            } = this;
            if (length <= 1 && pageNum > 1) {
                pageInfo.pageNum = pageNum - 1;
            }
        },
        /**
         * @description: 条件搜索
         * @param {Object} query: 待查询的条件
         */
        querySearch(query: Record<string, any>) {
            // @ts-ignore
            const { pageInfo } = this;
            pageInfo.pageNum = 1;
            // @ts-ignore
            this.$set(this, 'query', query);
            // @ts-ignore
            this.setRouteQuery(this.parameter);
            // @ts-ignore
            this.getList(this.parameter);
        },
        /**
         * 排序检索
         */
        sortChange({ prop, order, column }: Record<string, any>) {
            if (column?.sortable !== 'custom') return;
            const field = typeof column.index === 'function' && typeof column.index() === 'string' && column.index();
            // @ts-ignore
            const { query } = this;
            this.querySearch({ ...query, [field || `${prop}Sort`]: order || undefined });
        },
        /**
         * @description: 分页改变事件
         * @param {Object} query: 分页信息
         * @param {Number} query.page: 跳转页
         * @param {Number} query.limit: 每页显示数量
         */
        pageChange(pageInfo: Record<string, any>) {
            // @ts-ignore
            this.pageInfo = pageInfo;
            // @ts-ignore
            this.setRouteQuery(this.parameter);
            // @ts-ignore
            this.getList(this.parameter);
        },
    },
};

// list 作为 tab 组件子级的 mixin
export const tabListMixin = {
    props: {
        // 判断是否是路由组件
        isRouteComp: { type: Boolean },
        // 该组件所拥有的权限
        auth: { type: Array },
    },
    data: () => ({
        cacheQuery: {},
    }),
    mixins: [listBaseMixin],
    methods: {
        /**
         * @description: 返回可能存在的权限
         * @param {Object} data: 当前的 tab 对象
         */
        getOptionalAuth(data: any) {
            return data.meta && data.meta.butList ? data.meta.butList : [];
        },
        /**
         * @description: tab 切换事件
         * @param {String} value: 切换的 tab 名称
         * @param {String} oldValue: 旧的 tab 值
         */
        handover(value: string, oldValue: string) {
            // @ts-ignore
            const { cacheQuery, isRouteComp } = this;
            // @ts-ignore
            const { query } = this.$route;
            if (oldValue === value) return;
            // @ts-ignore
            isRouteComp && this.$router.replace({ query: { active: value } });
            const newQuery = { ...query, active: oldValue };
            cacheQuery[oldValue] = newQuery;

            cacheQuery[value] &&
                // @ts-ignore
                this.$nextTick(() => {
                    // @ts-ignore
                    this.setRouteQuery(cacheQuery[value]);
                });
        },
    },
};

// 可作为弹窗列表的 mixin
export const popupListMixin = {
    props: {
        // 是否是多选列表
        multiple: { type: Boolean },
        // 多选时, 用来判断唯一数据的 key
        uniqueKey: { type: String },
        // 默认选中的数据
        checked: { type: Array, default: () => [] },
    },
    data: (vm: any) => ({
        // 选中的数据
        checkedArr: [...vm.checked],
        // 当前页选中项
        temporarySelection: [],
    }),
    methods: {
        /**
         * @description: 返回选中的数据
         */
        // @ts-ignore
        getCheckedData() {
            // @ts-ignore
            const { multiple, checkedArr } = this;
            if (multiple) {
                // @ts-ignore
                const a = this.getUniqueData(checkedArr, this.getSelectionData());
                // @ts-ignore
                return [...this.checkedArr, ...a];
            } else {
                const tableInstance = this.getTableInstance();
                if (tableInstance) {
                    const currentRow = tableInstance.store.states.currentRow;
                    return currentRow ? [currentRow] : [];
                } else {
                    return [];
                }
            }
        },
        /**
         * @description: 对各种操作做的统一处理
         */
        popupListController(type: string) {
            switch (type) {
                case 'beforePage':
                    // 翻页前
                    // @ts-ignore
                    this.temporarySelection = this.getSelectionData();
                    break;
                case 'afterPage':
                    // 翻页后
                    this.updateTableChecked();
                    this.mergeCheckData();
                    break;
                default:
                    break;
            }
            return this;
        },
        /**
         * @description: 更新 table 的选中行状态
         */
        updateTableChecked() {
            // @ts-ignore
            const { isRouteComp } = this;
            if (isRouteComp) return;
            const {
                // @ts-ignore
                checkedArr,
                // @ts-ignore
                uniqueKey,
                // @ts-ignore
                $refs: {
                    list: {
                        list: { list },
                    },
                },
            } = this;
            const tableInstance = this.getTableInstance();
            if (checkedArr.length && tableInstance) {
                checkedArr.every((item: any) => {
                    list.some((v: any) => {
                        const isMatch = v[uniqueKey] === item[uniqueKey];
                        isMatch && tableInstance.toggleRowSelection(v);
                        return isMatch;
                    });
                    return true;
                });
            }
            // console.log(this)
            return this;
        },
        /**
         * @description: 获取当前列表中的选中项
         */
        // @ts-ignore
        getSelectionData() {
            // @ts-ignore
            const tableInstance = this.getTableInstance();
            return tableInstance ? tableInstance.selection : [];
        },
        /**
         * @description: 合并选中的数据
         */
        mergeCheckData() {
            // @ts-ignore
            const { checkedArr, temporarySelection } = this;
            checkedArr.push(...this.getUniqueData(checkedArr, temporarySelection));
            // @ts-ignore
            this.temporarySelection = [];
            return this;
        },
        /**
         * @description: 获取新增的数据
         * @param {Array} obj1: 原始数据
         * @param {Array} obj2: 新增数据
         * @param {String} uniqueKey
         *
         * @return {Array}
         */
        // @ts-ignore
        getUniqueData(obj1: any[], obj2: any[], uniqueKey = this.uniqueKey) {
            const result: any[] = [];
            obj2.every((item) => {
                const status = obj1.some((v) => item[uniqueKey] === v[uniqueKey]);
                status || result.push(item);
                return true;
            });
            return result;
        },
        /**
         * @description: 获取 el table 实例
         */
        // @ts-ignore
        getTableInstance() {
            try {
                // @ts-ignore
                return this.$refs.list.$refs.tablePage.$refs.table.$refs.table;
            } catch (error) {
                return null;
            }
        },
    },
};

interface PageInfo {
    pageNum: number;
    pageSize: number;
}

/**
 * @description: 对权限做处理以及定义设置路由参数函数
 */
@Component
export class BaseListMixin extends Vue {
    @Prop({ type: Boolean })
    isRouteComp?: boolean;
    @Prop({ type: Array, default: () => [] })
    auth!: Record<string, any>[];

    get finalAuth() {
        const { auth } = this;
        return (auth || []).filter((v) => v.menuType === 'F');
    }
    get authObj() {
        const { finalAuth } = this;
        return finalAuth.reduce((p, v) => {
            p[v.path] = v;
            return p;
        }, {});
    }

    /**
     * @description: 设置路由 query 参数
     * @param {Object} param
     */
    setRouteQuery(param: Record<string, any>) {
        // const {
        //     isRouteComp,
        //     $route: { query },
        // } = this;
        // if (!isRouteComp) return;
        // isEqual(param, query) || this.$router.replace({ query: param });
    }
    /**
     * @description: 判断传递进来的参数是否一致
     * @param {Object} param1?: 比对参数1
     * @param {Object} param2?: 比对参数2
     * @param {Boolean}
     */
    isEqual(param1: Record<string, any>, param2: Record<string, any>) {
        if (!(param1 && param2)) return false;
        return isEqual(param1, param2);
    }
}

/**
 * @description: 列表的 mixin
 */
// @ts-expect-error
@Component
export abstract class ListMixin<T = Record<string, any>> extends BaseListMixin {
    // 是否是多选列表
    @Prop({ type: Boolean })
    multiple?: boolean;

    tableData = {
        list: [] as T[],
        page: { pageSize: 20, pageNum: 1, count: 1, countPage: 1 },
    };
    pageInfo = { pageNum: 1, pageSize: 20 };
    query: Record<string, any> = {};
    columns: HTableColumn[] = [];

    get parameter() {
        const { pageInfo, query } = this;
        return { ...query, ...pageInfo };
    }
    get selection(): HTableColumn[] {
        const {
            multiple,
            columns,
            columns: { length },
        } = this;
        if (!multiple) return [];
        return length && columns[length - 1].type === 'selection' ? [] : [{ type: 'selection' }];
    }
    get finalColumns() {
        const {
            isRouteComp,
            selection,
            columns,
            columns: { length },
        } = this;
        const _cols = selection.concat(columns);
        return !isRouteComp && length && columns[length - 1].label === '操作' ? _cols.slice(0, -1) : _cols;
    }

    /**
     * @description: 获取列表事件 - 外部定义
     * @param {Object} params: 请求的参数
     */
    abstract getList(params: Record<string, any>): void;
    /**
     * @description: 数据被删除后对分页进行处理, 防止请求超出页
     */
    updatePageNum() {
        const {
            tableData: {
                list: { length },
            },
            pageInfo,
            pageInfo: { pageNum },
        } = this;
        if (length <= 1 && pageNum > 1) {
            pageInfo.pageNum = pageNum - 1;
        }
    }
    /**
     * @description: 条件搜索
     * @param {Object} query: 待查询的条件
     */
    querySearch(query: Record<string, any>) {
        const { pageInfo } = this;
        pageInfo.pageNum = 1;
        this.$set(this, 'query', query);
        this.setRouteQuery(this.parameter);
        this.getList(this.parameter);
    }
    /**
     * 排序检索
     */
    sortChange({ prop, order, column }: Record<string, any>) {
        if (column?.sortable !== 'custom') return;
        const field = typeof column.index === 'function' && typeof column.index() === 'string' && column.index();
        const { query } = this;
        this.querySearch({ ...query, [field || `${prop}Sort`]: order || undefined });
    }
    /**
     * @description: 分页改变事件
     * @param {Object} query: 分页信息
     * @param {Number} query.page: 跳转页
     * @param {Number} query.limit: 每页显示数量
     */
    pageChange(pageInfo: PageInfo) {
        this.pageInfo = pageInfo;
        this.setRouteQuery(this.parameter);
        this.getList(this.parameter);
    }
}

/**
 * @description: list 作为 tab 组件子级的 mixin
 */
@Component
export class TabListMixin extends BaseListMixin {
    cacheQuery: Record<string, any> = {};

    /**
     * @description: 返回可能存在的权限
     * @param {String} value?: 返回激活的菜单值(该值不存在于菜单中则返回第一项的值)
     * @return {String}
     */
    getActiveValue(value: string | undefined, data = this.auth): string {
        if (!(data && data.length)) return value || '';
        const r = data.find((v) => v.alias === value || v.path === value);
        return r?.alias || r?.path || data[0].alias || data[0].path;
    }
    /**
     * @description: 过滤 handover 函数中设置路由的参数(供外部使用)
     * @note 需要保留某些字段, 可以该函数处理
     * @param {Object} query: 待赋值的参数
     */
    filterQueryAtHandoverFunction(query: Record<string, any>) {
        return query;
    }
    /**
     * @description: tab 切换事件
     * @param {String} value: 切换的 tab 名称
     * @param {String} oldValue: 旧的 tab 值
     */
    // handover(value: string, oldValue: string) {
    //     // element 会默认将 value 设为 0
    //     if (value === '0') return Promise.resolve();
    //     if (oldValue === value) return Promise.resolve();
    //     const { isRouteComp, cacheQuery } = this;
    //     return new Promise<void>(async (resolve) => {
    //         const { query } = this.$route;
    //         try {
    //             isRouteComp &&
    //                 (await this.$router.replace({
    //                     query: this.filterQueryAtHandoverFunction({ active: value, ...(oldValue === '' ? query : {}) }),
    //                 }));
    //         } catch (error) {}

    //         const oldQuery = { ...query, active: oldValue };
    //         cacheQuery[oldValue] = oldQuery;
    //         if (cacheQuery[value]) {
    //             this.setRouteQuery(cacheQuery[value]);
    //             this.$nextTick(resolve);
    //         } else {
    //             resolve();
    //         }
    //     });
    // }
}

/**
 * @description: 可作为弹窗列表的 mixin
 */
@Component
export class PopupListMixin extends BaseListMixin {
    $refs!: {
        list: any;
    };

    // 是否是多选列表
    @Prop({ type: Boolean })
    multiple?: boolean;
    // 多选时, 用来判断唯一数据的 key
    @Prop({ type: String })
    uniqueKey?: string;
    // 默认选中的数据
    @Prop({ type: Array, default: () => [] })
    checked?: Record<string, any>[];

    // 选中的数据
    checkedArr: Record<string, any>[] = [];
    // 当前页选中项
    temporarySelection = [];

    created() {
        this.checked && (this.checkedArr = [...this.checked]);
    }

    /**
     * @description: 返回选中的数据
     */
    getCheckedData() {
        const { multiple, checkedArr } = this;
        if (multiple) {
            const a = this.getUniqueData(checkedArr, this.getSelectionData());
            return [...this.checkedArr, ...a];
        } else {
            const tableInstance = this.getTableInstance();
            if (tableInstance) {
                const currentRow = tableInstance.store.states.currentRow;
                return currentRow ? [currentRow] : [];
            } else {
                return [];
            }
        }
    }
    /**
     * @description: 对各种操作做的统一处理
     */
    popupListController(type: string) {
        switch (type) {
            case 'beforePage':
                // 翻页前
                this.temporarySelection = this.getSelectionData();
                break;
            case 'afterPage':
                // 翻页后
                this.updateTableChecked();
                this.mergeCheckData();
                break;
            default:
                break;
        }
        return this;
    }
    /**
     * @description: 更新 table 的选中行状态
     */
    updateTableChecked() {
        const { isRouteComp } = this;
        if (isRouteComp) return;
        const {
            checkedArr,
            uniqueKey,
            $refs: {
                list: {
                    list: { list },
                },
            },
        } = this;
        const tableInstance = this.getTableInstance();
        if (checkedArr.length && tableInstance) {
            checkedArr.every((item) => {
                list.some((v: any) => {
                    // @ts-expect-error
                    const isMatch = v[uniqueKey] === item[uniqueKey];
                    isMatch && tableInstance.toggleRowSelection(v);
                    return isMatch;
                });
                return true;
            });
        }
        // console.log(this)
        return this;
    }
    /**
     * @description: 获取当前列表中的选中项
     */
    getSelectionData() {
        const tableInstance = this.getTableInstance();
        return tableInstance ? tableInstance.selection : [];
    }
    /**
     * @description: 合并选中的数据
     */
    mergeCheckData() {
        const { checkedArr, temporarySelection } = this;
        checkedArr.push(...this.getUniqueData(checkedArr, temporarySelection));
        this.temporarySelection = [];
        return this;
    }
    /**
     * @description: 获取新增的数据
     * @param {Array} obj1: 原始数据
     * @param {Array} obj2: 新增数据
     * @param {String} uniqueKey
     *
     * @return {Array}
     */
    getUniqueData(obj1: Record<string, any>[], obj2: Record<string, any>[], uniqueKey = this.uniqueKey) {
        const result: Record<string, any>[] = [];
        obj2.every((item) => {
            // @ts-expect-error
            const status = obj1.some((v) => item[uniqueKey] === v[uniqueKey]);
            status || result.push(item);
            return true;
        });
        return result;
    }
    /**
     * @description: 获取 el table 实例
     */
    getTableInstance() {
        try {
            return this.$refs.list.$refs.tablePage.$refs.table.$refs.table;
        } catch (error) {
            return null;
        }
    }
}

/**
 * @description: 读写组件(动态路由, 需要缓存数据) mixin
 */
@Component
export class WriteableCacheDataMixin extends Vue {
    /**
     * @description: 从路由传递的标识符, 以该标识符作为缓存的键
     * 取时间戳, 后面可增加随机数
     */
    @Prop({ type: String })
    flag?: string;

    /**
     * @description: 标识发生变化时触发
     */
    @Watch('flag', { immediate: true })
    signChange(newVal?: string, oldVal?: string) {
        oldVal && this.setCacheData(this.getCacheData(), oldVal);
        this.readAndRestoreCacheData(newVal);
    }

    beforeDestroy() {
        // _inactive 为 null 说明组件没被缓存, 在销毁时应缓存数据
        // 其它值是说明是主动销毁的, 所以清除缓存的值
        // TODO: 直接清空 tags 时, 无法触发到清除缓存的方法
        this._inactive === null ? this.setCacheData(this.getCacheData()) : this.removeCacheData();
    }

    /**
     * @description: 缓存数据
     * @param {*} data: 缓存的数据
     * @param {String} _key?: 缓存的键
     */
    setCacheData(data: any, _key?: string) {
        const key = _key || this.flag;
        if (!key || !data) return;
        setStorage(`writeable-${key}`, data);
    }
    /**
     * @description: 读取缓存的数据
     * @param {String} _key?: 缓存的键
     */
    readAndRestoreCacheData(_key?: string) {
        const key = _key || this.flag;
        if (!key) return;
        const a = getStorage(`writeable-${key}`);
        a && this.restoreData(a);
    }
    /**
     * @description: 清除缓存的数据
     * @param {String} _key?: 缓存的键
     */
    removeCacheData(_key?: string) {
        const key = _key || this.flag;
        if (!key) return;
        removeStorage(`writeable-${key}`);
    }
    /* eslint-disable @typescript-eslint/no-empty-function */
    /* 外部需要覆盖此方法 */
    /**
     * @description: 获取缓存数据
     */
    getCacheData(): any {}
    /**
     * @description: 恢复缓存的数据
     */
    restoreData(data: any) {}
    /* eslint-disable @typescript-eslint/no-empty-function */
}
