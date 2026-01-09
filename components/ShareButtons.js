export default function ShareButtons({ url, title }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Twitter',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      bg: 'bg-sky-500 hover:bg-sky-600',
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      bg: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      bg: 'bg-blue-700 hover:bg-blue-800',
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      bg: 'bg-sky-600 hover:bg-sky-700',
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link kopyalandı!');
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${link.bg} text-white px-4 py-2 rounded text-sm font-medium transition`}
        >
          {link.name}
        </a>
      ))}
      <button
        onClick={copyToClipboard}
        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition"
      >
        Linki Kopyala
      </button>
    </div>
  );
}
