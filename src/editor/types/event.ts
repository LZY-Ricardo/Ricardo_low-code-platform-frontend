/**
 * 事件系统类型定义
 * 
 * 定义了低代码平台中组件事件系统的所有类型，包括：
 * - 事件类型：组件可以响应的事件（如 onClick、onChange 等）
 * - 动作类型：事件触发后执行的动作（如显示消息、页面跳转等）
 * - 事件配置：组件的事件配置结构
 * - 事件上下文：事件执行时的上下文信息
 * - 动作配置：各种动作类型的配置接口
 */

/**
 * 事件动作类型
 * 定义事件触发后可以执行的动作类型
 */
export type BuiltInActionType =
    | 'showMessage'      // 显示消息提示（使用 Ant Design 的 message 组件）
    | 'navigate'         // 页面跳转（支持当前窗口和新标签页）
    | 'setState'         // 更新组件状态（修改指定组件的 props）
    | 'callAPI'          // 调用 API（支持 GET、POST、PUT、DELETE）
    | 'customScript'     // 执行自定义脚本（JavaScript 代码）

export type ActionType = BuiltInActionType | (string & {})

/**
 * 事件类型
 * 定义组件可以响应的事件类型
 */
export type EventType =
    | 'onClick'          // 点击事件（鼠标左键单击）
    | 'onDoubleClick'    // 双击事件（鼠标左键双击）
    | 'onChange'         // 值变化事件（主要用于表单组件）
    | 'onFocus'          // 获得焦点事件（输入框等组件）
    | 'onBlur'           // 失去焦点事件（输入框等组件）
    | 'onMouseEnter'     // 鼠标进入事件（鼠标移入组件区域）
    | 'onMouseLeave'     // 鼠标离开事件（鼠标移出组件区域）

/**
 * 组件事件配置
 * 描述一个事件的完整配置信息
 * 
 * @property eventType - 事件类型，指定触发的事件
 * @property actionType - 动作类型，指定事件触发后执行的动作
 * @property actionConfig - 动作配置，具体动作的参数配置（根据 actionType 不同而不同）
 */
export interface ComponentEvent {
    /** 事件类型 */
    eventType: EventType
    /** 动作类型 */
    actionType: ActionType
    /** 动作配置对象，包含动作执行所需的所有参数 */
    actionConfig: Record<string, unknown>
}

export interface WorkflowAction {
    actionType: ActionType
    actionConfig: Record<string, unknown>
}

/**
 * 事件上下文
 * 事件执行时提供的上下文信息，用于在动作执行过程中获取数据和更新状态
 * 
 * @property componentId - 触发事件的组件 ID
 * @property eventType - 触发的事件类型
 * @property eventData - 事件数据（如 onChange 事件的新值）
 * @property components - 所有组件的数组
 * @property getComponentById - 根据 ID 获取组件的函数
 * @property updateComponentProps - 更新组件属性的函数
 */
export interface EventContext {
    /** 触发事件的组件 ID */
    componentId: number
    /** 触发的事件类型 */
    eventType: EventType
    /** 事件携带的数据（可选），如 onChange 事件的新值 */
    eventData?: unknown
    /** 所有组件的数组 */
    components: unknown[]
    /** 运行时变量 */
    variables: Record<string, unknown>
    /** 请求结果缓存 */
    requestResults: Record<string, unknown>
    /** 根据组件 ID 获取组件实例的函数 */
    getComponentById: (id: number) => unknown | null
    /** 更新组件属性的函数 */
    updateComponentProps: (id: number, props: Record<string, unknown>) => void
}

/**
 * 动作配置类型
 * 定义各种动作类型的配置接口
 */

/**
 * 显示消息动作配置
 * @property type - 消息类型：成功、错误、警告、信息
 * @property content - 消息内容（支持变量替换，如 {{componentId}}）
 * @property duration - 显示时长（秒），默认 3 秒
 */
export interface ShowMessageConfig {
    type: 'success' | 'error' | 'warning' | 'info'
    content: string
    duration?: number
}

/**
 * 页面跳转动作配置
 * @property url - 跳转的目标 URL（支持变量替换）
 * @property openInNewTab - 是否在新标签页打开，默认 false
 */
export interface NavigateConfig {
    targetType?: 'url' | 'page'
    pageId?: string
    url: string
    openInNewTab?: boolean
}

/**
 * 更新组件状态动作配置
 * @property componentId - 要更新的目标组件 ID
 * @property props - 要更新的属性对象（支持变量替换）
 */
export interface SetStateConfig {
    componentId: number
    props: Record<string, unknown>
}

/**
 * 调用 API 动作配置
 * @property url - API 地址（支持变量替换）
 * @property method - HTTP 请求方法
 * @property params - 请求参数（GET 请求会转换为 query string，其他方法放在 body 中）
 * @property headers - 自定义请求头
 */
export interface CallAPIConfig {
    dataSourceId?: string
    resultKey?: string
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    params?: Record<string, unknown>
    headers?: Record<string, string>
}

/**
 * 自定义脚本动作配置
 * @property script - 要执行的 JavaScript 代码字符串
 * 
 * 注意：脚本中可以通过 context 参数访问事件上下文
 * 例如：context.componentId、context.updateComponentProps() 等
 */
export interface CustomScriptConfig {
    script: string
}

