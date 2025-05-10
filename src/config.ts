interface Config {
  SOCKET_URL: string;
  API_BASE_URL: string;
  SOCKET_OPTIONS: {
    path: string;
    transports: string[];
    withCredentials: boolean;
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
    reconnectionDelayMax: number;
    timeout: number;
    secure: boolean;
    autoConnect: boolean;
    forceNew: boolean;
  };
}

const development: Config = {
  SOCKET_URL: 'http://localhost:3001',
  API_BASE_URL: 'http://localhost:3001/api',
  SOCKET_OPTIONS: {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 60000,
    secure: false,
    autoConnect: true,
    forceNew: true
  }
};

const production: Config = {
  SOCKET_URL: (import.meta.env.VITE_SOCKET_URL || 'https://newz-backend.vercel.app').replace(/\/$/, ''),
  API_BASE_URL: `${(import.meta.env.VITE_API_URL || 'https://newz-backend.vercel.app').replace(/\/$/, '')}/api`,
  SOCKET_OPTIONS: {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 60000,
    secure: true,
    autoConnect: true,
    forceNew: true
  }
};

const config: Config = import.meta.env ? production : development;

export default config; 