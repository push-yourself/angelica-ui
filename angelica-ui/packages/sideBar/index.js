import CustomMenu from './src/main.vue'

CustomMenu.install = function(Vue) {
    Vue.component(CustomMenu.name,CustomMenu);
}

export default CustomMenu;