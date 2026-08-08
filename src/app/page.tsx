import { getBooks } from "@/data/books";
import { CoverPage } from "@/components/ui/CoverPage";

export default async function HomePage() {
  const books = await getBooks();

  return <CoverPage books={books} />;
}
