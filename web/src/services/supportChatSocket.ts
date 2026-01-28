import { io, Socket } from 'socket.io-client';
import apiClient from '../config/api';

const resolveSocketUrl = () => {
  const base = apiClient.defaults.baseURL || '';
  return base.replace(/\/api\/?$/, '');
};

export const createSupportChatSocket = (): Socket => {
  const token = localStorage.getItem('accessToken');
  return io(`${resolveSocketUrl()}/support-chat`, {
    transports: ['websocket'],
    auth: token ? { token } : undefined,
  });
};
