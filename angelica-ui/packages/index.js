import Condition from './condition/index.js';

/**
 * 存储组件列表
 */
const components = [
    Condition,  // 动态表单查询
];

/**
 * 定义install方法，接收Vue的参数
 */
const install = function (Vue, opts = {}) {
    if (install.installed) return;
    components.map(item => {
        // 全局注册所有组件
        Vue.components(item.name, item);
    })
}
/**
 * 判断是否是直接引入文件，如果是，就不用调用Vue.use();
 */
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default {
    install,
}