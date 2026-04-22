import type { ReactNode } from 'react';
import { Avatar, Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  AppstoreOutlined,
  CompassOutlined,
  FolderOpenOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { THEME_PRESETS, useThemeStore } from '../stores/theme';
import { useAuthStore } from '../stores/auth';
import { showSuccess } from '../utils/antdApp';
import { resolveAssetUrl } from '../api/files';

type WorkspaceSection = 'projects' | 'templates' | 'market' | 'settings';

interface WorkspaceHeaderProps {
  active?: WorkspaceSection;
}

const NAV_ITEMS: Array<{
  key: WorkspaceSection;
  label: string;
  path: string;
  icon: ReactNode;
}> = [
  { key: 'projects', label: '项目', path: '/projects', icon: <FolderOpenOutlined /> },
  { key: 'templates', label: '模板', path: '/templates', icon: <AppstoreOutlined /> },
  { key: 'market', label: '市场', path: '/market', icon: <CompassOutlined /> },
  { key: 'settings', label: '设置', path: '/settings', icon: <SettingOutlined /> },
];

export default function WorkspaceHeader({ active }: WorkspaceHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { currentThemeId, setTheme } = useThemeStore();
  const username = user?.username ?? '未登录';
  const userInitial = username.trim().charAt(0).toUpperCase() || 'U';
  const avatarStyle = {
    backgroundImage: 'linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-primary-hover)))',
  } as const;

  const handleLogout = () => {
    logout();
    showSuccess('已退出登录');
    navigate('/login');
  };

  const accountMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div className="min-w-[220px] py-1">
          <div className="text-xs uppercase tracking-[0.16em] text-text-secondary/70">当前账号</div>
          <div className="mt-2 flex items-center gap-3">
            <Avatar
              size={36}
              src={user?.avatarUrl ? resolveAssetUrl(user.avatarUrl) : undefined}
              className="font-semibold text-white"
              style={avatarStyle}
            >
              {userInitial}
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-text-primary">{username}</div>
              <div className="truncate text-xs text-text-secondary">{user?.email ?? '暂无邮箱'}</div>
            </div>
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
      onClick: () => navigate('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="border-b border-border-light bg-bg-secondary shadow-soft">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-text-primary">低代码编辑器</h1>
          <div className="flex items-center gap-1 rounded-2xl border border-border-light p-1 shadow-soft" style={{ backgroundImage: 'var(--surface-muted)' }}>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.key}
                type="text"
                onClick={() => navigate(item.path)}
                icon={item.icon}
                className={
                  active === item.key
                    ? 'h-10 rounded-xl border-0 bg-accent px-4 font-medium text-white shadow-soft hover:!bg-accent-hover hover:!text-white'
                    : 'h-10 rounded-xl border border-transparent px-4 font-medium text-text-secondary hover:border-border-light hover:bg-bg-secondary hover:text-accent'
                }
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-2xl border border-border-light bg-bg-secondary/90 p-1 shadow-soft backdrop-blur">
            {THEME_PRESETS.map((theme) => (
              <Button
                key={theme.id}
                size="small"
                type="text"
                onClick={() => setTheme(theme.id)}
                className={
                  currentThemeId === theme.id
                    ? 'h-9 rounded-xl border px-3 text-accent shadow-soft hover:!text-accent'
                    : 'h-9 rounded-xl border border-transparent px-3 text-text-secondary hover:border-border-light hover:bg-bg-primary hover:text-text-primary'
                }
                style={currentThemeId === theme.id ? { backgroundColor: 'var(--theme-primary-soft)', borderColor: 'var(--theme-primary-muted)' } : undefined}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: `rgb(${theme.tokens.colorPrimary})` }}
                  />
                  <span>{theme.name}</span>
                </span>
              </Button>
            ))}
          </div>
          <Dropdown
            menu={{ items: accountMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Avatar
              size={38}
              src={user?.avatarUrl ? resolveAssetUrl(user.avatarUrl) : undefined}
              className="cursor-pointer font-semibold text-white"
              style={{ ...avatarStyle, animation: 'avatar-breathe 3s ease-in-out infinite' }}
            >
              {userInitial}
            </Avatar>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
