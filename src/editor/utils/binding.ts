interface RuntimeLike {
  variables: Record<string, unknown>
  requestResults: Record<string, unknown>
}

export function resolveBindingExpression(expression: string, runtime: RuntimeLike): unknown {
  if (!expression.includes('{{')) {
    return getByPath(runtime, expression)
  }

  return expression.replace(/\{\{([^}]+)\}\}/g, (_, path: string) => {
    const value = getByPath(runtime, path.trim())
    return value === undefined || value === null ? '' : String(value)
  })
}

export function resolveBindingsMap(
  props: Record<string, unknown>,
  bindings: Record<string, string> | undefined,
  runtime: RuntimeLike,
): Record<string, unknown> {
  if (!bindings) {
    return props
  }

  return Object.entries(bindings).reduce<Record<string, unknown>>((acc, [key, expression]) => {
    const resolved = resolveBindingExpression(expression, runtime)
    if (resolved !== undefined) {
      acc[key] = resolved
    }
    return acc
  }, { ...props })
}

function getByPath(source: unknown, path: string): unknown {
  if (!path.trim()) {
    return undefined
  }

  return path
    .split('.')
    .reduce<unknown>((current, key) => {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined
      }

      return (current as Record<string, unknown>)[key]
    }, source)
}
