import { useCallback, useEffect, useState } from 'react';
import { App, Button, Card, Input, Rate, Space, Tag, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createMarketReview,
  getMarketComponent,
  getMarketLikes,
  getMarketReviews,
  getMarketTemplate,
  installMarketComponent,
  toggleMarketLike,
  type CustomComponentMarketItem,
  type MarketReview,
  type MarketTemplateItem,
} from '../api/market';
import { installMarketComponentIntoEditor } from './market-install';
import { createProject } from '../api/projects';
import { saveProjectMeta } from '../editor/utils/project-meta';
import type { Component } from '../editor/stores/components';
import type { DataSource } from '../editor/stores/data-source';
import type { SharedStyleDefinition } from '../editor/stores/shared-styles';
import type { EditorPage } from '../editor/utils/page-model';

export default function MarketDetail() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { type, id } = useParams();
  const [item, setItem] = useState<CustomComponentMarketItem | MarketTemplateItem | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [reviews, setReviews] = useState<MarketReview[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');

  const isComponent = type === 'component';

  const load = useCallback(async () => {
    if (!id || !type) return;
    const detail = isComponent ? await getMarketComponent(id) : await getMarketTemplate(id);
    const likes = await getMarketLikes(isComponent ? 'component' : 'template', id);
    const reviewsResult = await getMarketReviews(isComponent ? 'component' : 'template', id);
    setItem(detail);
    setLiked(likes.liked);
    setLikeCount(likes.count);
    setReviews(reviewsResult.reviews);
  }, [id, isComponent, type]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!item) {
    return null;
  }

  return (
    <div className="app-page px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {'displayName' in item ? item.displayName : item.name}
            </h1>
            <p className="text-sm text-text-secondary">{item.description || '无描述'}</p>
          </div>
          <Button onClick={() => navigate('/market')}>返回市场</Button>
        </div>

        <Card className="border border-border-light bg-bg-secondary shadow-soft">
          <div className="mb-4 flex items-center gap-3">
            <Tag>{item.category}</Tag>
            <Tag>{isComponent ? `下载 ${(item as CustomComponentMarketItem).downloads}` : `使用 ${(item as MarketTemplateItem).useCount}`}</Tag>
            <Tag>{`评分 ${item.avgRating ?? 0}`}</Tag>
          </div>
          <Space wrap>
            <Button
              type="primary"
              onClick={async () => {
                if (!id) return;
                if (isComponent) {
                  const installed = await installMarketComponent(id);
                  installMarketComponentIntoEditor(installed);
                  message.success('组件已安装到物料面板');
                } else {
                  const template = item as MarketTemplateItem;
                  const project = await createProject({
                    name: `${template.name}_${Date.now()}`,
                    components: template.components as Component[],
                  });
                  saveProjectMeta(project.id, {
                    dataSources: template.dataSources as unknown as DataSource[],
                    variables: template.variables,
                    pages: template.pages as EditorPage[],
                    activePageId: template.pages[0]?.id ?? null,
                    sharedStyles: template.sharedStyles as SharedStyleDefinition[],
                    themeId: template.themeId,
                  });
                  message.success('已从市场模板创建项目');
                  navigate(`/editor/${project.id}`);
                }
              }}
            >
              {isComponent ? '添加到物料面板' : '使用模板'}
            </Button>
            <Button
              onClick={async () => {
                if (!id) return;
                const result = await toggleMarketLike(
                  isComponent ? 'component' : 'template',
                  id,
                );
                setLiked(result.liked);
                setLikeCount(result.count);
              }}
            >
              {liked ? '取消点赞' : '点赞'} ({likeCount})
            </Button>
          </Space>
        </Card>

        <Card title="评论" className="border border-border-light bg-bg-secondary shadow-soft">
          <div className="mb-4 flex flex-col gap-3">
            <Rate value={reviewRating} onChange={setReviewRating} />
            <Input.TextArea
              rows={4}
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="写下你的评价"
            />
            <Button
              type="primary"
              onClick={async () => {
                if (!id) return;
                await createMarketReview({
                  targetType: isComponent ? 'component' : 'template',
                  targetId: id,
                  rating: reviewRating,
                  content: reviewContent,
                });
                setReviewContent('');
                message.success('评论成功');
                await load();
              }}
            >
              提交评论
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <Card key={review.id} size="small" className="border border-border-light bg-bg-secondary">
                <Space direction="vertical">
                  <Rate disabled value={review.rating} />
                  <Typography.Text>{review.content}</Typography.Text>
                  <Typography.Text type="secondary">
                    {new Date(review.createdAt).toLocaleString('zh-CN')}
                  </Typography.Text>
                </Space>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
