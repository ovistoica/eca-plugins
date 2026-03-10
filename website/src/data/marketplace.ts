import type { Plugin } from '../types/plugin';
import data from '../../../.eca-plugin/marketplace.json';

/** All plugins from the marketplace registry, typed. */
export const plugins: Plugin[] = data.plugins as Plugin[];

/** Look up a single plugin by its unique name. */
export function getPluginByName(name: string): Plugin | undefined {
  return plugins.find(p => p.name === name);
}

/** Distinct category list (sorted, no duplicates). */
export function getCategories(): string[] {
  return [...new Set(plugins.map(p => p.category))].sort();
}
