<template>
  <div class="navbar-bottom-root" v-if="isShowing()">
    <ul class="main-routes">
      <li 
        :class="{active: $route.name === route.route}"
        v-for="route of mainRoutes" :key="route.label"
        @click="$router.push({name: route.route})">
        <i :class="route.icon" aria-hidden="true"></i>
        {{route.label}}
      </li>
      <li class="more" @click="openSidebar"><i class="fas fa-ellipsis-h" aria-hidden="true" ></i></li>
    </ul>
  </div>
</template>

<script>
import { computed } from 'vue'
import router from '../router'
import sidebar from '../services/sidebar'
export default {
  setup() {
    const routes =  [
      {route: 'dashboard', icon: 'fas fa-home', label: 'Accueil'},
    ]
    return {
      mainRoutes:computed(() => routes.slice(0, 4)),
      isShowing() {
        return !['login', 'register'].includes(router.currentRoute.value.name?.toString())
      },
      openSidebar() {
        sidebar.open = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar-bottom-root {
  box-shadow: 0 0 10px 0px lightgrey;
  z-index: 1;
  color: var(--headerBgColor);
  background-color: #fff;
  .main-routes {
    display: flex;
    justify-content: space-between;
    width: 100vw;
    li {
      transition: 300ms;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 10px;
      box-sizing: border-box;
    }
    .active {
      color: white;
      @include backgroundGradient;
    }
  }
}
</style>