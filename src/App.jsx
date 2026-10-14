import { useState, useEffect } from 'react';
import { auth, db, useMockData, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, signInAnonymously } from './firebase/config';
import { MOCK_PROPERTIES } from './data/mockData';
import { DEFAULT_VISIT_RULES, STORAGE_KEYS } from './constants';
import { loadFromStorage, saveToStorage } from './utils/storage';
import Spinner from './components/common/Spinner';
import PublicView from './components/public/PublicView';
import AdminView from './components/admin/AdminView';

const App = () => {
  const [view, setView] = useState('public');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [visits, setVisits] = useState(() => loadFromStorage(STORAGE_KEYS.VISITS, []));
  const [rules, setRules] = useState(() => loadFromStorage(STORAGE_KEYS.RULES, DEFAULT_VISIT_RULES));

  useEffect(() => { saveToStorage(STORAGE_KEYS.VISITS, visits); }, [visits]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.RULES, rules); }, [rules]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!useMockData && auth) {
          await signInAnonymously(auth);
        } else {
          setUser({ uid: 'mock-user-123' });
        }
      } catch (error) {
        console.warn("Auth error:", error);
        setUser({ uid: 'mock-user-123' });
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        if (!useMockData && db) {
          const querySnapshot = await getDocs(collection(db, "properties"));
          const data = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setProperties(data.length > 0 ? data : MOCK_PROPERTIES);
          setLoading(false);
        } else {
          const stored = loadFromStorage(STORAGE_KEYS.PROPERTIES, null);
          setTimeout(() => {
            setProperties(stored && stored.length > 0 ? stored : MOCK_PROPERTIES);
            setLoading(false);
          }, 500);
        }
      } catch (error) {
        console.warn("Error loading properties:", error);
        setProperties(MOCK_PROPERTIES);
        setLoading(false);
      }
    };
    loadProperties();
  }, []);

  // Persistência local das propriedades no modo mock
  useEffect(() => {
    if (!loading && useMockData) {
      saveToStorage(STORAGE_KEYS.PROPERTIES, properties);
    }
  }, [properties, loading]);

  // --- Visitas ---
  const handleNewVisit = (visit) => setVisits(prev => [visit, ...prev]);
  const handleApproveVisit = (id) => setVisits(prev => prev.map(v => v.id === id ? { ...v, status: 'approved' } : v));
  const handleRejectVisit = (id) => setVisits(prev => prev.map(v => v.id === id ? { ...v, status: 'rejected' } : v));
  const handleDeleteVisit = (id) => {
    if (!window.confirm('Excluir esta visita?')) return;
    setVisits(prev => prev.filter(v => v.id !== id));
  };

  // --- Regras ---
  const handleSaveRules = (newRules) => setRules(newRules);

  // --- Imóveis (CRUD) ---
  const handleAddProperty = async (payload) => {
    try {
      if (!useMockData && db) {
        const docRef = await addDoc(collection(db, 'properties'), payload);
        setProperties(prev => [{ id: docRef.id, ...payload }, ...prev]);
      } else {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        setProperties(prev => [{ id, ...payload }, ...prev]);
      }
    } catch (error) {
      console.error('Erro ao adicionar imóvel:', error);
      alert('Erro ao adicionar imóvel. Tente novamente.');
    }
  };

  const handleUpdateProperty = async (id, payload) => {
    try {
      if (!useMockData && db) {
        await updateDoc(doc(db, 'properties', id), payload);
      }
      setProperties(prev => prev.map(p => p.id === id ? { ...p, ...payload } : p));
    } catch (error) {
      console.error('Erro ao atualizar imóvel:', error);
      alert('Erro ao atualizar imóvel. Tente novamente.');
    }
  };

  const handleDeleteProperty = async (id) => {
    try {
      if (!useMockData && db) {
        await deleteDoc(doc(db, 'properties', id));
      }
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao excluir imóvel:', error);
      alert('Erro ao excluir imóvel. Tente novamente.');
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {view === 'public' ? (
        <PublicView
          properties={properties}
          onNavigate={setView}
          rules={rules}
          visits={visits}
          onNewVisit={handleNewVisit}
        />
      ) : (
        <AdminView
          properties={properties}
          onNavigate={setView}
          visits={visits}
          rules={rules}
          onApprove={handleApproveVisit}
          onReject={handleRejectVisit}
          onDeleteVisit={handleDeleteVisit}
          onSaveRules={handleSaveRules}
          onAddProperty={handleAddProperty}
          onUpdateProperty={handleUpdateProperty}
          onDeleteProperty={handleDeleteProperty}
        />
      )}
    </>
  );
};

export default App;