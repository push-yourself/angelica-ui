import tablePage from './src/main.vue';

/* istanbul ignore next */
tablePage.install = function(Vue) {
  Vue.component(tablePage.name, tablePage);
};

export default tablePage;