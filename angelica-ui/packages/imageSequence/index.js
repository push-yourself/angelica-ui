import imageSequence from './src/main.vue';

/* istanbul ignore next */
imageSequence.install = function(Vue) {
  Vue.component(imageSequence.name, imageSequence);
};

export default imageSequence;