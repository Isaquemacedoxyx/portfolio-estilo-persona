const portfolio = document.getElementById("portfolio");
const menuView = document.getElementById("menuView");
const options = [...document.querySelectorAll(".menu-option")];
const mobileSections = document.getElementById("mobileSections");
const panel = document.getElementById("detailPanel");
const sectionBackdrop = document.getElementById("sectionBackdrop");
const sectionBackdropImage = document.getElementById("sectionBackdropImage");
const sectionBackdropVideo = document.getElementById("sectionBackdropVideo");
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
  about: {
    kicker: "PROFILE", title: "SOBRE MIM", template: "aboutContent",
    video: "assets/images/sobremim.mp4", desktopFocus: "center", mobileFocus: "54% center",
    panelSide: "left", panelOffset: "clamp(18px, 4vw, 70px)", panelTop: "50%", panelWidth: "min(620px, 42vw, calc(100vw - 40px))"
  },
  skills: {
    kicker: "SKILL SET", title: "HABILIDADES", template: "skillsContent",
    image: "assets/images/habilidades.jpg", desktopFocus: "52% center", mobileFocus: "57% center",
    panelSide: "right", panelOffset: "clamp(18px, 4vw, 70px)", panelTop: "50%", panelWidth: "min(620px, 40vw, calc(100vw - 40px))"
  },
  projects: {
    kicker: "MISSION LOG", title: "PROJETOS", template: "projectsContent",
    image: "assets/images/projetos.jpg", desktopFocus: "center", mobileFocus: "78% center",
    panelSide: "left", panelOffset: "clamp(18px, 4vw, 70px)", panelTop: "50%", panelWidth: "min(620px, 42vw, calc(100vw - 40px))"
  },
  studies: {
    kicker: "ESTUDANDO AGORA", title: "ESTUDANDO AGORA", template: "studiesContent",
    image: "assets/images/estudos.jpg", desktopFocus: "center", mobileFocus: "24% center",
    panelSide: "left", panelOffset: "clamp(18px, 4vw, 70px)", panelTop: "50%", panelWidth: "min(620px, 38vw, calc(100vw - 40px))"
  },
  links: {
    kicker: "SOCIAL LINK", title: "VÍNCULOS", template: "linksContent",
    image: "assets/images/vinculos.jpg", desktopFocus: "center", mobileFocus: "78% center",
    panelSide: "left", panelOffset: "clamp(18px, 4vw, 70px)", panelTop: "50%", panelWidth: "min(620px, 42vw, calc(100vw - 40px))"
  },
  system: { kicker: "SYSTEM", title: "SISTEMA", template: "systemContent" }
};

let activeIndex = 0;
let chosenMotion = null;
let manuallyMuted = false;
let audioPlaybackActive = false;
let sectionTransitionLocked = false;
let sectionTransitionTimer = 0;
let backdropMediaHandler = null;
const sectionTransitionDuration = 680;
const sectionImageURLs = new Map();
const sectionImagePromises = new Map();

function loadSectionImage(path) {
  if (sectionImageURLs.has(path)) return Promise.resolve(sectionImageURLs.get(path));
  if (sectionImagePromises.has(path)) return sectionImagePromises.get(path);

  const imagePromise = fetch(path)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status} ao carregar ${path}`);
      return response.blob();
    })
    .then(async (blob) => {
      const signature = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
      const isWebP = signature[0] === 0x52 && signature[1] === 0x49
        && signature[2] === 0x46 && signature[3] === 0x46
        && signature[8] === 0x57 && signature[9] === 0x45
        && signature[10] === 0x42 && signature[11] === 0x50;
      const isJpeg = signature[0] === 0xff && signature[1] === 0xd8;
      const imageType = isWebP ? "image/webp" : isJpeg ? "image/jpeg" : "";
      if (!imageType) throw new Error(`Formato de imagem não reconhecido: ${path}`);

      const normalizedBlob = blob.type === imageType ? blob : new Blob([blob], { type: imageType });
      const objectURL = URL.createObjectURL(normalizedBlob);
      sectionImageURLs.set(path, objectURL);
      return objectURL;
    })
    .catch((error) => {
      console.error(`Não foi possível preparar a imagem de ${path}.`, error);
      return null;
    });

  sectionImagePromises.set(path, imagePromise);
  return imagePromise;
}

Object.values(sections).forEach((section) => {
  if (section.image) loadSectionImage(section.image);
});

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
  const nextIndex = (index + options.length) % options.length;
  const selectionChanged = nextIndex !== activeIndex;
  activeIndex = nextIndex;
  options.forEach((button, buttonIndex) => {
    const active = buttonIndex === activeIndex;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
    if (active && selectionChanged) pulseSelection(button);
  });
}

function pulseSelection(button) {
  button.classList.remove("is-pulsing");
  void button.offsetWidth;
  button.classList.add("is-pulsing");
}

function applyMotion(choice) {
  portfolio.dataset.motion = choice;

  panel.querySelectorAll("[data-motion-choice]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.motionChoice === choice));
  });

  ["motionStatus", "mobileMotionStatus"].forEach((statusId) => {
    const status = document.getElementById(statusId);
    if (status) {
      status.textContent = choice === "reduced"
        ? "Animação de fundo reduzida."
        : "Animações normais ativadas.";
    }
  });

  if (choice === "reduced") {
    backgroundIntro.pause();
    backgroundVideo.pause();
    sectionBackdropVideo.pause();
    mobileSections.querySelectorAll(".mobile-section-video").forEach((video) => video.pause());
    portfolio.dataset.videoState = "reduced";
  } else if (backgroundIntro.ended) {
    playBackgroundVideo();
  } else {
    playBackgroundIntro();
  }

  if (choice === "normal") syncMobileSectionVideos();
}

function setMotion(choice) {
  chosenMotion = choice;
  applyMotion(choice);
}

function buildMobileSections() {
  const sectionsMarkup = options.map((option) => {
    const sectionKey = option.dataset.section;
    const sectionData = sections[sectionKey];
    const template = document.getElementById(sectionData.template);
    const section = document.createElement("section");
    const headingId = `mobile-title-${sectionKey}`;
    const heading = document.createElement("h2");
    const pinkPlate = document.createElement("span");
    const whitePlate = document.createElement("span");
    const headingText = document.createElement("span");
    const redCut = document.createElement("span");
    const sectionContent = document.createElement("div");

    section.className = "mobile-section";
    section.id = `mobile-section-${sectionKey}`;
    section.dataset.section = sectionKey;
    section.setAttribute("aria-labelledby", headingId);
    section.style.setProperty("--section-focus-mobile", sectionData.mobileFocus || "center");
    if (sectionData.image) {
      loadSectionImage(sectionData.image).then((source) => {
        if (source && section.isConnected) section.style.setProperty("--section-image", `url("${source}")`);
      });
    }

    if (sectionData.video) {
      const video = document.createElement("video");
      video.className = "mobile-section-video";
      video.src = sectionData.video;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "none";
      video.tabIndex = -1;
      video.setAttribute("aria-hidden", "true");
      section.append(video);
    }

    heading.className = `mobile-section-title mobile-section-title--${sectionKey}`;
    heading.id = headingId;
    heading.setAttribute("aria-label", option.getAttribute("aria-label"));
    pinkPlate.className = "mobile-title-plate mobile-title-plate--pink";
    whitePlate.className = "mobile-title-plate mobile-title-plate--white";
    headingText.className = "mobile-title-text";
    headingText.textContent = option.getAttribute("aria-label");
    redCut.className = "mobile-title-red-cut";
    pinkPlate.setAttribute("aria-hidden", "true");
    whitePlate.setAttribute("aria-hidden", "true");
    redCut.setAttribute("aria-hidden", "true");
    heading.append(pinkPlate, whitePlate, headingText, redCut);
    sectionContent.className = "detail-content";
    sectionContent.append(template.content.cloneNode(true));
    const mobileMotionStatus = sectionContent.querySelector("#motionStatus");
    if (mobileMotionStatus) mobileMotionStatus.id = "mobileMotionStatus";
    section.append(heading, sectionContent);
    return section;
  });

  mobileSections.replaceChildren(...sectionsMarkup);
}

buildMobileSections();

function loadVideoStillFrame(video) {
  if (video.readyState >= 2) {
    video.pause();
    return;
  }

  const pauseAfterFrame = () => video.pause();
  video.addEventListener("loadeddata", pauseAfterFrame, { once: true });
  video.play().catch(() => video.removeEventListener("loadeddata", pauseAfterFrame));
}

function syncMobileSectionVideos() {
  if (portfolio.dataset.motion === "reduced") return;

  mobileSections.querySelectorAll(".mobile-section-video").forEach((video) => {
    const bounds = video.getBoundingClientRect();
    const isVisible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    if (isVisible) video.play().catch(() => {});
    else video.pause();
  });
}

if ("IntersectionObserver" in window) {
  const mobileSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
      const video = entry.target.querySelector(".mobile-section-video");
      if (!video) return;

      if (!entry.isIntersecting) {
        video.pause();
      } else if (portfolio.dataset.motion === "reduced") {
        loadVideoStillFrame(video);
      } else {
        video.play().catch(() => {});
      }
    });
  }, { threshold: 0.18 });

  mobileSections.querySelectorAll(".mobile-section").forEach((section) => mobileSectionObserver.observe(section));
}

mobileSections.addEventListener("click", (event) => {
  const motionButton = event.target.closest("[data-motion-choice]");
  if (motionButton) setMotion(motionButton.dataset.motionChoice);
});

function configureSectionBackdrop(sectionKey, imageSource) {
  const section = sections[sectionKey];
  if (backdropMediaHandler) {
    backdropMediaHandler.element.removeEventListener(backdropMediaHandler.event, backdropMediaHandler.handler);
    if (backdropMediaHandler.errorHandler) {
      backdropMediaHandler.element.removeEventListener("error", backdropMediaHandler.errorHandler);
    }
    backdropMediaHandler = null;
  }

  portfolio.dataset.section = sectionKey;
  portfolio.dataset.sectionBackdrop = "ambient";
  sectionBackdrop.classList.remove("has-image", "has-video", "is-loading");
  sectionBackdropVideo.pause();

  if (imageSource) {
    sectionBackdropImage.src = imageSource;
    const revealImage = () => {
      if (portfolio.dataset.section !== sectionKey || !sectionBackdropImage.naturalWidth) return;
      sectionBackdrop.classList.add("has-image");
      portfolio.dataset.sectionBackdrop = "media";
    };

    if (sectionBackdropImage.complete && sectionBackdropImage.naturalWidth) {
      revealImage();
    } else {
      backdropMediaHandler = { element: sectionBackdropImage, event: "load", handler: revealImage };
      sectionBackdropImage.addEventListener("load", revealImage, { once: true });
    }
  } else {
    sectionBackdropImage.removeAttribute("src");
  }

  if (section.video) {
    sectionBackdropVideo.autoplay = portfolio.dataset.motion !== "reduced";
    sectionBackdropVideo.preload = "auto";
    if (sectionBackdropVideo.getAttribute("src") !== section.video) {
      sectionBackdropVideo.src = section.video;
      sectionBackdropVideo.load();
    }
    sectionBackdrop.classList.add("is-loading");
    const revealVideo = () => {
      if (portfolio.dataset.section !== sectionKey || sectionBackdropVideo.readyState < 2) return;
      sectionBackdrop.classList.remove("is-loading");
      sectionBackdrop.classList.add("has-video");
      portfolio.dataset.sectionBackdrop = "media";
      if (portfolio.dataset.motion === "reduced") sectionBackdropVideo.pause();
      sectionBackdropVideo.removeEventListener("loadeddata", revealVideo);
      sectionBackdropVideo.removeEventListener("error", failVideo);
      backdropMediaHandler = null;
    };
    const failVideo = () => {
      sectionBackdrop.classList.remove("is-loading");
      sectionBackdropVideo.removeEventListener("loadeddata", revealVideo);
      sectionBackdropVideo.removeEventListener("error", failVideo);
      backdropMediaHandler = null;
    };

    backdropMediaHandler = { element: sectionBackdropVideo, event: "loadeddata", handler: revealVideo, errorHandler: failVideo };
    sectionBackdropVideo.addEventListener("loadeddata", revealVideo);
    sectionBackdropVideo.addEventListener("error", failVideo);
    if (sectionBackdropVideo.readyState >= 2) revealVideo();
  } else {
    sectionBackdropVideo.autoplay = false;
  }

  if (section.desktopFocus) portfolio.style.setProperty("--section-focus-desktop", section.desktopFocus);
  else portfolio.style.removeProperty("--section-focus-desktop");

  if (section.panelTop) portfolio.style.setProperty("--panel-top", section.panelTop);
  else portfolio.style.removeProperty("--panel-top");

  if (section.panelSide) {
    portfolio.style.setProperty("--panel-left", section.panelSide === "left" ? section.panelOffset : "auto");
    portfolio.style.setProperty("--panel-right", section.panelSide === "right" ? section.panelOffset : "auto");
    portfolio.style.setProperty("--panel-width", section.panelWidth);
    portfolio.style.setProperty("--panel-translate-x", "0");
  } else {
    ["--panel-left", "--panel-right", "--panel-width", "--panel-translate-x"].forEach((property) => portfolio.style.removeProperty(property));
  }
}

function getSectionTransitionDuration() {
  return portfolio.dataset.motion === "reduced" ? 1 : sectionTransitionDuration;
}

async function openSection(sectionKey) {
  const section = sections[sectionKey];
  const template = document.getElementById(section?.template);
  if (!section || !template || sectionTransitionLocked || !panel.hidden) return;

  sectionTransitionLocked = true;
  window.clearTimeout(sectionTransitionTimer);

  kicker.textContent = section.kicker;
  title.textContent = section.title;
  content.replaceChildren(template.content.cloneNode(true));
  const imageSource = section.image ? await loadSectionImage(section.image) : null;
  configureSectionBackdrop(sectionKey, imageSource);
  menuView.hidden = true;
  panel.hidden = false;

  if (sectionKey === "system") {
    panel.querySelectorAll("[data-motion-choice]").forEach((button) => {
      button.addEventListener("click", () => setMotion(button.dataset.motionChoice));
    });
    setMotion(chosenMotion || (motionPreference.matches ? "reduced" : "normal"));
  }

  portfolio.classList.remove("is-closing");
  portfolio.classList.add("has-section", "is-opening");
  window.requestAnimationFrame(() => panel.classList.add("is-open"));
  closeButton.focus();

  if (section.video) {
    sectionBackdropVideo.play().catch(() => {});
  }

  sectionTransitionTimer = window.setTimeout(() => {
    portfolio.classList.remove("is-opening");
    sectionTransitionLocked = false;
  }, getSectionTransitionDuration());
}

function closeSection() {
  if (panel.hidden || sectionTransitionLocked) return;

  sectionTransitionLocked = true;
  window.clearTimeout(sectionTransitionTimer);
  const duration = getSectionTransitionDuration();
  panel.classList.remove("is-open");
  menuView.hidden = false;
  portfolio.classList.remove("is-opening");
  portfolio.classList.add("is-closing");
  sectionBackdropVideo.autoplay = false;
  sectionBackdropVideo.pause();

  sectionTransitionTimer = window.setTimeout(() => {
    panel.hidden = true;
    portfolio.classList.remove("has-section", "is-closing");
    delete portfolio.dataset.section;
    delete portfolio.dataset.sectionBackdrop;
    sectionBackdrop.classList.remove("has-image", "has-video", "is-loading");
    sectionTransitionLocked = false;
    options[activeIndex].focus();
  }, duration);
}

options.forEach((button, index) => {
  button.addEventListener("mouseenter", () => setActive(index));
  button.addEventListener("focus", () => setActive(index));
  button.addEventListener("click", () => {
    const selectionChanged = index !== activeIndex;
    setActive(index);
    if (!selectionChanged) pulseSelection(button);

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
