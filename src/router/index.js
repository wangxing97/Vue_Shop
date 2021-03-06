import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Welcome from '../views/Welcome.vue'
import Users from '../views/user/Users.vue'
import Roles from '../views/power/Roles.vue'
import Right from '../views/power/Right.vue'
import Cate from '../views/goods/Cate.vue'
import Params from '../views/goods/Params.vue'
import List from '../views/goods/List.vue'
import GoodAdd from '../views/goods/GoodAdd.vue'
import Order from '../views/order/Order.vue'
import Report from '../views/reports/Report.vue'
Vue.use(VueRouter)
// 导入面包屑导航组件

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Right },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: GoodAdd },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  // to代表将要访问地址，from代表来自哪个地址
  // next代表放行，next()继续下一步，next('/home')：直接跳转
  if (to.path === '/login') return next()
  // 来到这里说明访问的是其他请求
  const token = window.sessionStorage.getItem('token')
  // 代表token不存在，回到login重新登录
  if (!token) return next('/login')
  next()
})

export default router
