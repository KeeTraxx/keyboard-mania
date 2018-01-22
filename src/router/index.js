import Vue from 'vue'
import Router from 'vue-router'
import Keyboard from '@/components/Keyboard'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Keyboard',
      component: Keyboard
    }
  ]
})
