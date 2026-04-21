import type { MessageInstance } from 'antd/es/message/interface';

let messageApi: MessageInstance | null = null;

export function setMessageApi(instance: MessageInstance) {
  messageApi = instance;
}

function getMessageApi() {
  return messageApi;
}

export function showSuccess(content: string) {
  getMessageApi()?.success(content);
}

export function showWarning(content: string) {
  getMessageApi()?.warning(content);
}

export function showError(content: string) {
  getMessageApi()?.error(content);
}
