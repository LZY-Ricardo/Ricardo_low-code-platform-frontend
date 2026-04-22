import { App, Form as AntdForm } from 'antd'
import { cloneElement, isValidElement, useMemo, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import type { CommonComponentProps } from '../../interface'
import { normalizeFormLayout } from './props'
import { submitForm } from '../../../api/forms'

type FormValueMap = Record<string, string>

function normalizeFieldValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function buildFieldName(id: unknown) {
  return `field_${id ?? 'unknown'}`
}

function enhanceChildren(
  children: ReactNode,
  values: FormValueMap,
  setValues: (updater: (prev: FormValueMap) => FormValueMap) => void,
  handleSubmit: () => void,
): ReactNode {
  return (Array.isArray(children) ? children : [children]).map((child, index) => {
    if (!isValidElement(child)) {
      return child;
    }

    const element = child as ReactElement<Record<string, any>>;

    const nextChildren = element.props.children
      ? enhanceChildren(element.props.children, values, setValues, handleSubmit)
      : element.props.children;

    const childName = typeof element.type === 'function' ? element.type.name : '';
    const fieldName = buildFieldName(element.props.id);

    if (childName === 'Input') {
      return cloneElement(element, {
        key: element.key ?? index,
        value: values[fieldName] ?? normalizeFieldValue(element.props.value),
        onChange: (event: { target: { value: string } }) => {
          const nextValue = event?.target?.value ?? '';
          setValues((prev) => ({ ...prev, [fieldName]: nextValue }));
        },
      });
    }

    if (childName === 'Select') {
      return cloneElement(element, {
        key: element.key ?? index,
        value: values[fieldName] ?? normalizeFieldValue(element.props.value),
        onChange: (value: string) => {
          setValues((prev) => ({ ...prev, [fieldName]: value }));
        },
      });
    }

    if (childName === 'DatePicker') {
      return cloneElement(element, {
        key: element.key ?? index,
        value: values[fieldName] ?? normalizeFieldValue(element.props.value),
        onChange: (_value: unknown, dateString: string | string[]) => {
          const nextValue = Array.isArray(dateString) ? dateString[0] ?? '' : dateString ?? '';
          setValues((prev) => ({ ...prev, [fieldName]: nextValue }));
        },
      });
    }

    if (childName === 'Button') {
      return cloneElement(element, {
        key: element.key ?? index,
        onClick: () => handleSubmit(),
      });
    }

    return cloneElement(element, {
      key: element.key ?? index,
      children: nextChildren,
    });
  });
}

export default function Form({
  title,
  layout,
  children,
  styles,
  formId,
  collectData,
}: CommonComponentProps) {
  const { message } = App.useApp()
  const [submitting, setSubmitting] = useState(false)
  const [values, setValues] = useState<FormValueMap>({})

  const enhancedChildren = useMemo(
    () => enhanceChildren(children, values, setValues, handleSubmit),
    [children, values],
  )

  async function handleSubmit() {
    if (!collectData) {
      message.info('当前表单未启用数据收集')
      return
    }

    if (!formId || typeof formId !== 'string') {
      message.warning('请先为表单配置 formId')
      return
    }

    setSubmitting(true)
    try {
      await submitForm(formId, values)
      message.success('表单提交成功')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles}>
      {typeof title === 'string' && title ? (
        <div style={{ marginBottom: 16, fontWeight: 600 }}>{title}</div>
      ) : null}
      <AntdForm layout={normalizeFormLayout(layout)}>
        {enhancedChildren}
        {submitting ? <div style={{ marginTop: 12, color: 'rgb(var(--text-secondary))' }}>提交中...</div> : null}
      </AntdForm>
    </div>
  )
}
