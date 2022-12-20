<template>
    <div v-if="!innerHide" class="h-condition-item">
        <p v-if="prefix" class="condition-prefix">{{ prefix }}</p>
        <el-input
            v-bind="$attrs"
            :value="checked"
            :disabled="innerDisabled"
            size="small"
            @input="change"
            @keydown.native.enter="enterHandle"
        />
    </div>
</template>

<script>
/**
 * 存在依赖项时, 禁用默认的逻辑
 * @param {object} query 实时的检索字段
 * @param {string | string[]} dependFields 依赖的字段
 */
function disableDefaultMethod (query, dependFields) {
  return ![].concat(dependFields).every((k) => query[k] && query[k].length)
}

/**
 * 组件禁用逻辑
 */
function disabledMethod (vm) {
  const cb = vm.disabled || disableDefaultMethod
  return typeof cb === 'function' ? vm.depend && cb(vm.query, vm.dependFields) : cb
}
/**
 * 组件隐藏逻辑
 */
function hideMethod (vm) {
  return typeof vm.hide === 'function' ? vm.depend && vm.hide(vm.query, vm.dependFields) : vm.hide
}

export default {
  inheritAttrs: false,
  props: {
    /* eslint-disable vue/require-default-prop */
    // 提交的字段
    field: { type: String, required: true },
    // 显示在 input 框前的文字
    prefix: { type: String },
    // 回填值的对象
    backfill: { type: Object },
    // 实时查询的值
    query: { type: Object },
    // 实时触发时做抖动, 防止频繁触发
    realtime: { type: Boolean },
    // 实时触发时防抖动的时间
    waitTimer: { type: Number, default: 300 },
    // 是否依赖其它字段
    depend: { type: Boolean },
    // 依赖字段
    dependFields: { type: [String, Array] },
    // 校验函数
    validator: { type: [Function] },
    // 禁用状态
    disabled: { type: [Boolean, Function] },
    // 是否隐藏 -> 如果是函数, 需传递依赖项, 可根据依赖项动态隐藏
    hide: { type: [Boolean, Function] }
    /* eslint-enable vue/require-default-prop */
  },
  data: (vm) => ({
    checked: '',
    // 只有存在依赖字段时, 该值才会生效
    innerDisabled: disabledMethod(vm),
    innerHide: hideMethod(vm)
  }),
  created () {
    const { field, depend, dependFields, hide } = this
    const unwatchs = []
    if (depend && dependFields.length) {
      // 存在依赖项
      const isStr = typeof dependFields === 'string'
      unwatchs.push(
        this.$watch(
          isStr ? `query.${dependFields}` : () => dependFields.map((k) => this.query[k]).join(','),
          (val, oldVal) => {
            if (val === oldVal) return
            this.change('')
            this.innerDisabled = disabledMethod(this)
            this.innerHide = hideMethod(this)
          },
          { deep: true, immediate: true }
        )
      )
    }
    unwatchs.push(
      this.$watch(
                `backfill.${field}`,
                (value) => {
                  this.checked = value
                },
                { immediate: true, deep: true }
      )
    )

    this.$once('hook:beforeDestroy', () => {
      unwatchs.forEach((v) => v())
    })
  },
  methods: {
    /**
         * @description: input change 事件
         * @param {String} value: 输入值
         */
    change (value) {
      this.checked = value
      this.triggerOfDiffType()
    },
    /**
         * @description: 为抖动写的过渡函数
         */
    triggerOfDiffType () {
      const { realtime, timer, waitTimer } = this
      if (!realtime) return this.triggerValue()

      timer && clearTimeout(timer)
      this.timer = setTimeout(() => {
        this.triggerValue()
      }, waitTimer)
    },
    /**
         * @description: input enter 事件
         * @param {KeyboardEvent} ev
         */
    enterHandle (ev) {
      const { realtime } = this
      this.checked = ev.target.value
      this.triggerValue()
      // 如果非实时触发则立即让条件容器触发一次搜索事件
      if (!realtime) this.$emit('triggerSearch')
    },
    /**
         * @description: 向上触发改变事件
         */
    triggerValue () {
      this.$emit('search', this.getQuery())
    },
    /**
         * @description: 获取返回到上层的值
         *
         * @return {Object}
         */
    getQuery () {
      const { checked, field } = this
      return { [field]: checked }
    },
    /**
         * @description: 获取返回到上层的值
         *
         * @return {Object}
         */
    reset () {
      const { field } = this
      this.checked = ''
      return { [field]: this.checked || undefined }
    }
  }
}
</script>
