<template>
    <component
        :is="getComp(option)"
        v-if="option"
        ref="comp"
        :field="field"
        :backfill="backfill"
        v-bind="option"
        @search="compSearch"
    />
    <div v-else class="h-condition-item">
        <p v-if="prefix" class="condition-prefix">{{ prefix }}</p>
        <el-input :placeholder="placeholder" size="small" disabled />
    </div>
</template>

<script>
import HInput from './input.vue'
import HSelect from './select.vue'
import DatePicker from './datepicker.vue'
import Cascader from './cascader.vue'

const compMap = {
  input: 'HInput',
  datePicker: 'DatePicker',
  select: 'HSelect',
  cascader: 'Cascader',
  dynamic: 'Dynamic'
}

export default {
  name: 'Dynamic',
  components: {
    HInput,
    HSelect,
    DatePicker,
    Cascader
  },
  inheritAttrs: false,
  props: {
    // 监听 query[watchValue], 以便值发生时改变动态组件
    query: { type: Object },
    // 回填值的对象
    backfill: { type: Object },
    // 需要监听的值
    watchValue: { type: String },
    // 获取显示的动态组件
    getOption: { type: Function, required: true },
    // 显示在 input 框前的文字
    prefix: { type: String },
    // 传递给动态组件的条件配置
    placeholder: { type: [Number, String] }
  },
  data: () => ({
    // 显示的字段
    field: '',
    // 给下层组件用的选项
    option: null,
    // 缓存的清空上次的值
    oldParams: {}
  }),
  created () {
    const { watchValue } = this
    const cb = (value, reset) => {
      const options = this.getOption(value)
      if (!options) {
        this.field = ''
        this.option = null
        this.compSearch({})
      } else {
        const { option, field } = options
        this.field = field
        this.oldParams[field] = undefined
        this.$set(this, 'option', option)
        this.$nextTick(() => {
          reset && this.reset()
          this.compSearch(this.getQuery())
        })
      }
    }
    const unwatch = this.$watch(`query.${watchValue}`, (value) => cb(value, true))
    this.$once('hook:beforeDestroy', () => {
      unwatch()
    })
    const value = this.query && watchValue ? this.query[watchValue] : undefined
    cb(value)
  },
  methods: {
    /**
         * @description: 获取展示的组件
         * @param {Object} item: 条件项
         *
         * @return {String}
         */
    getComp (item) {
      return item ? compMap[item.t] : ''
    },
    /**
         * @description: 组件的搜索事件
         * @param {Object} query: 搜索的值
         */
    compSearch (params) {
      const { oldParams } = this

      this.$emit('search', { ...oldParams, ...params })
    },
    /**
         * 检验参数
         * @param {Object} query 需校验的参数值
         */
    validator (query) {
      return this.$refs.comp && this.$refs.comp.validator(query)
    },
    /**
         * @description: 获取返回到上层的值
         *
         * @return {Object}
         */
    getQuery () {
      const { oldParams } = this
      if (!this.$refs.comp) return { ...oldParams }
      return { ...oldParams, ...this.$refs.comp.getQuery() }
    },
    /**
         * @description: 获取返回到上层的值
         *
         * @return {Object}
         */
    reset () {
      const { oldParams } = this
      if (!this.$refs.comp) return { ...oldParams }
      return { ...oldParams, ...this.$refs.comp.reset() }
    }
  }
}
</script>

<style lang="scss" scoped></style>
