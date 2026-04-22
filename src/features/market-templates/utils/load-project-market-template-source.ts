import { getProject, type ProjectData } from '../../../api/projects';
import { loadProjectMeta } from '../../../editor/utils/project-meta';
import { createPage, type EditorPage } from '../../../editor/utils/page-model';
import type { DataSource } from '../../../editor/stores/data-source';
import type { SharedStyleDefinition } from '../../../editor/stores/shared-styles';

export interface MarketTemplateSource {
  components: ProjectData['components'];
  pages: EditorPage[];
  dataSources: DataSource[];
  variables: Record<string, unknown>;
  sharedStyles: SharedStyleDefinition[];
  themeId: string | null;
}

export async function loadProjectMarketTemplateSource(
  projectId: string,
): Promise<{ project: ProjectData; source: MarketTemplateSource }> {
  const project = await getProject(projectId);
  const meta = loadProjectMeta(projectId);

  return {
    project,
    source: {
      components: project.components,
      pages:
        meta.pages.length > 0 ? meta.pages : [createPage('页面 1', project.components)],
      dataSources: meta.dataSources,
      variables: meta.variables,
      sharedStyles: meta.sharedStyles,
      themeId: meta.themeId,
    },
  };
}
