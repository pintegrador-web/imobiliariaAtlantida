const Spinner = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium animate-pulse">Iniciando Atlântida Imóveis...</p>
    </div>
  </div>
);

export default Spinner;