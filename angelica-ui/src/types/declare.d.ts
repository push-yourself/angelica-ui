
import { CreateElement as VueCreateElement } from 'vue';
declare global {
    // 获取函数中除首参外的值
    type Tail<T extends (...args: any[]) => void> = T extends ((a: any, ...args: infer T) => void) ? T : never;
}
