import { Form, Input, InputNumber, Select } from 'antd';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useComponentConfigStore } from '../../stores/component-config';
import type { ComponentSetter } from '../../stores/component-config';
import { useComponentsStore } from '../../stores/components';
import CssEditor from './CssEditor';
import { debounce } from 'lodash-es';
import styleToObject from 'style-to-object';
import SharedStylePanel from './SharedStylePanel';

export default function ComponentStyle() {

    const [form] = Form.useForm();

    const { curComponentId, curComponent, updateComponentStyles } = useComponentsStore();
    const { componentConfig } = useComponentConfigStore();
    const [css, setCss] = useState<string>(`.comp{\n\n}`);

    useEffect(() => {
        form.resetFields();

        const data = form.getFieldsValue();
        form.setFieldsValue({ ...data, ...curComponent?.styles });
        if (curComponent?.styles) {
            setCss(toCSSStr(curComponent.styles as Record<string, unknown>))
        }
    }, [curComponent, form])

    function toCSSStr(css: Record<string, unknown>) {
        let str = `.comp {\n`;
        for (const key in css) {
            let value = css[key];
            if (!value) {
                continue;
            }
            if (['width', 'height'].includes(key) && !value.toString().endsWith('px')) {
                value += 'px';
            }

            str += `\t${key}: ${value};\n`
        }
        str += `}`;
        return str;
    }

    if (!curComponentId || !curComponent) return null;

    function renderFormElememt(setting: ComponentSetter) {
        const { type, options } = setting;

        if (type === 'select') {
            return <Select options={options} />
        } else if (type === 'input') {
            return <Input />
        } else if (type === 'inputNumber') {
            return <InputNumber />
        }
    }

    function valueChange(changeValues: CSSProperties) {
        if (curComponentId) {
            updateComponentStyles(curComponentId, changeValues);
        }
    }

    const handleEditorChange = debounce((value) => {
        setCss(value);

        const css: Record<string, unknown> = {};

        try {
            const cssStr = value.replace(/\/\*.*\*\//, '') // 去掉注释 /** */
                .replace(/(\.?[^{]+{)/, '') // 去掉 .comp {
                .replace('}', '');// 去掉 }

            styleToObject(cssStr, (name, value) => {
                css[name.replace(/-\w/, (item) => item.toUpperCase().replace('-', ''))] = value;
            });

            updateComponentStyles(curComponentId, { ...form.getFieldsValue(), ...css });
        } catch {
            // 忽略 CSS 解析错误
        }
    }, 500);

    return (
        <div className='space-y-4'>
            <Form
                form={form}
                onValuesChange={valueChange}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
            >
                {
                    componentConfig[curComponent.name]?.stylesSetter?.map(setter => (
                        <Form.Item key={setter.name} name={setter.name} label={setter.label}>
                            {renderFormElememt(setter)}
                        </Form.Item>
                    ))
                }
                <div className='h-[200px] border border-border-light rounded-lg relative overflow-hidden shadow-soft'>
                    <CssEditor value={css} onChange={handleEditorChange} />
                </div>
            </Form>
            <SharedStylePanel />
        </div>
    )
}
