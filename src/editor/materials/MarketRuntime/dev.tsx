import { useMemo } from 'react';
import type { CommonComponentProps } from '../../interface';
import { buildMarketRuntimeHtml } from './runtime-html';

export default function MarketRuntimeDev({
  id,
  styles,
  __marketCode,
  ...rest
}: CommonComponentProps) {
  const srcDoc = useMemo(() => {
    if (typeof __marketCode !== 'string' || !__marketCode.trim()) {
      return '';
    }
    return buildMarketRuntimeHtml(__marketCode, rest);
  }, [__marketCode, rest]);

  return (
    <div data-component-id={id} style={{ ...styles, position: 'relative' }}>
      <iframe
        title={typeof rest.title === 'string' ? rest.title : `market-runtime-${id}`}
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        className="w-full min-h-[140px] border-0 bg-transparent"
      />
      {/* 编辑模式下透明遮罩，阻止 iframe 捕获点击事件，使父组件能正常选中和悬停 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} />
    </div>
  );
}
