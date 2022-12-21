import { Component, Vue } from 'vue-property-decorator';
import { isBoolean } from '../utils/index';

/**
 * @description: 弹窗默认的逻辑
 */
export const modalCommonMixin = {
    data: () => ({
        visible: false,
        // 保存该实例上打开的弹窗
        dialogInstance: {},
    }),
    // beforeUpdate() {
    //     // 当组件状态为显示时, 先执行 hide 函数
    //     // 防止热更新导致组件异常
    //     this.visible && this.hide();
    // },
    beforeDestroy() {
        // 当组件状态为显示时, 先执行 hide 函数
        // 防止热更新导致组件异常
        // @ts-ignore
        this.visible && this.hide();
    },
    methods: {
        /**
         * @description: 弹窗显示方法
         */
        show() {
            // @ts-ignore
            const { visible } = this;
            // @ts-ignore
            this.$nextTick(() => this.prefixFunc(!visible));
            // @ts-ignore
            this.visible = true;
            return this;
        },
        /**
         * @description: 弹窗隐藏方法
         */
        hide() {
            this.suffixFunc();
            // @ts-ignore
            this.visible = false;
            // @ts-ignore
            this.$emit('hide');
            return this;
        },
        /**
         * @description: 弹窗取消方法
         */
        cancel() {
            // @ts-ignore
            this.$emit('cancel');
            this.hide();
            return this;
        },
        /**
         * @description: 销毁当前实例上的方法
         * @param {String} name?: 关闭的提示框
         */
        destroyDialog(name?: string) {
            // @ts-ignore
            const { dialogInstance } = this;
            if (name) {
                if (dialogInstance[name]) {
                    dialogInstance[name].remove();
                    dialogInstance[name] = null;
                }
            } else {
                Object.keys(dialogInstance).forEach((k) => this.destroyDialog(k));
            }
            return this;
        },
        /**
         * @description: 打开弹窗时需执行的逻辑, 外层覆盖
         * @param {Boolean} isFirst: 是否是第一次打开(由未展示到初次展示)
         */
        prefixFunc(isFirst: boolean) {},
        /**
         * @description: 隐藏弹窗时需执行的逻辑, 外层覆盖
         */
        suffixFunc() {},
    },
};

/**
 * @description: 弹窗默认的逻辑
 * emit('hide'): 弹窗隐藏时触发
 * emit('cancel'): 弹窗关闭(取消)时触发
 */
@Component
export class ModalCommonMixin extends Vue {
    // 保存该实例上打开的弹窗
    dialogInstance: Record<string, any> = {};
    // 组件的显示状态
    visible = false;
    // 执行 prefixFunc 的延时, 由于 dialog 的内容是懒加载的
    // 导致在 prefixFunc 里拿不到子组件, 所以增加了这个参数
    openDelay: number | null = null;

    beforeDestroy() {
        // 当组件状态为显示时, 先执行 hide 函数
        // 防止热更新导致组件异常
        this.visible && this.hide();
    }

    /* eslint-disable @typescript-eslint/no-empty-function */
    /**
     * @description: 弹窗打开前执行
     */
    prefixFunc(isFirst?: boolean) {}
    /**
     * @description: 弹窗打开后执行
     */
    suffixFunc() {}
    /* eslint-enable @typescript-eslint/no-empty-function */

    /**
     * @description: 弹窗显示方法
     */
    show() {
        const { openDelay } = this;
        const cb = () => {
            // 额外套一层, 防止执行 form.resetFields 方法数据无法被清空
            this.$nextTick(() => {
                this.prefixFunc(!this.visible);
            });
        };
        openDelay ? setTimeout(cb, isBoolean(openDelay) ? 20 : openDelay) : this.$nextTick(cb);
        this.visible = true;
        return this;
    }
    /**
     * @description: 弹窗隐藏方法
     */
    hide() {
        this.suffixFunc();
        this.visible = false;
        this.$emit('hide');
        return this;
    }
    /**
     * @description: 弹窗取消方法
     */
    cancel() {
        this.$emit('cancel');
        this.hide();
        return this;
    }
    /**
     * @description: 销毁当前实例上的方法
     * @param {String} name?: 关闭的提示框
     */
    destroyDialog(name: string) {
        const { dialogInstance } = this;
        if (name) {
            if (dialogInstance[name]) {
                dialogInstance[name].remove();
                dialogInstance[name] = null;
            }
        } else {
            Object.keys(dialogInstance).forEach((k) => this.destroyDialog(k));
        }
        return this;
    }
}
