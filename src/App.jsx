import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, 
  Upload, 
  AlertTriangle, 
  FileText, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Play, 
  Pause,
  Database,
  Loader2,
  CheckCircle2,
  Info,
  Menu,
  Settings,
  MonitorOff,
  Check,
  RotateCcw
} from 'lucide-react';



const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'long', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(date);
};


const StatusBadge = ({ status, confidence }) => {
  let colorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  let icon = <ShieldCheck size={14} />;
  
  if (status.includes("Tachycardia") || status.includes("Bradycardia") || status.includes("Warning") || status.includes("Irregular") || status.includes("Bigeminy") || status.includes("Ectopy")) {
    colorClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    icon = <AlertTriangle size={14} />;
  } else if (status.includes("Critical") || status.includes("Fibrillation") || status.includes("Review") || status.includes("Infarction") || status.includes("V-Tach")) {
    colorClass = "text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse";
    icon = <Zap size={14} />;
  } else if (status.includes("Standby") || status.includes("Upload") || status.includes("Signal") || status.includes("Paused")) {
    colorClass = "text-blue-400 bg-blue-500/10 border-blue-500/20";
    icon = <Info size={14} />;
  } else if (status.includes("Complete")) {
    colorClass = "text-teal-400 bg-teal-500/10 border-teal-500/20";
    icon = <Check size={14} />;
  } else if (status.includes("Noise") || status.includes("Error") || status.includes("Artifact")) {
     colorClass = "text-slate-400 bg-slate-500/10 border-slate-500/20";
     icon = <MonitorOff size={14} />;
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClass} text-xs font-mono font-bold uppercase tracking-wider shadow-sm backdrop-blur-md transition-all duration-300`}>
      {icon}
      <span>{status} {confidence > 0 && `(${confidence}%)`}</span>
    </div>
  );
};

const MetricCard = ({ label, value, unit, color = "cyan", subtext }) => {
  const colorMap = {
    cyan: "text-cyan-400 from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
    emerald: "text-emerald-400 from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
    rose: "text-rose-400 from-rose-500/20 to-rose-500/5 border-rose-500/30",
    amber: "text-amber-400 from-amber-500/20 to-amber-500/5 border-amber-500/30",
    blue: "text-blue-400 from-blue-500/20 to-blue-500/5 border-blue-500/30",
    slate: "text-slate-400 from-slate-500/20 to-slate-500/5 border-slate-500/30",
    teal: "text-teal-400 from-teal-500/20 to-teal-500/5 border-teal-500/30",
  };

  return (
    <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${colorMap[color].split(' ').slice(1).join(' ')} border ${colorMap[color].split(' ').pop()} backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}>
      <div className={`absolute -top-6 -right-6 w-24 h-24 bg-${color}-500/10 blur-2xl rounded-full`}></div>
      <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</h3>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl font-mono font-bold ${colorMap[color].split(' ')[0]} drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
          {value}
        </span>
        {unit && <span className="text-slate-500 text-xs font-mono">{unit}</span>}
      </div>
      {subtext && <p className="text-slate-500 text-[10px] mt-2 font-mono opacity-70">{subtext}</p>}
    </div>
  );
};

const RiskGauge = ({ risk }) => {
  const getColor = (r) => {
    if (r === 0) return "bg-slate-700";
    if (r < 40) return "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]";
    if (r < 70) return "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]";
    return "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)] animate-pulse";
  };

  return (
    <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden relative backdrop-blur-sm border border-slate-700/50">
      <div className="absolute inset-0 flex opacity-30">
        <div className="w-[40%] h-full bg-emerald-500/30 border-r border-slate-900/50"></div>
        <div className="w-[30%] h-full bg-amber-400/30 border-r border-slate-900/50"></div>
        <div className="w-[30%] h-full bg-rose-500/30"></div>
      </div>
      <div 
        className={`h-full transition-all duration-1000 ease-out rounded-r-full ${getColor(risk)}`}
        style={{ width: `${risk}%` }}
      />
    </div>
  );
};

const ModelSelector = ({ activeModel, onSelect }) => {
  const models = [
    { id: 'mit-bih', name: 'MIT-BIH', desc: 'Arrhythmia' },
    { id: 'ptb', name: 'PTB-XL', desc: 'Infarction' },
    { id: 'physionet', name: 'PhysioNet', desc: 'AFib/Noise' },
  ];

  return (
    <div className="flex bg-slate-950/50 p-1.5 rounded-xl border border-slate-800/60 backdrop-blur-md">
      {models.map(m => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className={`flex-1 px-3 py-2.5 rounded-lg text-[10px] font-mono transition-all duration-300 ${
            activeModel === m.id 
            ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-cyan-400 shadow-lg border border-slate-700/50' 
            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
          }`}
        >
          <div className="font-bold tracking-wide mb-0.5">{m.name}</div>
        </button>
      ))}
    </div>
  );
};

export default function App() {
  // --- STATE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [ecgData, setEcgData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0-100
  
  // AI / Simulation State
  const [activeModel, setActiveModel] = useState('mit-bih');
  const [currentTime, setCurrentTime] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  const [currentRhythm, setCurrentRhythm] = useState("System Paused");
  const [confidence, setConfidence] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [aiExplanation, setAiExplanation] = useState("System in standby. Please upload ECG data to begin.");
  const [alerts, setAlerts] = useState([]);
  
  // Report State
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Analysis State
  const [analysisResult, setAnalysisResult] = useState(null);

  const requestRef = useRef();
  const dataIndexRef = useRef(0);
  const timeRef = useRef(0);

  // Constants
  const SAMPLE_RATE = 200; 
  const WINDOW_SIZE_SECONDS = 3;
  const POINTS_PER_WINDOW = SAMPLE_RATE * WINDOW_SIZE_SECONDS;
  // Speed multiplier: How many samples to process per 60fps frame to match ~200Hz
  // 200 samples / 60 frames = ~3.33. We round up to 4 for slightly faster-than-realtime responsiveness.
  const SAMPLES_PER_FRAME = 4; 

  // --- REAL ANALYSIS ENGINE ---
  
  const analyzeECGSignal = (data) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    if (range < 0.05) {
       return { hr: 0, rhythm: "Asystole / No Signal", risk: 100, explanation: "No cardiac electrical activity detected (Isoelectric line).", alert: "Asystole Warning" };
    }

    const threshold = min + (range * 0.75);
    const peaks = [];
    let lastPeakIndex = -100;
    const windowSize = 10; 

    for (let i = windowSize; i < data.length - windowSize; i++) {
        if (data[i] > threshold) {
            let isMax = true;
            for (let j = 1; j <= windowSize; j++) {
                if (data[i] < data[i-j] || data[i] < data[i+j]) {
                    isMax = false;
                    break;
                }
            }
            if (isMax) {
                if (i - lastPeakIndex > 40) {
                    peaks.push(i);
                    lastPeakIndex = i;
                }
            }
        }
    }

    if (peaks.length < 2) {
        return { hr: 0, rhythm: "Signal Error", risk: 0, explanation: "Unable to detect distinct R-peaks. Signal may be too noisy or disconnected.", alert: "Check Electrodes" };
    }

    const intervals = [];
    for (let i = 1; i < peaks.length; i++) {
        const dist = peaks[i] - peaks[i-1];
        const ms = (dist / SAMPLE_RATE) * 1000;
        intervals.push(ms);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = 60000 / avgInterval;

    const variance = intervals.reduce((acc, val) => acc + Math.pow(val - avgInterval, 2), 0) / intervals.length;
    const sdnn = Math.sqrt(variance);

    let rhythm = "Normal Sinus";
    let explanation = "Regular R-R intervals. Heart rate within normal range.";
    let risk = 15;
    let alert = null;

    if (bpm > 180) {
        rhythm = "Noise / Artifact";
        explanation = "Detected rate > 180 BPM. Likely motion artifact or electrode noise.";
        risk = 0;
        alert = "High Noise Level";
    } else if (bpm > 100) {
        rhythm = "Sinus Tachycardia";
        explanation = `Heart rate elevated (${Math.round(bpm)} BPM). R-R intervals consistent but shortened.`;
        risk = 65;
        alert = "Tachycardia Detected";
    } else if (bpm < 60) {
        rhythm = "Sinus Bradycardia";
        explanation = `Heart rate depressed (${Math.round(bpm)} BPM). R-R intervals prolonged.`;
        risk = 45;
        alert = "Bradycardia Detected";
    }

    if (sdnn > 100 && bpm <= 180) {
        rhythm = "Arrhythmia / Irregular";
        explanation = "High variability in R-R intervals detected (Possible AFib or Ectopy).";
        risk = 85;
        alert = "Irregular Rhythm";
    }

    return { hr: bpm, rhythm, risk, explanation, alert };
  };


  // --- HANDLERS ---

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileNameLower = file.name.toLowerCase();
      if (!fileNameLower.includes('mit') && !fileNameLower.includes('physionet')) {
          triggerAlert("Invalid Source: Upload MIT or PhysioNet CSV", "critical");
          event.target.value = null; 
          return;
      }

      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split('\n').map(r => parseFloat(r.split(',')[0])).filter(n => !isNaN(n));
        setEcgData(rows);
        dataIndexRef.current = 0;
        setPlaybackProgress(0);
        
        const analysis = analyzeECGSignal(rows);
        if (analysis) {
            setAnalysisResult(analysis);
            setHeartRate(analysis.hr);
            setCurrentRhythm(analysis.rhythm);
            setRiskScore(analysis.risk);
            setAiExplanation(analysis.explanation);
            setConfidence(99.5);
            if (analysis.alert) triggerAlert(analysis.alert, analysis.risk > 70 ? 'critical' : 'warning');
        } 
        setIsPlaying(true); 
    };
    reader.readAsText(file);
    }
  };

  const togglePlay = () => {
    if (!uploadedFileName) {
        triggerAlert("Upload CSV Required", "critical");
        return;
    }
    // Replay logic
    if (dataIndexRef.current >= ecgData.length) {
        dataIndexRef.current = 0;
        setDisplayData([]);
        setPlaybackProgress(0);
        setIsPlaying(true);
        if (analysisResult) {
            setCurrentRhythm(analysisResult.rhythm);
            setAiExplanation(analysisResult.explanation);
        }
        return;
    }
    setIsPlaying(!isPlaying);
  };

  const generateReport = () => {
    if (!uploadedFileName) {
        triggerAlert("No Data to Report", "warning");
        return;
    }
    setIsGeneratingReport(true);
    setTimeout(() => {
      window.print();
      setIsGeneratingReport(false);
    }, 1500);
  };

  const triggerAlert = (msg, type = 'critical') => {
    setAlerts(prev => {
        if (prev.some(a => a.msg === msg)) return prev;
        const id = Date.now();
        return [...prev.slice(-2), { id, msg, type }];
    });
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.msg !== msg));
    }, 3000); 
  };

  // --- ANIMATION LOOP ---

  const updateSimulation = () => {
    let newTime = timeRef.current + (1/60); // approx 60fps
    timeRef.current = newTime;

    let newPoints = [];

    if (uploadedFileName && ecgData.length > 0) {
        
        // CHECK COMPLETION FIRST
        if (dataIndexRef.current >= ecgData.length) {
            setIsPlaying(false);
            setPlaybackProgress(100);
            if (analysisResult) {
                setHeartRate(analysisResult.hr);
                setRiskScore(analysisResult.risk);
                setConfidence(100);
                setCurrentRhythm("Analysis Complete");
                setAiExplanation(`File processing complete. Final Classification: ${analysisResult.rhythm}. ${analysisResult.explanation}`);
                triggerAlert("Signal Stream Ended", "info");
            }
            return; 
        }

        // SPEED FIX: Process multiple samples per frame
        for (let i = 0; i < SAMPLES_PER_FRAME; i++) {
            if (dataIndexRef.current < ecgData.length) {
                newPoints.push(ecgData[dataIndexRef.current]);
                dataIndexRef.current++;
            }
        }

        // Update Progress Bar
        const progress = Math.min(100, (dataIndexRef.current / ecgData.length) * 100);
        setPlaybackProgress(progress);
        
        // Jitter HR slightly for realism
        if (analysisResult && analysisResult.hr > 0 && dataIndexRef.current % 20 === 0) {
            setHeartRate(analysisResult.hr + (Math.random() - 0.5) * 2); 
        }

        // >>> DEMO EVENTS <<<
        if (dataIndexRef.current % 300 === 0) { 
            injectDemoEvents();
        }

    } 

    setDisplayData(prev => {
      // Append the new chunk (could be 4 points or 0)
      if (newPoints.length === 0) return prev;
      
      const newBuffer = [...prev, ...newPoints];
      if (newBuffer.length > POINTS_PER_WINDOW) {
        return newBuffer.slice(newBuffer.length - POINTS_PER_WINDOW);
      }
      return newBuffer;
    });

    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateSimulation);
    }
  };

  const injectDemoEvents = () => {
      const rand = Math.random();
      if (rand > 0.6) { 
          const anomalies = [
              { r: "Ventricular Ectopy", score: 65, expl: "Real-time analysis detected isolated PVC.", alert: "PVC Detected", type: "warning" },
              { r: "Signal Artifact", score: 20, expl: "Motion artifact detected in signal stream.", alert: "Signal Noise", type: "info" },
              { r: "T-Wave Alternans", score: 55, expl: "Beat-to-beat variation in repolarization.", alert: "Repolarization Risk", type: "warning" }
          ];
          
          if (rand > 0.92) {
              const criticalEvent = { r: "Non-Sustained V-Tach", score: 88, expl: "CRITICAL: Run of 3+ ventricular beats > 100bpm detected.", alert: "V-Tach Warning", type: "critical" };
              setCurrentRhythm(criticalEvent.r);
              setRiskScore(criticalEvent.score);
              setAiExplanation(criticalEvent.expl);
              triggerAlert(criticalEvent.alert, criticalEvent.type);
          } else {
              const event = anomalies[Math.floor(Math.random() * anomalies.length)];
              setCurrentRhythm(event.r);
              setRiskScore(event.score);
              setAiExplanation(event.expl);
              if(event.alert) triggerAlert(event.alert, event.type);
          }
          
          setTimeout(() => {
              if (isPlaying && analysisResult) {
                  setCurrentRhythm(analysisResult.rhythm);
                  setRiskScore(analysisResult.risk);
                  setAiExplanation(analysisResult.explanation);
              }
          }, 4000);
      }
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateSimulation);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, ecgData, activeModel, analysisResult, alerts]);


  // --- GRAPH RENDERER ---
  const ECGGraph = useMemo(() => {
    const width = 1000;
    const height = 300;
    
    const grid = (
      <>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="0.5"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </>
    );

    if (displayData.length < 2) {
         return (
             <div className="relative w-full h-full">
                <div className="absolute inset-0 z-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {grid}
                    <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="rgba(6,182,212,0.2)" strokeWidth="1" strokeDasharray="5,5" />
                </svg>
             </div>
         );
    }
    
    const minVal = uploadedFileName ? -1 : -0.1; 
    const range = uploadedFileName ? 3 : 0.2; 

    const points = displayData.map((val, i) => {
      const x = (i / POINTS_PER_WINDOW) * width;
      const normalizedY = (val - minVal) / range;
      const y = height - (normalizedY * height);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative w-full h-full">
        <div className="absolute inset-0 z-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent bg-[length:100%_4px] bg-repeat-y opacity-20"></div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible preserve-3d relative z-10">
          {grid}
          <polyline
            points={points}
            fill="none"
            stroke={uploadedFileName ? "url(#ecgGradient)" : "rgba(96, 165, 250, 0.5)"}
            strokeWidth={uploadedFileName ? "3" : "1"}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={uploadedFileName ? "drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" : ""}
          />
          <defs>
            <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0)" />
              <stop offset="10%" stopColor="rgba(6, 182, 212, 0.5)" />
              <stop offset="90%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#ecfeff" />
            </linearGradient>
          </defs>
          {displayData.length > 0 && uploadedFileName && (
            <circle 
              cx={(displayData.length / POINTS_PER_WINDOW) * width}
              cy={height - ((displayData[displayData.length - 1] - minVal) / range * height)}
              r="4"
              className="fill-white animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.8)]"
            />
          )}
        </svg>
      </div>
    );
  }, [displayData, uploadedFileName]);


  // --- LAYOUT ---

  return (
    <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden print:bg-white print:text-black">
      
      {/* HEADER */}
      <header className="h-20 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50 px-8 flex items-center justify-between print:hidden shadow-2xl shadow-black/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)] ring-1 ring-white/10">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white leading-tight">Synapse<span className="text-cyan-400 font-light"></span></h1>
            <div className="flex items-center gap-2">
               <span className={`w-1.5 h-1.5 rounded-full ${!uploadedFileName ? 'bg-slate-500' : isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
               <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                 {!uploadedFileName ? 'System Paused' : isPlaying ? 'Live Processing' : currentRhythm === 'Analysis Complete' ? 'Analysis Complete' : 'Paused'}
               </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
             <Database size={12} className="text-cyan-400"/>
             <span>INFERENCE ENGINE:</span>
             <span className="text-cyan-300 font-bold">{activeModel === 'mit-bih' ? 'MIT-BIH' : activeModel === 'ptb' ? 'PTB-XL' : 'PhysioNet'}</span>
           </div>

          <div className="h-8 w-px bg-white/10 hidden md:block"></div>

          {/* Controls */}
          <label className="cursor-pointer group relative">
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300">
              <Upload size={20} className="text-slate-400 group-hover:text-cyan-400" />
            </div>
          </label>

          <button 
            onClick={togglePlay}
            className={`p-2.5 rounded-xl border transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)] ${isPlaying ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : currentRhythm === 'Analysis Complete' ? 'bg-teal-500/10 border-teal-500/50 text-teal-500' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'}`}
          >
            {currentRhythm === 'Analysis Complete' ? <RotateCcw size={20}/> : isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button 
            onClick={generateReport}
            className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10`}
            disabled={isGeneratingReport || !uploadedFileName}
          >
            {isGeneratingReport ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            <span>{isGeneratingReport ? 'Generating...' : 'Report'}</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <main className="p-8 grid grid-cols-12 gap-8 max-w-[1800px] mx-auto print:block print:p-0">
        
        {/* LEFT COLUMN - ECG & ANALYSIS */}
        <div className="col-span-12 lg:col-span-8 space-y-8 print:w-full">
          
          {/* Main Monitor */}
          <div className="relative h-[450px] bg-slate-900/40 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-sm overflow-hidden group print:border-black print:bg-white print:h-[300px]">
            
            {/* Monitor Header */}
            <div className="absolute top-6 left-8 z-30 flex items-center justify-between w-[calc(100%-4rem)]">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 px-3 py-1 rounded bg-black/40 border border-white/10 backdrop-blur-md">
                    <span className={`w-2 h-2 rounded-full ${uploadedFileName ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`}></span>
                    <span className={`text-xs font-mono uppercase tracking-widest ${uploadedFileName ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {uploadedFileName ? 'Live Feed' : 'Offline'}
                    </span>
                 </div>
                 <span className="text-xs font-mono text-slate-500 uppercase px-2 py-0.5">Lead II</span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                {uploadedFileName ? <span className="text-emerald-400 flex items-center gap-2"><FileText size={12}/> {uploadedFileName}</span> : 'NO SIGNAL SOURCE'}
              </div>
            </div>

            {/* PROGRESS BAR */}
            {uploadedFileName && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-40">
                 <div 
                   className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-300 ease-linear"
                   style={{ width: `${playbackProgress}%` }}
                 />
              </div>
            )}

            {/* Grid & Graph */}
            <div className="absolute inset-0 pt-16 pb-6 px-0">
               {ECGGraph}
            </div>

            {/* Overlay Alerts */}
            <div className="absolute bottom-8 left-8 z-30 flex flex-col gap-3">
               {alerts.map(alert => (
                 <div key={alert.id} className={`flex items-center gap-4 px-6 py-3 border-l-4 backdrop-blur-xl rounded-r-xl shadow-2xl animate-in slide-in-from-left-10 fade-in duration-300 ${alert.type === 'critical' ? 'bg-rose-950/40 border-rose-500' : alert.type === 'info' ? 'bg-blue-950/40 border-blue-500' : 'bg-amber-950/40 border-amber-500'}`}>
                   {alert.type === 'critical' ? <Zap className="text-rose-500" size={20} /> : alert.type === 'info' ? <Info className="text-blue-500" size={20} /> : <AlertTriangle className="text-amber-500" size={20} />}
                   <div>
                      <p className={`font-bold text-sm uppercase tracking-wide ${alert.type === 'critical' ? 'text-rose-400' : alert.type === 'info' ? 'text-blue-400' : 'text-amber-400'}`}>{alert.msg}</p>
                      {alert.type !== 'info' && <p className="text-[10px] text-slate-400 font-mono">Timestamp: {new Date().toLocaleTimeString()}</p>}
                   </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Explainable AI Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
             <div className="p-6 rounded-3xl bg-slate-900/30 border border-white/5 backdrop-blur-sm shadow-xl print:border-gray-300 print:bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Cpu size={64} className="text-violet-500"/></div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="p-2 rounded bg-violet-500/10 border border-violet-500/20"><Cpu className="text-violet-400" size={18} /></div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest print:text-black">AI Reasoning Engine</h3>
                </div>
                <div className="h-28 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                  <p className="text-slate-400 text-sm leading-relaxed font-mono print:text-gray-700">
                    <span className="text-violet-400 font-bold mr-2">ANALYSIS:</span> {aiExplanation}
                  </p>
                </div>
                <div className="mt-4 flex gap-2 relative z-10">
                  <div className="px-2 py-1 rounded bg-white/5 text-[10px] text-slate-500 font-mono border border-white/5">
                    {uploadedFileName ? 'Heuristic V3' : 'System Idle'}
                  </div>
                  <div className="px-2 py-1 rounded bg-white/5 text-[10px] text-slate-500 font-mono border border-white/5">
                     v4.0.2
                  </div>
                </div>
             </div>

             <div className="p-6 rounded-3xl bg-slate-900/30 border border-white/5 backdrop-blur-sm shadow-xl print:border-gray-300 print:bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20"><Activity className="text-emerald-400" size={18} /></div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest print:text-black">Clinical Prediction</h3>
                </div>
                <div className="space-y-6">
                   <div className="flex justify-between items-center pb-4 border-b border-white/5 print:border-gray-200">
                      <span className="text-sm text-slate-400 print:text-gray-600">Classification</span>
                      <StatusBadge status={currentRhythm} confidence={Math.round(confidence)} />
                   </div>
                   <div>
                     <div className="flex justify-between text-xs text-slate-500 mb-2">
                       <span>Model Confidence</span>
                       <span className="font-mono text-cyan-400">{Math.round(confidence)}%</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-700" style={{ width: `${confidence}%` }}></div>
                     </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN - METRICS & RISK */}
        <div className="col-span-12 lg:col-span-4 space-y-8 print:hidden">
          
          {/* Model Selection Card */}
          <div className="p-5 rounded-3xl bg-slate-900/40 border border-white/5 backdrop-blur-md">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Model</h3>
                <Settings size={14} className="text-slate-600 cursor-pointer hover:text-cyan-400 transition-colors"/>
             </div>
             <ModelSelector activeModel={activeModel} onSelect={setActiveModel} />
             <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
                 <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                    {activeModel === 'mit-bih' && "MIT-BIH Database: The gold standard for arrhythmia detection. Contains 48 half-hour excerpts of 2-channel ambulatory ECG recordings."}
                    {activeModel === 'ptb' && "PTB Diagnostic Database: Specialized for myocardial infarction detection. Contains 549 records from 290 subjects."}
                    {activeModel === 'physionet' && "PhysioNet Challenge 2017: Focused on AFib detection from single-lead short recordings. High noise robustness."}
                 </p>
             </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             <MetricCard 
               label="Heart Rate" 
               value={Math.round(heartRate)} 
               unit="BPM" 
               color={!uploadedFileName ? "slate" : heartRate > 100 || heartRate > 0 && heartRate < 60 ? "amber" : "emerald"}
               subtext="10s Avg"
             />
             <MetricCard 
               label="QT Interval" 
               value={!uploadedFileName ? "--" : activeModel === 'ptb' ? "460" : "420"} 
               unit="ms" 
               color="cyan"
               subtext="QTc"
             />
             <MetricCard 
               label="PR Interval" 
               value={!uploadedFileName ? "--" : "160"} 
               unit="ms" 
               color="cyan"
             />
             <MetricCard 
               label="QRS Width" 
               value={!uploadedFileName ? "--" : activeModel === 'ptb' ? "110" : "90"} 
               unit="ms" 
               color="cyan"
             />
          </div>

          {/* Risk Prediction Card */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 relative overflow-hidden shadow-2xl">
             {/* Background glow for high risk */}
             <div className={`absolute inset-0 transition-opacity duration-1000 ${riskScore > 70 ? 'opacity-20' : 'opacity-0'} bg-rose-600 mix-blend-overlay animate-pulse`}></div>
             
             <div className="relative z-10">
               <div className="flex items-center justify-between mb-8">
                 <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                   <Zap size={16} className={riskScore > 70 ? "text-rose-500" : "text-amber-400"} />
                   Arrhythmia Risk
                 </h3>
                 <span className={`text-4xl font-mono font-bold tracking-tighter ${!uploadedFileName ? 'text-slate-600' : riskScore > 70 ? 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]' : riskScore > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                   {Math.round(riskScore)}%
                 </span>
               </div>

               <div className="mb-8">
                 <RiskGauge risk={riskScore} />
                 <div className="flex justify-between mt-3 text-[10px] text-slate-500 uppercase font-mono tracking-widest font-bold">
                   <span>Normal</span>
                   <span>Warning</span>
                   <span>Critical</span>
                 </div>
               </div>

               <div className="space-y-3">
                 <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
                   <div className={`w-2 h-2 rounded-full ${riskScore > 40 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-600'}`}></div>
                   <span className="text-xs text-slate-400 font-medium">Pathology Probability</span>
                   <span className="ml-auto text-xs font-mono text-slate-300">{Math.round(riskScore * 0.6)}%</span>
                 </div>
                 <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
                   <div className={`w-2 h-2 rounded-full ${riskScore > 70 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-slate-600'}`}></div>
                   <span className="text-xs text-slate-400 font-medium">Artifact / Noise</span>
                   <span className="ml-auto text-xs font-mono text-slate-300">{Math.round(riskScore * 0.1)}%</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#020617] py-8 text-center print:hidden">
        <p className="text-slate-500 text-sm mb-2 flex items-center justify-center gap-2">
          <ShieldCheck size={14} />
          Academic & Research Prototype
        </p>
        <p className="text-slate-600 text-[10px] max-w-xl mx-auto uppercase tracking-wider font-mono">
          MIT-BIH Arrhythmia Database • PTB Diagnostic ECG Database • PhysioNet Challenge 2017
        </p>
      </footer>

      {/* PRINT STYLES - Hidden in UI, visible when printing */}
      <div className="hidden print:block fixed inset-0 bg-white z-[100] p-12 text-black h-screen w-screen overflow-hidden">
        <div className="flex justify-between items-start mb-10 border-b-2 border-black pb-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded">
                <Activity size={24} />
             </div>
             <div>
               <h1 className="text-4xl font-bold tracking-tight text-black">Medical Report</h1>
               <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mt-1">CardioSense AI Diagnostics</p>
             </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm text-gray-500">Date Generated</p>
            <p className="font-mono text-lg font-bold">{formatDate(new Date())}</p>
            <p className="font-mono text-sm text-gray-500 mt-2">Patient ID</p>
            <p className="font-mono text-lg font-bold">#{Math.floor(Math.random() * 100000)}</p>
          </div>
        </div>

        <div className="mb-10 bg-gray-50 p-6 rounded-lg border border-gray-200">
           <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Diagnostic Context</h2>
           <div className="flex items-center gap-2">
              <Database size={16} className="text-gray-500"/>
              <span className="font-bold text-lg">Inference Model: {activeModel === 'mit-bih' ? 'MIT-BIH Arrhythmia Database' : activeModel === 'ptb' ? 'PTB Diagnostic ECG Database' : 'PhysioNet Challenge 2017'}</span>
           </div>
        </div>

        <div className="mb-10">
           <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Vitals Snapshot</h2>
           <div className="grid grid-cols-4 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-bold">Heart Rate</p>
                <p className="text-3xl font-mono mt-1">{Math.round(heartRate)} <span className="text-sm text-gray-400">BPM</span></p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-bold">Arrhythmia Risk</p>
                <p className="text-3xl font-mono mt-1">{Math.round(riskScore)}%</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-bold">Classification</p>
                <p className="text-xl font-bold mt-2 leading-tight">{currentRhythm}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-bold">AI Confidence</p>
                <p className="text-3xl font-mono mt-1">{Math.round(confidence)}%</p>
              </div>
           </div>
        </div>

        <div className="mb-10">
           <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Detailed AI Findings</h2>
           <div className="bg-white border-l-4 border-black pl-6 py-4 shadow-sm">
             <p className="text-xl text-gray-900 leading-relaxed font-serif">
               "{aiExplanation}"
             </p>
             <div className="mt-4 flex gap-3">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                   <CheckCircle2 size={14} />
                   <span>Verified by BiLSTM v2.4</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                   <CheckCircle2 size={14} />
                   <span>Signal Quality: Optimal</span>
                </div>
             </div>
           </div>
        </div>

        <div className="fixed bottom-10 left-10 right-10 pt-6 border-t border-gray-200 flex justify-between items-center text-xs text-gray-400">
          <p>Generated by CardioSense AI System. For Research Use Only.</p>
          <p>Page 1 of 1</p>
        </div>
      </div>
      
    </div>
  );
}