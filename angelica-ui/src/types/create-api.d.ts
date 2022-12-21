import { createFunction } from 'vue-create-api';
import GetDynamicComponent, { DynamicComponentAlias } from '@/register';

type ReturnPromiseType<T extends Promise<any>> = T extends Promise<infer P> ? P : never;

// 注册的组件
type CreateComponent<T extends DynamicComponentAlias = DynamicComponentAlias> = {
    [P in string &
        keyof T as `$create${Capitalize<P>}`]: createFunction<// InstanceType<ReturnPromiseType<ReturnType<T[P]>>['default']>
    any>;
};

declare module 'vue/types/vue' {
    interface Vue extends CreateComponent {
        $getDynamicComponent: typeof GetDynamicComponent;
    }
}
