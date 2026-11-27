const portfolio = document.getElementById("portfolio");
const menuView = document.getElementById("menuView");
const options = [...document.querySelectorAll(".menu-option")];
const panel = document.getElementById("detailPanel");
const title = document.getElementById("detailTitle");
const kicker = document.getElementById("detailKicker");
const content = document.getElementById("detailContent");
const closeButton = document.getElementById("detailClose");
const backgroundVideo = document.getElementById("backgroundVideo");
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

function playBackgroundVideo() {
  portfolio.dataset.videoState = "loading";
  backgroundVideo.play().catch((error) => {
    if (error.name === "AbortError" && backgroundVideo.paused) return;
    portfolio.dataset.videoState = "fallback";
    console.error("O vídeo de fundo não pôde ser reproduzido.", error);
  });
}

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
    backgroundVideo.pause();
    portfolio.dataset.videoState = "reduced";
  } else {
    playBackgroundVideo();
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
