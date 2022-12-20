<template>
    <div class="h-condition-item">
        <p v-if="prefix" class="condition-prefix">{{ prefix }}</p>
        <el-cascader
            ref="cascader"
            v-bind="$attrs"
            :filter-method="finalFilterMethod"
            :clearable="clearable"
            :value="checked"
            :options="finalOption"
            :props="finalProps"
            size="small"
            @input="change"
        />
    </div>
</template>

<script>
import { getChained } from "../../../src/utils/utils";

function defaultFormatField(values, nodes, fields, emitPath) {
  if (emitPath) {
    return values.reduce((p, v, i) => {
      fields[i] && (p[fields[i]] = v);
      return p;
    }, {});
  } else {
    const i = values.length - 1;
    const lastValue = values.pop();
    return fields[i] ? { [fields[i]]: lastValue } : {};
  }
}

export default {
  inheritAttrs: false,
  props: {
    // 返回的字段
    field: { type: String, required: true },
    // 不同层级返回不同的字段(可能存在的字段, 不传初始不会回填数据)
    fields: { type: [String, Array] },
    // 不同层级返回不同的字段格式化函数
    formatField: { type: Function, default: defaultFormatField },
    // 显示在 input 框前的文字
    prefix: { type: String },
    // 提交给后端的字段
    valueKey: { type: String },
    // 展示的字段
    labelKey: { type: String },
    // 下拉选项的数据源
    option: { type: Array, default: () => [] },
    // 传递给 cascader 组件的 props 属性
    props: { type: Object },
    // 获取数据
    getDict: { type: Function },
    // 回填值的对象
    backfill: { type: Object },
    // 是否可以被清空
    clearable: { type: Boolean, default: true },
    // 自定义筛选方法
    filterMethod: { type: Function },
    // 校验函数
    validator: { type: [Function] },
  },
  data: (vm) => ({
    checked: [],
    remoteOption: [],
    insetTrigger: false, // 内部是否触发更改
    temporaryValue: "", // 临时存储的值
  }),
  computed: {
    oldParams() {
      const { field, fields } = this;
      return []
        .concat(fields || field)
        .reduce((p, k) => Object.assign(p, { [k]: undefined }), {});
    },
    finalOption() {
      const { remoteOption, option } = this;
      return (remoteOption.length ? remoteOption : option) || [];
    },
    finalProps() {
      const { valueKey, labelKey, props } = this;
      const a = { value: valueKey, label: labelKey };
      return props ? { ...a, ...props, emitPath: true } : a;
    },
    checkedStr() {
      const { checked, emitPath } = this;
      return emitPath ? checked.join("") : checked.slice(-1)[0];
    },
    finalFilterMethod() {
      const { filterMethod, finalOption } = this;
      return filterMethod
        ? (node, value) => filterMethod(node, value, finalOption)
        : undefined;
    },
  },
  watch: {
    getDict: {
      immediate: true,
      handler() {
        const { getDict } = this;
        if (getDict) {
          getDict((data) => {
            const { checked, temporaryValue } = this;
            // 重置 checked, 防止增加 option 后, select 值没更新的问题
            this.checked = undefined;
            this.remoteOption = data || [];
            this.checked = checked;
            if (temporaryValue) {
              this.checked = this.getChainedValues(temporaryValue);
              this.temporaryValue = "";
            }
          });
        }
      },
    },
  },
  created() {
    const { field, fields } = this;

    const unwatch = this.$watch(
      () =>
        []
          .concat(fields || field)
          .reduce((p, v) => `${p}${this.backfill[v] || ""}`, ""),
      (value) => {
        if (value === this.checkedStr) return;
        if (typeof value === "string") {
          if (this.finalOption.length) {
            this.checked = this.getChainedValues(value);
          } else {
            this.temporaryValue = value;
          }
        } else {
          this.checked = value || [];
        }
      },
      { immediate: true, deep: true }
    );
    this.$once("hook:beforeDestroy", () => {
      unwatch();
    });
  },
  methods: {
    /**
     * @description: change 事件
     * @param {Array} values: 选中的数据
     */
    change(values) {
      this.insetTrigger = true;
      this.checked = values;
      this.triggerValue();
      this.$nextTick(() => {
        this.insetTrigger = false;
      });
    },
    /**
     * @description: 向上触发改变事件
     */
    triggerValue() {
      this.$emit("search", this.getQuery());
    },
    /**
     * @description: 获取返回到上层的值
     *
     * @return {Object}
     */
    getQuery() {
      const {
        field,
        fields,
        formatField,
        checked,
        props,
        oldParams,
        temporaryValue,
      } = this;

      const emitPath = props && props.emitPath;

      // 当数据是远程获取时, 会涉及到一个异步问题导致初次回填数据失败
      // 所以直接返回当前条件中属于该组件的条件
      const query = temporaryValue
        ? this.getCurrentCondition()
        : fields
        ? formatField(
            checked.slice(),
            this.$refs.cascader.getCheckedNodes(),
            fields.slice(),
            emitPath
          )
        : { [field]: emitPath ? checked : checked.slice(-1)[0] };

      return { ...oldParams, ...query };
    },
    /**
     * @description: 获取当前条件中属于该组件的条件
     */
    getCurrentCondition() {
      const { backfill, fields, field } = this;
      return [].concat(fields || field).reduce((p, k) => {
        backfill[k] && (p[k] = backfill[k]);
        return p;
      }, {});
    },
    /**
     * @description: 获取返回到上层的值
     *
     * @return {Object}
     */
    reset() {
      const { fields, field, formatField, checked, emitPath, oldParams } = this;
      this.temporaryValue = "";
      this.checked = [];

      // 由于渲染机制是异步的, 这里的 $refs.cascader.getCheckedNodes 拿到的是旧值
      // 所以不调用 getQuery 来获取数据
      const query = fields
        ? formatField(checked.slice(), [], fields.slice(), emitPath)
        : { [field]: emitPath ? checked : checked.slice(-1)[0] };

      const result = { ...oldParams };
      Object.keys(query).every((k) => {
        result[k] = undefined;
        return true;
      });

      return result;
    },
    /**
     * @description: 获取选中值的全级
     * @param {String} checked: 选中的值
     *
     * @return {Array}
     */
    getChainedValues(checked) {
      const {
        finalOption,
        finalProps: { value },
      } = this;
      return getChained(finalOption, { [value]: checked }).map((v) => v[value]);
    },
  },
};
</script>
