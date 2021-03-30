<template>
  <div class="game-stat-root">
    <div class="trip">
      <div class="section">
        <i class="fas fa-play"></i>
        {{game?.wikipedia?.beginLabel}}
      </div>
      <i class="fas fa-chevron-right to"></i>
      <div class="section">
        <i class="fas fa-flag-checkered"></i>
        {{game?.wikipedia?.endLabel}}
      </div>
    </div>
    <div class="buttons">
      <button @click="$router.push({name: 'dashboard'})">
        <i class="fas fa-home"></i>
        Revenir à l'écran d'accueil
      </button>
      <button @click="share" v-if="game.ownerId === me">
        <i class="fas fa-share-alt"></i>
        Partager
      </button>

      <button @click="replay">
        <i class="fas fa-reply-all"></i>
        Rejouer cette partie
      </button>
    </div>
    <div class="scroll">
      <div class="scores">
        <div class="score-container">
          <i class="fas fa-award trophy"></i>
          <div class="score">
            <div class="value">{{game?.score || 0}}</div>points
          </div>
        </div>
        <div class="score-container">
          <i class="fas fa-shoe-prints trophy"></i>
          <div class="score">
            <div class="value">{{game?.steps?.length || 0}}</div>étapes
          </div>
        </div>
      </div>

      <div class="steps-container">
        <div class="steps">
          <div class="step">{{game?.wikipedia?.beginLabel}} <i class="fas fa-chevron-down"></i></div>
          <div class="step" v-for="step of game?.steps" :key="step.pageid">{{step.label}} <i class="fas fa-chevron-down"></i></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Plugins } from '@capacitor/core';
import router from '../router';
import { computed } from '@vue/runtime-core';
import Auth from '../services/Auth';
import Game from '../../server/shared/Game';
const { Share } = Plugins;


export default {
  components: {  },
  props: {
    game: {
      /** @type {import('../../server/shared/Game')} */
      default: null,
      required: true,
    }
  },
  setup(props) {
    return {
      me: computed(() => Auth?.user.value?._id),
      async replay() {
        const game = new Game({difficulty: props.game.difficulty})
        game.wikipediaId = props.game.wikipediaId
        await game.save()
        router.push({name: 'game', params: {gameId: game._id}})
      },
      async share() {
        await props.game.makePublic()
        let shareRet = await Share.share({
          title: 'Regardes !',
          text: `Mon score pour aller de ${props.game?.wikipedia?.beginLabel} à ${props.game?.wikipedia?.endLabel}`,
          url: process.env.VUE_APP_SERVER_URL + ':' +  process.env.VUE_APP_SERVER_PORT + '/#' + router.currentRoute.value.path,
          dialogTitle: 'Partager à mes ami(e)s'
        });
        console.log(shareRet)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.game-stat-root {
  text-align: center;
  overflow: hidden;
  display: flex;
  height: 100%;
  flex-direction: column;
  .scroll {
    overflow: auto;
  }
  .trip {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    .to {
      margin: 0 10px;
    }
    .section {
      width: 50%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 10px;
      box-sizing: border-box;
      border: 1px solid var(--headerBgColor);
      box-shadow: 0 0 7px -1px var(--headerBgColor);
      border-radius: 10px;
      i {
        margin-right: 10px;
        width: 20px;
      }
    }
  }
  button {
    margin: auto;
    margin-bottom: 40px;
    font-weight: bold;
    width: max-content;
  }
  .scores {
    display: flex;
    justify-content: space-around;
    margin-bottom: 40px;
    .score-container {
      display: flex;
      flex-direction: column;
      i {
        color: var(--headerBgColor);
        font-size: 80px;
        text-shadow: 0 0 4px var(--headerBgColor);

      }
      .score {
        margin-top: 10px;
        .value {
          font-weight: bold;
          font-size: 1.8em;
        }
      }
    }
  }
  .steps-container {
    margin-bottom: 40px;
    .steps {
      .step {
        display: flex;
        flex-direction: column;
        i {
          margin: 3px;
        }

        &:first-of-type{
          font-weight: bold
        }
        &:last-of-type{
          font-weight: bold;
          i {
            display: none;
          }
        }
      }
    } 
  }
  .buttons{
    display: flex;
  }
}
</style>