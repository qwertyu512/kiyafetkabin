
import React, { useRef } from 'react';
import { ImageData } from '../types';

interface ImageUploaderProps {
  label: string;
  onImageSelect: (data: ImageData) => void;
  currentImage: ImageData | null;
  placeholderIcon: React.ReactNode;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, onImageSelect, currentImage, placeholderIcon }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageSelect({
          base64: base64String,
          mimeType: file.type,
          previewUrl: URL.createObjectURL(file),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
      <div 
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer group h-56 w-full rounded-3xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden active:scale-[0.98]
          ${currentImage ? 'border-indigo-500 shadow-lg' : 'border-gray-300 bg-white/60 shadow-sm'}`}
      >
        {currentImage ? (
          <img 
            src={currentImage.previewUrl} 
            alt={label} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center space-y-3 text-gray-400">
            <div className="p-4 bg-gray-50 rounded-full">
              {placeholderIcon}
            </div>
            <div className="text-center px-4">
              <span className="text-sm font-bold text-gray-600 block">Yüklemek için dokunun</span>
              <span className="text-xs text-gray-400">Kamera veya Galeri</span>
            </div>
          </div>
        )}
        <input 
          type="file" 
          ref={inputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        {currentImage && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-gray-100">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
