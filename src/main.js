import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入axios库
import axios from 'axios'
// 导入组件面包屑导航
import BreadCrumb from './views/components/breadcrumb.vue'
// 导入插件table组件
import VueTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 导入Nprogress的Js和Css
import Nprocess from 'nprogress'
import 'nprogress/nprogress.css'
// 配置到Vue上
Vue.use(VueQuillEditor)
// 配置axios的基本访问路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 配置授权API的Authorization
axios.interceptors.request.use(config => {
  Nprocess.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 响应后关掉进度条
axios.interceptors.response.use(config => {
  Nprocess.done()
  return config
})
// 给Vue原型链挂载上一个可以全局Vue组件访问的功能
Vue.prototype.$http = axios
// 注册组件
Vue.component('breadcrumb', BreadCrumb)
Vue.component('tree-table', VueTable)
// 配置全局时间过滤器
Vue.filter('dateFormat', function(el) {
  el = new Date(el)
  const y = el.getFullYear()
  // 如果月份是一位数，在前面补0
  const m = (el.getMonth() + 1).toString().padStart(2, '0')
  const d = (el.getDate() + '').padStart(2, '0')
  const hh = el.getHours().toString().padStart(2, '0')
  const mm = el.getMinutes().toString().padStart(2, '0')
  const ss = el.getSeconds().toString().padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
Vue.config.productionTip = false
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
