/** Shape of a single plugin entry in marketplace.json */
export interface Plugin {
  name: string;
  description: string;
  source: string;
  category: string;
  tags: string[];
  author: string;
  icon: string;
  featured: boolean;
}
