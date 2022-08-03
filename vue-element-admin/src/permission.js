import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // 进度条
import 'nprogress/nprogress.css' // 进度条样式
import { getToken } from '@/utils/auth'
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // 访问url时的样式配置

const whiteList = ['/login', '/auth-redirect'] // URL白名单

router.beforeEach(async(to, from, next) => {
  // 启动进度条
  NProgress.start()

  // 修改页面标题
  document.title = getPageTitle(to.meta.title)

  // 从 cookie 中获取 token
  const hasToken = getToken()

  // 判断 token 是否存在
  if (hasToken) {
    if (to.path === '/login') {
      // 如果当前路径为 /login 则直接重定向到首页
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // 判断用于角色是否存在
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        // 如果用户角色存在，直接访问
        next()
      } else {
        try {
          // 异步获取用户角色
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const { roles } = await store.dispatch('user/getInfo')

          // 根据用户角色，动态生成路由
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

          // 调用router.addRoutes动态添加路由
          router.addRoutes(accessRoutes)

          // 设置replace为true,则navigation不会记录，回退时直接回退到一个空白页面
          next({ ...to, replace: true })
        } catch (error) {
          // 删除 Token 数据
          await store.dispatch('user/resetToken')
          // 显示错误提示
          Message.error(error || 'Has Error')
          // 重定向到登录页面
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* 没有 token 的情况下*/

    if (whiteList.indexOf(to.path) !== -1) {
      // 如果访问的 URL 在白名单当中，直接访问
      next()
    } else {
      // 如果访问的 URL 不在白名单当中，则直接重定向到登录页面，并将访问的 URL添加到redirect参数中
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // 停止进度条
  NProgress.done()
})
