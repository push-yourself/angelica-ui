<template>
    <ul :class="`custom-menu custom-menu--level-${level}`">
        <template v-for="(item, index) of datum">
            <li
                :key="index"
                :class="[
                    {
                        'custom-menu-item': hasChild(item),
                    },
                ]"
                class="custom-menu-item"
            >
                <div
                    :class="{
                        'custom-menu-item__title--active': item.path === active,
                        'custom-menu-item__title--expand': item.__expand,
                    }"
                    class="custom-menu-item__title center"
                    @click="handle(item)"
                >
                    <p class="center">
                        <img v-if="item.icons" class="custom-menu-item__icon" :src="item.icons" />
                        <span class="custom-menu-item__text">{{ item.name }}</span>
                    </p>
                    <img v-if="hasChild(item)" class="custom-menu-item__arrow" src="./images/arrow.png" />
                </div>
                <template v-if="hasChild(item)">
                    <ElCollapseTransition>
                        <CustomMenu v-show="item.__expand" :datum="item.child" :active="active" :level="level + 1" />
                    </ElCollapseTransition>
                </template>
            </li>
        </template>
    </ul>
</template>

<script>
export default {
    name: 'CustomMenu',
    props: {
        // 数据源
        datum: { type: Array, default: () => [] },
        // 当前激活路径
        active: { type: String },
        // 层级
        level: { type: Number, default: 1 },
    },
    mounted() {
        this.scrollIntoView();
    },
    // watch: {
    //     active(val) {
    //         val && this.$nextTick(this.scrollIntoView);
    //     },
    // },
    methods: {
        /**
         * 判断菜单是否有子级
         */
        hasChild(data) {
            return !!(data.child && data.child.length);
        },
        /**
         * 菜单点击事件
         * @param {Object} data 菜单数据
         */
        handle(data) {
            const currentExpandStatus = data.__expand;
            this.datum.forEach((v) => {
                this.$set(v, '__expand', false);
                // v.__expand = false;
            });
            this.$set(data, '__expand', !currentExpandStatus);
            const instance = this.findParent();
            instance && instance.$emit('menuClick', data);
        },
        /**
         * 查找顶层的 menu 元素
         */
        findParent(instance = this) {
            return instance.$parent.$options.name === 'CustomMenu' ? this.findParent(instance.$parent) : instance;
        },
        /**
         * 让元素显示在可视区内
         */
        scrollIntoView() {
            const dom =
                this.$el.getElementsByClassName &&
                this.$el.getElementsByClassName('custom-menu-item__title--active')[0];
            dom && dom.scrollIntoView({ behavior: 'smooth' });
        },
    },
};
</script>

<style lang="scss" scoped>
p,
li {
    margin: 0;
}

.custom-menu {
    &--level-1 {
        & > .custom-menu-item {
            &:not(:first-child) {
                margin-top: 0.08rem;
            }
            & > .custom-menu-item__title {
                font-size: 0.18rem;
                padding: 0 0.16rem;
                background-image: url('./images/menu-item.png');
            }
        }
    }
    &--level-2 {
        $border: 1px solid #0a3b66;
        border: $border;
        border-top: none;
        & > .custom-menu-item {
            &:not(:first-child) {
                margin-top: 0.04rem;
                border-top: $border;
            }
            &:not(:last-child) {
                border-bottom: $border;
            }
            & > .custom-menu-item__title {
                font-size: 0.18rem;
                padding: 0 0.16rem;
                background-color: #031429;
                box-shadow: inset 0 0 0.1rem 0 rgba(61, 160, 248, 0.2);
            }
        }
    }
    &--level-3 {
        & > .custom-menu-item {
            // &:not(:first-child) {
            // }
            & > .custom-menu-item__title {
                font-size: 0.16rem;
                padding-left: 0.16rem;
                &--active {
                    background: linear-gradient(
                        270deg,
                        rgba(0, 135, 255, 0) 0%,
                        rgba(0, 135, 255, 0.5) 49%,
                        rgba(0, 135, 255, 0) 100%
                    );
                }
            }
        }
    }
}
.custom-menu-item {
    &__title {
        height: 0.48rem;
        cursor: pointer;
        font-family: SourceHanSansCN-Regular, SourceHanSansCN;
        font-weight: 400;
        color: #a4ceed;
        background-size: 100% 100%;
        &--active {
            color: white;
        }
        &--expand {
            .custom-menu-item__arrow {
                transform: rotate(90deg);
            }
        }
    }
    &__icon {
        width: 0.24rem;
        height: 0.24rem;
    }
    &__text {
        margin-left: 0.29rem;
    }
    &__icon ~ .custom-menu-item__text {
        margin-left: 0.04rem;
    }
    &__arrow {
        width: 0.16rem;
        height: 0.16rem;
        margin-left: auto;
        transition: transform 0.1s linear;
    }
}
</style>
