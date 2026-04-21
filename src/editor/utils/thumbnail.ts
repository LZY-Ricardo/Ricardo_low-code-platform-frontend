/**
 * 缩略图生成工具
 * 使用 html2canvas 对编辑器画布截图，压缩为 base64
 */

/**
 * 生成画布缩略图
 * @param element 要截图的 DOM 元素（通常是编辑器画布）
 * @param maxWidth 最大宽度，默认 300
 * @param maxHeight 最大高度，默认 200
 * @returns base64 字符串（JPEG），失败返回 null
 */
export async function generateThumbnail(
  element: HTMLElement,
  maxWidth = 300,
  maxHeight = 200,
): Promise<string | null> {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, {
      scale: maxWidth / element.offsetWidth,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // 缩放到目标尺寸
    const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
    const targetWidth = Math.round(canvas.width * ratio);
    const targetHeight = Math.round(canvas.height * ratio);

    const resizeCanvas = document.createElement('canvas');
    resizeCanvas.width = targetWidth;
    resizeCanvas.height = targetHeight;
    const ctx = resizeCanvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
    return resizeCanvas.toDataURL('image/jpeg', 0.6);
  } catch (err) {
    console.warn('缩略图生成失败:', err);
    return null;
  }
}
