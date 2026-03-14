import { Heart, MessageCircle, Bookmark, Calendar, Clock, MapPin } from 'lucide-react';
import TagBadge from './TagBadge';
import Avatar from './Avatar';
import type { Post as FeedItem } from '../types';

export default function PostPreviewCard({ item }: { item: FeedItem }) {
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.045) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Cover image */}
      {item.image && (
        <div className="relative h-44 overflow-hidden">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <TagBadge label={item.category} variant={item.categoryTag} dot size="sm" />
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Author */}
        <div className="flex items-center gap-2.5 mb-3">
          <Avatar name={item.author} src={item.avatar} size={32} />
          <div>
            <p className="text-[12px] font-bold text-white">{item.authorName}</p>
            <p className="text-[10px] text-white/35">{item.authorRole} · Just now</p>
          </div>
        </div>

        {/* Title & summary */}
        <h3 className="text-[14px] font-bold text-white leading-snug mb-1.5" style={{ letterSpacing: '-0.02em' }}>
          {item.title}
        </h3>
        <p className="text-[12px] text-white/50 leading-relaxed line-clamp-2">{item.summary}</p>

        {/* Event details */}
        {item.eventDetails && (
          <div className="mt-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[11px] text-white/45">
              <Calendar size={11} />
              <span>{item.eventDetails.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/45">
              <Clock size={11} />
              <span>{item.eventDetails.time}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/45">
              <MapPin size={11} />
              <span>{item.eventDetails.location}</span>
            </div>
          </div>
        )}

        {/* Interaction bar */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.07]">
          <div className="flex items-center gap-1.5 text-[11px] text-white/35">
            <Heart size={12} />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/35">
            <MessageCircle size={12} />
            <span>0</span>
          </div>
          <div className="ml-auto">
            <Bookmark size={12} className="text-white/25" />
          </div>
        </div>
      </div>
    </div>
  );
}
