/**
 * 事件执行引擎
 * 
 * 负责执行组件事件配置中定义的各种动作
 * 支持的动作类型包括：显示消息、页面跳转、更新组件状态、调用 API、执行自定义脚本
 * 
 * 特性：
 * - 支持变量替换（{{variable}} 语法）
 * - 统一的错误处理
 * - 异步动作支持
 */
import { message } from 'antd'
import type { ComponentEvent, EventContext, WorkflowAction } from '../types/event'
import { useActionRegistryStore } from '../stores/action-registry'

class EventExecutor {
    /**
     * 执行事件动作
     * 
     * 根据事件配置的动作类型，调用相应的处理方法执行动作
     * 
     * @param event - 组件事件配置
     * @param context - 事件执行上下文
     * 
     * @example
     * ```typescript
     * await eventExecutor.executeAction({
     *   eventType: 'onClick',
     *   actionType: 'showMessage',
     *   actionConfig: { type: 'success', content: '操作成功' }
     * }, context)
     * ```
     */
    async executeAction(event: ComponentEvent, context: EventContext): Promise<void> {
        try {
            await this.executeWorkflowAction({
                actionType: event.actionType,
                actionConfig: event.actionConfig,
            }, context)

            const chainedActions = Array.isArray(event.actionConfig.actions)
                ? event.actionConfig.actions as WorkflowAction[]
                : []

            for (const action of chainedActions) {
                await this.executeWorkflowAction(action, context)
            }
        } catch (error) {
            console.error('Event execution error:', error)
            message.error('事件执行失败')
        }
    }

    private async executeWorkflowAction(action: WorkflowAction, context: EventContext): Promise<void> {
        const actionDefinition = useActionRegistryStore.getState().getAction(action.actionType)
        if (!actionDefinition?.execute) {
            console.warn('Unknown action type:', action.actionType)
            return
        }
        await actionDefinition.execute(action.actionConfig, context)
    }

}

// 导出单例实例，整个应用共享同一个事件执行引擎
export const eventExecutor = new EventExecutor()

