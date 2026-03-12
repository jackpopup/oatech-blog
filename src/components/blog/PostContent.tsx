import { MDXRemote } from 'next-mdx-remote/rsc';
import InlineCTA from '@/components/cta/InlineCTA';
import BottomCTA from '@/components/cta/BottomCTA';

function SafeLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = href?.startsWith('http');
  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="text-primary underline underline-offset-2 hover:text-primary-dark transition-colors"
      {...props}
    >
      {children}
    </a>
  );
}

function SafeImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { onError, onLoad, onClick, ...safeProps } = props;
  return <img src={src} alt={alt || ''} {...safeProps} />;
}

const mdxComponents = {
  InlineCTA,
  a: SafeLink,
  img: SafeImage,
  script: () => null,
  iframe: () => null,
  object: () => null,
  embed: () => null,
  form: () => null,
  input: () => null,
  textarea: () => null,
  button: () => null,
};

export default function PostContent({ content }: { content: string }) {
  return (
    <div className="prose max-w-none">
      <MDXRemote source={content} components={mdxComponents} />
      <BottomCTA />
    </div>
  );
}
