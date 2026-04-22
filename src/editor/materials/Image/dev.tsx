import { Image as AntdImage } from 'antd'
import type { CommonComponentProps } from '../../interface'
import { resolveAssetUrl } from '../../../api/files'

/**
 * 从URL中提取真正的图片地址
 * 如果URL是百度图片搜索详情页，尝试提取objurl参数中的真实图片URL
 */
function extractImageUrl(url: string): string {
    if (!url) return ''

    try {
        // 检查是否是百度图片搜索URL
        if (url.includes('image.baidu.com') && url.includes('objurl=')) {
            const urlObj = new URL(url)
            const objurl = urlObj.searchParams.get('objurl')
            if (objurl) {
                return decodeURIComponent(objurl)
            }
        }
        return url
    } catch {
        // 如果URL解析失败，返回原URL
        return url
    }
}

export default function Image({ id, src, alt, width, height, styles }: CommonComponentProps) {
    // 处理空值
    const rawSrc = (src === undefined || src === null || src === '')
        ? 'https://via.placeholder.com/300x200'
        : src

    // 提取真正的图片URL（如果是百度图片URL）
    const imageSrc = resolveAssetUrl(extractImageUrl(rawSrc))

    return (
        <AntdImage
            data-component-id={id}
            src={imageSrc}
            alt={alt || '图片'}
            width={width || 200}
            height={height || 200}
            style={styles}
            preview={false}
            fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E图片加载失败%3C/text%3E%3C/svg%3E"
        />
    )
}

