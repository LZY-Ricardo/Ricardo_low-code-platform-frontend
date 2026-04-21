import { aiClient } from '../../api/client';
import type { Component } from '../stores/components';
import type { DataSource } from '../stores/data-source';

export interface GeneratePageRequest {
  prompt: string;
  components: Component[];
  currentThemeId: string | null;
  currentProjectId?: string;
}

export interface GeneratePageResult {
  taskType: 'generate-page';
  summary: string;
  patches: Component[];
  warnings: string[];
  confidence: number;
  source: 'openrouter' | 'fallback';
  sourceModel?: string;
  sourceProvider?: string;
  fallbackReason?: string;
}

export interface EditSelectionRequest {
  prompt: string;
  components: Component[];
  selectedComponentId: number;
  currentThemeId: string | null;
  currentProjectId?: string;
  selectionSummary?: string;
  conversationSummary?: string;
}

export interface EditSelectionResult {
  taskType: 'edit-selection';
  summary: string;
  targetComponentId: number;
  operation: 'replace';
  patch: Component;
  warnings: string[];
  confidence: number;
  source: 'openrouter' | 'fallback';
  sourceModel?: string;
  sourceProvider?: string;
  fallbackReason?: string;
}

export interface BindDataRequest {
  components: Component[];
  dataSources: DataSource[];
  prompt?: string;
  currentThemeId: string | null;
  currentProjectId?: string;
  selectedComponentId?: number;
  conversationSummary?: string;
}

export interface BindDataSuggestion {
  componentId: number;
  componentName: string;
  bindings: Record<string, string>;
  dataSourceId?: string;
  resultKey?: string;
  stateSuggestions: string[];
}

export interface BindDataResult {
  taskType: 'bind-data';
  summary: string;
  suggestions: BindDataSuggestion[];
  warnings: string[];
  confidence: number;
  source: 'openrouter' | 'fallback';
  sourceModel?: string;
  sourceProvider?: string;
  fallbackReason?: string;
}

export interface ActionSuggestion {
  componentId: number;
  eventType: string;
  actionType: string;
  actionConfig: Record<string, unknown>;
  reason: string;
}

export interface GenerateActionRequest {
  components: Component[];
  dataSources: DataSource[];
  prompt?: string;
  currentThemeId: string | null;
  currentProjectId?: string;
  selectedComponentId?: number;
  conversationSummary?: string;
}

export interface GenerateActionResult {
  taskType: 'generate-action';
  summary: string;
  suggestions: ActionSuggestion[];
  warnings: string[];
  confidence: number;
  source: 'openrouter' | 'fallback';
  sourceModel?: string;
  sourceProvider?: string;
  fallbackReason?: string;
}

interface BackendResponse<T> {
  code: number;
  message: string;
  data: T;
}

export async function generatePage(
  payload: GeneratePageRequest,
): Promise<GeneratePageResult> {
  const response = await aiClient.post<BackendResponse<GeneratePageResult>>(
    '/ai/generate-page',
    payload,
  );

  return response.data.data;
}

export async function editSelection(
  payload: EditSelectionRequest,
): Promise<EditSelectionResult> {
  const response = await aiClient.post<BackendResponse<EditSelectionResult>>(
    '/ai/edit-selection',
    payload,
  );

  return response.data.data;
}

export async function bindData(
  payload: BindDataRequest,
): Promise<BindDataResult> {
  const response = await aiClient.post<BackendResponse<BindDataResult>>(
    '/ai/bind-data',
    payload,
  );
  return response.data.data;
}

export async function generateAction(
  payload: GenerateActionRequest,
): Promise<GenerateActionResult> {
  const response = await aiClient.post<BackendResponse<GenerateActionResult>>(
    '/ai/generate-action',
    payload,
  );
  return response.data.data;
}
