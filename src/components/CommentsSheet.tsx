import { useState, useRef, useEffect } from 'react';
import { X, Send, Heart, MoreHorizontal } from 'lucide-react';
import Avatar from './Avatar';

interface Comment {
  id: number;
  author: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
}

const SEED_COMMENTS: Record<number, Comment[]> = {};

function generateComments(postId: number): Comment[] {
  if (SEED_COMMENTS[postId]) return SEED_COMMENTS[postId];
  const pool = [
    { author: 'Priya Nair', text: 'This is so exciting! Been waiting for this all semester.' },
    { author: 'Arjun Mehta', text: 'Count me in. Who else is forming a team?' },
    { author: 'Simran Bhatia', text: 'The workshops last year were incredible. Can\'t wait for this.' },
    { author: 'Dev Malhotra', text: 'Is the ₹5L prize pool split among the team or per person?' },
    { author: 'Neha Kapoor', text: 'Already registered! Let\'s go 🔥' },
    { author: 'Kiran Das', text: 'What\'s the team size limit this year?' },
    { author: 'Rahul Sharma', text: 'DevSoc events are always top-tier. See you all there.' },
    { author: 'Ananya Singh', text: 'Looking for two teammates — DM me if interested!' },
  ];
  const n = 3 + (postId % 4);
  const comments: Comment[] = pool.slice(0, n).map((c, i) => ({
    id: i + 1,
    author: c.author,
    text: c.text,
    time: `${i + 1}h ago`,
    likes: Math.floor(Math.random() * 40) + 2,
    liked: false,
  }));
  SEED_COMMENTS[postId] = comments;
  return comments;
}

interface CommentsSheetProps {
  postId: number;
  postTitle: string;
  totalComments: number;
  onClose: () => void;
}

export default function CommentsSheet({ postId, postTitle, totalComments, onClose }: CommentsSheetProps) {
  const [comments, setComments] = useState<Comment[]>(() => generateComments(postId));
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newComment: Comment = {
      id: Date.now(),
      author: 'You',
      text: trimmed,
      time: 'Just now',
      likes: 0,
      liked: false,
    };
    setComments((prev) => [...prev, newComment]);
    setText('');
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  const toggleLike = (id: number) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{
        background: visible ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
        transition: 'background 0.32s ease',
      }}
      onClick={handleClose}
    >
      <div
        className="mx-auto w-full max-w-[430px] flex flex-col"
        style={{
          background: '#0d1224',
          borderRadius: '28px 28px 0 0',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
          maxHeight: '80vh',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div>
            <p className="text-[15px] font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>
              Comments
            </p>
            <p className="text-[11px] text-white/30 mt-0.5 truncate max-w-[220px]">{postTitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors active:scale-90"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Comment list */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          style={{ overscrollBehavior: 'contain' }}
        >
          {comments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-white/30">No comments yet</p>
              <p className="text-xs text-white/20 mt-1">Be the first to comment</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3 group">
                <Avatar name={c.author} size="sm" />
                <div className="flex-1 min-w-0">
                  <div
                    className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 100%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <p className="text-[12px] font-bold text-white mb-0.5">{c.author}</p>
                    <p className="text-[13px] text-white/70 leading-relaxed">{c.text}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 pl-1">
                    <span className="text-[10px] text-white/25 font-medium">{c.time}</span>
                    <button
                      onClick={() => toggleLike(c.id)}
                      className="flex items-center gap-1 text-[10px] font-bold transition-colors active:scale-90"
                      style={{ color: c.liked ? '#fb7185' : 'rgba(255,255,255,0.25)' }}
                    >
                      <Heart size={10} fill={c.liked ? 'currentColor' : 'none'} />
                      {c.likes > 0 && c.likes}
                    </button>
                    <button className="text-[10px] font-bold text-white/25 hover:text-white/50 transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity self-start mt-1">
                  <MoreHorizontal size={13} className="text-white/25" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          }}
        >
          <Avatar name="You" size="sm" />
          <div
            className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <input
              ref={inputRef}
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
                className="flex-shrink-0 text-blue-400 active:scale-90 transition-transform"
              >
                <Send size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
