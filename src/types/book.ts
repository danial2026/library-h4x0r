export interface Book {
  id: string;
  title: string;
  author: string | null;
  category: string;
  format: "pdf" | "epub" | "html" | "other";
  filename: string;
  path: string;
  description: string | null;
  tags: string[];
  pages: number | null;
  color: string;
  foil: string;
  cover?: string | null;
}

export type BookCategory =
  | "DevOps"
  | "Security"
  | "Programming"
  | "Blockchain"
  | "Networking"
  | "Other";
