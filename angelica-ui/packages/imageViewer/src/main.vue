<template>
    <!-- <div>12</div> -->
    <ElImageViewer
        v-if="showViewer"
        :z-index="zIndex"
        :initial-index="initialIndex"
        :on-close="closeViewer"
        :url-list="finalUrlList"
    />
</template>

<script>
/**
 * @file 图片预览组件
 */
import ElImageViewer from 'element-ui/packages/image/src/image-viewer.vue';

let prevOverflow = '';

export default {
    name: 'ImageViewer',
    components: {
        ElImageViewer,
    },
    props: {
        value: { type: Boolean, required: true },
        /**
         * 图片数据源
         */
        urlList: { type: [String, Array] },
        zIndex: {
            type: Number,
            default: 9999,
        },
        initialIndex: { type: Number },
    },
    computed: {
        showViewer() {
            const { value } = this;
            value && this.openViewer();
            return value;
        },
        finalUrlList() {
            const { urlList } = this;
            return [].concat(urlList);
        },
    },
    methods: {
        openViewer() {
            prevOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
        },
        closeViewer() {
            document.body.style.overflow = prevOverflow;
            this.$emit('input', false);  
        },
    },
};
</script>

<style lang="scss" scoped></style>
