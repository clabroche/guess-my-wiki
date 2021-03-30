<template>
  <div class="welcome-root" :class="{[image]: image, mini, ['space-between']:spaceBetween}">
    <div class="infos">
      <div class="title" :style="{fontSize: headerFontSize }">
        {{header}}
        <popover ref="popover" :async="true" @trigger="loadPopover(header, $event)" v-if="explainLink">
          <template #trigger>
            <i class="fas fa-external-link-alt"></i>
          </template>
        </popover>
      </div>
      <div class="description">
        {{description}}
        <popover ref="popover" :async="true" @trigger="loadPopover(description.split(':').pop(), $event)" v-if="description.trim() && explainLink">
          <template #trigger>
            <i class="fas fa-external-link-alt"></i>
          </template>
        </popover>
        <slot></slot>
      </div> 
      <div class="description">
        {{secondary}}
        <popover ref="popover" :async="true" @trigger="loadPopover(secondary.split(':').pop(), $event)" v-if="secondary.trim() && explainLink">
          <template #trigger>
            <i class="fas fa-external-link-alt"></i>
          </template>
        </popover>
      </div>
    </div>
    <div class="actions" v-if="actions?.length">
      <div class="action" @click="action.cb()" v-for="(action, i) of actions" :key="'action-' + i">
        <div v-if="action.label != null">{{action.label}}</div>
        <i :class="'fas fa-'+ action.icon" aria-hidden="true"></i>
      </div>
    </div>
  </div>
</template>

<script>
import Wikipedia from '../../../server/shared/Wikipedia'
import Popover from '../Popover.vue'
export default {
  components: { Popover },
  props: {
    image: {},
    header: {default: 'Bonjour !'},
    headerFontSize: {default: null}, 
    description: {default: 'Une petite partie ?'},
    secondary: {default: ''},
    mini: {default: false},
    actions: {default: () => []},
    spaceBetween: {default: false},
    explainLink: {default: false}
  },
  setup() {
    return {
      async loadPopover(link, cb) {
        if(!cb) return
        cb(await Wikipedia.getLinkDefinition(link))
      }, 
    }
  }
}
</script>

<style lang="scss" scoped>
.welcome-root {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 175px;
  background-size: cover;
  color: white;
  position: relative;
  margin-bottom: 1px;
  flex-shrink: 0;
  @include backgroundGradientImage(0.8, '../../assets/login.jpg');
  &.space-between {
    flex-direction: row;
    justify-content: space-between;
    text-align: center;
    .infos {
      width: 100%;
    }
    .actions {
      width: max-content;
      position: relative;
    }
  }
  &.mini {
    height: 150px;
    .title {
      font-size: 1.4em;
    }
    .description {
      display: flex;
      justify-content: center;
      font-size: 0.9em;
      margin-top: 10px;
    }
  }
  i {
    font-size: 13px;
    margin-left: 5px;
  }
  .title {
    font-size: 3em;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .description {
    font-size: 1em;
    margin-top: 20px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .secondary {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
.actions {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin: 0 10px;
  .action{
    flex-shrink: 0;
    padding: 5px;
    margin: 5px 0;
    background-color: white;
    color: var(--headerBgColorAccent);
    border-radius: 5px;
    width: 75px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    i {
      font-size: 0.8em;
    }
  }
}
</style>