<template>
    <div v-if="!innerHide" class="h-condition-item">
        <p v-if="prefix" class="condition-prefix">{{ prefix }}</p>
        <el-date-picker
            :value="checked"
            v-bind="$attrs"
            :type="type"
            size="small"
            :value-format="valueFormat"
            @input="updateChecked"
            @change="change"
        />
    </div>
</template>
    
<script>
const reg = /range$/
function isRange (str) {
  return reg.test(str)
}

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
    // 作为数组时提交的的字段
    field: { type: String, required: true },
    // 作为字符串时提交的的字段 - 起始字段
    beginField: { type: String },
    // 作为字符串时提交的的字段 - 结束字段
    endField: { type: String },
    // 显示在 input 框前的文字
    prefix: { type: String },
    // 选择器类型
    type: { type: String, default: 'date' },
    // 回填值的对象
    backfill: { type: Object },
    // 实时查询的值
    query: { type: Object },
    // 日期格式化的类型
    valueFormat: { type: String, default: 'yyyy-MM-dd' },
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
    checked: isRange(vm.type) ? ['', ''] : '',
    // 只有存在依赖字段时, 该值才会生效
    innerDisabled: disabledMethod(vm),
    innerHide: hideMethod(vm)
  }),
  computed: {
    isRange () {
      return isRange(this.type)
    }
  },
  created () {
    const { field, isRange, beginField, endField, depend, dependFields } = this
    const unwatchs = []
    if (isRange && beginField && endField) {
      const unwatch1 = this.$watch(
                `backfill.${beginField}`,
                (value) => {
                  this.checked.splice(0, 1, value || '')
                },
                { immediate: true }
      )
      const unwatch2 = this.$watch(
                `backfill.${endField}`,
                (value) => {
                  this.checked.splice(1, 1, value || '')
                },
                { immediate: true }
      )
      unwatchs.push(unwatch1, unwatch2)
    } else {
      const unwatch = this.$watch(
                `backfill.${field}`,
                (value) => {
                  this.checked = value || ''
                },
                { immediate: true, deep: true }
      )
      unwatchs.push(unwatch)
    }

    if (depend && dependFields.length) {
      // 存在依赖项
      const isStr = typeof dependFields === 'string'
      unwatchs.push(
        this.$watch(
          isStr ? `query.${dependFields}` : () => dependFields.map((k) => this.query[k]).join(','),
          (val, oldVal) => {
            if (val === oldVal) return
            this.updateChecked(null)
            this.change()
            this.innerDisabled = disabledMethod(this)
            this.innerHide = hideMethod(this)
          },
          { deep: true, immediate: true }
        )
      )
    }
    this.$once('hook:beforeDestroy', () => {
      unwatchs.forEach((v) => v())
    })
  },
  methods: {
    /**
         * @description: 日期更新事件
         * @param {String|Array} value: 更新的日期
         */
    updateChecked (value) {
      const { isRange } = this
      this.checked = value === null ? (isRange ? ['', ''] : '') : value
    },
    /**
         * @description: change 事件
         */
    change () {
      this.triggerValue()
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
      const { checked, isRange, beginField, endField, field } = this

      return isRange && beginField && endField
        ? { [beginField]: checked[0] || undefined, [endField]: checked[1] || undefined }
        : { [field]: typeof checked === 'object' ? [...checked] : checked || undefined }
    },
    /**
         * @description: 获取返回到上层的值
         *
         * @return {Object}
         */
    reset () {
      const { isRange, beginField, endField, field } = this
      this.checked = isRange ? ['', ''] : ''
      return isRange ? { [beginField]: undefined, [endField]: undefined } : { [field]: undefined }
    }
  }
}
</script>
