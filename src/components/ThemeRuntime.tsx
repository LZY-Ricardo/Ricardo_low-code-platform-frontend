import { useEffect } from 'react'
import { App as AntdApp, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useThemeStore } from '../stores/theme'
import AntdAppBridge from './AntdAppBridge'

export default function ThemeRuntime({ children }: { children: React.ReactNode }) {
  const activeTheme = useThemeStore((state) => state.getActiveTheme())

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--bg-primary', activeTheme.tokens.bgPrimary)
    root.style.setProperty('--bg-secondary', activeTheme.tokens.bgSecondary)
    root.style.setProperty('--border-light', activeTheme.tokens.borderLight)
    root.style.setProperty('--text-primary', activeTheme.tokens.textPrimary)
    root.style.setProperty('--text-secondary', activeTheme.tokens.textSecondary)
    root.style.setProperty('--color-primary', activeTheme.tokens.colorPrimary)
    root.style.setProperty('--color-primary-hover', activeTheme.tokens.colorPrimaryHover)
    root.style.setProperty('--color-success', activeTheme.tokens.colorSuccess)
    root.style.setProperty('--color-danger', activeTheme.tokens.colorDanger)
    root.style.setProperty('--scrollbar-thumb', activeTheme.tokens.scrollbarThumb)
    root.style.setProperty('--scrollbar-track', activeTheme.tokens.scrollbarTrack)
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
