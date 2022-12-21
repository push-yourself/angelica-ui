<script>
import { Table, TableColumn } from 'element-ui';

export default {
    inheritAttrs: false,
    props: {
        // 自动更新高度
        autoUpdateHeight: { type: Boolean },
        border: { type: Boolean, default: false },
        columns: { type: Array, default: () => [] },
    },
    data: () => ({
        height: 0,
    }),
    watch: {
        autoUpdateHeight() {
            const { autoUpdateHeight } = this;
            window.removeEventListener('resize', this.updateWrapperHeight);
            autoUpdateHeight && window.addEventListener('resize', this.updateWrapperHeight);
            autoUpdateHeight ? this.$nextTick(this.updateWrapperHeight) : (this.height = 0);
        },
    },
    mounted() {
        const { autoUpdateHeight } = this;
        autoUpdateHeight && this.updateWrapperHeight();
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.updateWrapperHeight);
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
        },
    },
    render(h) {
        const { $attrs, $listeners, columns, height, border } = this;
        return (
            <Table
                {...{ props: { height: height || undefined, border, ...$attrs }, on: $listeners }}
                class="dark-theme"
                ref="table"
            >
                {columns.map((v, index) => {
                    const key = `${index}${v.type || ''}${v.prop || ''}`;
                    const slots = {
                        scopedSlots: {
                            default: v.render && ((...args) => v.render(h, ...args)),
                            header: v.header && ((...args) => v.header(h, ...args)),
                        },
                    };
                    return <TableColumn {...{ props: v }} key={key} refInFor={true} {...slots}></TableColumn>;
                })}
                {this.$slots.default}
            </Table>
        );
    },
};
</script>

<style lang="scss" scoped>
::v-deep {
    &.el-table {
        border-left: none;
        border-top: none;

        &--border {
            .el-table__header .el-table__cell.is-leaf {
                border-right: 1px solid #496f90 !important;
            }
        }
    }
    .el-table__body-wrapper {
        // 以便支持自适应宽高
        overflow: auto;
    }
}
</style>
