import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    host: '0.0.0.0', // 모든 네트워크 인터페이스에서 접근 가능하도록 설정 (모바일 접속용)
    open: true
  },
  build: {
    sourcemap: true
  }
});


