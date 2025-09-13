
import React, { useState, useEffect, useRef } from 'react';
import type { ChatContact } from '../types';
import Avatar from './Avatar';
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, PhoneHangUpIcon, SettingsIcon } from './icons/Icons';

interface VideoCallProps {
  contact: ChatContact;
  onEndCall: () => void;
}

// Define types for quality settings
type Quality = '360p' | '720p' | '1080p';
type FrameRate = 15 | 30;

interface QualitySettings {
  resolution: Quality;
  frameRate: FrameRate;
}

const RESOLUTION_CONSTRAINTS: Record<Quality, MediaTrackConstraints> = {
  '360p': { width: { ideal: 640 }, height: { ideal: 360 } },
  '720p': { width: { ideal: 1280 }, height: { ideal: 720 } },
  '1080p': { width: { ideal: 1920 }, height: { ideal: 1080 } },
};

const FRAME_RATE_CONSTRAINTS: Record<FrameRate, MediaTrackConstraints> = {
  15: { frameRate: { ideal: 15 } },
  30: { frameRate: { ideal: 30 } },
};


const VideoCall: React.FC<VideoCallProps> = ({ contact, onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [qualitySettings, setQualitySettings] = useState<QualitySettings>({ resolution: '720p', frameRate: 30 });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Effect to request media access based on quality settings and handle cleanup
  useEffect(() => {
    let stream: MediaStream | null = null;

    const getMediaStream = async () => {
      try {
        const videoConstraints = {
            ...RESOLUTION_CONSTRAINTS[qualitySettings.resolution],
            ...FRAME_RATE_CONSTRAINTS[qualitySettings.frameRate],
        };

        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices.', error);
        alert('لا يمكن الوصول إلى الكاميرا أو الميكروفون. يرجى التحقق من الأذونات أو أن الجهاز يدعم الإعدادات المطلوبة.');
        onEndCall();
      }
    };

    getMediaStream();

    // Cleanup function: runs when component unmounts OR when dependencies change
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [qualitySettings, onEndCall]);


  // Effect for toggling microphone mute state
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [localStream, isMuted]);

  // Effect for toggling camera on/off state
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOff;
      });
    }
  }, [localStream, isCameraOff]);

  // Effect for call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  const handleQualityChange = (newSettings: Partial<QualitySettings>) => {
    setQualitySettings(prev => ({...prev, ...newSettings}));
    setIsSettingsOpen(false); // Close menu after selection
  }

  return (
    <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-between z-50 text-white p-8">
      {/* Remote peer video placeholder (blurred avatar) */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${contact.avatar})`, filter: 'blur(20px) brightness(0.5)' }}
      />

      {/* Header Info */}
      <div className="text-center">
        <h2 className="text-3xl font-bold">{contact.name}</h2>
        <p className="text-lg text-slate-300">{formatDuration(callDuration)}</p>
      </div>

      {/* Local Video Preview */}
      <div className="absolute top-8 right-8 w-48 h-36 md:w-64 md:h-48 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-600 shadow-lg">
        {isCameraOff ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-700">
            {/* Show contact avatar when local video is off */}
             <Avatar src="https://i.pravatar.cc/150?u=current-user" alt="User Avatar" size="lg" />
          </div>
        ) : (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted // Mute local preview to prevent echo
            className="w-full h-full object-cover transform -scale-x-100" // Flip video horizontally for mirror effect
          ></video>
        )}
      </div>

      {/* Call Controls Wrapper */}
      <div className="relative flex justify-center">
         {/* Settings Popover */}
        {isSettingsOpen && (
           <div className="absolute bottom-full mb-4 w-72 bg-slate-700/90 backdrop-blur-sm rounded-lg shadow-xl p-4 text-white animate-fade-in-up">
             <div className="mb-4">
                <h4 className="font-semibold mb-2 text-slate-300">الجودة (Resolution)</h4>
                <div className="flex justify-around gap-2">
                    {(['360p', '720p', '1080p'] as Quality[]).map(res => (
                        <button key={res} onClick={() => handleQualityChange({ resolution: res })}
                            className={`px-3 py-1 rounded-md text-sm transition-colors w-full ${qualitySettings.resolution === res ? 'bg-teal-500 text-white font-bold shadow-lg' : 'bg-slate-600 hover:bg-slate-500'}`}>
                            {res}
                        </button>
                    ))}
                </div>
             </div>
             <div>
                <h4 className="font-semibold mb-2 text-slate-300">معدل الإطارات (Frame Rate)</h4>
                <div className="flex justify-around gap-2">
                     {([15, 30] as FrameRate[]).map(fps => (
                        <button key={fps} onClick={() => handleQualityChange({ frameRate: fps })}
                           className={`px-3 py-1 rounded-md text-sm transition-colors w-full ${qualitySettings.frameRate === fps ? 'bg-teal-500 text-white font-bold shadow-lg' : 'bg-slate-600 hover:bg-slate-500'}`}>
                            {fps} fps
                        </button>
                    ))}
                </div>
             </div>
           </div>
        )}
          {/* Control Buttons */}
          <div className="flex items-center gap-6 p-4 bg-slate-800/50 rounded-full">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-4 bg-slate-700/80 rounded-full hover:bg-slate-600 transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOffIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setIsCameraOff(!isCameraOff)}
              className="p-4 bg-slate-700/80 rounded-full hover:bg-slate-600 transition-colors"
              aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
            >
              {isCameraOff ? <VideoOffIcon className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
            </button>
             <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-4 bg-slate-700/80 rounded-full hover:bg-slate-600 transition-colors"
              aria-label="Call settings"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
            <button
              onClick={onEndCall}
              className="p-4 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
              aria-label="End call"
            >
              <PhoneHangUpIcon className="w-6 h-6" />
            </button>
          </div>
      </div>
    </div>
  );
};

export default VideoCall;
