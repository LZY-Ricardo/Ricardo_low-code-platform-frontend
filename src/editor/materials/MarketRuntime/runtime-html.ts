export function buildMarketRuntimeHtml(code: string, props: Record<string, unknown>) {
  const normalizedCode = code.replace(/export\s+default/g, 'const __default__ =');
  const serializedCode = JSON.stringify(normalizedCode);
  const serializedProps = JSON.stringify(props);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/antd@5/dist/reset.css" />
  <style>
    html, body, #root {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      background: transparent;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    .runtime-error {
      padding: 12px;
      border: 1px solid #f5c2c7;
      background: #fff1f0;
      color: #cf1322;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/antd@5/dist/antd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@babel/standalone/babel.min.js"></script>
  <script>
    window.__MARKET_CODE__ = ${serializedCode};
    window.__MARKET_PROPS__ = ${serializedProps};
  </script>
  <script>
    (function () {
      const rootEl = document.getElementById('root');
      const renderError = (message) => {
        rootEl.innerHTML = '<div class="runtime-error">' + message + '</div>';
      };

      try {
        const source = window.__MARKET_CODE__;
        const transpiled = Babel.transform(source, {
          presets: ['react'],
        }).code;

        const factory = new Function(
          'React',
          'antd',
          transpiled + '\\nreturn typeof __default__ === "function" ? __default__ : (typeof Component === "function" ? Component : null);'
        );

        const Component = factory(window.React, window.antd);

        if (typeof Component !== 'function') {
          renderError('组件代码未导出可执行组件');
          return;
        }

        const root = window.ReactDOM.createRoot(rootEl);
        root.render(window.React.createElement(Component, window.__MARKET_PROPS__));
      } catch (error) {
        const message = error && error.message ? error.message : '组件执行失败';
        renderError(message);
      }
    })();
  </script>
</body>
</html>`;
}
