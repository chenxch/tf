import Vue from 'vue'
import './style.css'
import Vant from 'vant'
import App from './App.vue'
import 'vant/lib/index.css'

Vue.use(Vant)
new Vue({
  render: h => h(App),
}).$mount('#app')
