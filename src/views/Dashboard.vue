<template>
  <div class="root-lists">
    <welcome :mini="true"/>
    <div class="lists-container">
      <div class="start">
        <line-cmp
          name="Démarrer une nouvelle partie"
          icon="fas fa-play-circle"
          :bottomLineActive="false"
          @click="$router.push({name: 'new-game'})"/>
      </div>

      <div class="section" v-for="category of categories" :key="category.label">
        <h3>{{category.label}}</h3>
        <line-cmp v-for="game of category.games" :key="game._id"
          :name="game?.wikipedia?.endLabel"
          :description="getLastDescription(game)"
          :additionalCenter="getScores(game)"
          @click="goTo(game)">
          <div class="delete">
            <i class="far fa-trash-alt" @click.stop="deleteGame(game)"></i>
          </div>
        </line-cmp>
      </div>
    </div>
  </div>
  <modal-vue ref="deleteModal" validateString="Supprimer">
      <template #header="{data: game}">
        <div v-if="game">Suppression de {{game?.wikipedia?.endLabel}}</div>
      </template>
    </modal-vue>
</template>

<script>
import { computed, onMounted, ref, watch } from '@vue/runtime-core'
import Welcome from '../components/dashboard/Welcome.vue'
import Line from '../components/Line.vue'
import Game from '../../server/shared/Game'
import router from '../router'
import Modal from '../components/Modal.vue'
export default {
  components: {
    Welcome,
    lineCmp: Line,
    modalVue: Modal
  }, 
  setup() {
    const historic = ref([])
    const inprogress = ref([])
    const deleteModal = ref(null)
    const refreshGames = async () => {
      historic.value = await Game.completed()
      inprogress.value = await Game.inProgress()
    }
    onMounted(refreshGames)
    watch(() => router.currentRoute.value.fullPath, refreshGames)
    return {
      deleteModal,
      categories: computed(() => {
        const categ = []
        if(inprogress.value.length) categ.push( {label: 'Parties en cours', games: inprogress.value})
        if(historic.value.length) categ.push( {label: 'Parties complétées', games: historic.value},)
        return categ
      }),
      async deleteGame(game) {
        deleteModal.value.open(game).subscribe(async res => {
          if(!res) return 
          await Game.delete(game._id)
          await refreshGames()
        })
      },
      goTo(game) {
        router.push({name: 'game', params: {gameId: game._id}})
      },
      getLastDescription(game) {
        if(game?.completed) return ''
        return 'Dernière page: '+(game?.steps[game?.steps.length - 1]?.label || game?.wikipedia?.beginLabel)
      },
      getScores(game) {
        return `<i class="fas fa-shoe-prints"></i>${game?.steps?.length} - <i class="fas fa-award"></i> ${game?.score || 0}`
      }
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
    .start {
      margin-bottom: 50px;
    }
    .section {
      margin-bottom: 50px;
    }
    .delete {
      color: #6c6c6c;
    }
  }
}
</style>