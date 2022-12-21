import pdfPreview from './src/main.vue';

/* istanbul ignore next */
pdfPreview.install = function(Vue) {
  Vue.component(pdfPreview.name, pdfPreview);
};

export default pdfPreview;