"use strict";

/* =========================================================
   CONFIGURAÇÃO PRINCIPAL
   Edite o WhatsApp abaixo antes de publicar.
   Formato: 55 + DDD + número, sem espaços.
========================================================= */
const CONFIG = {
  whatsapp: "5527999999999",
  instructor: "Regnier",
  instagram: "@instrutorregnier",
  city: "Serra - ES"
};

/* =========================================================
   PLANOS
   ALTERE OS VALORES AQUI E O SITE RECALCULA TUDO.

   Observação: no material enviado, Ouro e Diamante aparecem
   ambos com 5 aulas de carro + 5 de moto, porém com preços
   diferentes. Mantivemos exatamente os dados do material.
========================================================= */
const PLANS = [
  {
    id: "prata",
    name: "Prata",
    price: 950,
    car: 2,
    moto: 2,
    label: "Entrada",
    description: "Para quem quer poucas aulas extras e menor desembolso."
  },
  {
    id: "ouro",
    name: "Ouro",
    price: 1200,
    car: 5,
    moto: 5,
    label: "Equilíbrio",
    description: "Mais espaço para repetir fundamentos."
  },
  {
    id: "diamante",
    name: "Diamante",
    price: 1600,
    car: 5,
    moto: 5,
    label: "Especial",
    description: "Aulas dinâmicas e direto ao ponto."
  },
  {
    id: "diamante-plus",
    name: "Diamante Plus",
    price: 1899,
    car: 15,
    moto: 15,
    label: "Melhor custo por aula",
    description: "Para quem quer o maior volume de prática em carro e moto.",
    featured: true
  }
];

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const money = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(value);
const moneyNoCents = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getPlan = id => PLANS.find(plan => plan.id === id);
const totalLessons = plan => plan.car + plan.moto;
const unitCost = plan => plan.price / totalLessons(plan);
const prata = getPlan("prata");
const plus = getPlan("diamante-plus");

let selectedPlan = null;
let stickyDismissed = false;
let toastTimer = null;

/* =========================================================
   PLANOS: RENDERIZAÇÃO E COMPARAÇÃO
========================================================= */
function renderPlans() {
  const grid = $("#plansGrid");
  if (!grid) return;
  const baseUnit = unitCost(prata);

  grid.innerHTML = PLANS.map(plan => {
    const total = totalLessons(plan);
    const perLesson = unitCost(plan);
    const savingVsPrata = Math.max(0, (1 - perLesson / baseUnit) * 100);

    return `
      <article class="plan-card ${plan.featured ? "featured" : ""}" data-plan="${plan.id}">
        ${plan.featured ? '<span class="plan-ribbon">DESTAQUE</span>' : ''}
        <span class="plan-type">${plan.label.toUpperCase()}</span>
        <h3 class="plan-name">${plan.name.toUpperCase()}</h3>
        <div class="plan-price"><span>R$</span><strong>${plan.price.toLocaleString("pt-BR")}</strong></div>
        <div class="plan-lessons">
          <b>${total} AULAS</b>
          <p>${plan.car} aulas práticas de carro<br>${plan.moto} aulas práticas de moto</p>
        </div>
        <div class="unit-cost">
          CUSTO MÉDIO POR AULA
          <strong>${money(perLesson)}</strong>
          ${savingVsPrata >= 1 ? `<div class="unit-saving">aprox. ${Math.round(savingVsPrata)}% menor por aula que no Prata</div>` : '<div class="unit-saving">referência de entrada</div>'}
        </div>
        <p class="plan-note">${plan.description}</p>
        <button type="button" class="btn ${plan.featured ? "btn-orange" : "btn-navy"}" data-select-plan="${plan.id}">
          ${plan.featured ? "Quero o melhor custo por aula" : `Quero o ${plan.name}`} <span>→</span>
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
  const ouro = getPlan("ouro");
  const additional = plus.price - ouro.price;
  const extraLessons = totalLessons(plus) - totalLessons(ouro);
  const unitSaving = (1 - unitCost(plus) / unitCost(prata)) * 100;

  $("#comparisonMetrics").innerHTML = `
    <div class="comparison-metric">
      <small>DIAMANTE PLUS</small>
      <strong>${totalLessons(plus)} AULAS</strong>
      <p>15 de carro + 15 de moto.</p>
    </div>
    <div class="comparison-metric">
      <small>COMPARADO AO OURO</small>
      <strong>+${extraLessons} AULAS</strong>
      <p>por ${moneyNoCents(additional)} a mais, conforme os valores informados.</p>
    </div>
    <div class="comparison-metric">
      <small>COMPARADO AO PRATA</small>
      <strong>${Math.round(unitSaving)}% MENOR</strong>
      <p>no custo médio por aula calculado a partir dos pacotes.</p>
    </div>
  `;
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
    text += `\n• ${plan.car} aulas de carro`;
    text += `\n• ${plan.moto} aulas de moto`;
    text += `\n• ${totalLessons(plan)} aulas no total`;
    text += `\n• Valor informado no site: ${money(plan.price)}`;
    text += `\n\nQuero confirmar disponibilidade, condições de pagamento e se esse plano é o mais indicado para mim.`;
  } else {
    text += `\n\nQuero entender qual plano é mais adequado para o meu momento e consultar horários disponíveis.`;
  }

  text += `\n\nLocal: ${CONFIG.city}`;
  if (utmSource) text += `\nOrigem: ${utmSource}`;
  if (utmCampaign) text += `\nCampanha: ${utmCampaign}`;
  text += `\nPágina: ${source}`;

  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
}

function openWhatsapp(plan = null, source = "site") {
  track("whatsapp_click", { plan: plan?.id || "geral", source });
  window.open(whatsappUrl(plan, source), "_blank", "noopener,noreferrer");
}

function selectPlan(plan, openNow = false) {
  selectedPlan = plan;
  localStorage.setItem("regnier_selected_plan", plan.id);
  updateSticky(plan);
  showToast(`${plan.name} selecionado. O WhatsApp será aberto com o plano preenchido.`);
  track("plan_selected", { plan: plan.id, price: plan.price });

  if (openNow) {
    if (plan.id === "ouro") {
      const difference = plus.price - plan.price;
      const extra = totalLessons(plus) - totalLessons(plan);
      const usePlus = window.confirm(
        `Antes de continuar: o Diamante Plus tem ${totalLessons(plus)} aulas, contra ${totalLessons(plan)} do Ouro.\n\nPor ${moneyNoCents(difference)} a mais, são +${extra} aulas conforme os valores informados.\n\nOK = ver o Diamante Plus no WhatsApp\nCancelar = continuar com o Ouro`
      );
      openWhatsapp(usePlus ? plus : plan, usePlus ? "upsell_ouro_plus" : "plano_ouro");
      return;
    }

    openWhatsapp(plan, `plano_${plan.id}`);
  }
}

function updateSticky(plan) {
  if (stickyDismissed || window.innerWidth <= 760) return;
  $("#stickyPlanName").textContent = plan.name.toUpperCase();
  $("#stickyPlanPrice").textContent = `${totalLessons(plan)} aulas • ${moneyNoCents(plan.price)}`;
  $("#stickyPlan").classList.add("is-visible");
}

$("#stickyWhatsapp").addEventListener("click", () => openWhatsapp(selectedPlan || plus, "sticky_plan"));
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
  $("#resultWhatsapp").addEventListener("click", () => openWhatsapp(selectedPlan || plus, "quiz_result"));
}

function goQuizStep(step) {
  $$(".quiz-step").forEach(el => el.classList.toggle("is-active", Number(el.dataset.step) === step));
  $("#quizResult").classList.remove("is-active");
  $("#quizBar").style.width = `${step * 33.333}%`;
}

function recommendPlan() {
  const [moment, confidence, priority] = quizAnswers;
  if (priority === "price" && moment === "start" && confidence !== "low") return getPlan("prata");
  if (priority === "balance" && confidence !== "low" && moment !== "intensive") return getPlan("ouro");
  if (priority === "practice" || confidence === "low" || moment === "intensive") return plus;
  return getPlan("ouro");
}

function recommendationReason(plan) {
  if (plan.id === "prata") return "Você indicou que quer começar com menor desembolso e não precisa, neste momento, do maior volume de prática. O Prata é a opção mais enxuta dos dados informados.";
  if (plan.id === "ouro") return "Você busca equilíbrio entre preço e quantidade de aulas. O Ouro aumenta bastante o volume de prática em relação ao Prata sem chegar ao investimento do Plus.";
  return `Você indicou que quer mais prática ou ainda precisa ganhar confiança. O Diamante Plus concentra ${totalLessons(plus)} aulas e, nos valores cadastrados, tem o menor custo médio por aula: ${money(unitCost(plus))}.`;
}

function showQuizResult() {
  const plan = recommendPlan();
  selectedPlan = plan;
  localStorage.setItem("regnier_selected_plan", plan.id);
  $$(".quiz-step").forEach(el => el.classList.remove("is-active"));
  $("#quizResult").classList.add("is-active");
  $("#quizBar").style.width = "100%";
  $("#resultPlan").textContent = plan.name.toUpperCase();
  $("#resultReason").textContent = recommendationReason(plan);
  $("#resultPrice").textContent = `${totalLessons(plan)} aulas • ${moneyNoCents(plan.price)} • ${money(unitCost(plan))}/aula em média`;
  updateSticky(plan);
  track("quiz_completed", { recommendation: plan.id });
}

function resetQuiz() {
  quizAnswers.length = 0;
  $("#quizResult").classList.remove("is-active");
  goQuizStep(1);
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
  if (!header) return;
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
  if (!hero || !mobile || !("IntersectionObserver" in window)) return;
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
  renderPlans();
  if ($("#quiz")) bindQuiz();
  bindFaq();
  bindNavigation();
  bindReveal();
  bindMobileCta();

  const saved = localStorage.getItem("regnier_selected_plan");
  if (saved && getPlan(saved)) selectedPlan = getPlan(saved);
}

init();
