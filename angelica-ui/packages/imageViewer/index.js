import imageViewer from './src/main.vue';

/* istanbul ignore next */
imageViewer.install = function(Vue) {
  Vue.component(imageViewer.name, imageViewer);
};

export default imageViewer;