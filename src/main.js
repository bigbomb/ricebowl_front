import babelpolyfill from 'babel-polyfill' // 解决 vuex requires a Promise polyfill in this browser 的问题
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import VueCookie from 'vue-cookie'
import 'element-ui/lib/theme-chalk/index.css' // 此路径会因版本不同而不同   import 'element-ui/lib/theme-default/index.css'
import VueRouter from 'vue-router'
import axios from 'axios'
import VueAxios from 'vue-axios' // 一个基于Promise 用于浏览器和 nodejs 的 HTTP 客户端
import store from './vuex/store'
import Vuex from 'vuex'
import './common/icon/iconfont.css' // 阿里图标库
import routes from './routes' // 路由
import NProgress from 'nprogress' // 轻量级进度条
import 'nprogress/nprogress.css' // 轻量级进度条样式
import base from './utils/base'
// Tell Vue to use the plugin
import { getCookie } from './utils/utils'
import VueQuillEditor from 'vue-quill-editor'

// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor /* { default global options } */)
Vue.use(base)
Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(VueAxios, axios)
Vue.use(VueCookie)
// 跨域携带cookie
axios.defaults.withCredentials = true
// Vue.config.productionTip = false

const router = new VueRouter({
  routes
})

// Vue.prototype.imgService = 'http://120.78.131.193/ftpdata' // 图片显示url
// Vue.prototype.uploadService = 'http://localhost:8080/' //上传图片url

axios.interceptors.response.use(
  response => {
    // Do something with response data
    if (response.data.status === 401 || typeof response === 'undefined') {
      router.replace({
        path: 'login',
        query: { redirect: router.currentRoute.fullPath }
      })
    } else {
      return response
    }
  },
  function(error) {
    return Promise.reject(error)
  }
)
// 时间格式化
Vue.filter('dataFormat', function(olddate, fmt) {
  var date = new Date(olddate)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? str : ('00' + str).substr(str.length)
      )
    }
  }
  return fmt
})

// url 拦截
router.beforeEach((to, from, next) => {
  const user = getCookie('user')
  if (to.path === '/login') {
    next()
  } else if (user === null) {
    next({
      path: '/login'
    })
  } else {
    next()
  }
})
router.afterEach(transition => {})

new Vue({
  el: '#app',
  template: '<App/>',
  router,
  components: { App }
}).$mount('#app')
