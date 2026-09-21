import { defineConfig } from 'prisma'

export default defineConfig({
  orm: {
    schemaPath: './prisma/schema.prisma',
  },
})
