import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const legalCompanySchema = z.object({
  name: z.string(),
  address: z.string(),
  email: z.string(),
  phone: z.string(),
});

const legalPageSchema = z.object({
  title: z.string(),
  description: z.string(),
  effectiveDate: z.string(),
  language: z.string(),
  lastUpdated: z.string(),
  company: legalCompanySchema,
});

const termsandconditions = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/termsandconditions',
  }),
  schema: legalPageSchema,
});

const privacypolicy = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/privacypolicy',
  }),
  schema: legalPageSchema,
});

export const collections = {
  termsandconditions,
  privacypolicy,
};
