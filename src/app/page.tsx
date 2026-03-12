import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import PostCard from '@/components/blog/PostCard';
import { SITE_CONFIG, CATEGORIES } from '@/lib/constants';

export default async function Home() {
  const posts = await getAllPosts();
  const featuredPost = posts[0];
  const recentPosts = posts.slice(1);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-light via-background to-accent-light">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(79,70,229,0.08),transparent_50%)]" />
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-6">
              숙박업 전문 블로그
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
              숙박업 운영의{' '}
              <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
                모든 노하우
              </span>
            </h1>
            <p className="text-lg text-muted leading-relaxed mb-8 max-w-lg">
              펜션, 모텔, 게스트하우스 운영자와 창업 준비자를 위한 실전 가이드.
              매주 새로운 인사이트를 전해드립니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#latest"
                className="bg-primary text-white px-6 py-3 rounded-button font-medium hover:bg-primary-dark hover:shadow-lg transition-all"
              >
                최신 글 보기
              </a>
              <a
                href={SITE_CONFIG.company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-primary px-6 py-3 rounded-button font-medium border border-border hover:border-primary hover:shadow-md transition-all"
              >
                오아테크 알아보기
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Category Chips */}
      <section className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {Object.entries(CATEGORIES).map(([key, { label, gradient }]) => (
            <Link
              key={key}
              href={`/category/${encodeURIComponent(key)}`}
              className={`flex-shrink-0 bg-gradient-to-r ${gradient} text-white text-sm font-medium px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all`}
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12" id="latest">
        {posts.length > 0 ? (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <section className="mb-12 animate-fade-in-up">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="block group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className={`bg-gradient-to-br ${CATEGORIES[featuredPost.category]?.gradient || 'from-primary to-violet-500'} p-8 md:p-12 flex items-center justify-center min-h-[200px]`}>
                      <span className="text-white/90 text-6xl font-extrabold opacity-20">
                        {featuredPost.category.charAt(0)}
                      </span>
                    </div>
                    <div className="p-6 md:p-10 flex flex-col justify-center">
                      <span className="inline-block w-fit bg-primary-light text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">
                        {featuredPost.category}
                      </span>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-muted line-clamp-2 mb-4">
                        {featuredPost.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <time dateTime={featuredPost.date}>
                          {new Date(featuredPost.date).toLocaleDateString('ko-KR', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </time>
                        <span className="w-1 h-1 rounded-full bg-muted" />
                        <span>{featuredPost.readingTime}분 읽기</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Recent Posts Grid */}
            {recentPosts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-foreground">최신 글</h2>
                  <span className="text-sm text-muted">{posts.length}개의 글</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentPosts.map((post, i) => (
                    <div
                      key={post.slug}
                      className={`animate-fade-in-up ${
                        i < 3 ? `animation-delay-${(i + 1) * 100}` : ''
                      }`}
                    >
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="text-center py-24">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary-light flex items-center justify-center">
              <span className="text-2xl text-primary">&#9997;</span>
            </div>
            <p className="text-lg font-medium text-foreground mb-2">아직 발행된 글이 없습니다</p>
            <p className="text-sm text-muted">곧 유익한 숙박업 운영 콘텐츠가 올라옵니다!</p>
          </section>
        )}
      </div>
    </div>
  );
}
