<template>
  <div class="root-lists">
    <welcome :mini="true"
      :header="headerTitle"
      :description="headerDescription"
      :spaceBetween="true"
      :actions="headerSummary"/>
    <div class="lists-container">
      <template v-if="!game?.completed">
        <template v-if="!loading">
          <line-cmp v-for="link of currentStep" :key="link.plcontinue"
            :bottomLineActive="false"
            :name="link.label"
            @click="goToNext(link)"/>
        </template>
        <template v-else>
          <div class="spinner-container">
            <spinner :size="150"/>
          </div>
        </template>
      </template>
      <template v-else>
        <game-stat :game="game"/>
      </template>
    </div>
  </div>
</template>

<script>
import { ref } from '@vue/reactivity'
import Welcome from '../components/dashboard/Welcome.vue'
import router from '../router'
import { computed, onMounted, watch } from '@vue/runtime-core'
import Game from '../../server/shared/Game'
import Line from '../components/Line.vue'
import Spinner from '../components/Spinner.vue'
import GameStat from '../components/GameStat.vue'
export default {
  components: {
    Welcome,
    lineCmp: Line,
    Spinner,
    GameStat,
  }, 
  setup() {
    const gameId = router.currentRoute.value.params.gameId.toString()
    const loading = ref(true)
    /** @type {import('vue').Ref<import('../../server/shared/Game')>} */
    const game = ref(null)
    const currentStep = ref([])
    const refreshGame = async () => game.value = await Game.getById(gameId)
    onMounted(refreshGame)

    watch(() => game.value?._id, async () => {
      if(!game.value) return
      currentStep.value = await game.value.getLinks()
      loading.value = false
    })

    return {
      loading,
      currentPage: computed(() => {
        
      }),
      gameId,
      game,
      currentStep,
      async goToNext(link) {
        loading.value = true
        game?.value?.steps.push(link)
        currentStep.value = await game.value.next(link)
        await refreshGame()
        loading.value = false
      },
      headerDescription: computed(() => {
        if(game.value?.completed) return ' '
        return 'Objectif: '+ game.value?.wikipedia?.endLabel
      }),
      headerTitle: computed(() => {
        if(game.value?.completed) return 'Félicitations'
        const previousPage = game?.value?.steps[game?.value?.steps.length - 1]
        return previousPage ? previousPage.label : game?.value?.wikipedia?.beginLabel
      }),
      headerSummary: computed(() => {
        if(game.value?.completed) return []
        return [{label: game.value?.steps?.length || 0, icon: 'fas fa-shoe-prints'}, {label: game.value?.score || 0, icon: 'fas fa-trophy'}]
      })
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
    height:100%;
    padding: 10px;
    overflow: auto;
  }
  .spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
}
</style>