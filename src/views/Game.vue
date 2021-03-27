<template>
  <div class="root-lists">
    <welcome :mini="true" :header="difficulty" description=" "/>
    <div class="lists-container">
      {{game}}
    </div>
  </div>
</template>

<script>
import { ref } from '@vue/reactivity'
import Welcome from '../components/dashboard/Welcome.vue'
import router from '../router'
import { onMounted } from '@vue/runtime-core'
import Game from '../../server/shared/Game'
export default {
  components: {
    Welcome,
  }, 
  setup() {
    const gameId = router.currentRoute.value.params.gameId.toString()
    /** @type {import('vue').Ref<import('../../server/shared/Game')>} */
    const game = ref(null)
    onMounted(async() => {
      game.value = await Game.getById(gameId)
    })
    return {
      gameId,
      game
    }
  }
}
</script>

<style lang="scss" scoped>
.root-lists {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  .lists-container {
    margin-top: 20px;
    height:100%;
    padding: 10px;
    overflow: auto;
  }
}
</style>