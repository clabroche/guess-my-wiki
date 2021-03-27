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
      <line-cmp
        name="Personnalisé"
        icon="fas fa-play-circle"
        @click="goTo('custom')"
        :bottomLineActive="false">
        <input
          placeholder="Ajoutez un mot"
          type="text"
          :value="custom" @input="custom = $event.target.value"
          @click.stop
          @keypress.enter="goTo('custom')">
        <i class="fas fa-cog" @click="goTo('custom')"></i>
      </line-cmp>
    </div>
  </div>
</template>

<script>
import Welcome from '../components/dashboard/Welcome.vue'
import Line from '../components/Line.vue'
import router from '../router'
import Game from '../../server/shared/Game'
import { ref } from '@vue/reactivity'
export default {
  components: {
    Welcome,
    'line-cmp': Line
  }, 
  setup() {
    const custom = ref('')
    return {
      custom,
      async goTo(difficulty) {
        console.log(difficulty)
        if(difficulty === 'custom' && !custom.value) return 
        const game = new Game({difficulty})
        if(difficulty === 'custom') {
          // @ts-ignore
          game.custom = custom.value
        }  
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
    input {
      margin: 0 20px;
    }
  }
}
</style>