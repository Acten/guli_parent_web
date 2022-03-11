import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth' // 验权

const whiteList = ['/login'] // 白名单，在白名单当中的路由可以免登录，直接进入
router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) { // 如果有token值（说明用户登录了！）
    if (to.path === '/login') { // 如果路由要跳转到登录页面
      next({ path: '/' }) // 界面就会重定向到首页
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else { // 否则路由要跳转到其他界面，比如首页
      if (store.getters.roles.length === 0) { // 判断当前用户是否已拉取完user_info信息
        store.dispatch('GetInfo').then(res => { // 拉取用户信息
          next() // 跳转到下一个路由
        }).catch((err) => {
          store.dispatch('FedLogOut').then(() => {
            Message.error(err || 'Verification failed, please login again')
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else { // 进入这一级就意味着没有获得token,也就是没有登录
    if (whiteList.indexOf(to.path) !== -1) { // 进行遍历如果要去往的路由在白名单内
      next() // 就允许直接跳转
    } else {
      next(`/login?redirect=${to.path}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})
