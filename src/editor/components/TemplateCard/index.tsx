import { Card, Button, Badge, Dropdown } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { TemplateItem, TemplateCategory } from '../../../api/templates';
import { CATEGORY_LABELS } from '../../../api/templates';
import { useThemeColors } from '../../../stores/theme';

interface TemplateCardProps {
  template: TemplateItem;
  onUse: (template: TemplateItem) => void;
  onEdit?: (template: TemplateItem) => void;
  onDelete?: (template: TemplateItem) => void;
}

const PLACEHOLDER_THUMBNAIL = (
  <div className="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
    <AppstoreOutlined className="text-4xl text-gray-300" />
  </div>
);

export default function TemplateCard({ template, onUse, onEdit, onDelete }: TemplateCardProps) {
  const isOwner = !template.builtIn && template.userId;
  const themeColors = useThemeColors();

  const menuItems: MenuProps['items'] = [
    ...(isOwner && onEdit
      ? [
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: '编辑信息',
            onClick: () => onEdit(template),
          },
        ]
      : []),
    ...(isOwner && onDelete
      ? [
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            danger: true,
            label: '删除模板',
            onClick: () => onDelete(template),
          },
        ]
      : []),
  ];

  return (
    <Card
      hoverable
      className="overflow-hidden"
      styles={{ body: { padding: 0 } }}
    >
      {/* 缩略图 */}
      <div className="relative">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-36 object-cover"
          />
        ) : (
          PLACEHOLDER_THUMBNAIL
        )}
        {/* 标签 */}
        <div className="absolute top-2 left-2 flex gap-1">
          {template.builtIn ? (
            <Badge
              count="内置"
              style={{ backgroundColor: themeColors.primary }}
              className="text-xs"
            />
          ) : (
            <Badge
              count="自定义"
              style={{ backgroundColor: themeColors.success }}
              className="text-xs"
            />
          )}
        </div>
        {/* 操作菜单 */}
        {menuItems && menuItems.length > 0 && (
          <div className="absolute top-2 right-2">
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                className="bg-white/80 hover:bg-white shadow-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </div>
        )}
      </div>

      {/* 信息区 */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-text-primary truncate flex-1">
            {template.name}
          </h4>
          <span className="text-xs text-text-secondary ml-2 whitespace-nowrap">
            {template.useCount} 次使用
          </span>
        </div>

        <p className="text-xs text-text-secondary line-clamp-2 min-h-[2rem]">
          {template.description || '暂无描述'}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs px-2 py-0.5 rounded bg-bg-primary text-text-secondary">
            {CATEGORY_LABELS[template.category as TemplateCategory] || '通用'}
          </span>
          <Button
            type="primary"
            size="small"
            onClick={() => onUse(template)}
          >
            使用模板
          </Button>
        </div>
      </div>
    </Card>
  );
}
