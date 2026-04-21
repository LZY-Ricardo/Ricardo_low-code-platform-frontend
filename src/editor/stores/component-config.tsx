import type { ComponentType } from "react";
import { create } from "zustand";
import type { CommonComponentProps } from "../interface";
import ContainerDev from "../materials/Container/dev";
import ContainerProd from "../materials/Container/prod";
import ButtonDev from "../materials/Button/dev";
import ButtonProd from "../materials/Button/prod";
import PageDev from "../materials/Page/dev";
import PageProd from "../materials/Page/prod";
import TextDev from "../materials/Text/dev";
import TextProd from "../materials/Text/prod";
import InputDev from "../materials/Input/dev";
import InputProd from "../materials/Input/prod";
import ImageDev from "../materials/Image/dev";
import ImageProd from "../materials/Image/prod";
import TitleDev from "../materials/Title/dev";
import TitleProd from "../materials/Title/prod";
import CardDev from "../materials/Card/dev";
import CardProd from "../materials/Card/prod";
import TableDev from "../materials/Table/dev";
import TableProd from "../materials/Table/prod";
import ModalDev from "../materials/Modal/dev";
import ModalProd from "../materials/Modal/prod";
import TabsDev from "../materials/Tabs/dev";
import TabsProd from "../materials/Tabs/prod";
import SelectDev from "../materials/Select/dev";
import SelectProd from "../materials/Select/prod";
import SwitchDev from "../materials/Switch/dev";
import SwitchProd from "../materials/Switch/prod";
import DatePickerDev from "../materials/DatePicker/dev";
import DatePickerProd from "../materials/DatePicker/prod";
import FormDev from "../materials/Form/dev";
import FormProd from "../materials/Form/prod";
import DividerDev from "../materials/Divider/dev";
import DividerProd from "../materials/Divider/prod";
import TagDev from "../materials/Tag/dev";
import TagProd from "../materials/Tag/prod";
import RowDev from "../materials/Grid/RowDev";
import RowProd from "../materials/Grid/RowProd";
import ColDev from "../materials/Grid/ColDev";
import ColProd from "../materials/Grid/ColProd";
import ChartDev from "../materials/Chart/dev";
import ChartProd from "../materials/Chart/prod";

export interface ComponentSetter {
    name: string;
    label: string;
    type: string;
    options?: Array<{ label: string; value: string | number | boolean }>;
    [key: string]: unknown;
}

export interface ComponentConfig {
    name: string;
    defaultProps: Record<string, unknown>;
    // component: any;
    desc: string;
    tooltip?: string;
    /** 是否允许包含子节点（容器型组件） */
    allowChildren?: boolean;
    bindableProps?: string[];
    setter?: ComponentSetter[];
    stylesSetter?: ComponentSetter[];
    dev: ComponentType<CommonComponentProps>, // 开发模式下的组件
    prod: ComponentType<CommonComponentProps>, // 预览模式下的组件
}

export type ComponentConfigMap = { [key: string]: ComponentConfig }

export interface State {
    componentConfig: ComponentConfigMap
}

export interface Action {
    registerComponent: (name: string, componentConfig: ComponentConfig) => void
}

// 每一个名字对应的组件具体是哪一个
export const useComponentConfigStore = create<State & Action>(
    (set) => ({
        componentConfig: {
            Container: {
                name: 'Container',
                defaultProps: {},
                desc: '容器',
                tooltip: '用来放一组内容',
                dev: ContainerDev,
                prod: ContainerProd,
                allowChildren: true,
            },
            Button: {
                name: 'Button',
                defaultProps: {
                    type: 'primary',
                    text: '按钮'
                },
                desc: '按钮',
                tooltip: '用来点击执行操作',
                dev: ButtonDev,
                prod: ButtonProd,
                bindableProps: ['text'],
                setter: [
                    {
                        name: 'type',
                        label: '按钮类型',
                        type: 'select',
                        options: [
                            {
                                label: '主要按钮',
                                value: 'primary'
                            },
                            {
                                label: '次要按钮',
                                value: 'default'
                            }
                        ]
                    },
                    {
                        name: 'text',
                        label: '文本',
                        type: 'input'
                    }
                ],
                stylesSetter: [
                    {
                        name: 'width',
                        label: '宽度',
                        type: 'inputNumber'
                    },
                    {
                        name: 'height',
                        label: '高度',
                        type: 'inputNumber'
                    }
                ]
            },
            Page: {
                name: 'Page',
                defaultProps: {},
                desc: '页面',
                tooltip: '用来承载整个页面',
                dev: PageDev,
                prod: PageProd,
                allowChildren: true,
            },
            Text: {
                name: 'Text',
                defaultProps: {
                    text: '文本内容'
                },
                desc: '文本',
                tooltip: '用来显示一段文字',
                dev: TextDev,
                prod: TextProd,
                bindableProps: ['text'],
                setter: [
                    {
                        name: 'text',
                        label: '文本内容',
                        type: 'input'
                    }
                ],
                stylesSetter: [
                    {
                        name: 'fontSize',
                        label: '字体大小',
                        type: 'inputNumber'
                    },
                    {
                        name: 'color',
                        label: '字体颜色',
                        type: 'input'
                    },
                    {
                        name: 'fontWeight',
                        label: '字体粗细',
                        type: 'select',
                        options: [
                            { label: '正常', value: 'normal' },
                            { label: '粗体', value: 'bold' }
                        ]
                    }
                ]
            },
            Title: {
                name: 'Title',
                defaultProps: {
                    level: 1,
                    text: '标题'
                },
                desc: '标题',
                tooltip: '用来显示标题',
                dev: TitleDev,
                prod: TitleProd,
                bindableProps: ['text'],
                setter: [
                    {
                        name: 'level',
                        label: '标题级别',
                        type: 'select',
                        options: [
                            { label: 'H1', value: 1 },
                            { label: 'H2', value: 2 },
                            { label: 'H3', value: 3 },
                            { label: 'H4', value: 4 },
                            { label: 'H5', value: 5 }
                        ]
                    },
                    {
                        name: 'text',
                        label: '标题文本',
                        type: 'input'
                    }
                ],
                stylesSetter: [
                    {
                        name: 'color',
                        label: '字体颜色',
                        type: 'input'
                    },
                    {
                        name: 'textAlign',
                        label: '对齐方式',
                        type: 'select',
                        options: [
                            { label: '左对齐', value: 'left' },
                            { label: '居中', value: 'center' },
                            { label: '右对齐', value: 'right' }
                        ]
                    }
                ]
            },
            Input: {
                name: 'Input',
                defaultProps: {
                    placeholder: '请输入内容',
                    value: ''
                },
                desc: '输入框',
                tooltip: '用来输入内容',
                dev: InputDev,
                prod: InputProd,
                bindableProps: ['value', 'placeholder'],
                setter: [
                    {
                        name: 'placeholder',
                        label: '占位符',
                        type: 'input'
                    },
                    {
                        name: 'value',
                        label: '默认值',
                        type: 'input'
                    }
                ],
                stylesSetter: [
                    {
                        name: 'width',
                        label: '宽度',
                        type: 'inputNumber'
                    },
                    {
                        name: 'height',
                        label: '高度',
                        type: 'inputNumber'
                    }
                ]
            },
            Image: {
                name: 'Image',
                defaultProps: {
                    src: 'https://via.placeholder.com/300x200',
                    alt: '图片',
                    width: 200,
                    height: 200
                },
                desc: '图片',
                tooltip: '用来显示图片',
                dev: ImageDev,
                prod: ImageProd,
                setter: [
                    {
                        name: 'src',
                        label: '图片地址',
                        type: 'input'
                    },
                    {
                        name: 'alt',
                        label: '替代文本',
                        type: 'input'
                    },
                    {
                        name: 'width',
                        label: '宽度',
                        type: 'inputNumber'
                    },
                    {
                        name: 'height',
                        label: '高度',
                        type: 'inputNumber'
                    }
                ],
                stylesSetter: [
                    {
                        name: 'borderRadius',
                        label: '圆角',
                        type: 'inputNumber'
                    }
                ]
            },
            Card: {
                name: 'Card',
                defaultProps: {
                    title: '卡片标题'
                },
                desc: '卡片',
                tooltip: '用来放一块内容',
                dev: CardDev,
                prod: CardProd,
                allowChildren: true,
                bindableProps: ['title'],
                setter: [
                    {
                        name: 'title',
                        label: '卡片标题',
                        type: 'input'
                    }
                ],
                stylesSetter: [
                    {
                        name: 'width',
                        label: '宽度',
                        type: 'inputNumber'
                    },
                    {
                        name: 'minHeight',
                        label: '最小高度',
                        type: 'inputNumber'
                    }
                ]
            },
            Table: {
                name: 'Table',
                defaultProps: {
                    columnsText: '姓名,年级,状态',
                    dataText: '张三,大一,正常\n李四,大二,请假',
                },
                desc: '表格',
                tooltip: '用来显示表格数据',
                dev: TableDev,
                prod: TableProd,
                bindableProps: ['dataSource'],
                setter: [
                    {
                        name: 'columnsText',
                        label: '列配置',
                        type: 'textarea',
                    },
                    {
                        name: 'dataText',
                        label: '数据行',
                        type: 'textarea',
                    }
                ],
                stylesSetter: [
                    {
                        name: 'width',
                        label: '宽度',
                        type: 'inputNumber'
                    }
                ]
            },
            Modal: {
                name: 'Modal',
                defaultProps: {
                    title: '弹窗标题',
                    content: '弹窗内容',
                    okText: '确认',
                    cancelText: '取消',
                    open: true,
                },
                desc: '弹窗',
                tooltip: '用来弹出一个窗口',
                dev: ModalDev,
                prod: ModalProd,
                allowChildren: true,
                setter: [
                    {
                        name: 'title',
                        label: '标题',
                        type: 'input',
                    },
                    {
                        name: 'content',
                        label: '内容',
                        type: 'textarea',
                    },
                    {
                        name: 'okText',
                        label: '确认文案',
                        type: 'input',
                    },
                    {
                        name: 'cancelText',
                        label: '取消文案',
                        type: 'input',
                    },
                    {
                        name: 'open',
                        label: '默认打开',
                        type: 'select',
                        options: [
                            { label: '打开', value: true },
                            { label: '关闭', value: false },
                        ]
                    }
                ],
                stylesSetter: [
                    {
                        name: 'width',
                        label: '宽度',
                        type: 'inputNumber'
                    }
                ]
            },
            Tabs: {
                name: 'Tabs',
                defaultProps: {
                    itemsText: '概览,趋势,明细',
                },
                desc: '选项卡',
                tooltip: '用来切换不同内容',
                dev: TabsDev,
                prod: TabsProd,
                setter: [
                    {
                        name: 'itemsText',
                        label: '标签项',
                        type: 'textarea',
                    }
                ],
                stylesSetter: [
                    {
                        name: 'width',
                        label: '宽度',
                        type: 'inputNumber'
                    }
                ]
            },
            Select: {
                name: 'Select',
                defaultProps: {
                    placeholder: '请选择',
                    optionsText: '全部,进行中,已完成',
                    value: '',
                },
                desc: '下拉框',
                tooltip: '用来从列表中选择',
                dev: SelectDev,
                prod: SelectProd,
                bindableProps: ['value', 'options'],
                setter: [
                    {
                        name: 'placeholder',
                        label: '占位符',
                        type: 'input',
                    },
                    {
                        name: 'optionsText',
                        label: '选项列表',
                        type: 'textarea',
                    },
                    {
                        name: 'value',
                        label: '默认值',
                        type: 'input',
                    }
                ],
                stylesSetter: [
                    {
                        name: 'width',
                        label: '宽度',
                        type: 'inputNumber'
                    }
                ]
            },
            Switch: {
                name: 'Switch',
                defaultProps: {
                    checked: false,
                    checkedText: '开',
                    uncheckedText: '关',
                },
                desc: '开关',
                tooltip: '用来打开或关闭状态',
                dev: SwitchDev,
                prod: SwitchProd,
                bindableProps: ['checked'],
                setter: [
                    {
                        name: 'checked',
                        label: '默认选中',
                        type: 'select',
                        options: [
                            { label: '打开', value: true },
                            { label: '关闭', value: false },
                        ]
                    },
                    {
                        name: 'checkedText',
                        label: '开启文案',
                        type: 'input',
                    },
                    {
                        name: 'uncheckedText',
                        label: '关闭文案',
                        type: 'input',
                    }
                ]
            },
            DatePicker: {
                name: 'DatePicker',
                defaultProps: {
                    placeholder: '请选择日期',
                    value: '',
                },
                desc: '日期选择',
                tooltip: '用来选择日期',
                dev: DatePickerDev,
                prod: DatePickerProd,
                bindableProps: ['value'],
                setter: [
                    {
                        name: 'placeholder',
                        label: '占位符',
                        type: 'input',
                    },
                    {
                        name: 'value',
                        label: '默认日期',
                        type: 'input',
                    }
                ],
                stylesSetter: [
                    {
                        name: 'width',
                        label: '宽度',
                        type: 'inputNumber'
                    }
                ]
            },
            Form: {
                name: 'Form',
                defaultProps: {
                    title: '表单',
                    layout: 'vertical',
                },
                desc: '表单',
                tooltip: '用来填写并提交信息',
                dev: FormDev,
                prod: FormProd,
                allowChildren: true,
                bindableProps: ['title'],
                setter: [
                    {
                        name: 'title',
                        label: '标题',
                        type: 'input',
                    },
                    {
                        name: 'layout',
                        label: '布局',
                        type: 'select',
                        options: [
                            { label: '垂直', value: 'vertical' },
                            { label: '水平', value: 'horizontal' },
                            { label: '内联', value: 'inline' },
                        ]
                    }
                ],
                stylesSetter: [
                    {
                        name: 'width',
                        label: '宽度',
                        type: 'inputNumber'
                    }
                ]
            },
            Divider: {
                name: 'Divider',
                defaultProps: {
                    text: '分割线',
                    orientation: 'center',
                },
                desc: '分割线',
                tooltip: '用来分隔内容',
                dev: DividerDev,
                prod: DividerProd,
                setter: [
                    {
                        name: 'text',
                        label: '文案',
                        type: 'input',
                    },
                    {
                        name: 'orientation',
                        label: '位置',
                        type: 'select',
                        options: [
                            { label: '左侧', value: 'left' },
                            { label: '居中', value: 'center' },
                            { label: '右侧', value: 'right' },
                        ]
                    }
                ]
            },
            Tag: {
                name: 'Tag',
                defaultProps: {
                    text: '标签',
                    color: 'default',
                },
                desc: '标签',
                tooltip: '用来标记分类或状态',
                dev: TagDev,
                prod: TagProd,
                setter: [
                    {
                        name: 'text',
                        label: '文案',
                        type: 'input',
                    },
                    {
                        name: 'color',
                        label: '颜色',
                        type: 'input',
                    }
                ]
            },
            Row: {
                name: 'Row',
                defaultProps: {
                    gutter: 16,
                },
                desc: '行布局',
                tooltip: '用来横向排列内容',
                dev: RowDev,
                prod: RowProd,
                allowChildren: true,
                setter: [
                    {
                        name: 'gutter',
                        label: '列间距',
                        type: 'inputNumber',
                    }
                ]
            },
            Col: {
                name: 'Col',
                defaultProps: {
                    span: 12,
                },
                desc: '列布局',
                tooltip: '用来把内容分成列',
                dev: ColDev,
                prod: ColProd,
                allowChildren: true,
                setter: [
                    {
                        name: 'span',
                        label: '宽度占比',
                        type: 'inputNumber',
                    }
                ]
            },
            Chart: {
                name: 'Chart',
                defaultProps: {
                    title: '数据图表',
                    chartType: 'bar',
                    dataText: '访问量,120\n注册数,80\n留存,45',
                },
                desc: '图表',
                tooltip: '用来显示数据图表',
                dev: ChartDev,
                prod: ChartProd,
                bindableProps: ['dataSource'],
                setter: [
                    {
                        name: 'title',
                        label: '标题',
                        type: 'input',
                    },
                    {
                        name: 'chartType',
                        label: '图表类型',
                        type: 'select',
                        options: [
                            { label: '柱状', value: 'bar' },
                            { label: '折线', value: 'line' },
                            { label: '占比', value: 'pie' },
                        ]
                    },
                    {
                        name: 'dataText',
                        label: '数据项',
                        type: 'textarea',
                    }
                ]
            }
        },

        registerComponent: (name, componentConfig) => {
            set((state) => {
                return {
                    ...state,
                    componentConfig: {
                        ...state.componentConfig,
                        [name]: componentConfig
                    }
                }
            })
        }
    })
)
