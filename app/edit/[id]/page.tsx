'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/auth/useAuth';
import { ArticleEditor } from '@/components/article/editor/ArticleEditor';
import type { CommunityArticle } from '@/lib/articles/types';

function EditorLoader() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();
  const [article, setArticle] = useState<CommunityArticle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/articles/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? 'Could not load article');
        }
        const data = await res.json();
        if (!cancelled) setArticle(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load article');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  if (error) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Could not load article</h2>
        <p>{error}</p>
      </div>
    );
  }
  if (!article) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading editor…</div>;
  }
  return <ArticleEditor article={article} />;
}

export default function EditPage() {
  return (
    <RequireAuth>
      <EditorLoader />
    </RequireAuth>
  );
}
