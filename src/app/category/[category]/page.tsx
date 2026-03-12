import { getPostsByCategory, getAllCategories } from '@/lib/posts';
import PostCard from '@/components/blog/PostCard';
import { generateCategoryMetadata } from '@/components/seo/SEOMeta';
import { CATEGORIES } from '@/lib/constants';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({
    category: encodeURIComponent(category),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const decoded = decodeURIComponent(category);
  return generateCategoryMetadata(decoded);
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const decoded = decodeURIComponent(category);
  const posts = await getPostsByCategory(decoded);
  const categoryInfo = CATEGORIES[decoded as keyof typeof CATEGORIES];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Category Header */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          {categoryInfo && (
            <span
              className={`inline-block w-2 h-8 rounded-full bg-gradient-to-b ${categoryInfo.gradient}`}
            />
          )}
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
            {categoryInfo?.label || decoded}
          </h1>
        </div>
        {categoryInfo && (
          <p className="text-muted ml-5">{categoryInfo.description}</p>
        )}
        <p className="text-sm text-muted mt-3 ml-5">{posts.length}개의 글</p>
      </section>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <section className="text-center py-24">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary-light flex items-center justify-center">
            <span className="text-2xl text-primary">&#128196;</span>
          </div>
          <p className="text-lg font-medium text-foreground mb-2">
            이 카테고리에 아직 글이 없습니다
          </p>
          <p className="text-sm text-muted">곧 새로운 콘텐츠가 올라옵니다!</p>
        </section>
      )}
    </div>
  );
}
