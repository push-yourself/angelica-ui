<template>
    <!-- <div :class="['svg-wrap', isCircle && 'circle']"> -->
    <svg v-bind="$attrs" aria-hidden="true" class="svg-icon" v-on="$listeners">
        <use :xlink:href="`#icon-${iconClass}`" />
    </svg>
    <!-- </div> -->
</template>

<script lang="ts">
// import { defineComponent, computed } from 'vue';
// https://github.com/PanJiaChen/vue-element-admin/blob/master/src/views/svg-icons/require-icons.js

import { Vue, Component, Prop } from 'vue-property-decorator';

/**
 * @description: 字体图标组件
 */
@Component({})
export default class SvgIcon extends Vue {
    @Prop({ type: [String], required: true })
    iconClass: string | undefined;
    @Prop({ type: [Boolean], default: () => false })
    isCircle?: boolean;
}
</script>

<style lang="scss" scoped>
.svg-wrap {
    // padding: 25px;
    width: 25px;
    height: 25px;
    display: inline-block;
    // display: flex;
    // justify-content: center;
    // align-items: center;
}
.circle {
    background: #0c3e61;
    border-radius: 50% 50%;
}
.svg-icon {
    width: 1em;
    height: 1em;
    // width: 1.3em;
    // height: 1.3em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
}
</style>
