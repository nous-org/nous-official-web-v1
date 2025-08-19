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

export const collections = {
  termsandconditions,
  privacypolicy,
};