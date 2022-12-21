<template>
    <HDialog
        v-model="visible"
        :title="title"
        :loading="loading"
        :close-on-click-modal="false"
        top="5vh"
        width="80%"
        :class="theme"
        @close="cancel"
    >
        <div class="table-content">
            <Condition v-if="condition" :datum="finalCondition" :backfill="query" @search="querySearch" />
            <div class="btn-box dark-theme operaBtnBox">
                <template v-for="item of btns">
                    <ElButton :key="item.value" @click="handle(item)">
                        {{ item.title }}
                    </ElButton>
                </template>
            </div>
            <TablePage
                ref="hTable"
                :data="list.list"
                v-bind="list.page"
                :columns="columns"
                autosizeOfCss
                @queryChange="pageChange"
            ></TablePage>
        </div>
    </HDialog>
</template>

<script>
import { Message as ElMessage, MessageBox as ElMessageBox } from 'element-ui';
import HDialog from '../../dialog/index';
import TablePage from '../../tablePage/index';
import Condition from '../../condition/index';
import { listMixin } from '../../../src/mixins/list';
import { modalCommonMixin } from '../../../src/mixins/dialog';

/**
 * @description: 动态渲染 columns 与 data 的 table 组件
 *
 * @emit('clickHandle', data): 点击按钮触发的事件
 * @param {Object} data: 按钮项
 */
export default {
    name: 'PopupTable',
    inheritAttrs: false,
    components: {
        HDialog,
        TablePage,
        Condition,
    },
    props: {
        theme: { type: String, default: 'popup-table' },
        /**
         * 获取数据(第一个参数是请求参数, 第二个参数是设置 table 的列)
         * @type (params: Record<string, any>, setColumns: (data: HTableColumn[]) => void,) => Promise<API.Response<API.ListType<unknown>>>
         */
        getData: { type: Function, default: () => Promise.resolve({ type: 'fail' }) },
        /**
         * 初始的列表
         */
        initialColumns: { type: Array },
        /**
         * 列表的条件
         */
        condition: { type: Function },
        /**
         * 列表上方的操作按钮
         * @type {Array<{
               title: string; // 名称
               value: string; // 点击时响应的字段
               handle?: (obj: BtnOption) => void; // 点击事件
           }>}
         */
        btns: { type: Array },
        /**
         * 请求参数(create-api 不支持未声明参数的传参)
         */
        params: { type: Object },
        /**
         * 标题
         */
        title: { type: String, default: '查看' },
    },
    mixins: [listMixin, modalCommonMixin],
    data: (vm) => ({
        loading: false,
        columns: [],
        finalCondition: null,
        query: {},
    }),
    methods: {
        /**
         * @description: 显示前执行的逻辑
         */
        async prefixFunc() {
            const { pageInfo } = this;
            pageInfo.pageNum = 1;
            this.initList();
            this.finalCondition = (this.condition && this.condition()) || null;
        },
        /**
         * @description: 隐藏前执行的逻辑
         */
        suffixFunc() {
            this.columns = [];
            Object.assign(this.list, {
                list: [],
                page: { pageSize: 20, pageNum: 1, count: 1, countPage: 1 },
            });
        },
        /**
         * @description: 初始化
         */
        initList() {
            const { pageInfo, initialColumns, params } = this;

            if (params) {
                params.pageNum && (pageInfo.pageNum = Number(params.pageNum));
                params.pageSize && (pageInfo.pageSize = Number(params.pageSize));
            }
            initialColumns && (this.columns = initialColumns);
            this.$set(this, 'query', params);
            this.getList(this.parameter);
        },
        /**
         * @description: 更新 table 的列
         * @param {Array} columns: 待更新的数据
         */
        setColumns(columns) {
            this.columns = columns;
        },
        /**
         * @description: 获取列表
         * @param {Object} params: 请求参数
         */
        async getList(params) {
            this.loading = true;

            const { type, data } = await this.getData(params, this.setColumns);

            this.loading = false;
            if (!type) {
                Object.assign(this.list, data);
            }
        },
        /**
         * @description: 按钮事件
         * @param {Object} item: 点击的按钮项信息
         */
        handle(item) {
            item.handle && item.handle(item);
            this.$emit('clickHandle', item);
        },
    },
};
</script>

<style lang="scss">
// @import '@/views/styles/modal.scss';
.popup-table {
    .el-dialog {
        height: 80%;
        overflow: hidden;
        .el-dialog__body {
            height: calc(100% - 72px);
        }
    }
    .table-content {
        height: 100%;
        display: flex;
        flex-flow: column;

        .btn-box {
            flex: none;
            .el-button {
                margin-bottom: 6px;
            }
        }
    }
}
</style>
