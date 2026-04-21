import { App as AntdApp } from 'antd';
import { useEffect } from 'react';
import { setMessageApi } from '../utils/antdApp';

export default function AntdAppBridge() {
  const { message } = AntdApp.useApp();

  useEffect(() => {
    setMessageApi(message);
  }, [message]);

  return null;
}
