'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/auth/useAuth';
import type { CommunityArticle, ArticleStatus } from '@/lib/articles/types';
import './page.scss';

const STATUS_ORDER: ArticleStatus[] = ['draft', 'rejected', 'pending', 'approved'];

const STATUS_LABEL: Record<ArticleStatus, string> = {
  draft: 'Drafts',
  pending: 'In review',
  approved: 'Published',
  rejected: 'Needs revision',
};

function MyArticlesList() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<CommunityArticle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/my-articles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const detail = data.error ?? `HTTP ${res.status}`;
          console.error('[/my-articles] server error:', detail, data);
          throw new Error(detail);
        }
        const data = await res.json();
        if (!cancelled) setArticles(data);
      } catch (err) {
        console.error('[/my-articles] fetch failed:', err);
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading…</div>;
  if (error) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  const grouped: Record<ArticleStatus, CommunityArticle[]> = {
    draft: [],
    pending: [],
    approved: [],
    rejected: [],
  };
  for (const a of articles) grouped[a.status]?.push(a);

  return (
    <div className="myArticles">
      <h1 className="myArticles__title">My Articles</h1>
      <p className="myArticles__hint">
        Drafts can be edited. Articles in review are locked. Rejected articles flip back to draft when you edit them.
      </p>
      <div className="myArticles__actions">
        <Link href="/generate" className="myArticles__newBtn">
          + New article
        </Link>
      </div>
      {STATUS_ORDER.map((status) => {
        const list = grouped[status];
        if (!list || list.length === 0) return null;
        return (
          <section key={status} className="myArticles__section">
            <h2 className="myArticles__sectionTitle">{STATUS_LABEL[status]} ({list.length})</h2>
            <ul className="myArticles__list">
              {list.map((a) => (
                <li key={a.id} className={`myArticles__item myArticles__item--${a.status}`}>
                  <div className="myArticles__itemMain">
                    <strong>{a.title}</strong>
                    <p>{a.description}</p>
                    {a.status === 'rejected' && a.rejectionReason && (
                      <p className="myArticles__reject"><em>Reviewer note: {a.rejectionReason}</em></p>
                    )}
                  </div>
                  <div className="myArticles__itemActions">
                    {a.status === 'approved' ? (
                      <Link href={`/article/${a.slug}`} className="myArticles__btn">View</Link>
                    ) : (
                      <Link href={`/edit/${a.id}`} className="myArticles__btn">
                        {a.status === 'pending' ? 'View' : 'Edit'}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {articles.length === 0 && (
        <p style={{ color: '#666' }}>No articles yet. <Link href="/generate">Generate one</Link>.</p>
      )}
    </div>
  );
}

export default function MyArticlesPage() {
  return (
    <RequireAuth>
      <MyArticlesList />
    </RequireAuth>
  );
}
