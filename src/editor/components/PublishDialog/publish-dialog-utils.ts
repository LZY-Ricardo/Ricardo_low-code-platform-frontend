import { isLocalPublishedPageUrl, type PublishResult } from '../../../api/publish'

export const PUBLISH_SLUG_PATTERN = /^[a-z0-9-\u4e00-\u9fa5]+$/
export const PUBLISH_SLUG_HINT = '支持中文、小写字母、数字和连字符，例如 system-settings 或 系统设置'

export function getPublishStatusText(result: PublishResult | null) {
  if (!result) {
    return '未发布'
  }

  return `已发布 · v${result.version}`
}

export function normalizePublishRequest(values: {
  slug?: string
  title?: string
  description?: string
}) {
  const normalizedSlug = typeof values.slug === 'string' ? values.slug.trim() : values.slug

  return {
    ...(normalizedSlug ? { slug: normalizedSlug } : {}),
    ...(values.title !== undefined ? { title: values.title } : {}),
    ...(values.description !== undefined ? { description: values.description } : {}),
  }
}

export function buildPublishAccessHint(url: string) {
  if (!url || !isLocalPublishedPageUrl(url)) {
    return ''
  }

  return '当前链接使用本地地址，二维码仅当前设备可用。跨设备访问请改用局域网地址或配置公网域名。'
}
