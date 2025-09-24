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
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    draft: z.boolean().default(false),
    description: z.string(),
    excerpt: z.string().max(200), // 1-2 líneas de resumen
    tags: z.array(z.string()).max(5).default([]), // Máximo 5 tags, mostraremos 2
    author: z.object({
      name: z.string(),
      avatar: z.string().optional(), // URL del avatar
      bio: z.string().optional()
    }).default({
      name: "Nous Technologies",
      bio: "Expertos en desarrollo web y soluciones de IA"
    }),
    readingTime: z.number().optional(), // Minutos de lectura calculados
    featured: z.boolean().default(false), // Para destacar posts importantes
    category: z.enum(['AI', 'Web Development', 'Business', 'Technology', 'Tutorial']).optional()
  })
});
export const collections = {
  termsandconditions,
  privacypolicy,
  blog,
};