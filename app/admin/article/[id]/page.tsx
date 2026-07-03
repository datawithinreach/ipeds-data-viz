'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Markdown from 'react-markdown';
import Link from 'next/link';
import { useAuth } from '@/components/auth/useAuth';
import { LiveChart } from '@/components/article/LiveChart';
import { Banner } from '@/components/visualizations';
import type { CommunityArticle } from '@/lib/articles/types';
import '@/components/article/article.scss';
import '../../page.scss';

export default function AdminReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [article, setArticle] = useState<CommunityArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.replace('/');
      return;
    }

    fetch(`/api/admin/articles?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setArticle(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isAdmin, authLoading, router]);

  async function handleApprove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/articles/${id}/approve`, {
        method: 'POST',
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Approve failed');
      }
      setActionDone('approved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/articles/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason || undefined }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Reject failed');
      }
      setActionDone('rejected');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="admin">
        <p>Loading…</p>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="admin">
        <div className="admin__error">{error}</div>
        <Link href="/admin" className="admin__back">
          ← Back to queue
        </Link>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="admin">
      <Link href="/admin" className="admin__back">
        ← Back to queue
      </Link>

      <div>
        <h1 className="admin__title">Review Article</h1>
        <div className="admin__cardMeta">
          <span>by {article.authorEmail}</span>
          <span>slug: {article.slug}</span>
          <span>status: {article.status}</span>
        </div>
        <div style={{ marginTop: '0.7rem', display: 'flex', gap: '0.5rem' }}>
          <Link
            href={`/edit/${article.id}`}
            className="admin__approveBtn"
            style={{ background: '#444', textDecoration: 'none' }}
          >
            Edit article
          </Link>
        </div>
      </div>

      {error && <div className="admin__error">{error}</div>}

      {actionDone && (
        <p className={`admin__status admin__status--${actionDone}`}>
          Article {actionDone}.
        </p>
      )}

      <article
        className="article"
        style={{
          border: '1px solid rgba(80,19,21,0.15)',
          borderRadius: '0.75rem',
          padding: '2rem',
        }}
      >
        <header className="article__header">
          <p className="article__category">{article.category} · Community</p>
          <h1 className="article__title">{article.title}</h1>
          <p className="article__description">{article.description}</p>
        </header>
        <div className="article__body article__mdx">
          {article.body.heroStat && (
            <div className="article__heroStat">
              <Banner value={article.body.heroStat.value} label={article.body.heroStat.label} />
              {article.body.heroStat.context && (
                <p className="article__heroStatContext">{article.body.heroStat.context}</p>
              )}
            </div>
          )}
          <Markdown>{article.body.intro}</Markdown>
          {article.body.sections.map((section) => (
            <section key={section.id} className="article__section">
              <div className="article__sectionHeader">
                {section.role && (
                  <span className={`article__sectionRole article__sectionRole--${section.role}`}>
                    {section.role}
                  </span>
                )}
                <h2 className="article__heading">{section.heading}</h2>
              </div>
              <Markdown>{section.markdown}</Markdown>
              {section.chart && <LiveChart spec={section.chart} />}
            </section>
          ))}
          {article.body.methodology && (
            <section className="article__methodology">
              <h2 className="article__methodologyTitle">Methodology</h2>
              <Markdown>{article.body.methodology}</Markdown>
            </section>
          )}
        </div>
      </article>

      {article.status === 'pending' && !actionDone && (
        <>
          <div className="admin__rejectField">
            <label className="generate__label">Rejection reason (optional)</label>
            <input
              className="admin__rejectInput"
              placeholder="e.g. Needs more analysis"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="admin__actions">
            <button
              className="admin__approveBtn"
              onClick={handleApprove}
              disabled={busy}
            >
              {busy ? '…' : 'Approve'}
            </button>
            <button
              className="admin__rejectBtn"
              onClick={handleReject}
              disabled={busy}
            >
              {busy ? '…' : 'Reject'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
