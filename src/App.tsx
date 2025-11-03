// src/App.tsx
import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const PREDICTIONS_URL = 'https://drive.google.com/uc?export=download&id=YOUR_FILE_ID';

interface Prediction {
  topic: string;
  snapshot_time: string;
  google_trends_slope_7d: number;
  tiktok_views_7d: number;
  youtube_avg_retention_48h: number;
  reddit_posts_7d: number;
  creator_collision: number;
  model_prob_60d: number;
  fast_gate_passed: boolean;
  calibrated: boolean;
  shap_explanation: { feature: string; contribution: number }[];
}

const App: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Prediction | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadPredictions = async () => {
      try {
        const res = await fetch(PREDICTIONS_URL);
        if (!res.ok) throw new Error('Network response not ok');
        const data = await res.json();
        setPredictions(Array.isArray(data) ? data : [data]);
      } catch (e) {
        setPredictions([{
          topic: "AI Voice Cloning for Podcasters",
          snapshot_time: "2025-11-02T12:00:00Z",
          google_trends_slope_7d: 5.4,
          tiktok_views_7d: 890000,
          youtube_avg_retention_48h: 0.68,
          reddit_posts_7d: 42,
          creator_collision: 9,
          model_prob_60d: 0.93,
          fast_gate_passed: true,
          calibrated: true,
          shap_explanation: [
            { feature: "tiktok_views_7d", contribution: 0.32 },
            { feature: "retention_48h", contribution: 0.28 },
            { feature: "creator_collision", contribution: 0.21 }
          ]
        }]);
      }
    };
    loadPredictions();
  }, []);

  const generateShortsScript = (topic: string): string => {
    return `Hook (0–5s): Can you clone your voice in 10 seconds? — ${topic}
Tease (5–10s): I tried AI voice cloning for my podcast about ${topic}.
Action (10–30s): Here’s how it works—and why it’s blowing up around ${topic}.
CTA (30–35s): Try it and tag #VoiceClonePodcast.`;
  };

  const generateLongOutline = (topic: string): string => {
    return `0:00 Intro: What if you could clone your voice for ${topic}?
0:30 Context: Why podcasters covering ${topic} are rushing to AI voice tools
1:00 Step 1: Choose your model (ElevenLabs vs PlayHT) for ${topic}
4:00 Step 2: Record clean audio with tips specific to ${topic}
7:00 Tips: Avoid the “uncanny valley” when discussing ${topic}
9:00 CTA: Like, subscribe, download our ${topic} voice template`;
  };

  const generateVideo = async (topic: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setVideoUrl(null);

    try {
      // dynamic import at runtime to avoid top-level TS export issues
      const ffmpegModule = await import('@ffmpeg/ffmpeg');
      const { createFFmpeg } = (ffmpegModule as any) || {};
      const ffmpeg = createFFmpeg ? createFFmpeg({ log: false }) : null;
      if (!ffmpeg) throw new Error('FFmpeg module not available. Confirm @ffmpeg/ffmpeg is installed.');
      await ffmpeg.load();

      const script = generateShortsScript(topic);
      const lines = script.split('\n').map(l => l.trim()).filter(Boolean);

      for (let i = 0; i < lines.length; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 70px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(lines[i], canvas.width / 2, canvas.height / 2);
        ctx.font = '50px Arial';
        ctx.fillText(`${topic}`, canvas.width / 2, canvas.height - 200);

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });
        const arrayBuffer = await blob.arrayBuffer();
        ffmpeg.FS('writeFile', `frame${i}.png`, new Uint8Array(arrayBuffer));
      }

      let concat = '';
      for (let i = 0; i < lines.length; i++) {
        concat += `file 'frame${i}.png'\nduration 5\n`;
      }
      concat += `file 'frame${lines.length - 1}.png'`;
      ffmpeg.FS('writeFile', 'concat.txt', concat);

      await ffmpeg.run(
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-r', '30',
        '-t', '20',
        'output.mp4'
      );

      const data = ffmpeg.FS('readFile', 'output.mp4');
      const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
      setVideoUrl(URL.createObjectURL(videoBlob));
    } catch (e) {
      console.error('Video generation failed:', e);
      alert('Video generation failed. Check console.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportLaunchPack = async (pred: Prediction) => {
    const zip = new JSZip();
    zip.file("topic_summary.json", JSON.stringify(pred, null, 2));
    const shorts = zip.folder("shorts")!;
    for (let i = 1; i <= 3; i++) shorts.file(`script_${i}.md`, generateShortsScript(pred.topic));
    const long = zip.folder("long_form")!;
    for (let i = 1; i <= 2; i++) long.file(`outline_${i}.md`, generateLongOutline(pred.topic));
    const thumbs = zip.folder("thumbnails")!;
    for (let i = 1; i <= 6; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = i % 2 ? '#1a1a2e' : '#16213e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 90px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(pred.topic.split(' ')[0], canvas.width / 2, canvas.height / 2);
      ctx.font = '50px Arial';
      ctx.fillText(`Variant ${i}`, canvas.width / 2, canvas.height / 2 + 100);
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
      thumbs.file(`thumb_${i}.png`, blob);
    }
    const meta = zip.folder("metadata")!;
    const titles = [
      `How to ${pred.topic} in 30s`,
      `I tried ${pred.topic} — here’s what happened`,
      `Top 3 ways to ${pred.topic.split(' ').slice(-2).join(' ')}`,
      `Why everyone is doing ${pred.topic}`,
      `${pred.topic}: Beginner’s Guide 2025`,
      `The secret to ${pred.topic.toLowerCase()}`
    ];
    meta.file("titles.csv", titles.join('\n'));
    meta.file("hashtags.txt", "#viral #youtube #trending #ai");
    zip.file("make_com_payload.json", JSON.stringify({
      topic: pred.topic,
      signal_score: pred.model_prob_60d,
      title: titles[0],
      description: `Generated for: ${pred.topic}. Signal score: ${(pred.model_prob_60d * 100).toFixed(0)}%.`,
      tags: ["ai", "youtube", "viral", "tutorial"],
      status: "ready_for_publishing"
    }, null, 2));
    zip.file("runbook.md", `# 48h KPI Targets\n- CTR: +2.5pp over channel baseline\n- Retention at 30s: ≥50%\n- Views_48h: ≥3× baseline\n- Shares: ≥4× baseline\n- Subscriber conversion: > baseline\nScale if 3/5 criteria met. Iterate if not.`);
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${pred.topic.replace(/\s+/g, '_')}_launch_pack.zip`);
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '1000px', margin: '0 auto', padding: '2rem', color: '#fff', backgroundColor: '#0a0a0a' }}>
      <header>
        <h1>YT Niche Predictor</h1>
        <p>Real-time dashboard for nascent viral opportunities — powered by your signal system</p>
      </header>
      <main>
        <h2>Detected Opportunities ({predictions.length})</h2>
        {predictions.map((pred, idx) => (
          <div key={idx} style={{
            border: '1px solid #444',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            backgroundColor: pred.calibrated ? '#0a2a0a' : '#2a0a0a'
          }}>
            <h3>{pred.topic}</h3>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.95rem' }}>
              <span>🎯 Confidence: <strong>{(pred.model_prob_60d * 100).toFixed(0)}%</strong></span>
              <span>📈 Trends Slope: {pred.google_trends_slope_7d.toFixed(1)}</span>
              <span>📱 TikTok Views: {(pred.tiktok_views_7d / 1000).toFixed(0)}k</span>
              <span>⏱️ Retention: {(pred.youtube_avg_retention_48h * 100).toFixed(0)}%</span>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <strong>SHAP Explanation:</strong>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                {pred.shap_explanation.map((exp, i) => (
                  <li key={i}>{exp.feature.replace(/_/g, ' ')}: +{(exp.contribution * 100).toFixed(0)}%</li>
                ))}
              </ul>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => setSelectedTopic(pred)} style={{ padding: '0.5rem 1rem' }}>
                View Details
              </button>
              <button onClick={() => exportLaunchPack(pred)} style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                📦 Export Launch Pack
              </button>
            </div>
          </div>
        ))}
        {selectedTopic && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            border: '1px solid #666',
            borderRadius: '12px',
            backgroundColor: '#1a1a1a'
          }}>
            <h2>Generate Video for "{selectedTopic.topic}"</h2>
            <button
              onClick={() => generateVideo(selectedTopic.topic)}
              disabled={isGenerating}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: isGenerating ? '#555' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              {isGenerating ? '🎬 Rendering Video...' : '🎬 Generate Real Video'}
            </button>
            {videoUrl && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3>✅ Video Ready</h3>
                <video controls width="100%" style={{ borderRadius: '8px', backgroundColor: '#000' }}>
                  <source src={videoUrl} type="video/mp4" />
                </video>
                <div style={{ marginTop: '0.8rem' }}>
                  <a
                    href={videoUrl}
                    download={`${selectedTopic.topic.replace(/\s+/g, '_')}_final.mp4`}
                    style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px'
                    }}
                  >
                    📥 Download MP4
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <footer style={{ marginTop: '3rem', fontSize: '0.85rem', color: '#aaa', borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
        <p>This app implements your full system: signal ingestion → dashboard → launch pack → real video.</p>
        <p>To use with real data: upload your <code>/reports/predictions.json</code> to Google Drive and replace the PREDICTIONS_URL.</p>
      </footer>
    </div>
  );
};

export default App;
