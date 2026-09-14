const canvas = document.getElementById("renderCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const downloadBtn = document.getElementById("downloadBtn");
const statusText = document.getElementById("statusText");

let currentScene = "default";
let currentSubtitle = "Start அழுத்தி பேசவும்...";
let recordedChunks = [];
let mediaRecorder;
let recognition;

// அனிமேஷன் துகள்கள் (Particles)
let particles = [];
function resetParticles(count) {
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 5 + 2,
      size: Math.random() * 3 + 1,
      alpha: Math.random()
    });
  }
}
resetParticles(150);

// காட்சி வரைதல் லூப் (Generative Graphics Loop)
function drawLoop() {
  // 1. காட்சிகள்
  if (currentScene === "rain") {
    ctx.fillStyle = "rgba(10, 15, 30, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    particles.forEach(p => {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + 15);
      ctx.stroke();
      p.y += 18;
      if (p.y > canvas.height) p.y = 0;
    });
  } else if (currentScene === "space") {
    ctx.fillStyle = "rgba(5, 5, 15, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      p.x -= 2;
      if (p.x < 0) p.x = canvas.width;
    });
  } else if (currentScene === "fire") {
    ctx.fillStyle = "rgba(20, 5, 5, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.fillStyle = `rgba(255, ${Math.floor(Math.random() * 150)}, 0, ${Math.random()})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
      ctx.fill();
      p.y -= 7;
      p.x += (Math.random() - 0.5) * 6;
      if (p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; }
    });
  } else if (currentScene === "ocean") {
    ctx.fillStyle = "#0369a1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#38bdf8";
    const time = Date.now() * 0.003;
    for (let x = 0; x < canvas.width; x += 10) {
      const y = Math.sin(x * 0.01 + time) * 30 + 400;
      ctx.fillRect(x, y, 10, canvas.height - y);
    }
  } else if (currentScene === "sun") {
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 250, 100, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Default Idle Matrix-like Scene
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#10b981";
    particles.forEach(p => {
      ctx.fillRect(p.x, p.y, 2, 8);
      p.y += 4;
      if (p.y > canvas.height) p.y = 0;
    });
  }

  // 2. சப்-டைட்டில் வரைதல்
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(currentSubtitle, canvas.width / 2, canvas.height - 40);

  requestAnimationFrame(drawLoop);
}
drawLoop();

// பேச்சு கண்டறிதல் (Speech Recognition)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("உங்கள் பிரவுசரில் மைக் சப்போர்ட் இல்லை. தயவுசெய்து Google Chrome-ஐப் பயன்படுத்தவும்.");
} else {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'ta-IN'; // தமிழ் மற்றும் ஆங்கில வார்த்தைகள் இரண்டையுமே ஏற்கும்

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    currentSubtitle = transcript;
    detectSceneKeywords(transcript.toLowerCase());
  };
}

// வார்த்தைக்கு ஏற்ப காட்சியை மாற்றும் ஃபங்ஷன்
function detectSceneKeywords(text) {
  if (text.includes("மழை") || text.includes("rain")) {
    currentScene = "rain";
    statusText.innerText = "காட்சி: Rain (மழை)";
  } else if (text.includes("விண்வெளி") || text.includes("space") || text.includes("star")) {
    currentScene = "space";
    statusText.innerText = "காட்சி: Space (விண்வெளி)";
  } else if (text.includes("நெருப்பு") || text.includes("தீ") || text.includes("fire")) {
    currentScene = "fire";
    statusText.innerText = "காட்சி: Fire (நெருப்பு)";
  } else if (text.includes("கடல்") || text.includes("ocean") || text.includes("wave")) {
    currentScene = "ocean";
    statusText.innerText = "காட்சி: Ocean (கடல்)";
  } else if (text.includes("சூரியன்") || text.includes("sun") || text.includes("வெளிச்சம்")) {
    currentScene = "sun";
    statusText.innerText = "காட்சி: Sun (சூரியன்)";
  }
}

// ரெக்கார்டிங் மற்றும் பதிவிறக்கம்
startBtn.onclick = () => {
  recordedChunks = [];
  const stream = canvas.captureStream(30);

  mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    downloadBtn.disabled = false;
    statusText.innerText = "வீடியோ தயார்! Download செய்யலாம்.";
  };

  mediaRecorder.start();
  recognition.start();

  startBtn.disabled = true;
  stopBtn.disabled = false;
  downloadBtn.disabled = true;
  statusText.innerText = "கேட்டுக் கொண்டிருக்கிறது... பேசுங்கள்!";
};

stopBtn.onclick = () => {
  recognition.stop();
  mediaRecorder.stop();

  startBtn.disabled = false;
  stopBtn.disabled = true;
};

downloadBtn.onclick = () => {
  const blob = new Blob(recordedChunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "generative_voice_video.webm";
  a.click();
};
