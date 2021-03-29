<template>
  <div class="">
    <div ref="refTrigger" @click.stop="click">
      <slot name="trigger" ></slot>
    </div>
    <div ref="refContent" @click.stop="hide">
      <slot name="content"/>
      <template v-if="async">
        <template v-if="!loading">{{asyncContent}}</template>
        <template v-else><spinner/></template>
      </template>
    </div>
  </div>
</template>

<script>
import { nextTick, onMounted, ref } from 'vue'
import tippy, {animateFill} from 'tippy.js'
import 'tippy.js/dist/tippy.css'; // optional for styling
import 'tippy.js/themes/light-border.css';
import 'tippy.js/dist/backdrop.css';
import 'tippy.js/animations/shift-away.css';
import Spinner from './Spinner.vue';
export default {
  components: {
      Spinner
  },
  props: {
    async: {default: false}
  },
  setup(props, comp) {
    const refTrigger = ref(null)
    const refContent = ref(null)
    const asyncContent = ref(null)
    const tippyInstance = ref()
    const loading = ref(false)

    onMounted(() => {
      tippyInstance.value = tippy(refTrigger.value, {
        placement: 'auto',
        hideOnClick: true,
        interactive: true,
        content: refContent.value,
        trigger: 'click',
        allowHTML: true,
        animateFill: false,
        theme: 'light-border',
        plugins: [animateFill],
        appendTo: document.body,
      })
    })
    return {
      refTrigger,
      refContent,
      asyncContent,
      loading,
      tippy,
      hide() {
        tippyInstance.value.hide()
      },
      click(event) {
        event.stopPropagation()
        if(props.async) {
          loading.value = true
        }
        const cb = async (text) => {
          asyncContent.value = text
          loading.value = false
          await nextTick()
          if(tippyInstance.value.popperInstance) {
            tippyInstance.value.popperInstance.forceUpdate()
          }
        }
        comp.emit('trigger', cb)
      }
    }
  }
}
</script>

<style>

</style>