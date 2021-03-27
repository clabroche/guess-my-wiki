<template>
  <div class="root-lists">
    <welcome :mini="true" header="Choisir le niveau de difficulté" description=" "/>
    <div class="lists-container">
      <line-cmp
        name="Facile"
        icon="fas fa-play-circle"
        :bottomLineActive="false"
        @click="goTo('easy')"/>
      <line-cmp
        name="Moyen"
        icon="fas fa-play-circle"
        :bottomLineActive="false"
        @click="goTo('medium')"/>
      <line-cmp
        name="Difficile"
        icon="fas fa-play-circle"
        :bottomLineActive="false"
        @click="goTo('hard')"/>
    </div>
  </div>
</template>

<script>
import Welcome from '../components/dashboard/Welcome.vue'
import Line from '../components/Line.vue'
import router from '../router'
import Game from '../../server/shared/Game'
export default {
  components: {
    Welcome,
    'line-cmp': Line
  }, 
  setup() {
    return {
      async goTo(difficulty) {
        const game = new Game({difficulty})
        await game.save()
        router.push({name: 'game', params: {gameId: game._id}})
      },
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