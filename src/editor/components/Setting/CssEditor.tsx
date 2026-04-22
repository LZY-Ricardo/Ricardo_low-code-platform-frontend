import { useState } from 'react'
import MonacoEditor from '@monaco-editor/react'
import type { OnMount, EditorProps } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { Spin } from 'antd'

export interface EditorFile {
    name: string
    value: string
    language: string
}

interface Props {
    value: string
    onChange?: EditorProps['onChange']
    options?: editor.IStandaloneEditorConstructionOptions
}

export default function CssEditor(props: Props) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const {
        value,
        onChange,
        options
    } = props;

    const handleEditorMount: OnMount = (editor, monaco) => {
        setIsLoading(false)
        setHasError(false)
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ, () => {
            editor.getAction('editor.action.formatDocument')?.run()
        });
    }

    const handleEditorWillMount = () => {
        setIsLoading(true)
        setHasError(false)
    }

    if (hasError) {
        return (
            <div className="flex h-full items-center justify-center text-text-secondary">
                <div className="text-center">
                    <div>编辑器加载失败</div>
                    <div className="text-sm mt-2">请刷新页面重试</div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative h-full">
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-secondary">
                    <Spin size="large" tip="加载编辑器..." />
                </div>
            )}
            <MonacoEditor
                height="200px"
                path='component.css'
                language='css'
                onMount={handleEditorMount}
                beforeMount={handleEditorWillMount}
                onChange={onChange}
                value={value}
                loading={<Spin size="large" tip="加载编辑器..." />}
                options={
                    {
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        minimap: {
                            enabled: false,
                        },
                        scrollbar: {
                            verticalScrollbarSize: 6,
                            horizontalScrollbarSize: 6,
                        },
                        automaticLayout: true,
                        ...options
                    }
                }
            />
        </div>
    )
}
