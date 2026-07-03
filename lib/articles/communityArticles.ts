import 'server-only';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type {
  CommunityArticle,
  ArticleBody,
  GenerationParams,
  ArticleStatus,
} from './types';

const col = () => adminDb.collection('articles');

export async function createDraft(opts: {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  source: string;
  authorUid: string;
  authorEmail: string;
  params: GenerationParams;
  body: ArticleBody;
}): Promise<string> {
  const doc = col().doc();
  await doc.set({
    ...opts,
    status: 'draft' as ArticleStatus,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return doc.id;
}

export async function createPending(opts: {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  source: string;
  authorUid: string;
  authorEmail: string;
  params: GenerationParams;
  body: ArticleBody;
}): Promise<string> {
  const doc = col().doc();
  await doc.set({
    ...opts,
    status: 'pending' as ArticleStatus,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return doc.id;
}

export async function updateArticle(
  id: string,
  patch: Partial<Omit<CommunityArticle, 'id' | 'createdAt' | 'authorUid' | 'authorEmail'>>,
) {
  await col().doc(id).update({
    ...patch,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function submitForReview(id: string) {
  await col().doc(id).update({
    status: 'pending',
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function reopenAsDraft(id: string) {
  await col().doc(id).update({
    status: 'draft',
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getBySlug(slug: string): Promise<CommunityArticle | null> {
  const snap = await col().where('slug', '==', slug).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as CommunityArticle;
}

export async function getApprovedBySlug(slug: string): Promise<CommunityArticle | null> {
  const snap = await col()
    .where('slug', '==', slug)
    .where('status', '==', 'approved')
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as CommunityArticle;
}

export async function getApproved(): Promise<CommunityArticle[]> {
  const snap = await col()
    .where('status', '==', 'approved')
    .orderBy('approvedAt', 'desc')
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CommunityArticle);
}

export async function getPending(): Promise<CommunityArticle[]> {
  const snap = await col()
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CommunityArticle);
}

export async function getById(id: string): Promise<CommunityArticle | null> {
  const doc = await col().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as CommunityArticle;
}

export async function setApproved(id: string, adminUid: string) {
  await col().doc(id).update({
    status: 'approved',
    approvedAt: FieldValue.serverTimestamp(),
    approvedByUid: adminUid,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function setRejected(id: string, reason?: string) {
  await col().doc(id).update({
    status: 'rejected',
    ...(reason ? { rejectionReason: reason } : {}),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getByAuthor(uid: string): Promise<CommunityArticle[]> {
  // No orderBy here so the query doesn't require a composite Firestore index.
  // We sort client-side after the fetch.
  const snap = await col().where('authorUid', '==', uid).get();
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CommunityArticle);
  docs.sort((a, b) => {
    const aTs = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const bTs = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return bTs - aTs;
  });
  return docs;
}
