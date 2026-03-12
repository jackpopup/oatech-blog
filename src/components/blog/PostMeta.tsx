import Link from 'next/link';
import type { Post } from '@/lib/types';
import { CATEGORIES, formatDate } from '@/lib/constants';

export default function PostMeta({ post }: { post: Post }) {
  const categoryInfo = CATEGORIES[post.category];

  return (
    <div className="mb-10">
      {/* Category Badge */}
      <Link
        href={`/category/${encodeURIComponent(post.category)}`}
        className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-badge mb-5 transition-all hover:shadow-sm bg-gradient-to-r ${categoryInfo?.gradient || 'from-primary to-violet-500'} text-white`}
      >
        {post.category}
      </Link>

      {/* Title */}
      <h1 className="text-2xl md:text-4xl font-extrabold text-foreground mb-5 leading-tight">
        {post.title}
      </h1>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
        {/* Author */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-xs font-bold">
            O
          </div>
          <div>
            <span className="font-medium text-foreground">오아테크</span>
          </div>
        </div>

        <span className="w-1 h-1 rounded-full bg-muted/50" />

        {/* Date */}
        <time dateTime={post.date}>{formatDate(post.date)}</time>

        <span className="w-1 h-1 rounded-full bg-muted/50" />

        {/* Reading Time */}
        <span>{post.readingTime}분 읽기</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-5">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs text-muted bg-background border border-border/50 px-2.5 py-1 rounded-badge"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
