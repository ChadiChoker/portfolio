import { tool } from "ai";
import { z } from "zod";
import { searchProjects, getProject, getExperience, getServices, getContact } from "./tools";

export const aiTools = {
  search_projects: tool({
    description: "Search Chadi's projects by keyword (tech, domain, or name). Empty query returns all.",
    inputSchema: z.object({ query: z.string().max(100) }),
    execute: async ({ query }) => searchProjects(query),
  }),
  get_project: tool({
    description: "Full case study for one project by slug.",
    inputSchema: z.object({ slug: z.string() }),
    execute: async ({ slug }) => getProject(slug) ?? { error: "not found" },
  }),
  get_experience: tool({ description: "Chadi's work history and education.", inputSchema: z.object({}), execute: async () => getExperience() }),
  get_services: tool({ description: "Freelance services Chadi offers.", inputSchema: z.object({}), execute: async () => getServices() }),
  get_contact: tool({ description: "How to contact Chadi or start a project with him.", inputSchema: z.object({}), execute: async () => getContact() }),
};
