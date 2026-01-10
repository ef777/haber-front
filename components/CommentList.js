import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import CommentForm from './CommentForm';
import { likeYorum } from '../lib/strapi';

// Tekil yorum komponenti
function CommentItem({ yorum, haberId, depth = 0 }) {
  const [showReply, setShowReply] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(yorum.begeni_sayisi || 0);

  const authorName = yorum.kullanici?.username || yorum.misafir_adi || 'Anonim';
  const isRegistered = !!yorum.kullanici;

  const handleLike = async () => {
    if (liked) return;

    try {
      await likeYorum(yorum.id);
      setLikeCount(prev => prev + 1);
      setLiked(true);
    } catch (err) {
      console.error('Begeni hatasi:', err);
    }
  };

  const handleReplySuccess = () => {
    setShowReply(false);
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 sm:ml-12 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <div className="bg-surface rounded-lg p-4 mb-4">
        {/* Yorum basligi */}
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
            isRegistered ? 'bg-primary-600' : 'bg-gray-400'
          }`}>
            {authorName.charAt(0).toUpperCase()}
          </div>

          {/* Kullanici bilgileri */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {authorName}
              </span>
              {isRegistered && (
                <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full">
                  Uye
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(yorum.createdAt), 'd MMMM yyyy HH:mm', { locale: tr })}
            </span>
          </div>
        </div>

        {/* Yorum icerigi */}
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {yorum.icerik}
        </p>

        {/* Aksiyonlar */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          {/* Begen */}
          <button
            onClick={handleLike}
            disabled={liked}
            className={`flex items-center gap-1 text-sm transition-colors ${
              liked
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-primary-600'
            }`}
          >
            <HeartIcon className="w-4 h-4" filled={liked} />
            <span>{likeCount}</span>
          </button>

          {/* Yanitla */}
          {depth < 2 && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition-colors"
            >
              <ReplyIcon className="w-4 h-4" />
              <span>Yanitla</span>
            </button>
          )}
        </div>
      </div>

      {/* Yanit formu */}
      {showReply && (
        <div className="ml-6 sm:ml-12 mb-4">
          <CommentForm
            haberId={haberId}
            parentId={yorum.id}
            onSuccess={handleReplySuccess}
            onCancel={() => setShowReply(false)}
          />
        </div>
      )}

      {/* Alt yorumlar (cevaplar) */}
      {yorum.cevaplar && yorum.cevaplar.length > 0 && (
        <div>
          {yorum.cevaplar.map((cevap) => (
            <CommentItem
              key={cevap.id}
              yorum={cevap}
              haberId={haberId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Ana yorum listesi komponenti
export default function CommentList({ yorumlar = [], haberId, onCommentAdded }) {
  return (
    <div className="mt-8">
      {/* Baslik */}
      <div className="flex items-center gap-3 mb-6">
        <ChatIcon className="w-6 h-6 text-primary-600" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Yorumlar ({yorumlar.length})
        </h3>
      </div>

      {/* Yeni yorum formu */}
      <div className="mb-8 p-6 bg-surface rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Yorum Yap
        </h4>
        <CommentForm haberId={haberId} onSuccess={onCommentAdded} />
      </div>

      {/* Yorum listesi */}
      {yorumlar.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl">
          <ChatIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Henuz yorum yapilmamis. Ilk yorumu siz yapin!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {yorumlar.map((yorum) => (
            <CommentItem key={yorum.id} yorum={yorum} haberId={haberId} />
          ))}
        </div>
      )}
    </div>
  );
}

// Ikonlar
function HeartIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function ReplyIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  );
}

function ChatIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
