import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string(),
    subtitle:    z.string(),
    award:       z.string().optional(),
    awardShort:  z.string().optional(),
    badge:       z.string().optional(),
    role:        z.string().optional(),
    period:      z.string().optional(),
    status:      z.enum(['active', 'poc', 'archived']).default('active'),
    featured:    z.boolean().default(false),
    tags:        z.array(z.string()).default([]),
    githubUrl:   z.string().url().optional(),
    demoUrl:     z.string().url().optional(),
    description: z.string(),
    architecturePillars: z.array(z.object({
      icon:        z.string(),
      title:       z.string(),
      description: z.string(),
      tags:        z.array(z.string()).default([]),
    })).optional(),
    metrics: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).optional(),
    scenarios: z.array(z.object({
      id:      z.string(),
      title:   z.string(),
      outcome: z.enum(['clear', 'alert', 'critical']),
      summary: z.string(),
    })).optional(),
  }),
});

export const collections = { projects };
