<template>
  <div class="root-lists">
    <welcome :mini="true" header="Choisir le parcours" description=" "/>
    <div class="lists-container">
      <div>
        <div v-for="(step, i) of steps" :key="step" class="step">
          <div class="input-container">
            <i class="fas " :class="getIcon(i)"></i>
            <input type="text" :placeholder="getPlaceholder(i)"
              :value="step.link"
              @input="typeInput(step, $event.target.value)"
              @blur="updateLink($event.target.value, step)"
              @keypress.enter="updateLink($event.target.value, step)">
            <spinner :size="20" v-if="step.loading"/>
            <i class="fas fa-check" v-else-if="step.success"></i>
            <i class="fas fa-times" v-else></i>
          </div>
          <div class="input-container">
            <button @click="addStep(i)">
              <i class="fas fa-plus"></i> Ajouter une étape
            </button>
          </div>
        </div>
        <button :disabled="!steps.every((a) => a.success)"
          @click="goTo('custom')">
          Allons-y !
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Welcome from '../components/dashboard/Welcome.vue'
import router from '../router'
import Game from '../../server/shared/Game'
import { ref } from '@vue/reactivity'
import notification from '../services/notification'
import Spinner from '../components/Spinner.vue'
import Wikipedia from '../../server/shared/Wikipedia'
export default {
  components: {
    Welcome,
    Spinner,
  }, 
  setup() {
    const steps = ref([
      {link: '', pageid: null, loading: false, success: true},
      {link: '', pageid: null, loading: false, success: true}
    ])
    const custom = ref('')
    return {
      custom,
      type: ref(),
      steps,
      typeInput(step, value) {
        if(value) {
          step.link = value
          step.success = false
        } else {
          step.link = ''
          step.success = true
        }
      },
      async updateLink(link,step) {
        console.log(link)
        if(!link) {
          step.link = ''
          step.pageid = null
          step.success = true
          step.loading = false
          return 
        }
        step.link = link
        step.loading = true
        await Wikipedia.searchLink(link)
          .then((link) => {
            if(link) {
              step.link = link.title
              step.pageid = link.pageid
              step.success = true
            } else {
              step.success = false
            }
          })
          .catch(() => {
            step.success = false
          })
        step.loading = false
      },
      addStep(i) {
        steps.value.splice(i + 1, 0,{link: '', pageid: null, loading: false, success: true})
      },
      getIcon(i) {
        if(i === 0) return 'fa-play'
        else if(i === steps.value.length - 1) return 'fa-flag-checkered'
        else return 'fa-route'
      },
      getPlaceholder(i) {
        if(i === 0) return 'Page de départ (laisser vide pour aléatoire)'
        else if(i === steps.value.length - 1) return 'Page d\'arrivée (laisser vide pour aléatoire)'
        else return 'Page d\'étape +500 (laisser vide pour aléatoire) '
      },
      async goTo(difficulty) {
        const game = new Game({difficulty})
        if(difficulty === 'custom') {
          game.custom = steps.value.map(step => ({link: step.link, pageid: step.pageid}))
        }  
        await game.save()
          .then(() => router.push({name: 'game', params: {gameId: game._id}}))
          .catch(() => notification.next('error', 'La page wikipedia n\'existes pas'))
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
    height:100%;
    padding: 10px;
    overflow: auto;
    .input-container {
      display: flex;
      align-items: center;
      margin: 10px 0;
      i {
        margin-right: 10px;
      }
      button {
        width: max-content;
        margin: auto;
      }
    }
    .step:last-of-type {
      button {
        display: none;
      }
    }
  }
}
</style>