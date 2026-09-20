import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    role: z.string(),
    stack: z.array(z.string()),
    metrics: z.array(z.string()),
    githubUrl: z.string().url(),
    liveDemoUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
    pubDate: z.coerce.date(),
  }),
});

const publications = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    year: z.number().int(),
    abstract: z.string(),
    pdfUrl: z.string().url(),
    bibtex: z.string(),
    featured: z.boolean().default(false),
    pubDate: z.coerce.date(),
  }),
});

const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    pubDate: z.coerce.date(),
  }),
});

export const collections = { projects, publications, writing };
