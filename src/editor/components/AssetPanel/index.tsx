import { useEffect, useMemo, useState } from 'react';
import {
  App,
  Button,
  Empty,
  Image,
  Pagination,
  Popconfirm,
  Segmented,
  Spin,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { UploadProps } from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  InboxOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import {
  deleteFile,
  getFiles,
  resolveAssetUrl,
  uploadFile,
  type AssetType,
  type FileAsset,
} from '../../../api/files';

const { Dragger } = Upload;
const { Text } = Typography;

export interface AssetPanelProps {
  selectable?: boolean;
  onSelect?: (asset: FileAsset) => void;
  projectId?: string;
}

const FILTER_OPTIONS: Array<{ label: string; value: AssetType | 'all' }> = [
  { label: '全部', value: 'all' },
  { label: '图片', value: 'image' },
  { label: '文档', value: 'document' },
  { label: '视频', value: 'video' },
];

export function getAssetPreviewMeta(asset: Pick<FileAsset, 'type' | 'url' | 'originalName'>) {
  if (asset.type === 'image') {
    return {
      mode: 'image' as const,
      src: resolveAssetUrl(asset.url),
      text: asset.originalName,
    };
  }

  return {
    mode: 'text' as const,
    src: '',
    text: asset.type === 'video' ? '视频资源' : '文档资源',
  };
}

function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AssetPanel({
  selectable = false,
  onSelect,
  projectId,
}: AssetPanelProps) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState<FileAsset[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<AssetType | 'all'>('all');

  const query = useMemo(
    () => ({
      page,
      pageSize,
      type: filter === 'all' ? undefined : filter,
    }),
    [filter, page, pageSize],
  );

  const loadAssets = async () => {
    setLoading(true);
    try {
      const result = await getFiles(query);
      setAssets(result.files);
      setTotal(result.pagination.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAssets();
  }, [page, filter]);

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const file = options.file as File;
    setUploading(true);
    try {
      await uploadFile(file, projectId);
      message.success(`"${file.name}" 上传成功`);
      setPage(1);
      await loadAssets();
      options.onSuccess?.({}, file);
    } catch (error) {
      options.onError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      message.error('文件大小不能超过 5MB');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleCopy = async (asset: FileAsset) => {
    const target = resolveAssetUrl(asset.url);
    await navigator.clipboard.writeText(target);
    message.success('链接已复制');
  };

  const handleDelete = async (asset: FileAsset) => {
    await deleteFile(asset.id);
    message.success('文件已删除');
    await loadAssets();
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <Dragger
        accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp,application/pdf,video/mp4"
        multiple={false}
        showUploadList={false}
        customRequest={handleUpload}
        beforeUpload={beforeUpload}
        disabled={uploading}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">拖拽文件到这里，或点击上传</p>
        <p className="ant-upload-hint">支持图片、PDF、MP4，单文件不超过 5MB</p>
      </Dragger>

      <Segmented
        value={filter}
        options={FILTER_OPTIONS}
        onChange={(value) => {
          setPage(1);
          setFilter(value as AssetType | 'all');
        }}
        block
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spin />
          </div>
        ) : assets.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Empty description="暂无资源" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {assets.map((asset) => {
              const preview = getAssetPreviewMeta(asset);
              return (
                <div
                  key={asset.id}
                  className="rounded-lg border border-border-light bg-bg-secondary p-3 shadow-soft"
                >
                  <div
                    className={`mb-3 overflow-hidden rounded-md border border-border-light ${
                      selectable ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => selectable && onSelect?.(asset)}
                  >
                    {preview.mode === 'image' ? (
                      <Image
                        src={preview.src}
                        alt={asset.originalName}
                        preview={false}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center bg-white text-text-secondary">
                        <div className="text-center">
                          <Tag>{asset.type === 'video' ? '视频' : '文档'}</Tag>
                          <div className="mt-2">{preview.text}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <Text strong ellipsis={{ tooltip: asset.originalName }}>
                        {asset.originalName}
                      </Text>
                      <Tag>{asset.type}</Tag>
                    </div>
                    <Text type="secondary">{formatFileSize(asset.fileSize)}</Text>
                    <div className="flex flex-wrap gap-2">
                      {selectable && (
                        <Button
                          size="small"
                          type="primary"
                          icon={<LinkOutlined />}
                          onClick={() => onSelect?.(asset)}
                        >
                          选择
                        </Button>
                      )}
                      <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => void handleCopy(asset)}
                      >
                        复制链接
                      </Button>
                      <Popconfirm
                        title="确认删除该资源吗？"
                        okText="删除"
                        cancelText="取消"
                        onConfirm={() => void handleDelete(asset)}
                      >
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                        >
                          删除
                        </Button>
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Pagination
        current={page}
        pageSize={pageSize}
        total={total}
        showSizeChanger={false}
        onChange={setPage}
      />
    </div>
  );
}
