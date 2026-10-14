import { useState, useEffect, useRef } from 'react';
import { PROPERTY_TYPES, PROPERTY_STATUS } from '../../constants';
import { IconClose } from '../icons';

const EMPTY_FORM = {
  title: '',
  type: 'Apartamento',
  status: 'Vazio',
  price: '',
  bedrooms: '',
  area: '',
  image: '',
  description: ''
};

// Normaliza URLs coladas: remove espaços, aspas e quebras de linha acidentais
const normalizeImageUrl = (url) => {
  if (!url) return '';
  return url
    .trim()
    .replace(/^["'<]+|["'>]+$/g, '') // remove aspas/angle brackets
    .replace(/\s+/g, '');           // remove espaços internos
};

// Aceita apenas URLs http(s) válidas
const isValidImageUrl = (url) => {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

const PropertyFormModal = ({ property, onClose, onSave }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [imageStatus, setImageStatus] = useState('idle'); // 'idle' | 'loading' | 'ok' | 'error'
  const imgRef = useRef(null);
  const isEditing = Boolean(property);

  useEffect(() => {
    if (property) {
      setForm({
        title: property.title || '',
        type: property.type || 'Apartamento',
        status: property.status || 'Vazio',
        price: property.price ?? '',
        bedrooms: property.bedrooms ?? '',
        area: property.area ?? '',
        image: property.image || '',
        description: property.description || ''
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setImageStatus('idle');
  }, [property]);

  // Reavalia a imagem sempre que a URL muda
  useEffect(() => {
    const url = normalizeImageUrl(form.image);
    if (!url) {
      setImageStatus('idle');
      return;
    }
    if (!isValidImageUrl(url)) {
      setImageStatus('error');
      return;
    }
    setImageStatus('loading');
  }, [form.image]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) return setError('Informe o título do imóvel.');
    if (form.price === '' || Number(form.price) < 0) return setError('Informe um valor válido.');
    if (form.area === '' || Number(form.area) <= 0) return setError('Informe uma área válida.');

    const cleanImage = normalizeImageUrl(form.image);
    if (!cleanImage) return setError('Informe a URL da imagem.');
    if (!isValidImageUrl(cleanImage)) {
      return setError('URL de imagem inválida. Use uma URL começando com http:// ou https://');
    }

    const payload = {
      title: form.title.trim(),
      type: form.type,
      status: form.status,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms) || 0,
      area: Number(form.area),
      image: cleanImage,
      description: form.description.trim()
    };

    onSave(payload, property?.id);
  };

  const cleanImage = normalizeImageUrl(form.image);
  const showPreview = cleanImage && isValidImageUrl(cleanImage);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Editar Imóvel' : 'Novo Imóvel'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fechar">
            <IconClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              placeholder="Ex: Apartamento Luxo Centro"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                value={form.type}
                onChange={e => update('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
              >
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={form.status}
                onChange={e => update('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
              >
                {PROPERTY_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => update('price', e.target.value)}
                placeholder="3500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quartos</label>
              <input
                type="number"
                min="0"
                value={form.bedrooms}
                onChange={e => update('bedrooms', e.target.value)}
                placeholder="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área (m²) *</label>
              <input
                type="number"
                min="0"
                value={form.area}
                onChange={e => update('area', e.target.value)}
                placeholder="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* --- Campo de imagem corrigido --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL da Imagem *
            </label>
            <input
              type="text"
              inputMode="url"
              value={form.image}
              onChange={e => update('image', e.target.value)}
              onBlur={() => update('image', normalizeImageUrl(form.image))}
              placeholder="https://images.unsplash.com/..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none text-sm ${
                imageStatus === 'error'
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-red-500'
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Cole a URL direta da imagem (deve começar com <code>https://</code>).
            </p>

            {cleanImage && !isValidImageUrl(cleanImage) && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                ⚠ URL inválida. Verifique se começa com http:// ou https://
              </p>
            )}

            {showPreview && (
              <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  key={cleanImage} /* força remontagem quando a URL muda */
                  ref={imgRef}
                  src={cleanImage}
                  alt="Pré-visualização"
                  className={`w-full h-40 object-cover transition-opacity ${
                    imageStatus === 'ok' ? 'opacity-100' : 'opacity-40'
                  }`}
                  onLoad={() => setImageStatus('ok')}
                  onError={() => setImageStatus('error')}
                />
                <div className="px-3 py-2 text-xs">
                  {imageStatus === 'loading' && <span className="text-gray-500">A carregar imagem…</span>}
                  {imageStatus === 'ok' && <span className="text-green-600 font-medium">✓ Imagem carregada</span>}
                  {imageStatus === 'error' && (
                    <span className="text-red-600 font-medium">
                      ✗ Não foi possível carregar a imagem. Verifique se o link é público e direto.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              rows="3"
              value={form.description}
              onChange={e => update('description', e.target.value)}
              placeholder="Descrição do imóvel..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm shadow-red-200"
            >
              {isEditing ? 'Guardar Alterações' : 'Adicionar Imóvel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyFormModal;