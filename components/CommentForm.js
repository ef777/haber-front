import { useState } from 'react';
import { postYorum } from '../lib/strapi';

export default function CommentForm({ haberId, parentId = null, onSuccess, onCancel }) {
  const [icerik, setIcerik] = useState('');
  const [misafirAdi, setMisafirAdi] = useState('');
  const [misafirEmail, setMisafirEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await postYorum(haberId, {
        icerik,
        parent_yorum: parentId,
        misafir_adi: misafirAdi,
        misafir_email: misafirEmail,
      });

      setIcerik('');
      setMisafirAdi('');
      setMisafirEmail('');
      setSuccess(true);

      if (onSuccess) {
        onSuccess(response);
      }

      // Basari mesajini 3 saniye sonra kaldir
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Yorum gonderilemedi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
          Yorumunuz gonderildi. Onaylandiktan sonra yayinlanacak.
        </div>
      )}

      {/* Misafir bilgileri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="misafir_adi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Adiniz *
          </label>
          <input
            type="text"
            id="misafir_adi"
            value={misafirAdi}
            onChange={(e) => setMisafirAdi(e.target.value)}
            className="form-input"
            placeholder="Adinizi girin"
            required
          />
        </div>
        <div>
          <label htmlFor="misafir_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            E-posta *
          </label>
          <input
            type="email"
            id="misafir_email"
            value={misafirEmail}
            onChange={(e) => setMisafirEmail(e.target.value)}
            className="form-input"
            placeholder="E-posta adresiniz"
            required
          />
        </div>
      </div>

      {/* Yorum icerigi */}
      <div>
        <label htmlFor="icerik" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {parentId ? 'Yanitiniz *' : 'Yorumunuz *'}
        </label>
        <textarea
          id="icerik"
          value={icerik}
          onChange={(e) => setIcerik(e.target.value)}
          className="form-input"
          rows={4}
          placeholder={parentId ? 'Yanitinizi yazin...' : 'Yorumunuzu yazin...'}
          required
          maxLength={2000}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {icerik.length}/2000 karakter
        </p>
      </div>

      {/* Butonlar */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Gonderiliyor...
            </span>
          ) : (
            parentId ? 'Yanit Gonder' : 'Yorum Gonder'
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Iptal
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Yorumunuz moderasyon sonrasi yayinlanacaktir.
      </p>
    </form>
  );
}
