<template>
    <HDialog
        v-model="visible"
        :title="title"
        :loading="loading"
        :close-on-click-modal="false"
        top="5vh"
        width="80%"
        class="popup-table"
        @close="cancel"
    >
        <iframe class="pdf-iframe" v-if="visible" :src="url"></iframe>
    </HDialog>
</template>

<script>
import HDialog from '../../dialog/index';
import { listMixin } from '../../../src/mixins/list';
import { modalCommonMixin } from '../../../src/mixins/dialog';

/**
 * @description: 动态渲染 columns 与 data 的 table 组件
 *
 * @emit('clickHandle', data): 点击按钮触发的事件
 * @param {Object} data: 按钮项
 */
export default {
    name: 'PDFPreview',
    inheritAttrs: false,
    components: {
        HDialog,
    },
    props: {
        /** 标题 */
        title: { type: String, default: '预览' },
        /** pdf 文档路径 */
        url: { type: String },
    },
    mixins: [listMixin, modalCommonMixin],
    data: (vm) => ({
        loading: false,
    }),
    methods: {
        /**
         * @description: 显示前执行的逻辑
         */
        async prefixFunc() {},
        /**
         * @description: 隐藏前执行的逻辑
         */
        suffixFunc() {},
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

<style lang="scss" scoped>
.pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
}
</style>
