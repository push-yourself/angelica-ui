<template>
    <!-- eslint-disable vue/attributes-order -->
    <ElDialog 
        :visible="$attrs.value" 
        @update:visible="visibleUpdate" 
        v-bind="$attrs" 
        :class="theme" 
        v-on="$listeners">
        <div v-loading="loading" class="loading-wrap">
            <slot></slot>
        </div>
    </ElDialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    name: 'HDialog',
})
export default class HDialog extends Vue {
    @Prop({ type: Boolean })
    loading?: boolean;
    @Prop({ type: String, default: 'dark-theme' })
    theme?: string;

    visibleUpdate() {
        this.$emit('input', false);
        this.$emit('update:visible', false);
    }
}
</script>

<style lang="scss" scoped>
// $dark-bg: '~@/assets/images/modal/newModalBg.png';
* {
    box-sizing: border-box;
}

::v-deep {
    &.dark-theme {
        .el-dialog {
            // background-image: url($dark-bg);
            background-size: 100% 100%;
            background-color: transparent;

            &__header {
                text-align: center;
                padding: 12px 20px 10px;

                .el-dialog__title {
                    color: white;
                }
            }
            &__body {
                color: inherit;
            }
        }
    }
    .el-dialog {
        &__header {
            // border-bottom: $--border-base;
        }
        &__body {
            padding: 0;
        }
    }
    .el-select {
        width: 100%;
    }
}
.loading-wrap {
    width: 100%;
    height: 100%;
    padding: 0.3rem 0.2rem;
}
</style>
