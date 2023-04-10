import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const isExternal = (id: string) => !id.startsWith('.') && !path.isAbsolute(id);

export default defineConfig(() => ({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/shotbro-client.ts'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: isExternal,
    },
  },
  plugins: [dts()],
}));
