import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'mock-api',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith('/api/instruments')) {
              res.setHeader('Content-Type', 'application/json');
              if (req.method === 'GET') {
                res.end(JSON.stringify([
                  {
                    id: 'inst-1',
                    name: '標準白金電阻溫度計 (Pt100)',
                    model: 'Fluke 5609',
                    serialNumber: 'SN-98765',
                    createdAt: 1710000000000,
                  },
                  {
                    id: 'inst-2',
                    name: '一級標準白金電阻溫度計 (Pt25)',
                    model: 'Fluke 5699',
                    serialNumber: 'SN-SPRT-001',
                    createdAt: 1710000000000,
                  }
                ]));
              } else {
                res.end(JSON.stringify({ success: true }));
              }
              return;
            }
            if (req.url?.startsWith('/api/records')) {
              res.setHeader('Content-Type', 'application/json');
              if (req.method === 'GET') {
                res.end(JSON.stringify([
                  {
                    id: 'rec-1',
                    instrumentId: 'inst-1',
                    year: 2026,
                    reportNumber: 'CAL-2026-001',
                    interceptPos: 0,
                    x1Pos: 1,
                    x2Pos: 0,
                    reportNumberNeg: '',
                    interceptNeg: 0,
                    x1Neg: 1,
                    x2Neg: 0,
                    r0: 100.000,
                    a: 3.9083e-3,
                    b: -5.775e-7,
                    c: -4.183e-12,
                    createdAt: 1710000000000,
                  }
                ]));
              } else {
                res.end(JSON.stringify({ success: true }));
              }
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
