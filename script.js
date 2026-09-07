"use strict";

/* =========================================================
   CONFIGURAÇÃO PRINCIPAL
   WhatsApp de contato do Regnier.
   Formato: 55 + DDD + número, sem espaços.
========================================================= */
const CONFIG = {
  whatsapp: "5527999729224",
  instructor: "Regnier",
  instagram: "@instrutorregnier",
  city: "Serra - ES"
};

/* =========================================================
   PLANOS
   ALTERE OS VALORES AQUI E O SITE RECALCULA TUDO.

   Cada câmbio tem preço e composição próprios.
   A ordem abaixo é a mesma exibida no computador e no celular.
========================================================= */
const PLANS = [
  {
    id: "diamante-plus",
    name: "Diamante Plus",
    label: "Melhor custo por aula",
    description: "Mais tempo para repetir, corrigir e ganhar confiança.",
    featured: true,
    options: {
      automatico: { price: 1899, car: 15, moto: 15 },
      manual: { price: 1300, car: 15, moto: 0 }
    }
  },
  {
    id: "diamante",
    name: "Diamante",
    label: "Especial",
    description: "Mais prática para trabalhar suas dificuldades.",
    options: {
      automatico: { price: 1600, car: 5, moto: 5 },
      manual: { price: 900, car: 10, moto: 0 }
    }
  },
  {
    id: "ouro",
    name: "Ouro",
    label: "Equilíbrio",
    description: "Espaço para repetir os fundamentos da direção.",
    options: {
      automatico: { price: 1200, car: 5, moto: 5 },
      manual: { price: 500, car: 5, moto: 0 }
    }
  },
  {
    id: "prata",
    name: "Prata",
    label: "Entrada",
    description: "Poucas aulas extras para começar com menor investimento.",
    options: {
      automatico: { price: 950, car: 2, moto: 2 },
      manual: { price: 350, car: 2, moto: 0 }
    }
  }
];

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const money = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(value);
const moneyNoCents = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let selectedTransmission = "automatico";
const transmissionLabel = mode => mode === "manual" ? "manual" : "automático";
const getPlan = id => {
  const plan = PLANS.find(item => item.id === id);
  return plan ? { ...plan, ...plan.options[selectedTransmission], transmission: selectedTransmission } : null;
};
const totalLessons = plan => plan.car + plan.moto;
const unitCost = plan => plan.price / totalLessons(plan);
const lessonSummary = plan => `${plan.car} aulas de carro ${transmissionLabel(plan.transmission)}${plan.moto ? ` + ${plan.moto} de moto` : ""}`;

// O armazenamento é opcional: abrir o HTML localmente também deve funcionar.
function saveSelection(plan) {
  try { localStorage.setItem("regnier_selected_plan", plan.id); } catch {}
}

let selectedPlan = null;
let stickyDismissed = false;
let toastTimer = null;

/* =========================================================
   PLANOS: RENDERIZAÇÃO E COMPARAÇÃO
========================================================= */
function renderPlans() {
  const grid = $("#plansGrid");
  const plus = getPlan("diamante-plus");
  $("#plansCategory").textContent = plus.moto ? "PLANOS CATEGORIA AB" : "PLANOS CATEGORIA B";
  $("#plusSummary").textContent = lessonSummary(plus);
  $("#transmissionSummary").textContent = `Carro ${transmissionLabel(selectedTransmission)}${plus.moto ? " + moto" : ""}. Escolha a quantidade de aulas para o seu momento.`;

  grid.innerHTML = PLANS.map(item => {
    const plan = getPlan(item.id);
    const total = totalLessons(plan);

    return `
      <article class="plan-card ${plan.featured ? "featured" : ""}" data-plan="${plan.id}">
        ${plan.featured ? '<span class="plan-ribbon">DESTAQUE</span>' : ''}
        <span class="plan-type">${plan.label.toUpperCase()}</span>
        <h3 class="plan-name">${plan.name.toUpperCase()}</h3>
        <div class="plan-price"><span>R$</span><strong>${plan.price.toLocaleString("pt-BR")}</strong></div>
        <div class="plan-lessons">
          <b>${total} AULAS</b>
          <p>${plan.car} aulas de carro ${transmissionLabel(plan.transmission)}${plan.moto ? `<br>${plan.moto} aulas de moto` : ""}</p>
        </div>
        ${plan.featured ? `<div class="unit-cost">
          CUSTO MÉDIO POR AULA
          <strong>${money(unitCost(plan))}</strong>
        </div>` : ""}
        <p class="plan-note">${plan.description}</p>
        <button type="button" class="btn ${plan.featured ? "btn-orange" : "btn-navy"}" data-select-plan="${plan.id}">
          Quero o ${plan.name} <span>→</span>
        </button>
      </article>
    `;
  }).join("");

  renderComparison();

  $$('[data-select-plan]').forEach(button => {
    button.addEventListener("click", () => {
      const plan = getPlan(button.dataset.selectPlan);
      selectPlan(plan, true);
    });
  });
}

function renderComparison() {
  const plus = getPlan("diamante-plus");
  const ouro = getPlan("ouro");
  const additional = plus.price - ouro.price;
  const extraLessons = totalLessons(plus) - totalLessons(ouro);

  $("#comparisonMetrics").innerHTML = `
    <div class="comparison-metric">
      <small>DIAMANTE PLUS</small>
      <strong>${totalLessons(plus)} AULAS</strong>
      <p>${lessonSummary(plus)}.</p>
    </div>
    <div class="comparison-metric">
      <small>COMPARADO AO OURO</small>
      <strong>+${extraLessons} AULAS</strong>
      <p>por ${moneyNoCents(additional)} a mais.</p>
    </div>
    <div class="comparison-metric">
      <small>SEU TREINO</small>
      <strong>MAIS REPETIÇÃO</strong>
      <p>Mais oportunidades para praticar os pontos que você quer melhorar.</p>
    </div>
  `;
}

function bindTransmission() {
  $$('input[name="transmission"]').forEach(input => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      selectedTransmission = input.value;
      renderPlans();
      if (selectedPlan) {
        selectedPlan = getPlan(selectedPlan.id);
        updateSticky(selectedPlan);
      }
      if (quizAnswers.length === 3) renderQuizResult(false);
      track("transmission_changed", { transmission: selectedTransmission });
    });
  });
}

/* =========================================================
   WHATSAPP E SELEÇÃO DE PLANO
========================================================= */
function whatsappUrl(plan = null, source = "site") {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const utmCampaign = params.get("utm_campaign");

  let text = `Olá, ${CONFIG.instructor}! Vi seu site e gostaria de falar sobre as aulas práticas.`;

  if (plan) {
    text += `\n\nTenho interesse no plano *${plan.name}*:`;
    text += `\n• ${plan.car} aulas de carro ${transmissionLabel(plan.transmission)}`;
    if (plan.moto) text += `\n• ${plan.moto} aulas de moto`;
    text += `\n• ${totalLessons(plan)} aulas no total`;
    text += `\n• Valor informado no site: ${money(plan.price)}`;
    text += `\n\nQuero confirmar disponibilidade, condições de pagamento e se esse plano é o mais indicado para mim.`;
  } else {
    text += `\n\nQuero entender qual plano é mais adequado para o meu momento e consultar horários disponíveis.`;
    text += `\nTenho interesse em carro ${transmissionLabel(selectedTransmission)}.`;
  }

  text += `\n\nLocal: ${CONFIG.city}`;
  if (utmSource) text += `\nOrigem: ${utmSource}`;
  if (utmCampaign) text += `\nCampanha: ${utmCampaign}`;
  text += `\nPágina: ${source}`;

  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
}

function openWhatsapp(plan = null, source = "site") {
  track("whatsapp_click", { plan: plan?.id || "geral", transmission: selectedTransmission, source });
  window.open(whatsappUrl(plan, source), "_blank", "noopener,noreferrer");
}

function selectPlan(plan, openNow = false) {
  selectedPlan = plan;
  saveSelection(plan);
  updateSticky(plan);
  showToast(`${plan.name} selecionado. O WhatsApp será aberto com o plano preenchido.`);
  track("plan_selected", { plan: plan.id, price: plan.price });

  if (openNow) {
    if (plan.id === "ouro") {
      const plus = getPlan("diamante-plus");
      const difference = plus.price - plan.price;
      const extra = totalLessons(plus) - totalLessons(plan);
      const usePlus = window.confirm(
        `Antes de continuar: o Diamante Plus tem ${totalLessons(plus)} aulas, contra ${totalLessons(plan)} do Ouro.\n\nPor ${moneyNoCents(difference)} a mais, são +${extra} aulas.\n\nOK = ver o Diamante Plus no WhatsApp\nCancelar = continuar com o Ouro`
      );
      if (usePlus) {
        selectedPlan = plus;
        saveSelection(plus);
        updateSticky(plus);
        showToast(`${plus.name} selecionado. O WhatsApp será aberto com o plano preenchido.`);
      }
      openWhatsapp(selectedPlan, usePlus ? "upsell_ouro_plus" : "plano_ouro");
      return;
    }

    openWhatsapp(plan, `plano_${plan.id}`);
  }
}

function updateSticky(plan) {
  $("#stickyPlanName").textContent = plan.name.toUpperCase();
  $("#stickyPlanPrice").textContent = `${totalLessons(plan)} aulas • ${transmissionLabel(plan.transmission)} • ${moneyNoCents(plan.price)}`;
  if (!stickyDismissed && window.innerWidth > 760) $("#stickyPlan").classList.add("is-visible");
}

$("#stickyWhatsapp").addEventListener("click", () => openWhatsapp(selectedPlan || getPlan("diamante-plus"), "sticky_plan"));
$("#stickyClose").addEventListener("click", () => {
  stickyDismissed = true;
  $("#stickyPlan").classList.remove("is-visible");
});

$$('[data-whatsapp="geral"]').forEach(button => button.addEventListener("click", () => openWhatsapp(null, "contato_geral")));

/* =========================================================
   QUIZ HONESTO DE RECOMENDAÇÃO
========================================================= */
const quizAnswers = [];

function bindQuiz() {
  $$(".quiz-option").forEach(button => {
    button.addEventListener("click", () => {
      const step = Number(button.closest(".quiz-step").dataset.step);
      quizAnswers[step - 1] = button.dataset.value;
      track("quiz_answer", { step, answer: button.dataset.value });

      if (step < 3) {
        goQuizStep(step + 1);
      } else {
        showQuizResult();
      }
    });
  });

  $("#quizRestart").addEventListener("click", resetQuiz);
  $("#resultWhatsapp").addEventListener("click", () => {
    const plan = recommendPlan();
    selectPlan(plan);
    openWhatsapp(plan, "quiz_result");
  });
}

function goQuizStep(step) {
  $$(".quiz-step").forEach(el => el.classList.toggle("is-active", Number(el.dataset.step) === step));
  $("#quizResult").classList.remove("is-active");
  $("#quizBar").style.width = `${step * 33.333}%`;
}

function recommendPlan() {
  const plus = getPlan("diamante-plus");
  const [moment, confidence, priority] = quizAnswers;
  if (priority === "price" && moment === "start" && confidence !== "low") return getPlan("prata");
  if (priority === "balance" && confidence !== "low" && moment !== "intensive") return getPlan("ouro");
  if (priority === "practice" || confidence === "low" || moment === "intensive") return plus;
  return getPlan("ouro");
}

function recommendationReason(plan) {
  const plus = getPlan("diamante-plus");
  if (plan.id === "prata") return "Você indicou que quer começar com menor investimento e não precisa, neste momento, do maior volume de prática. O Prata é o nosso plano com menos aulas e menor preço.";
  if (plan.id === "ouro") return "Você busca equilíbrio entre preço e quantidade de aulas. O Ouro aumenta bastante o volume de prática em relação ao Prata sem chegar ao investimento do Plus.";
  return `Você indicou que quer mais prática ou ainda precisa ganhar confiança. O Diamante Plus oferece ${totalLessons(plus)} aulas e tem o menor custo médio por aula entre os nossos planos: ${money(unitCost(plus))}.`;
}

function showQuizResult() {
  renderQuizResult();
  track("quiz_completed", { recommendation: recommendPlan().id, transmission: selectedTransmission });
}

function renderQuizResult(selectRecommendation = true) {
  const plan = recommendPlan();
  if (selectRecommendation) {
    selectedPlan = plan;
    saveSelection(plan);
    updateSticky(plan);
  }
  $$(".quiz-step").forEach(el => el.classList.remove("is-active"));
  $("#quizResult").classList.add("is-active");
  $("#quizBar").style.width = "100%";
  $("#resultPlan").textContent = plan.name.toUpperCase();
  $("#resultReason").textContent = recommendationReason(plan);
  $("#resultContext").textContent = lessonSummary(plan);
  $("#resultPrice").innerHTML = `${totalLessons(plan)} aulas • ${moneyNoCents(plan.price)}${plan.featured ? `<small>${money(unitCost(plan))}/aula em média</small>` : ""}`;
}

function resetQuiz() {
  quizAnswers.length = 0;
  $("#quizResult").classList.remove("is-active");
  goQuizStep(1);
}

/* =========================================================
   AVALIAÇÕES: UMA NO CELULAR, TRÊS NO COMPUTADOR
========================================================= */
function bindReviews() {
  const trackElement = $("#reviewsTrack");
  const groups = $$(".reviews-page", trackElement);
  const cards = $$(".review-card", trackElement);
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  let pageSize = mobileQuery.matches ? 1 : 3;
  let pages = mobileQuery.matches ? cards : groups;
  const previous = $("#reviewsPrev");
  const next = $("#reviewsNext");
  const status = $("#reviewsStatus");
  const total = cards.length;
  let activePage = 0;
  let pendingFrame = null;

  const pageOffset = page => page.getBoundingClientRect().left - trackElement.getBoundingClientRect().left + trackElement.scrollLeft;

  function updateControls() {
    activePage = pages.reduce((closest, page, index) => {
      return Math.abs(pageOffset(page) - trackElement.scrollLeft) < Math.abs(pageOffset(pages[closest]) - trackElement.scrollLeft) ? index : closest;
    }, 0);
    previous.disabled = activePage === 0;
    next.disabled = activePage === pages.length - 1;
    const first = activePage * pageSize + 1;
    status.textContent = pageSize === 1 ? `${first} de ${total}` : `${first} a ${Math.min(first + pageSize - 1, total)} de ${total}`;
    previous.setAttribute("aria-label", pageSize === 1 ? "Avaliação anterior" : "Grupo anterior");
    next.setAttribute("aria-label", pageSize === 1 ? "Próxima avaliação" : "Próximo grupo");
  }

  function goToPage(index, instant = false) {
    const target = Math.max(0, Math.min(pages.length - 1, index));
    trackElement.scrollTo({ left: pageOffset(pages[target]), behavior: instant || reduceMotion ? "instant" : "smooth" });
  }

  previous.addEventListener("click", () => goToPage(activePage - 1));
  next.addEventListener("click", () => goToPage(activePage + 1));
  trackElement.addEventListener("keydown", event => {
    if (event.target !== trackElement) return;
    const targets = { ArrowLeft: activePage - 1, ArrowRight: activePage + 1, Home: 0, End: pages.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    goToPage(targets[event.key]);
  });
  trackElement.addEventListener("scroll", () => {
    if (pendingFrame !== null) return;
    pendingFrame = requestAnimationFrame(() => {
      updateControls();
      pendingFrame = null;
    });
  }, { passive: true });
  mobileQuery.addEventListener("change", () => {
    const firstCard = activePage * pageSize;
    pageSize = mobileQuery.matches ? 1 : 3;
    pages = mobileQuery.matches ? cards : groups;
    activePage = Math.floor(firstCard / pageSize);
    goToPage(activePage, true);
    updateControls();
  });
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => goToPage(activePage, true)).observe(trackElement);
  }
  updateControls();
}

/* =========================================================
   FAQ
========================================================= */
function bindFaq() {
  $$(".faq-item").forEach(item => {
    const button = $(".faq-question", item);
    const answer = $(".faq-answer", item);
    button.addEventListener("click", () => {
      const opening = !item.classList.contains("is-open");
      $$(".faq-item.is-open").forEach(other => {
        if (other === item) return;
        other.classList.remove("is-open");
        $(".faq-question", other).setAttribute("aria-expanded", "false");
        $(".faq-answer", other).style.maxHeight = null;
      });
      item.classList.toggle("is-open", opening);
      button.setAttribute("aria-expanded", String(opening));
      answer.style.maxHeight = opening ? `${answer.scrollHeight}px` : null;
    });
  });
}

/* =========================================================
   HEADER / MENU / SCROLL
========================================================= */
function bindNavigation() {
  const header = $("#header");
  const progress = $("#scrollProgress");
  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");

  function updateScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 15);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  }

  window.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  menuToggle.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  });

  $$("#mobileMenu a").forEach(link => link.addEventListener("click", () => {
    mobileMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }));
}

/* =========================================================
   REVEAL SUTIL + CTA MOBILE
========================================================= */
function bindReveal() {
  const elements = $$(".reveal");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    elements.forEach(el => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .1, rootMargin: "0px 0px -35px 0px" });
  elements.forEach(el => observer.observe(el));
}

function bindMobileCta() {
  const hero = $("#inicio");
  const mobile = $("#mobileCta");
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(entries => {
    mobile.classList.toggle("is-visible", !entries[0].isIntersecting);
  }, { threshold: .08 });
  observer.observe(hero);
}

/* =========================================================
   TRACKING: pronto para GA4 / GTM
========================================================= */
function track(eventName, data = {}) {
  if (typeof window.gtag === "function") window.gtag("event", eventName, data);
  if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: eventName, ...data });
}

$$('[data-track]').forEach(el => el.addEventListener("click", () => track("cta_click", { location: el.dataset.track })));

/* =========================================================
   TOAST
========================================================= */
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3000);
}

/* =========================================================
   INIT
========================================================= */
function init() {
  $("#year").textContent = new Date().getFullYear();
  renderPlans();
  bindTransmission();
  bindReviews();
  bindQuiz();
  bindFaq();
  bindNavigation();
  bindReveal();
  bindMobileCta();

  try {
    const saved = localStorage.getItem("regnier_selected_plan");
    if (saved && getPlan(saved)) selectedPlan = getPlan(saved);
  } catch {}
}

init();
