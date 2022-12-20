<template>
    <div class="dark-theme condition-box">
        <slot name="prepend" />
        <template v-for="(item, key) of datum">
            <component
                :is="getComp(item)"
                :key="key"
                ref="comp"
                v-bind="item"
                :field="item.as || key"
                :backfill="backfill"
                :query="query"
                @search="compSearch"
                @triggerSearch="querySearch"
            />
        </template>
        <div v-if="triggerBtn" class="btn-box">
            <slot name="btn" :search="getQuery" :reset="resetValue">
                <el-button class="condi-submit-btn" type="primary" size="small" icon="el-icon-search" @click="querySearch">
                    {{ text.search }}
                </el-button>
                <el-button class="condi-reset-btn" size="small" icon="el-icon-refresh" @click="reset">
                    {{ text.reset }}
                </el-button>
            </slot>
        </div>
    </div>
</template>

<script>
import { Message as ElMessage } from 'element-ui';
import HInput from '../components/input.vue';
import HSelect from '../components/select.vue';
import DatePicker from '../components/datepicker.vue';
import Cascader from '../components/cascader.vue';
import Dynamic from '../components/dynamic.vue';

const compMap = {
    input: 'HInput',
    datePicker: 'DatePicker',
    select: 'HSelect',
    cascader: 'Cascader',
    dynamic: 'Dynamic',
};

/**
 * @description: 条件格式
 *
 * @description: 文字搜素
 * interface Input extends ElInput {
 *      t: 'input';
 *      prefix?: string; // 显示在筛选框前的文字
 * }
 *
 * @description: 日期筛选
 * @note 注意: 当类型为 *range 时, 需要指定起始字段与结束字段
 * 不指定会传数组上去
 * interface DatePicker extends ElDatePicker {
 *      t: 'datePicker';
 *      prefix?: string; // 显示在筛选框前的文字
 *      beginField: string; // 起始字段
 *      endField: string; // 结束字段
 *      type?: string; // 日期的类型
 * }
 *
 * @description: 下拉框筛选
 * 不指定会传数组上去
 * interface HSelect extends ElSelect {
 *      t: 'select';
 *      prefix?: string; // 显示在筛选框前的文字
 *      valueKey: string; // 提交给后台的字段
 *      labelKey: string; // 显示的字段
 *      option: []; // 下拉项的数据源
 *      getDict?: (cb: (options: Record<string, any>[]) => void) => void; // 动态获取下拉项时传递的函数
 * }
 *
 * @description: 级联选择筛选
 * interface Cascader {
 *      t: 'cascader';
 *      fields?: string | string[]; // 如果不传递则取 field, 不同层级显示返回不同的字段
 *      formatField?: (fields: string[], values: string[], emitPath: boolean, defaultFormatField: Cascader['formatField']) => Record<string, string>; // 不同层级返回不同的字段时触发的函数
 *      getDict?: (cb: (options: Record<string, any>[]) => void) => void; // 动态获取下拉项时传递的函数
 * }
 *
 * @description: 动态筛选组件
 * interface Dynamic {
 *      t: 'dynamic';
 *      prefix: string; // 输入框前的值
 *      placeholder: string; // 未显示前提示的值
 *      watchValue: string; // 要监听的值 backfill[watchValue]
 *      getOption(value: any): null | { field: string; option: ConditionOption | null }; // value: 监听值的值, field: 提交的字段, option: 显示的组件
 * }
 *
 */

/**
 * @description: 条件筛选组件
 *
 * @emit('ready', query): 进入组件后根据传递的值来判断是否触发准备事件;
 * @param {Object} query: 检索的参数
 *
 * @emit('search', query): 搜索事件;
 * @param {Object} query: 检索的参数
 */
export default {
    components: {
        HInput,
        HSelect,
        DatePicker,
        Cascader,
        Dynamic,
    },
    inheritAttrs: false,
    props: {
        /* eslint-disable vue/require-default-prop */
        datum: { type: Object, default: () => ({}) },
        // 回填的数据
        backfill: { type: Object },
        // 是否需要触发的按钮 - 搜索按钮
        triggerBtn: { type: Boolean, default: true },
        // 是否需要实时触发搜索事件
        realtime: { type: Boolean },
        // 初始是否触发一次事件来返回当前的 query
        immediateTrigger: { type: Boolean },
        /* eslint-enable vue/require-default-prop */
    },
    data: () => ({
        // 返回上层组件的搜索值
        query: {},
    }),
    computed: {
        text() {
            return {
                search: '搜索',
                reset: '重置',
            };
        },
        hasCondition() {
            const { datum } = this;
            return !!Object.keys(datum).length;
        },
    },
    watch: {
        // 当条件源发生变化后, 更新 query 字段
        datum() {
            this.$nextTick(() => {
                this.initQuery();
            });
        },
    },
    created() {
        const unwatch = this.$watch(
            `backfill`,
            (value) => {
                this.query = { ...value };
            },
            { immediate: true },
        );
        this.$once('hook:beforeDestroy', () => {
            unwatch();
        });
    },
    mounted() {
        const { immediateTrigger } = this;
        this.initQuery();
        immediateTrigger && this.$emit('ready', this.query);
    },
    methods: {
        /**
         * @description: 初始化 query 字段
         */
        initQuery() {
            const { backfill } = this;
            this.query = { ...backfill, ...this.genCompQuery() };
        },
        /**
         * @description: 获取展示的组件
         * @param {Object} item: 条件项
         *
         * @return {String}
         */
        getComp(item) {
            return compMap[item.t];
        },
        /**
         * @description: 组件的搜索事件
         * @param {Object} query: 搜索的值
         */
        compSearch(params) {
            const { query, realtime } = this;
            this.$set(this, 'query', { ...query, ...params });
            // Object.assign(query, params);
            realtime && this.querySearch();
        },
        /**
         * @description: 搜索事件
         */
        async querySearch() {
            const { query } = this;
            const r = await Promise.all(this.$refs.comp.map((v) => v.validator && v.validator(query)));
            const msg = r.find((v) => v && typeof v === 'string');
            msg ? ElMessage.warning(msg) : this.$emit('search', this.getQuery());
        },
        /**
         * @description: 重置事件
         */
        reset() {
            this.resetValue();
            this.querySearch();
            // this.$emit('search', this.getQuery());
            // const result = this.resetValue();
            // this.$emit('search', result)
            // this.$emit('reset', result)
        },
        /**
         * @description: 获取参数
         */
        getQuery() {
            const { query } = this;
            return { ...query };
        },
        /**
         * @description: 重置事件
         */
        resetValue() {
            const query = this.$refs.comp ? this.$refs.comp.reduce((p, v) => Object.assign(p, v.reset()), {}) : {};
            Object.assign(this.query, query);
        },
        /**
         * @description: 获取组件的 query 信息
         *
         * @return {Object}
         */
        genCompQuery() {
            if (!this.$refs.comp) return {};
            return this.$refs.comp.reduce((p, v) => Object.assign(p, v.getQuery()), {});
        },
    },
};
</script>

<style lang="scss" scoped>
::v-deep {
    .el-input {
        width: 240px;
    }
    .h-condition-item {
        display: flex;
        align-items: center;
    }
    .condition-prefix {
        font-size: 16px;
        padding-right: 12px;
        font-weight: 700;
        white-space: nowrap;
    }
}

.condition-box {
    color: white;
    margin-left: -10px;
    display: flex;
    flex-flow: row wrap;
    & > * {
        margin-left: 10px;
        margin-bottom: 10px;
    }
}
.btn-box {
    display: inline-flex;
    align-items: center;
}
.condi-submit-btn {
    &.el-button--small {
        height: 30px !important;
    }
    background: #0087ff;
    border-radius: 4px;
    border-color: transparent;
    padding: 8px 15px;
    font-size: 14px;
}
.condi-reset-btn {
    &.el-button--small {
        height: 30px !important;
    }
    background-color: #004889;
    border-color: transparent;
    color: #ffffff;
    padding: 8px 15px;
    font-size: 14px;
}
</style>
