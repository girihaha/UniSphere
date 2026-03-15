import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Trash2 } from 'lucide-react';
import Avatar from './Avatar';
import { createComment, deleteComment, getComments } from '../services/commentService';
import type { Comment } from '../types';
import { useAuth } from '../context/AuthContext';

interface CommentsSheetProps {
  postId: number;
  postTitle: string;
  totalComments: number;
  onClose: () => void;
}

export default function CommentsSheet({
  postId,
  postTitle,
  onClose,
}: CommentsSheetProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadComments = async () => {
      setLoading(true);
      try {
        const data = await getComments(postId);
        if (active) {
          setComments(data);
        }
      } catch (error) {
        console.error('Failed to load comments:', error);
        if (active) {
          setComments([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadComments();

    return () => {
      active = false;
    };
  }, [postId]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);

    try {
      const result = await createComment(postId, trimmed);
      if (result.comment) {
        setComments((prev) => [...prev, result.comment!]);
        setText('');
        requestAnimationFrame(() => {
          listRef.current?.scrollTo({
            top: listRef.current.scrollHeight,
            behavior: 'smooth',
          });
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    const result = await deleteComment(postId, commentId);
    if (!result.error) {
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-end"
      style={{
        background: visible ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
        transition: 'background 0.32s ease',
      }}
      onClick={handleClose}
    >
      <div
        className="mx-auto w-full max-w-[430px] lg:max-w-[760px] flex flex-col"
        style={{
          background: '#0d1224',
          borderRadius: '28px 28px 0 0',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
          maxHeight: 'calc(100dvh - 12px)',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.45)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          />
        </div>

        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div>
            <p
              className="text-[15px] font-extrabold text-white"
              style={{ letterSpacing: '-0.02em' }}
            >
              Comments
            </p>
            <p className="text-[11px] text-white/30 mt-0.5 truncate max-w-[220px]">
              {postTitle}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors active:scale-90"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          style={{ overscrollBehavior: 'contain' }}
        >
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-white/30">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-white/30">No comments yet</p>
              <p className="text-xs text-white/20 mt-1">Be the first to comment</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 group">
                <Avatar src={comment.authorAvatar} name={comment.authorName} size="sm" />

                <div className="flex-1 min-w-0">
                  <div
                    className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 100%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <p className="text-[12px] font-bold text-white mb-0.5">
                      {comment.authorName}
                    </p>
                    <p className="text-[13px] text-white/70 leading-relaxed">
                      {comment.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 pl-1">
                    <span className="text-[10px] text-white/25 font-medium">
                      {comment.time}
                    </span>

                    {comment.authorId === user?.id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-rose-400/80 active:scale-90"
                      >
                        <Trash2 size={10} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          }}
        >
          <Avatar src={user?.avatarUrl} name={user?.name || 'You'} size="sm" />

          <div
            className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-[13px] text-white placeholder-white/25 outline-none font-medium"
            />

            {text.trim() && (
              <button
                onClick={handleSend}
                disabled={submitting}
                className="flex-shrink-0 text-blue-400 active:scale-90 transition-transform disabled:opacity-50"
              >
                <Send size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
