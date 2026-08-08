import { getBooks } from "@/data/books";
import { notFound } from "next/navigation";
import { BookDetailPanel } from "@/components/ui/BookDetailPanel";

interface Props {
  params: { id: string };
}

export async function generateStaticParams() {
  const books = await getBooks();
  return books.map((book) => ({ id: encodeURIComponent(book.id) }));
}

export default async function BookPage({ params }: Props) {
  const books = await getBooks();
  const book = books.find((b) => encodeURIComponent(b.id) === params.id);

  if (!book) {
    notFound();
  }

  return <BookDetailPanel book={book} />;
}