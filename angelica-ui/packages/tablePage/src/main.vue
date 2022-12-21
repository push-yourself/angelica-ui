<template>
    <div class="table-page" :style="styles">
        <table ref="table" v-bind="$attrs" v-on="$listeners"><slot /></table>
        <Pagination v-bind="$attrs" @pageChange="$emit('queryChange', $event)" />
    </div>
</template>

<script>
import table from '../../table/index';
import Pagination from '../../pagination/index';

/**
 * @description: table + page 组件
 *
 * @emit('queryChange', query) 分页信息发生变化时触发
 * @param {Object} query: 分页信息
 * @param {Number} query.pageNum: 跳转页
 * @param {Number} query.pageSize: 每页显示数量
 */
export default {
    components: {
        table,
        Pagination,
    },
    inheritAttrs: false,
    // props: {},
    data: () => ({
        height: 0,
        updateHeight: false,
    }),
    computed: {
        styles() {
            const { height } = this;
            return height ? { height: `${height}px` } : {};
        },
    },
    mounted() {
        const resizer = () => {
            this._inactive !== null && this._inactive === true
                ? (this.updateHeight = true)
                : this.updateWrapperHeight();
        };
        window.addEventListener('resize', resizer);
        this.$once('hook:beforeDestroy', () => {
            window.removeEventListener('resize', resizer);
        });
        this.updateWrapperHeight();
    },
    activated() {
        const { updateHeight } = this;
        if (updateHeight) {
            this.updateWrapperHeight();
            this.updateHeight = false;
        }
        // updateHeight && this.$nextTick(() => {
        //     this.updateWrapperHeight()
        //     this.updateHeight = false
        // })
    },
    methods: {
        /**
         * @description: 获取当前组件的高度
         */
        updateWrapperHeight() {
            const { top, bottom } = this.$el.parentElement.getBoundingClientRect();
            const rect = this.$el.getBoundingClientRect();
            const topDistance = rect.top - top;
            this.height = bottom - top - topDistance;
            this.$nextTick(() => {
                this.$refs.table.updateWrapperHeight();
            });
        },
    },
};
</script>

<style lang="scss" scoped>
::v-deep {
    .el-table {
        margin-top: 0 !important;
        width: 100%;
        // display: flex;
        // flex-flow: column;

        // &__header-wrapper {
        //     flex: none;
        // }
        // &__body-wrapper {
        //     flex: auto;
        // }
    }
}

.table-page {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column;
}
// .scroll-wrap {
//     flex: auto;
//     display: flex;
//     flex-flow: column;
//     overflow: hidden;
// }
</style>
