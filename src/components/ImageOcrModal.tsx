import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, AlertCircle, Loader2, Sparkles, Edit3 } from 'lucide-react';
import { MathView } from './MathView.tsx';

interface ImageOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmQuestion: (confirmedText: string) => void;
}

export const ImageOcrModal: React.FC<ImageOcrModalProps> = ({
  isOpen,
  onClose,
  onConfirmQuestion,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [recognizedData, setRecognizedData] = useState<{
    recognizedQuestion: string;
    latex: string;
    detectedSubject: string;
    confidence: 'high' | 'medium' | 'low';
    ambiguities?: string | null;
  } | null>(null);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload an image file (JPG, PNG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setRecognizedData(null);
      setErrorMsg(null);
      triggerOcr(base64);
    };
    reader.readAsDataURL(file);
  };

  const triggerOcr = async (base64Img: string) => {
    setIsScanning(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Img }),
      });

      if (!response.ok) {
        throw new Error('OCR recognition failed');
      }

      const data = await response.json();
      setRecognizedData(data);
      setEditedQuestion(data.recognizedQuestion || data.latex || '');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not cleanly recognize text from this image. Please verify lighting and try again or type the equation.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirm = () => {
    if (!editedQuestion.trim()) return;
    onConfirmQuestion(editedQuestion.trim());
    onClose();
  };

  const handleReset = () => {
    setImagePreview(null);
    setRecognizedData(null);
    setEditedQuestion('');
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Visual Maths Problem Scanner</h2>
              <p className="text-xs text-slate-400">Scan textbook, worksheet or handwritten math</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-800/20 hover:bg-slate-800/40 group text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-base font-medium text-slate-200 mb-1">
                Click to upload or take a photo of a math problem
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Supports textbook exercises, printed formulas, graphs, handwritten notes and worksheets (JPG, PNG, WebP)
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Powered by Sharukh AI Vision Engine
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview & Scanner Indicator */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black max-h-52 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Math problem to solve"
                  className="max-h-52 w-auto object-contain"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    <p className="text-sm font-medium">Extracting equations and mathematical symbols...</p>
                    <span className="text-xs text-indigo-300">Checking fractions, powers and matrices</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-900 text-xs text-slate-300 rounded-md border border-slate-700 backdrop-blur-sm transition-colors"
                >
                  Change Image
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              )}

              {/* OCR Review Section */}
              {recognizedData && !isScanning && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Review Recognised Question
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          recognizedData.confidence === 'high'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : recognizedData.confidence === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        Confidence: {recognizedData.confidence}
                      </span>
                    </div>
                    {recognizedData.detectedSubject && (
                      <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {recognizedData.detectedSubject}
                      </span>
                    )}
                  </div>

                  {recognizedData.ambiguities && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-amber-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Review Notice:</span> {recognizedData.ambiguities}
                      </div>
                    </div>
                  )}

                  {/* Editable Question */}
                  <div className="relative">
                    <textarea
                      value={editedQuestion}
                      onChange={(e) => setEditedQuestion(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
                      placeholder="Verify the recognized question before solving..."
                    />
                    <div className="absolute right-2.5 bottom-2.5 text-[11px] text-slate-500 flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> Edit if needed
                    </div>
                  </div>

                  {/* Math Preview */}
                  {editedQuestion && (
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">
                        Mathematical Preview:
                      </span>
                      <div className="text-sm text-indigo-200">
                        <MathView content={editedQuestion} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          {recognizedData && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isScanning || !editedQuestion.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Confirm &amp; Solve with AI
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
