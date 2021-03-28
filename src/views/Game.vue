<template>
  <div class="root-lists">
    <welcome :mini="true"
      :header="currentPage"
      :description="'Objectif: '+ game?.wikipedia?.endLabel"
      :actions="[{label: game?.steps?.length}]"/>
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
        <div class="completed">
          <svg-background svg="check" :bottom="false" />
          <button @click="$router.push({name: 'dashboard'})">Revenir à l'écran d'accueil</button>
        </div>
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
import SvgBackground from '../components/SvgBackground.vue'
export default {
  components: {
    Welcome,
    lineCmp: Line,
    Spinner,
    SvgBackground,
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
        const previousPage = game?.value?.steps[game?.value?.steps.length - 1]
        return previousPage ? previousPage.label : game?.value?.wikipedia?.beginLabel
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
    height:100%;
    padding: 10px;
    overflow: auto;
  }
  .completed {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    margin-top: 150px;
  }
  .spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
}
</style>