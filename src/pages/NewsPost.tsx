import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { getNewsPostBySlug, NewsPost } from '@/lib/contentful';
import { formatDate, getCategoryColor } from '@/lib/utils';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';

const NewsPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      setError(false);
      try {
        const lang = i18n.language === 'ro' ? 'ro' : 'en';
        const data = await getNewsPostBySlug(slug, lang);
        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, i18n.language]);

  const richTextOptions = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (_node: any, children: any) => (
        <p className="mb-4 text-foreground leading-relaxed">{children}</p>
      ),
      [BLOCKS.HEADING_2]: (_node: any, children: any) => (
        <h2 className="text-2xl font-bold mt-8 mb-4 text-primary">{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (_node: any, children: any) => (
        <h3 className="text-xl font-bold mt-6 mb-3 text-primary">{children}</h3>
      ),
      [BLOCKS.UL_LIST]: (_node: any, children: any) => (
        <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (_node: any, children: any) => (
        <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
      ),
      [INLINES.HYPERLINK]: (node: any, children: any) => (
        <a
          href={node.data.uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {children}
        </a>
      ),
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4 text-destructive">
              {i18n.language === 'ro' ? 'Articol negăsit' : 'Post not found'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {i18n.language === 'ro' 
                ? 'Ne pare rău, articolul căutat nu există sau a fost șters.'
                : 'Sorry, the post you are looking for does not exist or has been deleted.'}
            </p>
            <Button asChild>
              <Link to="/news">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {i18n.language === 'ro' ? 'Înapoi la Noutăți' : 'Back to News'}
              </Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const title = i18n.language === 'ro' ? post.title : post.titleEn;
  const content = i18n.language === 'ro' ? post.content : post.contentEn;

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <section className="py-6 border-b bg-background">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild>
            <Link to="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {i18n.language === 'ro' ? 'Înapoi la Noutăți' : 'Back to News'}
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Image */}
      <section className="relative w-full h-[400px] md:h-[500px]">
        <img
          src={post.featuredImageUrl || '/news-placeholder.jpg'}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/news-placeholder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </section>

      {/* Post Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
            <span className="text-muted-foreground">
              {formatDate(post.publicationDate, i18n.language as 'ro' | 'en')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-foreground">
            {title}
          </h1>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {documentToReactComponents(content, richTextOptions)}
          </div>

          {/* Additional Images */}
          {post.additionalImages && post.additionalImages.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-primary">
                {i18n.language === 'ro' ? 'Galerie foto' : 'Photo Gallery'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {post.additionalImages.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl || '/news-placeholder.jpg'}
                    alt={`${title} - ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow"
                    onError={(e) => {
                      e.currentTarget.src = '/news-placeholder.jpg';
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Facebook Link */}
          {post.facebookLink && (
            <div className="mt-8 p-6 bg-muted rounded-lg">
              <Button asChild variant="default">
                <a
                  href={post.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {i18n.language === 'ro' ? 'Vezi pe Facebook' : 'View on Facebook'}
                </a>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NewsPostPage;
