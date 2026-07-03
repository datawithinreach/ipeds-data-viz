import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser, isAdminEmail } from '@/lib/auth/admin';
import { getPending } from '@/lib/articles/communityArticles';
import './page.scss';

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user?.email || !isAdminEmail(user.email)) {
    redirect('/');
  }

  const pending = await getPending();

  return (
    <div className="admin">
      <div>
        <h1 className="admin__title">Admin Queue</h1>
        <p className="admin__subtitle">
          Review community-submitted articles awaiting approval.
        </p>
      </div>

      {pending.length === 0 ? (
        <p className="admin__empty">No articles pending review.</p>
      ) : (
        <div className="admin__list">
          {pending.map((article) => (
            <div key={article.id} className="admin__card">
              <div className="admin__cardTitle">{article.title}</div>
              <div className="admin__cardMeta">
                <span>by {article.authorEmail}</span>
                <span>slug: {article.slug}</span>
              </div>
              <p className="admin__cardDesc">{article.description}</p>
              <Link
                href={`/admin/article/${article.id}`}
                className="admin__reviewBtn"
              >
                Review →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
