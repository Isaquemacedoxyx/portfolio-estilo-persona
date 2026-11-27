const portfolio = document.getElementById("portfolio");
const menuView = document.getElementById("menuView");
const options = [...document.querySelectorAll(".menu-option")];
const panel = document.getElementById("detailPanel");
const title = document.getElementById("detailTitle");
const kicker = document.getElementById("detailKicker");
const content = document.getElementById("detailContent");
const closeButton = document.getElementById("detailClose");
const backgroundIntro = document.getElementById("backgroundIntro");
const backgroundVideo = document.getElementById("backgroundVideo");
const backgroundAudio = document.getElementById("backgroundAudio");
const audioToggle = document.getElementById("audioToggle");
const audioVolume = document.getElementById("audioVolume");
const audioState = document.getElementById("audioState");
const audioValue = document.getElementById("audioValue");
const audioStatus = document.getElementById("audioStatus");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

const sections = {
  about: { kicker: "PROFILE", title: "SOBRE MIM", template: "aboutContent" },
  skills: { kicker: "SKILL SET", title: "HABILIDADES", template: "skillsContent" },
  projects: { kicker: "MISSION LOG", title: "PROJETOS", template: "projectsContent" },
  studies: { kicker: "LEARNING PATH", title: "ESTUDOS", template: "studiesContent" },
  links: { kicker: "SOCIAL LINK", title: "VÍNCULOS", template: "linksContent" },
  system: { kicker: "SYSTEM", title: "SISTEMA", template: "systemContent" }
};

let activeIndex = 0;
let chosenMotion = null;
let manuallyMuted = false;
let audioPlaybackActive = false;

function updateAudioControls() {
  const soundOn = audioPlaybackActive
    && !backgroundAudio.paused
    && !backgroundAudio.muted
    && backgroundAudio.volume > 0;

  audioToggle.setAttribute("aria-label", soundOn ? "Silenciar música" : "Ativar som");
  audioToggle.setAttribute("aria-pressed", String(soundOn));
  audioState.textContent = soundOn ? "ON" : "OFF";
  const volumePercent = Math.round(backgroundAudio.volume * 100);
  audioVolume.value = String(volumePercent);
  audioVolume.setAttribute("aria-valuetext", `${volumePercent}%`);
  audioVolume.style.setProperty("--volume-fill", `${backgroundAudio.volume * 100}%`);
  audioValue.textContent = `${volumePercent}%`;
}

function showAudioStatus(message) {
  audioStatus.textContent = message;
  audioStatus.hidden = !message;
}

function playBackgroundAudio() {
  backgroundAudio.play().then(() => {
    audioPlaybackActive = true;
    showAudioStatus("");
    updateAudioControls();
  }).catch((error) => {
    updateAudioControls();
    if (error.name === "NotAllowedError") {
      showAudioStatus("AUTOPLAY BLOQUEADO · CLIQUE");
      return;
    }

    if (error.name === "AbortError" && backgroundAudio.paused) return;

    if (backgroundAudio.error || error.name === "NotSupportedError") {
      showAudioStatus("NÃO FOI POSSÍVEL CARREGAR: assets/audio/Color Your Night.mp3");
      if (!backgroundAudio.error) {
        console.error("O arquivo assets/audio/Color Your Night.mp3 não pôde ser carregado.", error);
      }
      return;
    }

    showAudioStatus("NÃO FOI POSSÍVEL REPRODUZIR A TRILHA");
    console.error("A trilha sonora não pôde ser reproduzida.", error);
  });
}

function setAudioVolume(value) {
  const volume = Math.max(0, Math.min(1, value));
  audioVolume.value = String(Math.round(volume * 100));
  backgroundAudio.volume = volume;
  backgroundAudio.muted = manuallyMuted || volume === 0;
  updateAudioControls();
}

audioToggle.addEventListener("click", () => {
  if (backgroundAudio.paused) {
    manuallyMuted = false;
    if (backgroundAudio.volume === 0) setAudioVolume(0.25);
    backgroundAudio.muted = false;
    playBackgroundAudio();
    return;
  }

  manuallyMuted = !manuallyMuted;
  backgroundAudio.muted = manuallyMuted || backgroundAudio.volume === 0;
  updateAudioControls();
});

audioVolume.addEventListener("input", () => {
  setAudioVolume(Number(audioVolume.value) / 100);
});

backgroundAudio.addEventListener("play", updateAudioControls);
backgroundAudio.addEventListener("playing", () => {
  audioPlaybackActive = true;
  updateAudioControls();
});
["pause", "waiting", "stalled", "ended", "emptied"].forEach((eventName) => {
  backgroundAudio.addEventListener(eventName, () => {
    audioPlaybackActive = false;
    updateAudioControls();
  });
});
backgroundAudio.addEventListener("volumechange", updateAudioControls);
backgroundAudio.addEventListener("error", () => {
  audioPlaybackActive = false;
  showAudioStatus("NÃO FOI POSSÍVEL CARREGAR: assets/audio/Color Your Night.mp3");
  updateAudioControls();
  console.error("O arquivo assets/audio/Color Your Night.mp3 não pôde ser carregado.", backgroundAudio.error);
});

function playBackgroundVideo() {
  if (!backgroundVideo.paused) return;

  portfolio.dataset.videoState = backgroundIntro.ended ? "transition" : "loading";
  backgroundVideo.play().catch((error) => {
    if (error.name === "AbortError" && backgroundVideo.paused) return;
    portfolio.dataset.videoState = "fallback";
    console.error("O vídeo de fundo não pôde ser reproduzido.", error);
  });
}

function playBackgroundIntro() {
  if (!backgroundIntro.paused) {
    portfolio.dataset.videoState = "intro";
    return;
  }

  portfolio.dataset.videoState = "loading";
  backgroundIntro.play().catch((error) => {
    if (error.name === "AbortError" && backgroundIntro.paused) return;
    console.error("O vídeo inicial de fundo não pôde ser reproduzido.", error);
    playBackgroundVideo();
  });
}

backgroundIntro.addEventListener("playing", () => {
  if (portfolio.dataset.motion === "reduced") {
    backgroundIntro.pause();
    portfolio.dataset.videoState = "reduced";
    return;
  }

  portfolio.dataset.videoState = "intro";
});

backgroundIntro.addEventListener("ended", () => {
  if (portfolio.dataset.motion === "reduced") {
    portfolio.dataset.videoState = "reduced";
    return;
  }

  playBackgroundVideo();
});

backgroundIntro.addEventListener("error", () => {
  if (portfolio.dataset.motion === "reduced") {
    portfolio.dataset.videoState = "reduced";
    return;
  }

  console.error("O vídeo inicial de fundo não pôde ser carregado.", backgroundIntro.error);
  playBackgroundVideo();
});

backgroundVideo.addEventListener("playing", () => {
  if (portfolio.dataset.motion === "reduced") {
    backgroundVideo.pause();
    portfolio.dataset.videoState = "reduced";
    return;
  }

  portfolio.dataset.videoState = "playing";
});

backgroundVideo.addEventListener("error", () => {
  portfolio.dataset.videoState = "fallback";
  console.error("O arquivo de vídeo de fundo não pôde ser carregado.", backgroundVideo.error);
});

function setActive(index) {
  activeIndex = (index + options.length) % options.length;
  options.forEach((button, buttonIndex) => {
    const active = buttonIndex === activeIndex;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function applyMotion(choice) {
  portfolio.dataset.motion = choice;

  panel.querySelectorAll("[data-motion-choice]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.motionChoice === choice));
  });

  const status = document.getElementById("motionStatus");
  if (status) {
    status.textContent = choice === "reduced"
      ? "Animação de fundo reduzida."
      : "Animações normais ativadas.";
  }

  if (choice === "reduced") {
    backgroundIntro.pause();
    backgroundVideo.pause();
    portfolio.dataset.videoState = "reduced";
  } else if (backgroundIntro.ended) {
    playBackgroundVideo();
  } else {
    playBackgroundIntro();
  }
}

function setMotion(choice) {
  chosenMotion = choice;
  applyMotion(choice);
}

function openSection(sectionKey) {
  const section = sections[sectionKey];
  const template = document.getElementById(section?.template);
  if (!section || !template) return;

  kicker.textContent = section.kicker;
  title.textContent = section.title;
  content.replaceChildren(template.content.cloneNode(true));
  menuView.hidden = true;
  panel.hidden = false;

  if (sectionKey === "system") {
    panel.querySelectorAll("[data-motion-choice]").forEach((button) => {
      button.addEventListener("click", () => setMotion(button.dataset.motionChoice));
    });
    setMotion(chosenMotion || (motionPreference.matches ? "reduced" : "normal"));
  }

  window.requestAnimationFrame(() => panel.classList.add("is-open"));
  closeButton.focus();
}

function closeSection() {
  panel.classList.remove("is-open");
  panel.hidden = true;
  menuView.hidden = false;
  options[activeIndex].focus();
}

options.forEach((button, index) => {
  button.addEventListener("mouseenter", () => setActive(index));
  button.addEventListener("focus", () => setActive(index));
  button.addEventListener("click", () => {
    setActive(index);
    openSection(button.dataset.section);
  });
});

closeButton.addEventListener("click", closeSection);

document.addEventListener("keydown", (event) => {
  if (panel.hidden) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(activeIndex + 1);
      options[activeIndex].focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(activeIndex - 1);
      options[activeIndex].focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      options[activeIndex].focus();
    }
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeSection();
    return;
  }

  if (event.key === "Tab") {
    const focusable = [...panel.querySelectorAll("button:not(:disabled), a[href]")];
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

motionPreference.addEventListener("change", (event) => {
  if (chosenMotion === null) {
    applyMotion(event.matches ? "reduced" : "normal");
  }
});

setActive(0);
applyMotion(motionPreference.matches ? "reduced" : "normal");
backgroundAudio.volume = Number(audioVolume.value) / 100;
updateAudioControls();
playBackgroundAudio();
