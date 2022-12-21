<template>
    <ElPagination
        v-show="count > 0"
        :current-page="pageNum"
        :page-size="pageSize"
        :layout="layout"
        :pageSizes="pageSizes"
        :total="count"
        v-bind="$attrs"
        @size-change="pageChange('pageSize', $event)"
        @current-change="pageChange('pageNum', $event)"
    />
</template>

<script>
export default {
    props: {
        layout: { type: String, default: 'total, prev, pager, next, jumper' },
        pageNum: { type: [Number, String], default: 1 },
        pageSize: { type: [Number, String], default: 20 },
        count: { type: [Number, String], default: 1 },
        pageSizes: { type: Array, default: () => [10, 20, 30, 50] },
    },
    methods: {
        pageChange(type, val) {
            const { pageNum, pageSize } = this;
            if (this[type] === val) return;
            this.$emit('pageChange', { pageNum, pageSize, [type]: val });
        },
    },
};
</script>

<style></style>
