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
    <div data-component-id={id} style={styles}>
      <iframe
        title={typeof rest.title === 'string' ? rest.title : `market-runtime-${id}`}
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        className="w-full min-h-[140px] border-0 bg-transparent"
      />
    </div>
  );
}
