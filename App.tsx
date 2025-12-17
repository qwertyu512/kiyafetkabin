
import React, { useState, useCallback } from 'react';
import { AppMode, ImageData, ProcessingState } from './types';
import { processVirtualTryOn, editImageWithPrompt } from './services/geminiService';
import ImageUploader from './components/ImageUploader';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.TRY_ON);
  const [personImage, setPersonImage] = useState<ImageData | null>(null);
  const [clothingImage, setClothingImage] = useState<ImageData | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [state, setState] = useState<ProcessingState>({
    isLoading: false,
    error: null,
    resultImageUrl: null,
  });

  const handleGenerate = async () => {
    if (mode === AppMode.TRY_ON) {
      if (!personImage || !clothingImage) {
        setState(prev => ({ ...prev, error: 'Lütfen hem vücut hem de kıyafet fotoğrafı yükleyin.' }));
        return;
      }
      
      setState({ isLoading: true, error: null, resultImageUrl: null });
      try {
        const result = await processVirtualTryOn(personImage, clothingImage, editPrompt);
        setState({ isLoading: false, error: null, resultImageUrl: result });
      } catch (err: any) {
        setState({ isLoading: false, error: err.message || 'Bir hata oluştu.', resultImageUrl: null });
      }
    } else {
      if (!personImage || !editPrompt) {
        setState(prev => ({ ...prev, error: 'Lütfen bir fotoğraf yükleyin ve ne yapılacağını yazın.' }));
        return;
      }

      setState({ isLoading: true, error: null, resultImageUrl: null });
      try {
        const result = await editImageWithPrompt(personImage, editPrompt);
        setState({ isLoading: false, error: null, resultImageUrl: result });
      } catch (err: any) {
        setState({ isLoading: false, error: err.message || 'Bir hata oluştu.', resultImageUrl: null });
      }
    }
  };

  const handleDownload = () => {
    if (!state.resultImageUrl) return;
    const link = document.createElement('a');
    link.href = state.resultImageUrl;
    link.download = `ai-stylist-outfit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setPersonImage(null);
    setClothingImage(null);
    setEditPrompt('');
    setState({ isLoading: false, error: null, resultImageUrl: null });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          AI <span className="text-indigo-600">Virtual Stylist</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Yapay zeka ile kıyafetleri üzerinizde görün veya fotoğraflarınızı metinle düzenleyin.
        </p>
      </header>

      {/* Mode Switcher */}
      <div className="flex justify-center mb-10">
        <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm border border-gray-200 flex space-x-2">
          <button
            onClick={() => { setMode(AppMode.TRY_ON); resetAll(); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === AppMode.TRY_ON ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Sanal Giydirme
          </button>
          <button
            onClick={() => { setMode(AppMode.EDIT); resetAll(); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === AppMode.EDIT ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Hızlı Düzenleme
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-8 bg-white/40 p-6 rounded-3xl border border-white/50 backdrop-blur-md shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            <ImageUploader 
              label={mode === AppMode.TRY_ON ? "Vücut Fotoğrafınız" : "Düzenlenecek Fotoğraf"}
              onImageSelect={setPersonImage}
              currentImage={personImage}
              placeholderIcon={<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            />
            
            {mode === AppMode.TRY_ON && (
              <ImageUploader 
                label="Kıyafet Fotoğrafı"
                onImageSelect={setClothingImage}
                currentImage={clothingImage}
                placeholderIcon={<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13V6a2 2 0 00-2-2H5a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5m16 0h-3.586a1 1 0 00-.707.293l-1.414 1.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 006.586 13H3" /></svg>}
              />
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">
              {mode === AppMode.TRY_ON ? "Ek Talimatlar (Opsiyonel)" : "Ne Değiştirmek İstiyorsunuz?"}
            </label>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder={mode === AppMode.TRY_ON ? "Örn: Arka planı değiştirme, kıyafeti daha dar yap..." : "Örn: Retro filtre ekle, arka planı temizle..."}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white resize-none h-28 text-gray-700"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={state.isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 ${state.isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            {state.isLoading ? (
              <div className="flex items-center justify-center space-x-3">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>AI Oluşturuyor...</span>
              </div>
            ) : (
              'Şimdi Oluştur'
            )}
          </button>
          
          {state.error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
              {state.error}
            </div>
          )}
        </div>

        {/* Result Section */}
        <div className="lg:col-span-7 h-full min-h-[500px]">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-white/40 flex justify-between items-center min-h-[64px]">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Sonuç</span>
              {state.resultImageUrl && (
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => window.open(state.resultImageUrl!, '_blank')}
                    className="text-xs text-indigo-600 font-bold hover:underline transition-all"
                  >
                    Tam Boyut Görüntüle
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex items-center space-x-2 text-xs bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Fotoğrafı İndir</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex-1 flex items-center justify-center p-6 relative bg-gray-50/50">
              {state.isLoading ? (
                <div className="flex flex-col items-center space-y-6 w-full max-w-md">
                  <div className="shimmer w-full aspect-square rounded-2xl shadow-inner"></div>
                  <div className="text-center">
                    <p className="text-indigo-600 font-bold animate-pulse">Güzelleştiriliyor...</p>
                    <p className="text-gray-400 text-xs mt-1">Bu işlem yaklaşık 10-15 saniye sürebilir.</p>
                  </div>
                </div>
              ) : state.resultImageUrl ? (
                <div className="w-full h-full flex items-center justify-center group relative">
                  <img 
                    src={state.resultImageUrl} 
                    alt="AI Result" 
                    className="max-h-[700px] w-full object-contain rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.01]"
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                    AI GENERATED
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 flex flex-col items-center space-y-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-500">Henüz sonuç yok</p>
                    <p className="text-sm">Girişleri yapın ve 'Şimdi Oluştur' butonuna tıklayın.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-20 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>&copy; 2024 AI Virtual Stylist. Gemini 2.5 Flash Image tarafından desteklenmektedir.</p>
      </footer>
    </div>
  );
};

export default App;
