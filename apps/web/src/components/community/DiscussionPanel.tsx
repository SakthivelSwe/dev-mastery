'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, ThumbsUp, Flag, Reply, Pencil, Trash2 } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

interface Comment {
  id: string;
  parentId: string | null;
  topicSlug: string;
  authorId: string;
  authorName: string;
  body: string;
  upvotes: number;
  isFlagged: boolean;
  isDeleted: boolean;
  editedByAuthor: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  upvotedByMe: boolean;
}

interface Props {
  topicSlug: string;
  /** If provided, mutations (post/edit/delete/upvote) are enabled */
  token?: string | null;
  userId?: string | null;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? '';
const PAGE_SIZE = 20;

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60)   return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

// ── Sub-components ──────────────────────────────────────────────────────────

function CommentInput({
  placeholder,
  onSubmit,
  onCancel,
  initialValue = '',
  submitLabel = 'Post',
}: {
  placeholder: string;
  onSubmit: (body: string) => Promise<void>;
  onCancel?: () => void;
  initialValue?: string;
  submitLabel?: string;
}) {
  const [body, setBody] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setBusy(true); setErr('');
    try { await onSubmit(body.trim()); setBody(''); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Error posting comment.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-1.5">
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={4000}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none
          focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      {err && <p className="text-xs text-red-500">{err}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={busy || !body.trim()}
          className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium
            hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Posting…' : submitLabel}
        </button>
        {onCancel && (
          <button onClick={onCancel}
            className="rounded-md border px-3 py-1.5 text-xs hover:bg-accent">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  token,
  userId,
  topicSlug,
  onUpdated,
}: {
  comment: Comment;
  token?: string | null;
  userId?: string | null;
  topicSlug: string;
  onUpdated: () => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [upvotes, setUpvotes] = useState(comment.upvotes);
  const [myUpvote, setMyUpvote] = useState(comment.upvotedByMe);

  const isAuthor = userId && userId === comment.authorId;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const loadReplies = async () => {
    const r = await fetch(`${API}/v1/comments/${topicSlug}/${comment.id}/replies`);
    if (r.ok) setReplies(await r.json());
  };

  const handleToggleReplies = async () => {
    if (!showReplies && replies.length === 0) await loadReplies();
    setShowReplies(v => !v);
  };

  const handleUpvote = async () => {
    if (!token) return;
    const r = await fetch(`${API}/v1/comments/${comment.id}/upvote`, {
      method: 'POST', headers: authHeader,
    });
    if (r.ok) {
      const data: { upvotes: number } = await r.json();
      setUpvotes(data.upvotes);
      setMyUpvote(v => !v);
    }
  };

  const handleDelete = async () => {
    if (!token || !isAuthor) return;
    if (!confirm('Delete this comment?')) return;
    await fetch(`${API}/v1/comments/${comment.id}`, {
      method: 'DELETE', headers: authHeader,
    });
    onUpdated();
  };

  const handleFlag = async () => {
    if (!token) return;
    await fetch(`${API}/v1/comments/${comment.id}/flag`, {
      method: 'POST', headers: authHeader,
    });
    alert('Flagged for review. Thank you!');
  };

  const postReply = async (body: string) => {
    const r = await fetch(`${API}/v1/comments/${topicSlug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ parentId: comment.id, body }),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message ?? 'Failed to post reply');
    setReplying(false);
    await loadReplies();
    setShowReplies(true);
    onUpdated();
  };

  const saveEdit = async (body: string) => {
    const r = await fetch(`${API}/v1/comments/${comment.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ body }),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message ?? 'Failed to edit');
    setEditing(false);
    onUpdated();
  };

  return (
    <div className="space-y-2">
      <div className="rounded-xl border bg-card p-3 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center
              text-xs font-semibold text-primary shrink-0">
              {comment.authorName.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-sm truncate">{comment.authorName}</span>
            {comment.editedByAuthor && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{timeAgo(comment.createdAt)}</span>
        </div>

        {/* Body */}
        {editing ? (
          <CommentInput
            placeholder="Edit your comment…"
            initialValue={comment.body}
            onSubmit={saveEdit}
            onCancel={() => setEditing(false)}
            submitLabel="Save"
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{comment.body}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleUpvote}
            disabled={!token}
            className={`flex items-center gap-1 text-xs transition-colors
              ${myUpvote ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}
              disabled:cursor-not-allowed`}
          >
            <ThumbsUp size={12} /> {upvotes}
          </button>

          {token && !comment.isDeleted && (
            <button onClick={() => setReplying(v => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Reply size={12} /> Reply
            </button>
          )}

          {comment.replyCount > 0 && (
            <button onClick={handleToggleReplies}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {isAuthor && !comment.isDeleted && (
            <>
              <button onClick={() => setEditing(v => !v)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <Pencil size={12} /> Edit
              </button>
              <button onClick={handleDelete}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600">
                <Trash2 size={12} /> Delete
              </button>
            </>
          )}

          {token && !isAuthor && !comment.isDeleted && (
            <button onClick={handleFlag}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 ml-auto">
              <Flag size={12} /> Flag
            </button>
          )}
        </div>

        {/* Reply input */}
        {replying && (
          <div className="ml-4 pt-1 border-l-2 pl-3">
            <CommentInput
              placeholder={`Reply to ${comment.authorName}…`}
              onSubmit={postReply}
              onCancel={() => setReplying(false)}
              submitLabel="Reply"
            />
          </div>
        )}
      </div>

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="ml-6 space-y-2">
          {replies.map(r => (
            <CommentRow key={r.id} comment={r} token={token} userId={userId}
              topicSlug={topicSlug} onUpdated={() => { loadReplies(); onUpdated(); }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function DiscussionPanel({ topicSlug, token, userId }: Props) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const initialized = useRef(false);

  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const loadComments = async (p = 0, reset = false) => {
    setLoading(true);
    try {
      const r = await fetch(
        `${API}/v1/comments/${topicSlug}?page=${p}&size=${PAGE_SIZE}`
      );
      if (!r.ok) return;
      const data: Comment[] = await r.json();
      setComments(prev => reset ? data : [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
      setPage(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true;
      loadComments(0, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const postTopLevel = async (body: string) => {
    const r = await fetch(`${API}/v1/comments/${topicSlug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ body }),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message ?? 'Failed to post');
    await loadComments(0, true);
  };

  return (
    <div className="border-t mt-8">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium
          hover:bg-accent/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <MessageSquare size={16} className="text-primary" />
          Community Discussion
          {comments.length > 0 && (
            <span className="rounded-full bg-primary/15 text-primary px-2 py-0.5 text-xs">
              {comments.length}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="px-4 pb-6 space-y-4">
          {/* New top-level comment */}
          {token ? (
            <CommentInput
              placeholder="Ask a question or share an insight about this topic…"
              onSubmit={postTopLevel}
            />
          ) : (
            <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-3">
              <a href="/auth/login" className="text-primary underline">Sign in</a> to join the discussion.
            </p>
          )}

          {/* Comment list */}
          {loading && comments.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">Loading…</div>
          ) : comments.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No comments yet — be the first to ask or share!
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map(c => (
                <CommentRow
                  key={c.id}
                  comment={c}
                  token={token}
                  userId={userId}
                  topicSlug={topicSlug}
                  onUpdated={() => loadComments(0, true)}
                />
              ))}
              {hasMore && (
                <button
                  onClick={() => loadComments(page + 1)}
                  disabled={loading}
                  className="w-full text-sm text-primary py-2 hover:underline disabled:opacity-50"
                >
                  {loading ? 'Loading…' : 'Load more comments'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}



