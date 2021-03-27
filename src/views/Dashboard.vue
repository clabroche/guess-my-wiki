<template>
  <div class="root-lists">
    <welcome :mini="true"/>
    <div class="lists-container">
      <div class="line">
        <line-cmp
          name="Démarrer une partie"
          icon="fas fa-play-circle"
          :bottomLineActive="false"
          @click="$router.push({name: 'new-game'})"/>
      </div>
      <h2>Mes parties</h2>
      <div class="history">
        <template v-if="historic?.length">
          <line-cmp v-for="game of historic" :key="game._id" :name="game.title"/>
        </template>
        <template v-else>
          Démarres une nouvelle partie avant de pouvoir visualiser ton historique
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import Welcome from '../components/dashboard/Welcome.vue'
import Line from '../components/Line.vue'
export default {
  components: {
    Welcome,
    'line-cmp': Line
  }, 
  setup() {
    return {
      historic: [],
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