import Link from 'next/link';
import type { Post } from '@/lib/types';
import { CATEGORIES, formatDate } from '@/lib/constants';

export default function PostCard({ post }: { post: Post }) {
  const categoryInfo = CATEGORIES[post.category];

  return (
    <article className="group bg-white border border-border rounded-card overflow-hidden hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Category Gradient Banner */}
        <div
          className={`h-2 bg-gradient-to-r ${categoryInfo?.gradient || 'from-primary to-violet-500'}`}
        />

        <div className="p-6">
          {/* Category + Reading Time */}
          <div className="flex items-center justify-between mb-3">
            <span className="inline-block bg-primary-light text-primary text-xs font-semibold px-2.5 py-1 rounded-badge">
              {post.category}
            </span>
            <span className="text-xs text-muted">{post.readingTime}분 읽기</span>
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-muted line-clamp-2 mb-4 leading-relaxed">
            {post.description}
          </p>

          {/* Footer: Date + Tags */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <time dateTime={post.date} className="text-xs text-muted">
              {formatDate(post.date)}
            </time>
            <div className="flex gap-1.5">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-muted bg-background px-2 py-0.5 rounded-badge"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
