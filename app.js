(() => {
  const { SoundTouch, SimpleFilter, WebAudioBufferSource } = window.soundtouch;

  // 큐베이스 스타일: 원곡 키를 0(가운데 C4)으로 잡았을 때 -12 ~ +12 반음 각각의 음이름 및 음정(Interval) 정보
  const KEY_MAP = [
    { semi: -12, note: 'C3', isBlack: false, shortInt: '-1옥타브', fullInt: '완전 8도 낮춤 (-1 Octave)', guide: '원곡보다 정확히 한 옥타브 낮은 키' },
    { semi: -11, note: 'C#3', isBlack: true, shortInt: '장7도↓', fullInt: '장 7도 낮춤', guide: '매우 낮은 음역대' },
    { semi: -10, note: 'D3', isBlack: false, shortInt: '단7도↓', fullInt: '단 7도 낮춤', guide: '깊은 저음역대로 변환' },
    { semi: -9, note: 'D#3', isBlack: true, shortInt: '장6도↓', fullInt: '장 6도 낮춤', guide: '여자 곡을 저음 남성이 부를 때' },
    { semi: -8, note: 'E3', isBlack: false, shortInt: '단6도↓', fullInt: '단 6도 낮춤', guide: '여자 곡을 중저음 남성이 부를 때' },
    { semi: -7, note: 'F3', isBlack: false, shortInt: '완전5도↓', fullInt: '완전 5도 낮춤', guide: '화성적으로 매우 안정적인 낮은 키' },
    { semi: -6, note: 'F#3', isBlack: true, shortInt: '증4도↓', fullInt: '증 4도(감 5도) 낮춤', guide: '반옥타브 낮춤' },
    { semi: -5, note: 'G3', isBlack: false, shortInt: '완전4도↓', fullInt: '완전 4도 낮춤 (여자곡→남자키 추천)', guide: '여자 아이돌/발라드 곡을 남자가 부르기 가장 좋은 키' },
    { semi: -4, note: 'G#3', isBlack: true, shortInt: '장3도↓', fullInt: '장 3도 낮춤 (여자곡→남자키)', guide: '여자 원곡을 남자 키로 바꿀 때 자주 쓰는 스케일' },
    { semi: -3, note: 'A3', isBlack: false, shortInt: '단3도↓', fullInt: '단 3도 낮춤', guide: '고음이 꽤 부담스러울 때 자연스럽게 낮춘 키' },
    { semi: -2, note: 'A#3', isBlack: true, shortInt: '장2도↓', fullInt: '장 2도(온음) 낮춤', guide: '노래방에서 보통 2키 내릴 때의 스케일' },
    { semi: -1, note: 'B3', isBlack: false, shortInt: '단2도↓', fullInt: '단 2도(반음) 낮춤', guide: '최고음이 살짝 버거울 때 반음만 살짝 낮춤' },
    { semi: 0, note: 'C4', isBlack: false, shortInt: '원곡(C)', fullInt: '완전 1도 (원곡 키 그대로)', guide: '피치 변화 없는 원본 스케일' },
    { semi: 1, note: 'C#4', isBlack: true, shortInt: '단2도↑', fullInt: '단 2도(반음) 올림', guide: '원곡보다 반음 높여 시원한 느낌을 줄 때' },
    { semi: 2, note: 'D4', isBlack: false, shortInt: '장2도↑', fullInt: '장 2도(온음) 올림', guide: '노래방에서 보통 2키 올릴 때의 스케일' },
    { semi: 3, note: 'D#4', isBlack: true, shortInt: '단3도↑', fullInt: '단 3도 올림', guide: '노래가 낮아서 3키 높여 부르고 싶을 때' },
    { semi: 4, note: 'E4', isBlack: false, shortInt: '장3도↑', fullInt: '장 3도 올림 (남자곡→여자키)', guide: '남자 원곡을 여자 키로 바꿀 때 자주 쓰는 스케일' },
    { semi: 5, note: 'F4', isBlack: false, shortInt: '완전4도↑', fullInt: '완전 4도 올림 (남자곡→여자키 추천)', guide: '남자 발라드/가요를 여자가 부르기 가장 좋은 키' },
    { semi: 6, note: 'F#4', isBlack: true, shortInt: '증4도↑', fullInt: '증 4도(감 5도) 올림', guide: '반옥타브 올림' },
    { semi: 7, note: 'G4', isBlack: false, shortInt: '완전5도↑', fullInt: '완전 5도 올림', guide: '화성적으로 자연스러운 고음역 변환' },
    { semi: 8, note: 'G#4', isBlack: true, shortInt: '단6도↑', fullInt: '단 6도 올림', guide: '저음 남성 곡을 고음 여성이 부를 때' },
    { semi: 9, note: 'A4', isBlack: false, shortInt: '장6도↑', fullInt: '장 6도 올림', guide: '높은 소프라노 음역대' },
    { semi: 10, note: 'A#4', isBlack: true, shortInt: '단7도↑', fullInt: '단 7도 올림', guide: '매우 높은 음역대' },
    { semi: 11, note: 'B4', isBlack: false, shortInt: '장7도↑', fullInt: '장 7도 올림', guide: '한 옥타브 직전 스케일' },
    { semi: 12, note: 'C5', isBlack: false, shortInt: '+1옥타브', fullInt: '완전 8도 올림 (+1 Octave)', guide: '원곡보다 정확히 한 옥타브 높은 키' }
  ];

  // DOM Elements
  const statusBadge = document.getElementById('statusBadge');
  const uploadSection = document.getElementById('uploadSection');
  const workspaceSection = document.getElementById('workspaceSection');
  const fileInput = document.getElementById('fileInput');
  const dropZone = document.getElementById('dropZone');
  const selectFileBtn = document.getElementById('selectFileBtn');
  const changeFileBtn = document.getElementById('changeFileBtn');

  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const fileMetaDisplay = document.getElementById('fileMetaDisplay');

  const waveformWrapper = document.getElementById('waveformWrapper');
  const waveformCanvas = document.getElementById('waveformCanvas');
  const playhead = document.getElementById('playhead');
  const hoverTime = document.getElementById('hoverTime');

  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const stopBtn = document.getElementById('stopBtn');
  const currentTimeEl = document.getElementById('currentTime');
  const totalDurationEl = document.getElementById('totalDuration');
  const bypassBtn = document.getElementById('bypassBtn');
  const volumeSlider = document.getElementById('volumeSlider');

  const semiDownBtn = document.getElementById('semiDownBtn');
  const semiUpBtn = document.getElementById('semiUpBtn');
  const semitoneValue = document.getElementById('semitoneValue');
  const keyRelationText = document.getElementById('keyRelationText');
  const currentNoteBadge = document.getElementById('currentNoteBadge');
  const intervalNameDisplay = document.getElementById('intervalNameDisplay');
  const genderGuideText = document.getElementById('genderGuideText');

  const resetAllBtn = document.getElementById('resetAllBtn');
  const centsSlider = document.getElementById('centsSlider');
  const centsValue = document.getElementById('centsValue');
  const tempoSlider = document.getElementById('tempoSlider');
  const tempoValue = document.getElementById('tempoValue');

  const semitoneSlider = document.getElementById('semitoneSlider');
  const sliderTicks = document.getElementById('sliderTicks');
  const pianoKeyboard = document.getElementById('pianoKeyboard');
  const presetPills = document.querySelectorAll('.preset-pill');

  const exportSummaryText = document.getElementById('exportSummaryText');
  const exportMp3Btn = document.getElementById('exportMp3Btn');
  const exportWavBtn = document.getElementById('exportWavBtn');

  const progressOverlay = document.getElementById('progressOverlay');
  const progressTitle = document.getElementById('progressTitle');
  const progressSub = document.getElementById('progressSub');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressPercent = document.getElementById('progressPercent');

  // Audio State
  let audioCtx = null;
  let audioBuffer = null;
  let originalFileName = 'audio';
  let soundTouch = null;
  let simpleFilter = null;
  let scriptNode = null;
  let gainNode = null;
  let keepAliveSource = null;

  let isPlaying = false;
  let isBypass = false;
  let currentSemitones = 0;
  let currentCents = 0;
  let currentTempo = 1.0;

  const BUFFER_SIZE = 4096;

  // iOS 무음 스위치(진동 모드)가 켜져 있어도 미디어 스피커로 소리가 나오도록 설정
  function configureIOSAudioSession() {
    try {
      if (navigator.audioSession && navigator.audioSession.type !== 'playback') {
        navigator.audioSession.type = 'playback';
      }
    } catch (_) {}
  }

  // 초기 UI 구성 (건반 및 슬라이더 눈금 생성)
  function initControlsUI() {
    pianoKeyboard.innerHTML = '';
    sliderTicks.innerHTML = '';

    KEY_MAP.forEach((item) => {
      // 1) 건반 생성
      const keyEl = document.createElement('div');
      keyEl.className = `piano-key ${item.isBlack ? 'black' : 'white'}`;
      if (item.semi === 0) keyEl.classList.add('origin-c');
      if (item.semi === currentSemitones) keyEl.classList.add('active');
      keyEl.dataset.semi = item.semi;

      const signStr = item.semi > 0 ? `+${item.semi}` : `${item.semi}`;
      keyEl.innerHTML = `
        <span class="key-semi">${signStr}</span>
        <span class="key-note">${item.note}</span>
        <span class="key-interval">${item.shortInt}</span>
      `;

      keyEl.addEventListener('click', () => {
        setSemitones(item.semi);
      });
      pianoKeyboard.appendChild(keyEl);

      // 2) 슬라이더 하단 눈금 (짝수나 주요 음정 표시)
      if (item.semi % 2 === 0) {
        const tick = document.createElement('span');
        tick.textContent = signStr;
        tick.addEventListener('click', () => setSemitones(item.semi));
        sliderTicks.appendChild(tick);
      }
    });

    updatePitchUI();
  }

  // 시간 포맷 (초 -> M:SS)
  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // 피치 파라미터를 실시간 엔진에 반영
  function applyEngineParameters() {
    if (!soundTouch) return;
    if (isBypass) {
      soundTouch.pitchSemitones = 0;
      soundTouch.tempo = 1.0;
    } else {
      const totalSemi = currentSemitones + (currentCents / 100);
      soundTouch.pitchSemitones = totalSemi;
      soundTouch.tempo = currentTempo;
    }
  }

  // 반음(키) 변경
  function setSemitones(semi) {
    const clamped = Math.max(-12, Math.min(12, Math.round(semi)));
    currentSemitones = clamped;
    if (isBypass) {
      isBypass = false;
      bypassBtn.classList.remove('active');
    }
    applyEngineParameters();
    updatePitchUI();
  }

  // UI 상태 업데이트
  function updatePitchUI() {
    const signStr = currentSemitones > 0 ? `+${currentSemitones}` : `${currentSemitones}`;
    semitoneValue.textContent = signStr;
    semitoneSlider.value = currentSemitones;

    const info = KEY_MAP.find((k) => k.semi === currentSemitones) || KEY_MAP[12];
    currentNoteBadge.textContent = info.note;
    intervalNameDisplay.textContent = info.fullInt;
    genderGuideText.textContent = info.guide;

    if (currentSemitones === 0 && currentCents === 0) {
      keyRelationText.textContent = '원곡 키 그대로 (Original Key)';
    } else if (currentSemitones > 0) {
      keyRelationText.textContent = `원곡보다 반음 ${currentSemitones}개 높음 (${signStr} Key)`;
    } else if (currentSemitones < 0) {
      keyRelationText.textContent = `원곡보다 반음 ${Math.abs(currentSemitones)}개 낮음 (${signStr} Key)`;
    } else {
      keyRelationText.textContent = `미세 튜닝 ${currentCents > 0 ? '+' : ''}${currentCents} cents`;
    }

    // 건반 하이라이트
    document.querySelectorAll('.piano-key').forEach((el) => {
      const s = Number(el.dataset.semi);
      el.classList.toggle('active', s === currentSemitones);
    });

    // 프리셋 버튼 하이라이트
    presetPills.forEach((pill) => {
      const s = Number(pill.dataset.semi);
      pill.classList.toggle('active', s === currentSemitones && currentCents === 0);
    });

    // 다운로드 요약 텍스트
    const tempoPct = Math.round(currentTempo * 100);
    const centsPart = currentCents !== 0 ? ` (${currentCents > 0 ? '+' : ''}${currentCents}ct)` : '';
    exportSummaryText.textContent = `${signStr}키${centsPart} · ${info.shortInt} · 속도 ${tempoPct}%`;
  }

  // iOS Safari 호환성을 위한 FileReader 기반 ArrayBuffer 읽기
  function readFileAsArrayBuffer(file) {
    if (typeof file.arrayBuffer === 'function') {
      return file.arrayBuffer().catch(() => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(file);
        });
      });
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  // iOS Safari (구버전 및 WebKit) 호환성을 위한 decodeAudioData 래퍼
  function decodeAudioDataCompat(ctx, arrayBuffer) {
    return new Promise((resolve, reject) => {
      try {
        const res = ctx.decodeAudioData(
          arrayBuffer,
          (decoded) => resolve(decoded),
          (err) => reject(err || new Error('오디오 디코딩 실패'))
        );
        if (res && typeof res.catch === 'function') {
          res.catch((err) => reject(err));
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  // 오디오 파일 로드 및 디코딩
  async function handleFile(file) {
    if (!file) return;
    stopPlayback();

    statusBadge.textContent = '오디오 분석 중...';
    originalFileName = file.name.replace(/\.[^/.]+$/, '');

    try {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
      }
      // 주의: iOS Safari에서는 파일 선택(change) 이벤트 중 audioCtx.resume()을 await하면
      // 사용자 직접 터치 제스처로 인정하지 않아 영구 대기(Hang) 상태에 빠집니다.
      // 따라서 여기서는 await 없이 비동기로만 호출하고, 실제 resume은 재생 버튼 터치 시 수행합니다.
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }

      const arrayBuffer = await readFileAsArrayBuffer(file);
      audioBuffer = await decodeAudioDataCompat(audioCtx, arrayBuffer);

      // UI 전환
      uploadSection.classList.add('hidden');
      workspaceSection.classList.remove('hidden');

      fileNameDisplay.textContent = file.name;
      const chText = audioBuffer.numberOfChannels > 1 ? 'Stereo' : 'Mono';
      const srText = `${(audioBuffer.sampleRate / 1000).toFixed(1)}kHz`;
      fileMetaDisplay.textContent = `${srText} · ${chText} · ${formatTime(audioBuffer.duration)}`;

      totalDurationEl.textContent = formatTime(audioBuffer.duration);
      currentTimeEl.textContent = '0:00';
      playhead.style.left = '0%';

      setupSoundTouchPipeline(0);
      drawWaveform(audioBuffer);
      statusBadge.textContent = '준비 완료 · 실시간 키 변환 가능';
    } catch (err) {
      console.error(err);
      alert('오디오 파일을 읽을 수 없습니다. 정상적인 MP3 또는 WAV 파일인지 확인해주세요.');
      statusBadge.textContent = '파일 로드 실패';
    }
  }

  // SoundTouch 파이프라인 초기화
  function setupSoundTouchPipeline(startFrame = 0) {
    if (!audioBuffer || !audioCtx) return;

    disconnectAudioNodes();

    soundTouch = new SoundTouch();
    applyEngineParameters();

    const bufferSource = new WebAudioBufferSource(audioBuffer);
    simpleFilter = new SimpleFilter(bufferSource, soundTouch, () => {
      // 재생 완료 콜백
      stopPlayback(true);
    });

    if (startFrame > 0) {
      simpleFilter.sourcePosition = startFrame;
    }

    scriptNode = audioCtx.createScriptProcessor(BUFFER_SIZE, 2, 2);
    const samples = new Float32Array(BUFFER_SIZE * 2);

    // iOS Safari(WebKit) 필수 처리: ScriptProcessorNode에 연결된 입력 소스가 없으면
    // 오디오 그래프가 활성화되지 않거나 소리가 출력되지 않는 버그를 방지하기 위해 무음 루프 소스를 연결합니다.
    try {
      const dummyBuf = audioCtx.createBuffer(2, BUFFER_SIZE, audioCtx.sampleRate);
      keepAliveSource = audioCtx.createBufferSource();
      keepAliveSource.buffer = dummyBuf;
      keepAliveSource.loop = true;
      keepAliveSource.connect(scriptNode);
      keepAliveSource.start(0);
    } catch (_) {}

    scriptNode.onaudioprocess = (e) => {
      const outL = e.outputBuffer.getChannelData(0);
      const outR = e.outputBuffer.getChannelData(1);

      if (!isPlaying || !simpleFilter) {
        outL.fill(0);
        outR.fill(0);
        return;
      }

      const framesExtracted = simpleFilter.extract(samples, BUFFER_SIZE);

      for (let i = 0; i < framesExtracted; i++) {
        outL[i] = samples[i * 2];
        outR[i] = samples[i * 2 + 1];
      }

      for (let i = framesExtracted; i < BUFFER_SIZE; i++) {
        outL[i] = 0;
        outR[i] = 0;
      }

      // 재생 위치 업데이트
      const curFrames = simpleFilter.sourcePosition;
      const totalFrames = audioBuffer.length;
      const curSec = curFrames / audioBuffer.sampleRate;
      const pct = Math.min(100, (curFrames / totalFrames) * 100);

      requestAnimationFrame(() => {
        currentTimeEl.textContent = formatTime(curSec);
        playhead.style.left = `${pct}%`;
      });

      if (framesExtracted === 0) {
        requestAnimationFrame(() => {
          stopPlayback(true);
        });
      }
    };

    gainNode = audioCtx.createGain();
    gainNode.gain.value = Number(volumeSlider.value);

    scriptNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  }

  function disconnectAudioNodes() {
    if (keepAliveSource) {
      try {
        keepAliveSource.stop();
        keepAliveSource.disconnect();
      } catch (_) {}
      keepAliveSource = null;
    }
    if (scriptNode) {
      try {
        scriptNode.onaudioprocess = null;
        scriptNode.disconnect();
      } catch (_) {}
      scriptNode = null;
    }
    if (gainNode) {
      try {
        gainNode.disconnect();
      } catch (_) {}
      gainNode = null;
    }
  }

  async function togglePlayback() {
    if (!audioBuffer) return;

    configureIOSAudioSession();

    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }

    // iOS Safari에서는 터치 이벤트 핸들러 내부에서 동기적으로 resume()과 무음 버퍼 start(0)를 호출해야 잠금이 풀립니다.
    try {
      const resumePromise = audioCtx.resume();
      const silentBuf = audioCtx.createBuffer(1, 1, audioCtx.sampleRate || 44100);
      const src = audioCtx.createBufferSource();
      src.buffer = silentBuf;
      src.connect(audioCtx.destination);
      src.start(0);
      await resumePromise;
    } catch (_) {}

    if (isPlaying) {
      isPlaying = false;
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      statusBadge.textContent = '일시정지됨';
    } else {
      // 끝에 도달했으면 처음으로
      const currentPos = simpleFilter ? simpleFilter.sourcePosition : 0;
      const startPos = currentPos >= audioBuffer.length - BUFFER_SIZE ? 0 : currentPos;

      // 오디오 컨텍스트가 깨어난 상태에서 파이프라인을 재연결하여 iOS에서도 확실히 소리 출력
      setupSoundTouchPipeline(startPos);

      isPlaying = true;
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
      statusBadge.textContent = '재생 중 (실시간 키 변환)';
    }
  }

  function stopPlayback(resetToZero = true) {
    isPlaying = false;
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    if (resetToZero && simpleFilter && audioBuffer) {
      simpleFilter.sourcePosition = 0;
      currentTimeEl.textContent = '0:00';
      playhead.style.left = '0%';
      statusBadge.textContent = '정지됨';
    }
  }

  function seekToRatio(ratio) {
    if (!audioBuffer || !simpleFilter) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    const targetFrame = Math.floor(clamped * audioBuffer.length);
    simpleFilter.sourcePosition = targetFrame;
    currentTimeEl.textContent = formatTime(targetFrame / audioBuffer.sampleRate);
    playhead.style.left = `${clamped * 100}%`;
  }

  // 캔버스에 오디오 파형 그리기
  function drawWaveform(buffer) {
    const dpr = window.devicePixelRatio || 1;
    const rect = waveformWrapper.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 92;

    waveformCanvas.width = width * dpr;
    waveformCanvas.height = height * dpr;

    const ctx = waveformCanvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(0.5, '#22d3ee');
    grad.addColorStop(1, '#818cf8');

    ctx.fillStyle = grad;

    const barWidth = 2;
    const gap = 1;
    const totalBars = Math.floor(width / (barWidth + gap));
    const samplesPerBar = Math.floor(data.length / totalBars);

    for (let i = 0; i < totalBars; i++) {
      let min = 1.0;
      let max = -1.0;
      const start = i * samplesPerBar;
      for (let j = 0; j < samplesPerBar; j += Math.max(1, Math.floor(samplesPerBar / 40))) {
        const datum = data[start + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      const peak = Math.max(Math.abs(min), Math.abs(max));
      const barHeight = Math.max(2, peak * (height * 0.86));
      const x = i * (barWidth + gap);
      const y = amp - barHeight / 2;

      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }

  // 오프라인 고속 피치 시프트 렌더링 후 MP3 또는 WAV 다운로드
  async function exportShiftedAudio(format = 'mp3') {
    if (!audioBuffer) return;

    // 재생 중이면 일시정지
    if (isPlaying) {
      await togglePlayback();
    }

    progressOverlay.classList.remove('hidden');
    progressTitle.textContent = format === 'mp3' ? '키 변환 및 MP3 파일 생성 중...' : '키 변환 및 WAV 파일 생성 중...';
    progressSub.textContent = '1단계: 피치 시프트 오디오 렌더링 중';
    updateProgress(0);

    await new Promise((r) => setTimeout(r, 40));

    try {
      const offlineST = new SoundTouch();
      const totalSemi = currentSemitones + (currentCents / 100);
      offlineST.pitchSemitones = totalSemi;
      offlineST.tempo = currentTempo;

      const offlineSource = new WebAudioBufferSource(audioBuffer);
      const offlineFilter = new SimpleFilter(offlineSource, offlineST);

      const chunkSize = 8192;
      const expectedTotalFrames = Math.ceil(audioBuffer.length / currentTempo);
      const leftChunks = [];
      const rightChunks = [];
      let totalExtracted = 0;

      const sampleBuffer = new Float32Array(chunkSize * 2);
      let iteration = 0;

      while (true) {
        const extracted = offlineFilter.extract(sampleBuffer, chunkSize);
        if (extracted <= 0) break;

        const l = new Float32Array(extracted);
        const r = new Float32Array(extracted);
        for (let i = 0; i < extracted; i++) {
          l[i] = sampleBuffer[i * 2];
          r[i] = sampleBuffer[i * 2 + 1];
        }
        leftChunks.push(l);
        rightChunks.push(r);
        totalExtracted += extracted;

        iteration++;
        if (iteration % 18 === 0) {
          const pct = Math.min(50, Math.round((totalExtracted / expectedTotalFrames) * 50));
          updateProgress(pct);
          await new Promise((res) => setTimeout(res, 0));
        }
      }

      // 하나로 병합
      const finalLeft = new Float32Array(totalExtracted);
      const finalRight = new Float32Array(totalExtracted);
      let offset = 0;
      for (let i = 0; i < leftChunks.length; i++) {
        finalLeft.set(leftChunks[i], offset);
        finalRight.set(rightChunks[i], offset);
        offset += leftChunks[i].length;
      }

      const signStr = currentSemitones > 0 ? `+${currentSemitones}` : `${currentSemitones}`;
      const fileSuffix = `_${signStr}키`;

      if (format === 'wav') {
        progressSub.textContent = '2단계: 무손실 WAV 파일 패키징 중';
        updateProgress(85);
        await new Promise((res) => setTimeout(res, 20));

        const wavBlob = encodeWAV(finalLeft, finalRight, audioBuffer.sampleRate);
        updateProgress(100);
        triggerDownload(wavBlob, `${originalFileName}${fileSuffix}.wav`);
      } else {
        progressSub.textContent = '2단계: 고음질 MP3 인코딩 중 (192kbps)';
        const mp3Blob = await encodeMP3Async(finalLeft, finalRight, audioBuffer.sampleRate, (p) => {
          updateProgress(50 + Math.round(p * 50));
        });
        updateProgress(100);
        triggerDownload(mp3Blob, `${originalFileName}${fileSuffix}.mp3`);
      }
    } catch (err) {
      console.error(err);
      alert('파일 변환 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setTimeout(() => {
        progressOverlay.classList.add('hidden');
      }, 300);
    }
  }

  function updateProgress(pct) {
    const clamped = Math.max(0, Math.min(100, pct));
    progressBarFill.style.width = `${clamped}%`;
    progressPercent.textContent = `${clamped}%`;
  }

  function floatTo16BitPCM(float32Array) {
    const int16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16;
  }

  async function encodeMP3Async(leftF32, rightF32, sampleRate, onProgress) {
    const left16 = floatTo16BitPCM(leftF32);
    const right16 = floatTo16BitPCM(rightF32);

    const mp3encoder = new window.lamejs.Mp3Encoder(2, sampleRate, 192);
    const mp3Data = [];
    const sampleBlockSize = 1152 * 16; // 묶음 단위로 처리하여 속도 향상
    const totalLen = left16.length;

    for (let i = 0; i < totalLen; i += sampleBlockSize) {
      const leftChunk = left16.subarray(i, i + sampleBlockSize);
      const rightChunk = right16.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
      if ((i / sampleBlockSize) % 6 === 0) {
        onProgress(i / totalLen);
        await new Promise((res) => setTimeout(res, 0));
      }
    }

    const endBuf = mp3encoder.flush();
    if (endBuf.length > 0) {
      mp3Data.push(endBuf);
    }
    onProgress(1);
    return new Blob(mp3Data, { type: 'audio/mpeg' });
  }

  function encodeWAV(leftF32, rightF32, sampleRate) {
    const numChannels = 2;
    const length = leftF32.length * numChannels * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);

    function writeString(view, offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + leftF32.length * numChannels * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, leftF32.length * numChannels * 2, true);

    let offset = 44;
    for (let i = 0; i < leftF32.length; i++) {
      let sL = Math.max(-1, Math.min(1, leftF32[i]));
      let sR = Math.max(-1, Math.min(1, rightF32[i]));
      view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7fff, true);
      offset += 2;
      view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7fff, true);
      offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  // Event Listeners
  function ensureAudioContextUnlocked() {
    configureIOSAudioSession();
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state !== 'running') {
      try {
        audioCtx.resume().catch(() => {});
        const silentBuf = audioCtx.createBuffer(1, 1, audioCtx.sampleRate || 44100);
        const src = audioCtx.createBufferSource();
        src.buffer = silentBuf;
        src.connect(audioCtx.destination);
        src.start(0);
      } catch (_) {}
    }
  }

  selectFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    ensureAudioContextUnlocked();
    fileInput.click();
  });

  dropZone.addEventListener('click', () => {
    ensureAudioContextUnlocked();
    fileInput.click();
  });

  changeFileBtn.addEventListener('click', () => {
    ensureAudioContextUnlocked();
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
      // 동일한 파일을 다시 선택할 수 있도록 초기화
      e.target.value = '';
    }
  });

  // Drag & Drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // 화면 전체에서도 파일 드롭 허용
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // 재생/정지/탐색
  playPauseBtn.addEventListener('click', togglePlayback);
  stopBtn.addEventListener('click', () => stopPlayback(true));

  waveformWrapper.addEventListener('click', (e) => {
    const rect = waveformWrapper.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seekToRatio(ratio);
  });

  waveformWrapper.addEventListener('mousemove', (e) => {
    if (!audioBuffer) return;
    const rect = waveformWrapper.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    hoverTime.style.left = `${ratio * 100}%`;
    hoverTime.textContent = formatTime(ratio * audioBuffer.duration);
  });

  // 원곡 비교 (Bypass)
  bypassBtn.addEventListener('click', () => {
    isBypass = !isBypass;
    bypassBtn.classList.toggle('active', isBypass);
    applyEngineParameters();
  });

  volumeSlider.addEventListener('input', (e) => {
    if (gainNode) {
      gainNode.gain.value = Number(e.target.value);
    }
  });

  // 키 조절 이벤트
  semiDownBtn.addEventListener('click', () => setSemitones(currentSemitones - 1));
  semiUpBtn.addEventListener('click', () => setSemitones(currentSemitones + 1));

  semitoneSlider.addEventListener('input', (e) => {
    setSemitones(Number(e.target.value));
  });

  presetPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      currentCents = 0;
      centsSlider.value = 0;
      centsValue.textContent = '0 ct';
      setSemitones(Number(pill.dataset.semi));
    });
  });

  centsSlider.addEventListener('input', (e) => {
    currentCents = Number(e.target.value);
    centsValue.textContent = `${currentCents > 0 ? '+' : ''}${currentCents} ct`;
    applyEngineParameters();
    updatePitchUI();
  });

  tempoSlider.addEventListener('input', (e) => {
    currentTempo = Number(e.target.value);
    tempoValue.textContent = `${Math.round(currentTempo * 100)}%`;
    applyEngineParameters();
    updatePitchUI();
  });

  resetAllBtn.addEventListener('click', () => {
    currentCents = 0;
    currentTempo = 1.0;
    centsSlider.value = 0;
    centsValue.textContent = '0 ct';
    tempoSlider.value = 1.0;
    tempoValue.textContent = '100%';
    setSemitones(0);
  });

  // 다운로드 버튼
  exportMp3Btn.addEventListener('click', () => exportShiftedAudio('mp3'));
  exportWavBtn.addEventListener('click', () => exportShiftedAudio('wav'));

  // 키보드 단축키 (스페이스바: 재생/일시정지, 위/아래 방향키: 반음 조절)
  window.addEventListener('keydown', (e) => {
    if (!audioBuffer || ! progressOverlay.classList.contains('hidden')) return;
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayback();
    } else if (e.code === 'ArrowUp') {
      e.preventDefault();
      setSemitones(currentSemitones + 1);
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      setSemitones(currentSemitones - 1);
    }
  });

  window.addEventListener('resize', () => {
    if (audioBuffer) drawWaveform(audioBuffer);
  });

  initControlsUI();
})();
