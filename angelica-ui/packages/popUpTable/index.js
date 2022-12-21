import popUpTable from './src/main.vue';

/* istanbul ignore next */
popUpTable.install = function(Vue) {
  Vue.component(popUpTable.name, popUpTable);
};

export default popUpTable;