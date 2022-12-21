import Condition from './condition/index.js';
import Table from './table/index.js';
import countUp from './countUp/index.js';
import svgIcon from './svgIcon/index.js';
import Dialog from './dialog/index.js';
import imageSequence from './imageSequence/index.js';
import imageViewer from './imageViewer/index.js';
import Pagination from './pagination/index.js';
import tablePage from './tablePage/index.js';
import popUpTable from './popUpTable/index.js';
import pdfPreview from './pdfPreViewer/index.js';
import CustomMenu from './sideBar/index.js';

/**
 * 存储组件列表
 */
const components = [
    Condition,      // 动态表单查询
    Table,          // 表格组件
    countUp,        // 动效数字
    svgIcon,        // 字体图标组件
    Dialog,         // 弹框
    imageSequence,  // 图片动画
    imageViewer,    // 图片预览
    Pagination,     // 分页
    tablePage,      // 分页表格
    popUpTable,     // 弹框表格
    pdfPreview,     // PDF文件预览
    CustomMenu,        // 侧边菜单栏
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