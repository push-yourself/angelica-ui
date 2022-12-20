import { VNode, h as CreateElement } from 'vue';
import {
    Input as ElInput,
    DatePicker as ElDatePicker,
    TimePicker as ElTimePicker,
    Select as ElSelect,
    Cascader as ElCascader,
    TableColumn,
} from 'element-ui';

declare global {
    interface HTableColumn extends Partial<TableColumn> {
        render?(h: CreateElement, data: RenderOption): VNode | JSX.Element;
    }
    // 动态组件
    // type DynamicComponent = InstanceType<typeof RegisterComponent>;
    // 条件组件的类型
    type Condition = Record<string, ConditionOption>;
    type ConditionOption =
        | Conditions.Input
        | Conditions.DatePicker
        | Conditions.TimePicker
        | Conditions.HSelect
        | Conditions.Cascader
        | Conditions.Dynamic;

    interface Window {}
    namespace Conditions {
        // 条件格式

        // 文字搜素
        interface Input extends Partial<ElInput> {
            t: 'input';
            as?: string; // 提交的字段(防止重复字段的条件冲突)
            prefix?: string; // 显示在筛选框前的文字
            depend?: boolean; // 是否对其它依赖其它条件项
            dependFields?: string | string[]; // 依赖其它条件时, 该条件所依赖的字段
            validator?: (query: Record<string, any>) => boolean | string | number;
        }

        // 日期筛选
        // @note 注意: 当类型为 range 时, 需要指定起始字段与结束字段
        // 不指定会传数组上去
        interface DatePicker extends Partial<ElDatePicker> {
            t: 'datePicker';
            as?: string; // 提交的字段(防止重复字段的条件冲突)
            prefix?: string; // 显示在筛选框前的文字
            beginField: string; // 起始字段
            endField: string; // 结束字段
            type?: string; // 日期的类型
            depend?: boolean; // 是否对其它依赖其它条件项
            dependFields?: string | string[]; // 依赖其它条件时, 该条件所依赖的字段
            validator?: (query: Record<string, any>) => boolean | string | number;
        }

        // 时间筛选
        // @note 注意: 当 isRange 时, 需要指定起始字段与结束字段
        // 不指定会传数组上去
        interface TimePicker extends Partial<ElTimePicker> {
            t: 'timePicker';
            as?: string; // 提交的字段(防止重复字段的条件冲突)
            prefix?: string; // 显示在筛选框前的文字
            format?: string; // 对时间进行格式化(显示和返回都应用此字段)
            beginField: string; // 起始字段
            endField: string; // 结束字段
            depend?: boolean; // 是否对其它依赖其它条件项
            dependFields?: string | string[]; // 依赖其它条件时, 该条件所依赖的字段
            validator?: (query: Record<string, any>) => boolean | string | number;
        }

        // 下拉框筛选
        // 不指定会传数组上去
        interface HSelect extends Partial<ElSelect> {
            t: 'select';
            as?: string; // 提交的字段(防止重复字段的条件冲突)
            prefix?: string; // 显示在筛选框前的文字
            valueKey: string; // 提交给后台的字段
            labelKey: string; // 显示的字段
            option: Record<string, any>[]; // 下拉项的数据源
            getDict?: (cb: (options: Record<string, any>[]) => void, ...args: any[]) => void; // 动态获取下拉项时传递的函数
            depend?: boolean; // 是否对其它依赖其它条件项
            dependFields?: string | string[]; // 依赖其它条件时, 该条件所依赖的字段
            validator?: (query: Record<string, any>) => boolean | string | number | null | undefined;
        }

        // 级联选择筛选
        interface Cascader extends Partial<ElCascader> {
            t: 'cascader';
            as?: string; // 提交的字段(防止重复字段的条件冲突)
            fields?: string | string[]; // 如果不传递则取 field, 不同层级显示返回不同的字段
            valueKey: string; // 提交给后台的字段
            labelKey: string; // 显示的字段
            option: Record<string, any>[]; // 下拉项的数据源
            formatField?: (
                fields: string[],
                values: string[],
                emitPath: boolean,
                defaultFormatField: Cascader['formatField'],
            ) => Record<string, string>; // 不同层级返回不同的字段时触发的函数
            getDict?: (cb: (options: Record<string, any>[]) => void) => void; // 动态获取下拉项时传递的函数
            depend?: boolean; // 是否对其它依赖其它条件项
            dependFields?: string | string[]; // 依赖其它条件时, 该条件所依赖的字段
            validator?: (query: Record<string, any>) => boolean | string | number;
        }

        // 动态筛选组件
        interface Dynamic {
            t: 'dynamic';
            as?: string; // 提交的字段(防止重复字段的条件冲突)
            prefix: string; // 输入框前的值
            placeholder: string; // 未显示前提示的值
            watchValue: string; // 要监听的值 backfill[watchValue]
            getOption(value: any): null | { field: string; option: ConditionOption | null }; // value: 监听值的值, field: 提交的字段, option: 显示的组件
        }
    }
}
