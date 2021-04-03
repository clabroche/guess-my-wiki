import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import NewGame from '../views/NewGame.vue'
import Game from '../views/Game.vue'
import { Plugins } from '@capacitor/core';
import history from './history'
const { App } = Plugins;

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: { name: 'dashboard' },
  }, {
    path: '/new-game',
    name: 'new-game',
    component: NewGame
  }, {
    path: '/game/:gameId',
    name: 'game',
    component: Game
  }, {
    path: '/login',
    name: 'login',
    component: Login
  }, {
    path: '/register',
    name: 'register',
    props: { register: true },
    component: Login
  }, {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard
  },
  { path: '/:pathMatch(.*)*', redirect: {name: 'home'} },
]



const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedHistory) {
    history.push(from)
    try {
      localStorage.setItem(`scroll-${from.name.toString()}`, document.querySelector('[save-scroll]')?.scrollTop.toFixed())
      if(savedHistory) {
        const saved = localStorage.getItem(`scroll-${to.name.toString()}`)
        setTimeout(() => {
          const a = document.querySelector('[save-scroll]')
          if(a) {
            a.scrollTop = +saved
          }
        }, 100);
      }
    // eslint-disable-next-line no-empty
    } catch (error) {
    }
  }
})

App.addListener('appUrlOpen', function (data) {
  const slug = data.url.split('.fr').pop();

  if (slug) {
    router.push({
      path: slug,
    });
  }
});
export default router
