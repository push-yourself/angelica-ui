<template>
    <component :is="tag" ref="countUpRef"></component>
</template>

<script>
import { CountUp } from 'countup.js';

/**
 * @file 数字递增动效
 */
export default {
    name: 'CountUp',
    props: {
        num: { type: [Number, String] },
        tag: { type: String, default: 'span' },
    },
    data: () => ({
        /** @type {CountUp} */
        countUpInstance: null,
    }),
    mounted() {
        const { num } = this;
        this.countUpInstance = new CountUp(this.$refs.countUpRef, Number(num));
        this.countUpInstance.start();
    },
    watch: {
        num(val, oldVal) {
            const { countUpInstance } = this;
            if (val !== oldVal && countUpInstance) {
                countUpInstance.update(Number(val));
            }
        },
    },
};
</script>

<style lang="scss" scoped></style>
