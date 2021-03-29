<template>
  <div class="root-lists">
    <welcome :mini="true"
      :header="headerTitle"
      :explainLink="true"
      :spaceBetween="true"
      :actions="headerSummary"
      :description="headerDescription"
      :secondary="headerSecondary">
    </welcome>
    <div class="lists-container">
      <template v-if="!game?.completed">
        <template v-if="!loading">
          <line-cmp v-for="link of game.currentLinks" :key="link.plcontinue"
            :bottomLineActive="false"
            :name="link.label"
            :linkExplain="true"
            @trigger="loadPopover(link,$event)"
            @click="goToNext(link)"/>
          <button v-if="game?.currentLinks?.length % 10 === 0" @click="more">
            Voir plus (-50<i class="fas fa-award"/>)
          </button>
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
import { computed, onBeforeUnmount, onMounted, watch } from '@vue/runtime-core'
import Game from '../../server/shared/Game'
import Line from '../components/Line.vue'
import Spinner from '../components/Spinner.vue'
import GameStat from '../components/GameStat.vue'
import Wikipedia from '../../server/shared/Wikipedia'
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

    const score = ref(game.value?.score || 1000)
    let interval
    watch(() => game.value?.score || 1000, async (newScore, oldScore) => {
      clearInterval(interval)
      const delta = oldScore - newScore
      const step = Math.ceil(delta / 16)
      interval = setInterval(() => {
        if(game.value?.score === score.value) clearInterval(interval)
        else {
          if(score.value < game.value?.score) {
            score.value = game.value?.score
          } else {
            score.value -= step
          }
        }
      }, 25);
    })
    onBeforeUnmount(() => clearInterval(interval))
    
    return {
      loading,
      gameId,
      game,
      currentStep,
      async loadPopover(link, cb) {
        if(!cb) return
        cb(await Wikipedia.getLinkDefinition(link.label))
      }, 
      async goToNext(link) {
        loading.value = true
        game?.value?.steps.push(link)
        currentStep.value = await game.value.next(link)
        await refreshGame()
        loading.value = false
      },
      headerDescription: computed(() => {
        if(game.value?.completed) return ' '
        let description = 'Objectif: '+ game.value?.wikipedia?.endLabel
        return description
      }),
      headerSecondary: computed(() => {
        if(game.value?.wikipedia?.steps?.length > 2) {
          console.log(game.value.allBonus)
          const missings = game.value.wikipedia.steps.filter((step, i, steps) => {
            return i !==0 &&
              i!==steps.length -1 &&
              !game.value.allBonus.includes(step.link)
          })
          return missings[0]
            ? `Bonus: ${missings[0].link}`
            : 'Bonus complétés'
        }
      }),
      headerTitle: computed(() => {
        if(game.value?.completed) return 'Félicitations'
        const previousPage = game?.value?.steps[game?.value?.steps.length - 1]
        return previousPage ? previousPage.label : game?.value?.wikipedia?.beginLabel
      }),
      headerSummary: computed(() => {
        if(game.value?.completed) return []
        return [{label: game.value?.steps?.length || 0, icon: 'fas fa-shoe-prints'}, {label: score.value || 0, icon: 'fas fa-award'}]
      }),
      async more() {
        currentStep.value = await game.value.more()
        await refreshGame()
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
  .spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
}
</style>