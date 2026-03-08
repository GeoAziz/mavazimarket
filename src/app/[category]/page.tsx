
import { mockCategories, mockProducts } from '@/lib/mock-data';
import type { Category, Product } from '@/lib/types';
import { CategoryDisplay } from '@/components/categories/CategoryDisplay'; // New client component

export async function generateStaticParams() {
  return mockCategories.map((category) => ({
    category: category.slug,
  }));
}

interface CategoryPageProps {
  params: { category: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categorySlug = params.category;
  const category = mockCategories.find(c => c.slug === categorySlug);

  if (!category) {
    // This can be handled by a not-found() call in a real app
    // or let Next.js handle it based on generateStaticParams behavior for dynamic segments.
    // For now, if generateStaticParams is exhaustive, this shouldn't be hit for those paths.
    // If it's a truly dynamic segment not covered by generateStaticParams, Next.js would 404
    // or try to render it dynamically if fallback is not false.
    // Consider adding notFound() from 'next/navigation' here for explicit 404s.
    return <div className="text-center py-10">Category not found.</div>;
  }

  const productsInCategory: Product[] = mockProducts.filter(
    (product) => product.category === category.id
  );

  return <CategoryDisplay category={category} productsInCategory={productsInCategory} />;
}
