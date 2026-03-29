/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, Video, Sparkles, Copy, Check, RefreshCw, Play, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateTikTokScript, VideoData } from './services/aiService';

interface VideoState {
  file: File | null;
  preview: string | null;
  base64: string | null;
}

export default function App() {
  const [sampleVideo, setSampleVideo] = useState<VideoState>({ file: null, preview: null, base64: null });
  const [targetVideo, setTargetVideo] = useState<VideoState>({ file: null, preview: null, base64: null });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'sample' | 'target') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      const newState = {
        file,
        preview: URL.createObjectURL(file),
        base64: base64String,
      };
      if (type === 'sample') setSampleVideo(newState);
      else setTargetVideo(newState);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!sampleVideo.base64 || !targetVideo.base64) return;

    setIsGenerating(true);
    setGeneratedScript(null);

    try {
      const script = await generateTikTokScript(
        { base64: sampleVideo.base64, mimeType: sampleVideo.file!.type },
        { base64: targetVideo.base64, mimeType: targetVideo.file!.type }
      );
      setGeneratedScript(script);
    } catch (error) {
      console.error("Error generating script:", error);
      setGeneratedScript("Lỗi khi tạo kịch bản. Vui lòng thử lại!");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = (type: 'sample' | 'target') => {
    if (type === 'sample') setSampleVideo({ file: null, preview: null, base64: null });
    else setTargetVideo({ file: null, preview: null, base64: null });
    setGeneratedScript(null);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-sans selection:bg-[#FE2C55] selection:text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FE2C55] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(254,44,85,0.5)]">
              <Video className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">TikTok <span className="text-[#FE2C55]">Script AI</span></h1>
          </div>
          <div className="text-xs text-white/40 font-mono hidden sm:block">
            Vibe-matching Room Tour Generator
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Column: Uploads */}
          <div className="space-y-6">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60 flex items-center gap-2">
                  <Play className="w-4 h-4" /> 1. Video Mẫu (Vibe)
                </h2>
                {sampleVideo.preview && (
                  <button onClick={() => reset('sample')} className="text-white/40 hover:text-[#FE2C55] transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {!sampleVideo.preview ? (
                <div 
                  onClick={() => sampleInputRef.current?.click()}
                  className="group relative border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#FE2C55]/50 hover:bg-[#FE2C55]/5 transition-all duration-300 h-64 overflow-hidden"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8 text-white/40 group-hover:text-[#FE2C55]" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-white/80">Tải lên video mẫu</p>
                    <p className="text-xs text-white/40 mt-1">Video có giọng nói/phong cách bạn muốn bắt chước</p>
                  </div>
                  <input 
                    type="file" 
                    ref={sampleInputRef} 
                    onChange={(e) => handleFileChange(e, 'sample')} 
                    accept="video/*" 
                    className="hidden" 
                  />
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-video">
                  <video src={sampleVideo.preview} controls className="w-full h-full object-contain" />
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 2. Video Cần Làm (Target)
                </h2>
                {targetVideo.preview && (
                  <button onClick={() => reset('target')} className="text-white/40 hover:text-[#FE2C55] transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {!targetVideo.preview ? (
                <div 
                  onClick={() => targetInputRef.current?.click()}
                  className="group relative border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#25F4EE]/50 hover:bg-[#25F4EE]/5 transition-all duration-300 h-64 overflow-hidden"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8 text-white/40 group-hover:text-[#25F4EE]" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-white/80">Tải lên video phòng mới</p>
                    <p className="text-xs text-white/40 mt-1">Video quay phòng thực tế (không cần tiếng)</p>
                  </div>
                  <input 
                    type="file" 
                    ref={targetInputRef} 
                    onChange={(e) => handleFileChange(e, 'target')} 
                    accept="video/*" 
                    className="hidden" 
                  />
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-video">
                  <video src={targetVideo.preview} controls className="w-full h-full object-contain" />
                </div>
              )}
            </section>

            <button
              onClick={handleGenerate}
              disabled={!sampleVideo.base64 || !targetVideo.base64 || isGenerating}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                !sampleVideo.base64 || !targetVideo.base64 || isGenerating
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] text-black hover:scale-[1.02] active:scale-[0.98] shadow-[#FE2C55]/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  Đang phân tích & tạo kịch bản...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Tạo Kịch Bản Viral
                </>
              )}
            </button>
          </div>

          {/* Right Column: Result */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60">
                  Kịch Bản Gợi Ý
                </h2>
                {generatedScript && (
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Đã sao chép' : 'Sao chép'}
                  </button>
                )}
              </div>

              <div className="min-h-[500px] bg-white/5 rounded-3xl border border-white/10 p-6 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {!generatedScript && !isGenerating ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-white/20"
                    >
                      <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                      <p>Tải lên cả 2 video để bắt đầu sáng tạo nội dung triệu view!</p>
                    </motion.div>
                  ) : isGenerating ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse" />
                      <div className="h-4 bg-white/10 rounded-full w-full animate-pulse" />
                      <div className="h-4 bg-white/10 rounded-full w-5/6 animate-pulse" />
                      <div className="h-4 bg-white/10 rounded-full w-2/3 animate-pulse" />
                      <div className="h-4 bg-white/10 rounded-full w-full animate-pulse" />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="prose prose-invert max-w-none"
                    >
                      <div className="whitespace-pre-wrap text-white/90 leading-relaxed text-lg font-medium">
                        {generatedScript}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#FE2C55]/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#25F4EE]/10 blur-[80px] rounded-full pointer-events-none" />
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-[#FE2C55]/5 border border-[#FE2C55]/20 text-xs text-white/60 leading-relaxed">
                <p className="font-bold text-[#FE2C55] mb-1 uppercase tracking-tighter">Mẹo nhỏ:</p>
                Kịch bản đã được tinh chỉnh để tránh bị đánh dấu spam. Bạn có thể thay đổi thêm 1 vài từ ngữ địa phương để tăng tính cá nhân hóa!
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-white/20 text-sm">
          <p>© 2026 TikTok Room Tour AI. Built for creators.</p>
        </div>
      </footer>
    </div>
  );
}
