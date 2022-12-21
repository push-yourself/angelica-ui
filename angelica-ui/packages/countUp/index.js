import countUp from './src/main.vue';

/* istanbul ignore next */
countUp.install = function(Vue) {
  Vue.component(countUp.name, countUp);
};

export default countUp;