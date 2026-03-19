import { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, File as FileIcon, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function FileUpload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload a valid PDF file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    if (password) {
      formData.append('password', password);
    }
    
    try {
      const response = await axios.post('http://localhost:8000/api/statements/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onSuccess(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'An error occurred during upload. Please ensure the password is correct.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass-panel rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
        <div 
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' : file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/30'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            accept=".pdf" 
            className="hidden" 
          />
          
          {file ? (
            <div className="flex flex-col items-center animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <FileIcon className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-200 mb-1">{file.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-sm px-4 py-2 rounded-lg bg-slate-800/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                disabled={isUploading}
              >
                Remove File
              </button>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-5 shadow-inner">
                <UploadCloud className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-200">Drag & Drop your PDF here</h3>
              <p className="text-slate-400 mb-6 text-center max-w-xs">Upload your Kotak Bank statement. We process it securely without saving it.</p>
              <div className="px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 font-medium transition-all shadow-sm">
                Browse Files
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-950/50 border border-red-900/50 flex items-start space-x-3 text-red-200 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className={`transition-all duration-500 overflow-hidden ${file ? 'max-h-64 opacity-100 mt-8' : 'max-h-0 opacity-0 mt-0'}`}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-slate-400" />
                Statement Password (if protected)
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Usually your CRN or DOB combo for Kotak"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
                disabled={isUploading}
              />
            </div>
            
            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3.5 px-4 rounded-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
            >
              {isUploading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing securely...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Analyze Statement
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
