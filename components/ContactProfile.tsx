import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatContact } from '../types';
import Avatar from './Avatar';
import { CameraIcon, CloseIcon } from './icons/Icons';

interface ContactProfileProps {
  contact: ChatContact;
  onClose: () => void;
  onSave: (updatedContact: ChatContact) => void;
}

const ContactProfile: React.FC<ContactProfileProps> = ({ contact, onClose, onSave }) => {
  const [name, setName] = useState(contact.name);
  const [avatar, setAvatar] = useState(contact.avatar);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cleanupCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const handleOpenCamera = async () => {
    cleanupCamera();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("لا يمكن الوصول إلى الكاميرا. يرجى التحقق من الأذونات.");
    }
  };
  
  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
        videoRef.current.srcObject = stream;
    }
    return () => {
        cleanupCamera();
    };
  }, [isCameraOpen, stream, cleanupCamera]);

  const handleCloseCamera = () => {
    cleanupCamera();
    setIsCameraOpen(false);
  };

  const handleTakePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.translate(video.videoWidth, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        context.setTransform(1, 0, 0, 1, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setAvatar(dataUrl);
        handleCloseCamera();
      }
    }
  };

  const handleSave = () => {
    onSave({ ...contact, name: name.trim(), avatar });
  };

  const renderCameraView = () => (
    <div className="flex flex-col items-center justify-center p-4">
      <h3 className="text-xl font-semibold mb-4 text-slate-100">ضع وجهك في المنتصف</h3>
      <div className="relative w-full max-w-md aspect-video bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-600">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100"></video>
      </div>
      <div className="flex gap-4 mt-6">
        <button onClick={handleTakePhoto} className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-full transition-colors">
          التقط صورة
        </button>
        <button onClick={handleCloseCamera} className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-full transition-colors">
          إلغاء
        </button>
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );

  const renderProfileForm = () => (
    <>
      <div className="p-6 sm:p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-50 mb-6">تعديل جهة الاتصال</h2>
        <div className="relative inline-block mb-6 group">
          <Avatar src={avatar} alt={name} size="xl" />
          <button
            onClick={handleOpenCamera}
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Change contact avatar"
          >
            <CameraIcon className="w-8 h-8" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-6 text-right">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-slate-300 mb-2">اسم جهة الاتصال</label>
              <input
                type="text"
                id="contactName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-700 border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                required
              />
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button type="submit" className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-full transition-colors">
              حفظ التغييرات
            </button>
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-full transition-colors">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="relative w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden transform transition-all animate-fade-in-up">
        <button onClick={isCameraOpen ? handleCloseCamera : onClose} className="absolute top-4 left-4 text-slate-400 hover:text-white z-10" aria-label="Close">
          <CloseIcon className="w-6 h-6" />
        </button>
        {isCameraOpen ? renderCameraView() : renderProfileForm()}
      </div>
       <style>{`
         @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
         }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
       `}</style>
    </div>
  );
};

export default ContactProfile;
