<template>
    <div v-if="!innerHide" class="h-condition-item">
        <p v-if="prefix" class="condition-prefix">{{ prefix }}</p>
        <el-select
            v-bind="$attrs"
            :filter-method="filterMethod && finalFilterMethod"
            :value="checked"
            :clearable="clearable"
            :disabled="innerDisabled"
            size="small"
            @blur="blur"
            @input="change"
        >
            <el-option
                v-for="item of finalOption"
                :key="item[valueKey]"
                :value="item[valueKey]"
                :label="item[labelKey]"
            />
        </el-select>
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
    // 提交给后端的字段
    valueKey: { type: String },
    // 展示的字段
    labelKey: { type: String },
    // 下拉选项的数据源
    option: { type: Array, default: () => [] },
    // 是否多选
    multiple: { type: Boolean },
    // 获取数据
    getDict: { type: Function },
    // 实时查询的值
    query: { type: Object },
    // 回填值的对象
    backfill: { type: Object },
    // 是否允许清空 - 默认允许
    clearable: { type: Boolean, default: true },
    // 自定义筛选方法
    filterMethod: { type: Function },
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
    checked: vm.multiple ? [] : '',
    remoteOption: [],
    backFilterOption: false, // 是否返回过滤后的数据
    filterOption: [], // 过滤后的数据源
    // 只有存在依赖字段时, 该值才会生效
    innerDisabled: disabledMethod(vm),
    innerHide: hideMethod(vm)
  }),
  computed: {
    // 数据源
    originOption () {
      const { remoteOption, option } = this
      return (remoteOption.length ? remoteOption : option) || []
    },
    // 根据是否过滤返回不同的数据源
    finalOption () {
      const { backFilterOption, filterOption, originOption } = this
      return backFilterOption ? filterOption : originOption
    }
  },
  watch: {
    getDict: {
      immediate: true,
      handler () {
        const { getDict } = this
        if (getDict) {
          getDict((data) => {
            const { checked } = this
            // 重置 checked, 防止增加 option 后, select 值没更新的问题
            this.checked = undefined
            this.remoteOption = data || []
            this.checked = checked
          })
        }
      }
    }
  },
  created () {
    const { field, depend, dependFields } = this
    const unwatchs = []
    unwatchs.push(
      this.$watch(
                `backfill.${field}`,
                (value) => {
                  this.checked = value
                },
                { immediate: true, deep: true }
      )
    )
    if (depend && dependFields.length) {
      // 存在依赖项
      const isStr = typeof dependFields === 'string'
      unwatchs.push(
        this.$watch(
          isStr ? `query.${dependFields}` : () => dependFields.map((k) => this.query[k]).join(','),
          (val, oldVal) => {
            if (val === oldVal) return
            this.change(this.multiple ? [] : '')
            const { getDict } = this
            if (getDict) {
              getDict(
                (data) => {
                  const { checked } = this
                  // 重置 checked, 防止增加 option 后, select 值没更新的问题
                  this.checked = undefined
                  this.remoteOption = data || []
                  this.checked = checked
                },
                isStr ? this.query[dependFields] : dependFields.map((k) => this.query[k])
              )
            }

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
         * @description: 过滤方法
         */
    finalFilterMethod (value) {
      const { originOption } = this
      if (value === '' || value === undefined) {
        this.backFilterOption = false
        this.filterOption = []
      } else {
        this.backFilterOption = true
        this.filterOption = originOption.filter((v) => this.filterMethod(value, v))
      }
    },
    /**
         * @description: input change 事件
         * @param {String} value: 输入值
         */
    change (value) {
      this.checked = value
      this.triggerValue()
    },
    /**
         * @description: 失焦事件
         */
    blur () {
      this.$listeners.blur && this.$emit('blur', ...arguments)
      this.filterMethod && this.finalFilterMethod()
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
      const { field, multiple } = this
      this.checked = multiple ? [] : ''
      return { [field]: this.checked || undefined }
    }
  }
}
</script>
