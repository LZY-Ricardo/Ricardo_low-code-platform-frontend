import { Card, Tag } from 'antd';
import type { CommonComponentProps } from '../../interface';

export default function MarketComponentDev({
  id,
  title,
  description,
  category,
  styles,
}: CommonComponentProps) {
  return (
    <div data-component-id={id} style={styles}>
      <Card size="small" title={title || '市场组件'}>
        <div className="flex flex-col gap-2">
          <div className="text-sm text-gray-600">{description || '已安装的市场组件'}</div>
          {category ? <Tag>{category}</Tag> : null}
        </div>
      </Card>
    </div>
  );
}
