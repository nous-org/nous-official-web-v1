import { defineCollection, z } from 'astro:content';

const termsandconditions = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    effectiveDate: z.string(),
    language: z.string(),
    lastUpdated: z.string(),
    company: z.object({
      name: z.string(),
      address: z.string(),
      email: z.string(),
      phone: z.string(),
    }),
  }),
});

const privacypolicy = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    effectiveDate: z.string(),
    language: z.string(),
    lastUpdated: z.string(),
    company: z.object({
      name: z.string(),
      address: z.string(),
      email: z.string(),
      phone: z.string(),
    }),
  }),
});

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    draft: z.boolean().default(false),
    description: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
});
export const collections = {
  termsandconditions,
  privacypolicy,
  blog,
};