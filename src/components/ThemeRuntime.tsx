import { useEffect } from 'react'
import { App as AntdApp, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { getThemeCssVariables, useThemeStore } from '../stores/theme'
import AntdAppBridge from './AntdAppBridge'

export default function ThemeRuntime({ children }: { children: React.ReactNode }) {
  const activeTheme = useThemeStore((state) => state.getActiveTheme())

  useEffect(() => {
    const root = document.documentElement
    Object.entries(getThemeCssVariables(activeTheme)).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [activeTheme])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: `rgb(${activeTheme.tokens.colorPrimary})`,
          borderRadius: 6,
          colorBorder: `rgb(${activeTheme.tokens.borderLight})`,
          colorBgContainer: `rgb(${activeTheme.tokens.bgSecondary})`,
          colorText: `rgb(${activeTheme.tokens.textPrimary})`,
          colorTextSecondary: `rgb(${activeTheme.tokens.textSecondary})`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      <AntdApp>
        <AntdAppBridge />
        {children}
      </AntdApp>
    </ConfigProvider>
  )
}
