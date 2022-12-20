import Vue from 'vue'

import AngelicaUl from '../packages'
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(AngelicaUl)

new Vue({
  render: h => h(App)
}).$mount('#app')
