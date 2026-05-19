import { useState, useEffect, useMemo } from "react"; // v1779056609861


// ─── STORAGE ──────────────────────────────────────────────────────────────────
const DB = {
  get: (k, d) => { try { const v = localStorage.getItem("partic_" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem("partic_" + k, JSON.stringify(v)); } catch {} },
};

// ─── CORES OFICIAIS PARTIC ────────────────────────────────────────────────────
const C = {
  azulPetroleo: "#1B6B8A", azulClaro: "#5BB8D4", verdeEscuro: "#1A7A5E",
  verdeMedio: "#4CAF82", noite: "#0D2233", roxo: "#7153A2",
};

// Cor por cidade para avatares
const CITY_COLORS = {
  "Ribeirão Preto": "#7153A2", "Uberlândia": "#4CAF82", "São José do Rio Preto": "#1B6B8A",
  "Bauru": "#E67E22", "Uberaba": "#1A7A5E", "Presidente Prudente": "#E74C3C",
  "São Paulo": "#2980B9", "Rio de Janeiro": "#8E44AD", "Belo Horizonte": "#16A085",
  "Curitiba": "#D35400", "Porto Alegre": "#27AE60", "Florianópolis": "#2C3E50",
  "Campinas": "#C0392B", "Salvador": "#F39C12", "Fortaleza": "#1ABC9C",
  "Recife": "#9B59B6", "Brasília": "#E74C3C", "Goiânia": "#3498DB",
  "Manaus": "#E67E22", "Belém": "#16A085",
};

function getCityColor(city) {
  const base = (city || "").replace(/[\s]*[-,][\s]*[A-Z]{2}$/, "").replace(/\/[A-Z]{2}$/, "").trim();
  if (CITY_COLORS[base]) return CITY_COLORS[base];
  let hash = 0;
  for (let i = 0; i < base.length; i++) hash = base.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#1B6B8A","#4CAF82","#7153A2","#E67E22","#1A7A5E","#3498DB","#E74C3C","#8E44AD","#27AE60","#F39C12","#16A085","#D35400"];
  return colors[Math.abs(hash) % colors.length];
}

function WppBtn({ phone, size, showNumber }) {
  const num = (phone || "").replace(/[^0-9]/g, "");
  if (!num || num.length < 8) return null;
  const isXs = size === "xs";
  return (
    <a href={"https://wa.me/55" + num} target="_blank" rel="noreferrer"
      style={{ display: "inline-flex", alignItems: "center", gap: 4,
        background: "#128C7E", color: "#fff", borderRadius: 7,
        padding: isXs ? "2px 7px" : "5px 10px",
        fontSize: isXs ? 10 : 12, fontWeight: 700,
        textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap" }}>
      {I.wpp}{showNumber ? " " + phone : " WhatsApp"}
    </a>
  );
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_SCRIPTS = [
  { id: 1, category: "primeiro_contato", title: "Primeiro contato médico", content: "Olá, Dr(a). {{nome}}! 👋\n\nSou da equipe PARTIC — plataforma de curadoria para profissionais de saúde de excelência.\n\nVi seu perfil e acredito que você se encaixa perfeitamente no nosso padrão. Posso te apresentar em 10 minutos como funciona?\n\nAguardo seu retorno! 🙏" },
  { id: 2, category: "agendamento", title: "Confirmação de reunião", content: "Olá, Dr(a). {{nome}}!\n\nPassando para confirmar nossa conversa amanhã às {{horario}}. Será rápida — cerca de 20 minutos. Qualquer imprevisto, é só me avisar!\n\nAté amanhã! 😊" },
  { id: 3, category: "pos_reuniao", title: "Follow-up pós reunião", content: "Olá, Dr(a). {{nome}}!\n\nFoi um prazer conversar sobre a PARTIC. Como combinamos:\n\n✅ Acesso premium à plataforma\n✅ Perfil destacado para captação\n✅ Comunidade exclusiva de especialistas\n\nQualquer dúvida, estou à disposição! 🚀" },
  { id: 4, category: "onboarding", title: "Boas-vindas ao membro", content: "Bem-vindo(a) à PARTIC, Dr(a). {{nome}}! 🎉\n\nEstamos felizes em ter você na nossa comunidade de excelência médica.\n\nSeu perfil já está ativo!\n\nSeja muito bem-vindo(a)! 💙" },
  { id: 5, category: "expansao", title: "Expansão de cidade", content: "Olá, Dr(a). {{nome}}!\n\nEstamos expandindo a PARTIC para {{cidade}} e seu nome foi indicado como referência de excelência na região.\n\nGostaria de conversar sobre como fazer parte?" },
];
const SEED_USERS = [
  { id: 1, name: "Karine Rodrigues", email: "karine@partic.com.br", password: "partic2025", role: "admin", active: true, createdAt: "2025-01-01" },
];

const SEED_ANCHORS = [
  { id: 9001, name: "Dr. João Lucas O’Connell", profession: "Médico", specialty: "Cardiologia", subspecialty: "", city: "Uberlândia", state: "MG", status: "active", instagram: "@drjoaolucas", personalContact: "(34) 99123-0001", schedulingContact: "", email: "joao@email.com", monthlyFee: 297, joinedAt: "2024-01-15", isAnchor: true, notes: "Âncora confirmado", source: "Âncora" },
  { id: 9002, name: "Dra. Mariana Jabur", profession: "Médico", specialty: "Cardiologia", subspecialty: "Eletrofisiologia", city: "São José do Rio Preto", state: "SP", status: "active", instagram: "@dramarianajabur", personalContact: "(17) 99123-0002", schedulingContact: "", email: "mariana.jabur@email.com", monthlyFee: 297, joinedAt: "2024-02-10", isAnchor: true, notes: "Âncora confirmado", source: "Âncora" },
  { id: 9003, name: "Dra. Mariana Kefalas Gomes", profession: "Médico", specialty: "Ginecologia e Obstetrícia", subspecialty: "Endometriose", city: "Uberaba", state: "MG", status: "active", instagram: "@dramarianakefalas", personalContact: "(34) 99123-0003", schedulingContact: "", email: "mariana.kefalas@email.com", monthlyFee: 297, joinedAt: "2024-03-05", isAnchor: true, notes: "Âncora confirmado", source: "Âncora" },
  { id: 9004, name: "Dr. Tales Nadai", profession: "Médico", specialty: "Cirurgia Geral", subspecialty: "", city: "Bauru", state: "SP", status: "active", instagram: "@drtalesnadai", personalContact: "(14) 99123-0004", schedulingContact: "", email: "tales@email.com", monthlyFee: 297, joinedAt: "2024-03-20", isAnchor: true, notes: "Âncora confirmado", source: "Âncora" },
  { id: 9005, name: "Dra. Luciana Kelly Camargos", profession: "Médico", specialty: "Nefrologia", subspecialty: "", city: "Presidente Prudente", state: "SP", status: "active", instagram: "@dralucianak", personalContact: "(18) 99123-0005", schedulingContact: "", email: "luciana.kelly@email.com", monthlyFee: 297, joinedAt: "2024-04-01", isAnchor: true, notes: "Âncora confirmado", source: "Âncora" },
  { id: 9006, name: "Âncora PARTIC Ribeirão Preto", profession: "Médico", specialty: "—", subspecialty: "", city: "Ribeirão Preto", state: "SP", status: "active", instagram: "", personalContact: "", schedulingContact: "", email: "", monthlyFee: 0, joinedAt: "2024-01-01", isAnchor: true, notes: "Cidade âncora principal", source: "Âncora" },
]

function initData() {
  // Scripts sempre inicializados
  if (!DB.get("scripts_v1", false)) {
    DB.set("scripts", SEED_SCRIPTS);
    DB.set("scripts_v1", true);
  }
  // Usuários sempre garantidos
  if (!DB.get("users", null) || DB.get("users", []).length === 0) {
    DB.set("users", SEED_USERS);
  }
  studioInit();
  // Âncoras sempre garantidos — preserva e adiciona se não existirem
  if (!DB.get("anchors_seeded_v1", false)) {
    const existing = DB.get("members", []);
    const anchorIds = new Set(SEED_ANCHORS.map(a => a.id));
    const withoutOldAnchors = existing.filter(m => !anchorIds.has(m.id));
    DB.set("members", [...SEED_ANCHORS, ...withoutOldAnchors]);
    DB.set("anchors_seeded_v1", true);
  }
  // Base limpa — sem dados fictícios (exceto âncoras)
  if (!DB.get("base_clean_v3", false)) {
    DB.set("leads", []);
    DB.set("curation", []);
    DB.set("commercial", []);
    DB.set("contacts", []); // unified contacts table
    DB.set("meetings", []);
    DB.set("member_pipelines", []);
    DB.set("base_clean_v3", true);
    ["partic_initialized_v3","partic_initialized","partic_diagnosticDone"].forEach(k=>{try{localStorage.removeItem(k);}catch(e){}});
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getInitials(name) { return (name || "?").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase(); }

function Avatar({ name, size = 34, city, fixed }) {
  const bg = fixed ? C.azulPetroleo : city ? getCityColor(city) : C.azulPetroleo;
  return <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.34, flexShrink: 0 }}>{getInitials(name)}</div>;
}

function Pill({ children, color = C.azulPetroleo }) {
  return <span style={{ background: color + "18", color, border: "1px solid " + color + "33", borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{children}</span>;
}

function showToast(msg, type = "ok") {
  const el = document.createElement("div");
  el.style.cssText = `position:fixed;bottom:20px;right:20px;z-index:9999;padding:11px 18px;border-radius:10px;font-size:13px;font-weight:500;font-family:system-ui;color:#fff;background:${type === "ok" ? "#0f6e56" : type === "error" ? "#a32d2d" : C.azulPetroleo};box-shadow:0 4px 20px rgba(0,0,0,0.18);`;
  el.textContent = msg; document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; setTimeout(() => el.remove(), 300); }, 2600);
}


const PIPELINE_STAGES = [
  { id: "a_fazer", label: "A Fazer", color: "#94A3B8" },
  { id: "em_andamento", label: "Em Andamento", color: "#F59E0B" },
  { id: "concluido", label: "Concluído ✓", color: "#10B981" },
];

const SCRIPT_CATS = { primeiro_contato: "Primeiro Contato", agendamento: "Agendamento", pos_reuniao: "Pós Reunião", onboarding: "Onboarding", expansao: "Expansão de Cidade", outro: "Outro" };
const SCRIPT_COLORS = { primeiro_contato: "#3B82F6", agendamento: C.azulPetroleo, pos_reuniao: "#F59E0B", onboarding: "#10B981", expansao: C.roxo, outro: "#888" };

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const S = {
  app: { fontFamily: "system-ui,sans-serif", fontSize: 13, color: "#1a1a1a", minHeight: "100vh", background: "#f5f5f3", display: "flex" },
  sidebar: { width: 224, background: `linear-gradient(180deg,${C.noite} 0%,#1a3d52 100%)`, minHeight: "100vh", display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 50, overflowY: "auto" },
  main: { marginLeft: 224, padding: "20px 24px", flex: 1, minHeight: "100vh" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  card: { background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: "16px 18px" },
  input: { width: "100%", fontSize: 13, padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", outline: "none", height: 36 },
  select: { width: "100%", fontSize: 13, padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", height: 36 },
  btnP: { background: C.azulPetroleo, color: "#fff", border: "none", borderRadius: 8, padding: "0 16px", height: 36, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 },
  btnG: { background: C.verdeMedio, color: "#fff", border: "none", borderRadius: 8, padding: "0 16px", height: 36, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 },
  btnO: { background: "#fff", color: "#555", border: "1px solid #ddd", borderRadius: 8, padding: "0 14px", height: 32, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 },
  btnD: { background: "#fff0f0", color: "#a32d2d", border: "1px solid #fca5a5", borderRadius: 8, padding: "0 12px", height: 32, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 },
  btnSm: (color) => ({ background: color + "15", color, border: `1px solid ${color}30`, borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }),
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modalBox: { background: "#fff", borderRadius: 16, padding: "24px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" },
  lbl: { fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 4 },
  th: { background: "#f7f7f5", color: "#999", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", padding: "9px 14px", textAlign: "left", borderBottom: "1px solid #e5e5e5", whiteSpace: "nowrap" },
  td: { padding: "10px 14px", borderBottom: "1px solid #f5f5f5", verticalAlign: "middle", fontSize: 12 },
  kanbanCol: { background: "#f7f7f5", borderRadius: 12, padding: "12px 10px", minWidth: 240, flex: "0 0 240px" },
  kanbanCard: { background: "#fff", borderRadius: 10, border: "1px solid #e5e5e5", padding: "10px 12px", marginBottom: 8, cursor: "pointer" },
  filterBar: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 800, margin: "0 0 2px" },
  sectionSub: { fontSize: 13, color: "#888", margin: 0 },
};

// ─── ÍCONES ───────────────────────────────────────────────────────────────────
const I = {
  dashboard: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  leads: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  curadoria: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  comercial: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  members: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  anchor: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>,
  pipeline: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="10" width="14" height="4" rx="1"/><rect x="3" y="17" width="10" height="4" rx="1"/></svg>,
  map: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  scripts: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  diag: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  settings: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  generator: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  plus: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  search: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  edit: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  wpp: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  mail: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  ig: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  copy: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  logout: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  x: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chev: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
  shield: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  export: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  task: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  studio: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  calendar: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  upload: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  arquivo: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
  arrowR: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function Logo({ dark = false, size = "md" }) {
  const sz = { sm: { t: 14, s: 9 }, md: { t: 18, s: 10 }, lg: { t: 26, s: 12 } }[size] || { t: 18, s: 10 };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span style={{ fontFamily: "system-ui", fontSize: sz.t, fontWeight: 900, color: dark ? "#fff" : C.azulPetroleo, letterSpacing: "1px" }}>PARTIC</span>
        <span style={{ fontFamily: "system-ui", fontSize: sz.t, fontWeight: 300, color: C.verdeMedio, letterSpacing: "2px" }}> Flow</span>
      </div>
      {size !== "sm" && <span style={{ fontSize: sz.s, color: dark ? "rgba(255,255,255,0.4)" : C.azulClaro, letterSpacing: "0.1em", textTransform: "uppercase" }}>Saúde de Excelência a um clique</span>}
    </div>
  );
}

// ─── FILTROS RÁPIDOS ──────────────────────────────────────────────────────────
function FilterBar({ cities = [], specialties = [], onFilter, extraFilters }) {
  const [city, setCity] = useState("");
  const [spec, setSpec] = useState("");
  const [sub, setSub] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => { onFilter({ city, spec, sub, search }); }, [city, spec, sub, search]);
  return (
    <div style={S.filterBar}>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#aaa" }}>{I.search}</span>
        <input style={{ ...S.input, width: 200, paddingLeft: 28 }} placeholder="Buscar nome..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {cities.length > 0 && (
        <select style={{ ...S.select, width: "auto", minWidth: 140 }} value={city} onChange={e => setCity(e.target.value)}>
          <option value="">Todas as cidades</option>
          {cities.map(c => <option key={c}>{c}</option>)}
        </select>
      )}
      {specialties.length > 0 && (
        <select style={{ ...S.select, width: "auto", minWidth: 150 }} value={spec} onChange={e => setSpec(e.target.value)}>
          <option value="">Todas especialidades</option>
          {specialties.map(s => <option key={s}>{s}</option>)}
        </select>
      )}
      {extraFilters}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ onNav, user }) {
  const members = DB.get("members", []);
  const contacts = DB.get("contacts", []);
  const leads = contacts.filter(c => c.stage === "lead");
  const curation = contacts.filter(c => c.stage === "curadoria_avaliacao" || c.stage === "curadoria_aprovado");
  const commercial = contacts.filter(c => c.stage && c.stage.startsWith("comercial_") && c.stage !== "comercial_sem_interesse");
  const meetings = DB.get("meetings", []);
  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  const firstName = (user?.name || "").split(" ")[0];
  const activeM = members.filter(m => m.status === "active").length;

  const inEval = contacts.filter(c => c.stage === "curadoria_avaliacao").length;
  const approved = contacts.filter(c => c.stage === "curadoria_aprovado").length;
  const nextMtgs = [...meetings].filter(m => new Date(m.scheduledAt) > now).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)).slice(0, 4);
  const cityStats = members.reduce((acc, m) => { acc[m.city] = (acc[m.city] || 0) + 1; return acc; }, {});
  const topCities = Object.entries(cityStats).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const specStats = members.reduce((acc, m) => { acc[m.specialty] = (acc[m.specialty] || 0) + 1; return acc; }, {});
  const topSpecs = Object.entries(specStats).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCity = Math.max(...topCities.map(c => c[1]), 1);

  return (
    <div>
      <div style={S.topbar}>
        <div>
          <h1 style={S.sectionTitle}>{greeting}, {firstName}! 👋</h1>
          <p style={S.sectionSub}>{now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Membros Ativos", value: activeM, sub: `de ${members.length} total`, color: C.azulPetroleo, icon: "👥", page: "members" },
          { label: "Em Curadoria", value: inEval, sub: `${approved} aprovados`, color: "#F59E0B", icon: "🔍", page: "curadoria" },
          { label: "Em Comercial", value: commercial.length, sub: "no pipeline", color: C.roxo, icon: "💼", page: "comercial" },
        ].map(k => (
          <div key={k.label} style={{ ...S.card, borderLeft: `3px solid ${k.color}`, cursor: "pointer" }} onClick={() => onNav(k.page)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 13, color: "#888", margin: "0 0 5px" }}>{k.label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: k.color, margin: "0 0 2px", lineHeight: 1 }}>{k.value}</p>
                <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>{k.sub}</p>
              </div>
              <span style={{ fontSize: 26 }}>{k.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div style={S.card}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 14px" }}>Membros por Cidade</h3>
          {topCities.map(([city, count]) => (
            <div key={city} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: "#555", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: getCityColor(city), display: "inline-block" }} />
                  {city}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: getCityColor(city) }}>{count}</span>
              </div>
              <div style={{ height: 5, background: "#f0f0f0", borderRadius: 99 }}>
                <div style={{ height: "100%", background: getCityColor(city), borderRadius: 99, width: `${(count / maxCity) * 100}%`, transition: "width .5s" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Por Especialidade</h3>
          {topSpecs.map(([spec, count]) => (
            <div key={spec} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <span style={{ fontSize: 11, color: "#555", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{spec}</span>
              <span style={{ background: C.azulPetroleo + "15", color: C.azulPetroleo, borderRadius: 99, padding: "1px 8px", fontSize: 11, fontWeight: 700, marginLeft: 6 }}>{count}</span>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Próximas Reuniões</h3>
          {nextMtgs.length > 0 ? nextMtgs.map(m => {
            const d = new Date(m.scheduledAt);
            return (
              <div key={m.id} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: C.azulPetroleo + "12", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.azulPetroleo, lineHeight: 1 }}>{d.getDate()}</span>
                  <span style={{ fontSize: 9, color: C.azulClaro, lineHeight: 1 }}>{d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</p>
                  <p style={{ fontSize: 10, color: "#aaa", margin: 0 }}>{d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · {m.type === "video" ? "📹" : m.type === "phone" ? "📞" : "🏥"}</p>
                </div>
              </div>
            );
          }) : <p style={{ fontSize: 12, color: "#aaa", textAlign: "center", padding: "16px 0" }}>Nenhuma reunião agendada</p>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Âncoras Confirmados</h3>
            <button style={{ ...S.btnO, fontSize: 11, height: 26 }} onClick={() => onNav("anchors")}>Ver todos {I.arrowR}</button>
          </div>
          {members.filter(m => m.isAnchor).map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
              <Avatar name={m.name} size={30} city={m.city} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</p>
                <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{m.specialty} · {m.city}</p>
              </div>
              {m.personalContact && (
                <a href={`https://wa.me/55${m.personalContact.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{ color: "#128C7E" }}>{I.wpp}</a>
              )}
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Leads Recentes</h3>
            <button style={{ ...S.btnO, fontSize: 11, height: 26 }} onClick={() => onNav("leads")}>Ver todos {I.arrowR}</button>
          </div>
          {DB.get("contacts", []).filter(c => c.stage === "lead").slice(0, 5).map(l => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
              <Avatar name={l.name} size={30} fixed />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</p>
                <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{l.specialty} · {l.city}</p>
              </div>
              {l.sentToCuration && <Pill color="#10B981">Curadoria</Pill>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CONTACTS HOOK ────────────────────────────────────────────────────────────
function useContacts() {
  const [contacts, setContactsState] = useState(() => {
    const stored = DB.get("contacts", null);
    if (!stored) {
      const oldLeads = DB.get("leads", []).map(c => ({ ...c, stage: "lead" }));
      const oldCuration = DB.get("curation", []).map(c => ({
        ...c,
        stage: c.status === "aprovado" ? "curadoria_aprovado" :
               c.status === "reprovado" ? "curadoria_reprovado" : "curadoria_avaliacao"
      }));
      const migrated = [];
      const seen = new Set();
      [...oldCuration, ...oldLeads].forEach(c => {
        const key = (c.name || "").toLowerCase().trim();
        if (!key || seen.has(key)) return;
        seen.add(key);
        migrated.push({ ...c, id: c.id || Date.now() + Math.random(), createdAt: c.createdAt || new Date().toISOString() });
      });
      DB.set("contacts", migrated);
      return migrated;
    }
    const seen = new Set();
    return stored.filter(c => {
      const key = (c.name || "").toLowerCase().trim();
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

  const save = updated => {
    const seen = new Set();
    const deduped = updated.filter(c => {
      const key = (c.name || "").toLowerCase().trim();
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setContactsState(deduped);
    DB.set("contacts", deduped);
  };

  const moveStage = (id, newStage, extra) => {
    save(contacts.map(c => c.id === id ? { ...c, stage: newStage, ...extra, lastMoved: new Date().toISOString() } : c));
  };

  return { contacts, save, moveStage };
}


// ─── LEADS ────────────────────────────────────────────────────────────────────
function Leads({ onNav, initialFilters }) {
  const { contacts, save, moveStage } = useContacts();

  const [filters, setFilters] = useState({ city: (initialFilters && initialFilters.city) || "", spec: (initialFilters && initialFilters.spec) || "", search: "" });

  useEffect(() => {
    if (initialFilters && (initialFilters.city || initialFilters.spec)) {
      setFilters({ city: initialFilters.city || "", spec: initialFilters.spec || "", search: "" });
    }
  }, [initialFilters && initialFilters.city, initialFilters && initialFilters.spec]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "", specialty: "", subspecialty: "", profession: "Medico",
    city: "", state: "", phone: "", email: "", instagram: "", source: "Indicacao"
  });

  // Strip state suffix: "Ribeirao Preto/SP" -> "Ribeirao Preto"
  const stripSuffix = c => (c || "").replace(/\s*[-\/,]\s*[A-Za-z]{2}$/, "").trim();

  // Only contacts with stage = "lead", deduplicated by name
  const leads = contacts.filter(c => c.stage === "lead");

  // Unique cities from leads (normalized dedup, original display)
  const cityOptions = [];
  const seenCities = new Set();
  leads.forEach(l => {
    const city = stripSuffix(l.city || "").trim();
    if (!city || city.length < 2) return;
    // Use normalized key for dedup to avoid duplicates from accent differences
    const key = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (seenCities.has(key)) return;
    seenCities.add(key);
    const st = (l.state || "").toUpperCase();
    cityOptions.push({ value: city, label: st ? city + " - " + st : city });
  });
  cityOptions.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

  // Unique specialties from leads (normalized dedup)
  const specOptions = [];
  const seenSpecs = new Set();
  leads.forEach(l => {
    const spec = (l.specialty || "").trim();
    if (!spec) return;
    const key = spec.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (seenSpecs.has(key)) return;
    seenSpecs.add(key);
    specOptions.push({ value: spec, label: spec });
  });
  specOptions.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

  // Normalize: remove accents for comparison
  const normalize = s => (s || "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim();

  // Apply filters with normalized comparison
  const filtered = leads.filter(l => {
    if (filters.city) {
      const leadCity = normalize(stripSuffix(l.city || ""));
      const filterCity = normalize(filters.city);
      if (leadCity !== filterCity) return false;
    }
    if (filters.spec) {
      const leadSpec = normalize(l.specialty || "");
      const filterSpec = normalize(filters.spec);
      if (leadSpec !== filterSpec) return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!(l.name || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  function sendToCuration(id) {
    moveStage(id, "curadoria_avaliacao");
    showToast("Enviado para Curadoria!");
  }

  function addLead() {
    if (!form.name.trim()) return alert("Nome e obrigatorio");
    const newContact = {
      ...form,
      id: Date.now() + Math.random(),
      stage: "lead",
      createdAt: new Date().toISOString()
    };
    save([...contacts, newContact]);
    setShowAdd(false);
    showToast("Lead adicionado!");
    setForm({ name: "", specialty: "", subspecialty: "", profession: "Medico", city: "", state: "", phone: "", email: "", instagram: "", source: "Indicacao" });
  }

  function deleteLead(id) {
    if (!confirm("Remover este lead?")) return;
    save(contacts.filter(c => c.id !== id));
    showToast("Lead removido");
  }

  return (
    <div>
      <div style={S.topbar}>
        <div>
          <h1 style={S.sectionTitle}>Leads</h1>
          <p style={S.sectionSub}>
            <span style={{ color: C.azulPetroleo, fontWeight: 600 }}>{leads.length} contatos</span>
            <span style={{ color: "#aaa", marginLeft: 8, fontSize: 11 }}>prontos para curadoria</span>
          </p>
        </div>
        <button style={S.btnP} onClick={() => setShowAdd(true)}>{I.plus} Novo lead</button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 12 }}>{I.search}</span>
          <input style={{ ...S.input, width: 200, paddingLeft: 28, height: 34, fontSize: 12 }}
            placeholder="Buscar por nome..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
        </div>

        <select style={{ ...S.select, height: 34, fontSize: 12, minWidth: 190 }}
          value={filters.city}
          onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}>
          <option value="">Todas as cidades</option>
          {cityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select style={{ ...S.select, height: 34, fontSize: 12, minWidth: 190 }}
          value={filters.spec}
          onChange={e => setFilters(f => ({ ...f, spec: e.target.value }))}>
          <option value="">Todas as especialidades</option>
          {specOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {(filters.city || filters.spec || filters.search) && (
          <button style={{ ...S.btnO, height: 30, fontSize: 11 }}
            onClick={() => setFilters({ city: "", spec: "", search: "" })}>
            x Limpar
          </button>
        )}
        <span style={{ fontSize: 11, color: "#aaa", marginLeft: "auto" }}>
          {filtered.length} lead{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 10 }}>
        {filtered.map(lead => {
          const city = stripSuffix(lead.city || "");
          const st = (lead.state || "").toUpperCase();
          const cityDisplay = city ? (st ? city + " - " + st : city) : "";
          const phone = lead.schedulingContact || lead.personalContact || lead.phone || "";
          const ig = (lead.instagram || "").replace("@", "");

          return (
            <div key={lead.id} style={{ ...S.card, padding: "14px 16px", borderLeft: "3px solid " + C.azulPetroleo }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <Avatar name={lead.name} size={42} fixed />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.name}</p>
                  <p style={{ fontSize: 11, color: "#555", margin: "0 0 2px" }}>
                    {lead.specialty || "Especialidade nao informada"}
                    {lead.subspecialty ? " · " + lead.subspecialty : ""}
                  </p>
                  {cityDisplay && <p style={{ fontSize: 12, color: "#888", margin: 0 }}>📍 {cityDisplay}</p>}
                </div>
              </div>

              {/* Botoes de contato */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {phone && <WppBtn phone={phone} />}
                {lead.email && (
                  <a href={"mailto:" + lead.email}
                    style={{ ...S.btnSm(C.azulPetroleo), textDecoration: "none" }}>
                    {I.mail} E-mail
                  </a>
                )}
                {ig && ig !== "A verificar" && (
                  <a href={"https://instagram.com/" + ig} target="_blank" rel="noreferrer"
                    style={{ ...S.btnSm("#833ab4"), textDecoration: "none" }}>
                    {I.ig} Instagram
                  </a>
                )}
              </div>

              {/* Acoes */}
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => sendToCuration(lead.id)}
                  style={{ flex: 1, background: C.azulPetroleo + "12", color: C.azulPetroleo, border: "1px solid " + C.azulPetroleo + "30", borderRadius: 8, padding: "7px 0", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  Enviar para Curadoria
                </button>
                <button onClick={() => deleteLead(lead.id)}
                  style={{ background: "#fff0f0", color: "#a32d2d", border: "1px solid #fca5a5", borderRadius: 8, padding: "7px 10px", fontSize: 12, cursor: "pointer" }}>
                  {I.trash}
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", ...S.card, textAlign: "center", padding: "48px 20px", color: "#aaa" }}>
            <p style={{ fontSize: 32, margin: "0 0 10px" }}>📋</p>
            <p style={{ margin: 0 }}>
              {leads.length === 0
                ? "Nenhum lead. Use Importacao para adicionar contatos."
                : "Nenhum lead corresponde aos filtros."}
            </p>
          </div>
        )}
      </div>

      {/* Modal novo lead */}
      {showAdd && (
        <div style={S.modal} onClick={() => setShowAdd(false)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 18px" }}>Novo Lead</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div style={{ gridColumn: "1/-1" }}><label style={S.lbl}>Nome</label><input style={S.input} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label style={S.lbl}>Especialidade</label><input style={S.input} value={form.specialty} onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))} /></div>
              <div><label style={S.lbl}>Subespecialidade</label><input style={S.input} value={form.subspecialty} onChange={e => setForm(p => ({ ...p, subspecialty: e.target.value }))} /></div>
              <div><label style={S.lbl}>Cidade</label><input style={S.input} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
              <div><label style={S.lbl}>Estado (UF)</label><input style={S.input} value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} maxLength={2} placeholder="SP" /></div>
              <div><label style={S.lbl}>WhatsApp</label><input style={S.input} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div><label style={S.lbl}>E-mail</label><input style={S.input} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div><label style={S.lbl}>Instagram</label><input style={S.input} value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} /></div>
              <div><label style={S.lbl}>Origem</label>
                <select style={S.select} value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
                  {["Indicacao", "Instagram", "Google", "Evento", "Site"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btnP} onClick={addLead}>Salvar</button>
              <button style={S.btnO} onClick={() => setShowAdd(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      )}
    </div>
  );
}


// ─── CURADORIA ────────────────────────────────────────────────────────────────
function Curadoria({ onNav }) {
  const { contacts, save, moveStage } = useContacts();
  const [cityFilter, setCityFilter] = useState("");
  const [specFilter, setSpecFilter] = useState("");
  const [dragging, setDragging] = useState(null);
  const [sel, setSel] = useState(null);

  const norm = s => (s||"").toLowerCase().trim();
  const stripState = c => (c||"").replace(/[\s]*[-,][\s]*[A-Za-z]{2}$/, "").replace(/\/[A-Za-z]{2}$/, "").trim();

  // ONLY contacts in curadoria stages
  const curationContacts = contacts.filter(c => 
    c.stage === "curadoria_avaliacao" || c.stage === "curadoria_aprovado"
  );

  const cities = [...new Set(curationContacts.map(c => stripState(c.city)).filter(Boolean))].sort();
  const specs  = [...new Set(curationContacts.map(c => (c.specialty||"").trim()).filter(Boolean))].sort();

  const applyFilters = list => list.filter(c => {
    if (cityFilter && norm(stripState(c.city)) !== norm(cityFilter)) return false;
    if (specFilter && norm(c.specialty) !== norm(specFilter)) return false;
    return true;
  });

  const cols = {
    curadoria_avaliacao: applyFilters(curationContacts.filter(c => c.stage === "curadoria_avaliacao")),
    curadoria_aprovado:  applyFilters(curationContacts.filter(c => c.stage === "curadoria_aprovado")),
  };

  const COL_CFG = {
    curadoria_avaliacao: { label: "Em Avaliação", color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
    curadoria_aprovado:  { label: "Aprovado ✓",   color: "#10B981", bg: "#F0FDF4", border: "#A7F3D0" },
  };

  function approve(id) {
    moveStage(id, "curadoria_aprovado");
    showToast("Aprovado ✓");
    if (sel?.id === id) setSel(prev => ({ ...prev, stage: "curadoria_aprovado" }));
  }

  function reprove(id) {
    // Reprovado → goes to arquivo (stage = curadoria_reprovado), REMOVED from kanban
    moveStage(id, "curadoria_reprovado");
    setSel(null);
    showToast("Reprovado → movido para Arquivo", "info");
  }

  function sendToCommercial(id) {
    // Move: curadoria_aprovado → comercial_prospecto (REMOVES from curadoria)
    moveStage(id, "comercial_prospecto");
    setSel(null);
    showToast("Enviado para Comercial 🚀");
  }

  const totalAvaliacao = contacts.filter(c => c.stage === "curadoria_avaliacao").length;
  const totalAprovado  = contacts.filter(c => c.stage === "curadoria_aprovado").length;
  const totalReprovado = contacts.filter(c => c.stage === "curadoria_reprovado").length;

  return (
    <div>
      <div style={S.topbar}>
        <div>
          <h1 style={S.sectionTitle}>Curadoria</h1>
          <p style={S.sectionSub}>
            <span style={{ color: "#F59E0B", fontWeight: 600 }}>{totalAvaliacao} em avaliação</span> ·{" "}
            <span style={{ color: "#10B981", fontWeight: 600 }}>{totalAprovado} aprovados</span> ·{" "}
            <span style={{ color: "#aaa" }}>{totalReprovado} reprovados</span>
            {totalReprovado > 0 && <> · <button style={{ ...S.btnO, height: 20, fontSize: 10, padding: "0 8px" }} onClick={() => onNav("arquivo")}>📁 Ver arquivo →</button></>}
          </p>
        </div>
        <button style={S.btnG} onClick={() => onNav("leads")}>{I.leads} Ver Leads</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <select style={{ ...S.select, width: "auto", minWidth: 160, height: 34, fontSize: 12 }}
          value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
          <option value="">Todas as cidades</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select style={{ ...S.select, width: "auto", minWidth: 170, height: 34, fontSize: 12 }}
          value={specFilter} onChange={e => setSpecFilter(e.target.value)}>
          <option value="">Todas especialidades</option>
          {specs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(cityFilter || specFilter) && (
          <button style={{ ...S.btnO, fontSize: 11, height: 30 }} onClick={() => { setCityFilter(""); setSpecFilter(""); }}>✕ Limpar</button>
        )}
        {cityFilter && <span style={{ fontSize: 12, fontWeight: 700, color: getCityColor(cityFilter), background: getCityColor(cityFilter) + "15", borderRadius: 99, padding: "3px 10px" }}>📍 {cityFilter}</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {Object.entries(COL_CFG).map(([stage, cfg]) => (
          <div key={stage}
            style={{ background: cfg.bg, borderRadius: 14, border: `1.5px solid ${cfg.border}`, overflow: "hidden" }}
            onDragOver={e => e.preventDefault()}
            onDrop={() => {
              if (dragging && Object.keys(COL_CFG).includes(stage)) {
                moveStage(dragging, stage);
                setDragging(null);
              }
            }}>
            <div style={{ padding: "12px 14px 10px", borderBottom: `1.5px solid ${cfg.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.color }} />
              <span style={{ fontWeight: 700, fontSize: 13, color: cfg.color, flex: 1 }}>{cfg.label}</span>
              <span style={{ background: cfg.color, color: "#fff", borderRadius: 99, padding: "2px 9px", fontSize: 12, fontWeight: 800 }}>{cols[stage].length}</span>
            </div>
            <div style={{ padding: "10px 10px 12px", maxHeight: 540, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {cols[stage].map(item => {
                const cityColor = getCityColor(stripState(item.city));
                const googleUrl = "https://www.google.com/search?q=" + encodeURIComponent(item.name + " " + (item.specialty||"") + " " + (stripState(item.city)||""));
                return (
                  <div key={item.id}
                    draggable onDragStart={() => setDragging(item.id)} onDragEnd={() => setDragging(null)}
                    onClick={() => setSel(item)}
                    style={{ background: "#fff", borderRadius: 10, border: `1px solid ${cityColor}30`, borderLeft: `3px solid ${cityColor}`, padding: "10px 12px", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 10, background: cityColor+"18", color: cityColor, borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>
                        📍 {stripState(item.city)}{item.state ? ` - ${item.state}` : ""}
                      </span>
                      {item.particScore && <span style={{ fontSize: 10, background: "#f0faf4", color: "#0f6e56", borderRadius: 99, padding: "2px 7px", fontWeight: 700 }}>⭐ {item.particScore}/10</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
                      <Avatar name={item.name} size={36} city={stripState(item.city)} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{item.name}</p>
                          <a href={googleUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                            style={{ color: "#ccc", textDecoration: "none", fontSize: 11 }}
                            onMouseEnter={e => e.currentTarget.style.color="#555"} onMouseLeave={e => e.currentTarget.style.color="#ccc"}>🔍</a>
                        </div>
                        <p style={{ fontSize: 12, color: "#555", margin: "3px 0 0" }}>
                          {item.specialty}{item.subspecialty ? <span style={{ color: "#EF4444", fontWeight: 600 }}> · {item.subspecialty}</span> : ""}
                        </p>
                      </div>
                    </div>
                    {(item.phone || item.personalContact) && (
                      <div style={{ fontSize: 11, color: "#888", marginBottom: 6, display: "flex", gap: 6, alignItems: "center" }}>
                        📱 {item.phone || item.personalContact}
                        <a href={`https://wa.me/55${(item.phone || item.personalContact || "").replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
                          style={{ background: "#128C7E", color: "#fff", borderRadius: 5, padding: "1px 7px", fontSize: 10, textDecoration: "none", fontWeight: 700 }}>{I.wpp}</a>
                      </div>
                    )}
                    {stage === "curadoria_avaliacao" && (
                      <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                        <button style={{ flex: 1, background: "#f0faf4", color: "#0f6e56", border: "1px solid #a7f0d8", borderRadius: 7, padding: "5px 0", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                          onClick={e => { e.stopPropagation(); approve(item.id); }}>✓ Aprovar</button>
                        <button style={{ flex: 1, background: "#fff0f0", color: "#a32d2d", border: "1px solid #fca5a5", borderRadius: 7, padding: "5px 0", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                          onClick={e => { e.stopPropagation(); reprove(item.id); }}>✕ Reprovar</button>
                      </div>
                    )}
                    {stage === "curadoria_aprovado" && (
                      <button style={{ width: "100%", background: C.azulPetroleo, color: "#fff", border: "none", borderRadius: 7, padding: "6px 0", fontSize: 11, fontWeight: 700, cursor: "pointer", marginTop: 4 }}
                        onClick={e => { e.stopPropagation(); sendToCommercial(item.id); }}>
                        → Enviar para Comercial
                      </button>
                    )}
                  </div>
                );
              })}
              {cols[stage].length === 0 && <div style={{ textAlign: "center", padding: "28px 0", color: "#bbb", fontSize: 12 }}>Nenhum lead aqui</div>}
            </div>
          </div>
        ))}
      </div>



      {sel && (
        <div style={S.modal} onClick={() => setSel(null)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <Avatar name={sel.name} size={46} city={stripState(sel.city)} />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 2px" }}>{sel.name}</h3>
                <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{sel.specialty}{sel.subspecialty ? <span style={{ color: "#EF4444" }}> · {sel.subspecialty}</span> : ""} · {stripState(sel.city)}</p>
              </div>
              <button style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#aaa" }} onClick={() => setSel(null)}>{I.x}</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", marginBottom: 14, fontSize: 12 }}>
              {[["Formação", sel.formation], ["Telefone", sel.phone], ["E-mail", sel.email], ["Instagram", sel.instagram], ["Origem", sel.source], ["Score", sel.particScore && `${sel.particScore}/10`]].filter(([,v]) => v).map(([l,v]) => (
                <div key={l}><span style={{ fontSize: 10, color: "#aaa", fontWeight: 700, textTransform: "uppercase" }}>{l}</span><p style={{ margin: "1px 0 0" }}>{v}</p></div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(sel.phone || sel.personalContact) && <a href={`https://wa.me/55${(sel.phone || sel.personalContact || "").replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{ ...S.btnSm("#128C7E"), textDecoration: "none" }}>{I.wpp} WhatsApp</a>}
              {sel.email && <a href={`mailto:${sel.email}`} style={{ ...S.btnSm(C.azulPetroleo), textDecoration: "none" }}>{I.mail} E-mail</a>}
              <a href={`https://www.google.com/search?q=${encodeURIComponent(sel.name+" "+(sel.specialty||"")+" "+(stripState(sel.city)||""))}`} target="_blank" rel="noreferrer" style={{ ...S.btnSm("#185fa5"), textDecoration: "none" }}>🔍 Google</a>
              {sel.stage === "curadoria_avaliacao" && <>
                <button style={S.btnG} onClick={() => { approve(sel.id); setSel(null); }}>✓ Aprovar</button>
                <button style={S.btnD} onClick={() => reprove(sel.id)}>✕ Reprovar → Arquivo</button>
              </>}
              {sel.stage === "curadoria_aprovado" && <button style={S.btnP} onClick={() => sendToCommercial(sel.id)}>→ Comercial</button>}
            </div>
          </div>
        </div>
      )}
      )}
    </div>
  );
}



// ─── COMERCIAL ────────────────────────────────────────────────────────────────
const COMMERCIAL_STAGES = ["comercial_prospecto","comercial_aguardando","comercial_reuniao","comercial_negociacao","comercial_fechou"];
const COMMERCIAL_CFG = {
  comercial_prospecto:  { label: "Prospecto",           color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  comercial_aguardando: { label: "Aguardando Resposta",  color: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE" },
  comercial_reuniao:    { label: "Reuniao Agendada",     color: "#F97316", bg: "#FFF7ED", border: "#FED7AA" },
  comercial_negociacao: { label: "Negociacao",           color: "#EF4444", bg: "#FFF5F5", border: "#FECACA" },
  comercial_fechou:     { label: "Fechou!",              color: "#10B981", bg: "#F0FDF4", border: "#A7F3D0" },
};

function MeetingModal({ contact, onSave, onClose }) {
  const [form, setForm] = useState({
    meetingDate: contact.meetingDate || "",
    meetingTime: contact.meetingTime || "",
    meetingType: contact.meetingType || "online",
    meetingLink: contact.meetingLink || "",
    meetingAddress: contact.meetingAddress || "",
    meetingNotes: contact.meetingNotes || "",
  });

  function save() {
    if (!form.meetingDate) return alert("Informe a data da reuniao");
    onSave(form);
  }

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>Detalhes da Reuniao</h3>
        <p style={{ fontSize: 12, color: "#888", margin: "0 0 18px" }}>{contact.name}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <label style={S.lbl}>Data</label>
            <input type="date" style={S.input} value={form.meetingDate} onChange={e => setForm(f => ({ ...f, meetingDate: e.target.value }))} />
          </div>
          <div>
            <label style={S.lbl}>Horario</label>
            <input type="time" style={S.input} value={form.meetingTime} onChange={e => setForm(f => ({ ...f, meetingTime: e.target.value }))} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={S.lbl}>Formato</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["online", "presencial"].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, meetingType: t }))}
                  style={{ flex: 1, padding: "8px", fontSize: 13, fontWeight: form.meetingType === t ? 700 : 400, borderRadius: 8, border: form.meetingType === t ? "2px solid " + C.azulPetroleo : "1px solid #ddd", background: form.meetingType === t ? C.azulPetroleo + "10" : "#fff", cursor: "pointer", color: form.meetingType === t ? C.azulPetroleo : "#555" }}>
                  {t === "online" ? "💻 Online" : "📍 Presencial"}
                </button>
              ))}
            </div>
          </div>
          {form.meetingType === "online" && (
            <div style={{ gridColumn: "1/-1" }}>
              <label style={S.lbl}>Link da reuniao</label>
              <input style={S.input} placeholder="https://meet.google.com/..." value={form.meetingLink} onChange={e => setForm(f => ({ ...f, meetingLink: e.target.value }))} />
            </div>
          )}
          {form.meetingType === "presencial" && (
            <div style={{ gridColumn: "1/-1" }}>
              <label style={S.lbl}>Endereco</label>
              <input style={S.input} placeholder="Rua, numero, cidade..." value={form.meetingAddress} onChange={e => setForm(f => ({ ...f, meetingAddress: e.target.value }))} />
            </div>
          )}
          <div style={{ gridColumn: "1/-1" }}>
            <label style={S.lbl}>Observacoes</label>
            <textarea style={{ ...S.input, height: 60, resize: "none" }} value={form.meetingNotes} onChange={e => setForm(f => ({ ...f, meetingNotes: e.target.value }))} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.btnP} onClick={save}>Salvar reuniao</button>
          <button style={S.btnO} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function ContactDetailModal({ contact, onClose, onStageChange, onArchive, onConvert, onSaveMeeting }) {
  const stripState = c => (c||"").replace(/\s*[-\/,]\s*[A-Za-z]{2}$/, "").trim();
  const cfg = COMMERCIAL_CFG[contact.stage] || COMMERCIAL_CFG.comercial_prospecto;
  const [showMeeting, setShowMeeting] = useState(false);

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #f0f0f0" }}>
          <Avatar name={contact.name} size={46} city={stripState(contact.city)} />
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 2px" }}>{contact.name}</h3>
            <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{contact.specialty} · {stripState(contact.city)}</p>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18 }} onClick={onClose}>{I.x}</button>
        </div>

        <p style={{ fontSize: 11, color: "#888", margin: "0 0 8px", fontWeight: 700, textTransform: "uppercase" }}>Mover para etapa:</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
          {COMMERCIAL_STAGES.map(k => {
            const v = COMMERCIAL_CFG[k];
            const isCurrent = contact.stage === k;
            return (
              <button key={k} onClick={() => { onStageChange(contact.id, k); onClose(); }}
                style={{ background: isCurrent ? v.color + "20" : "#f7f7f5", color: isCurrent ? v.color : "#555", border: "1px solid " + (isCurrent ? v.color + "44" : "#e5e5e5"), borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: isCurrent ? 700 : 400, cursor: "pointer", textAlign: "left" }}>
                {isCurrent ? "● " : "○ "}{v.label}
              </button>
            );
          })}
        </div>

        {contact.stage === "comercial_reuniao" && (
          <div style={{ background: "#FFF7ED", borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: "1px solid #FED7AA" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>📅 Reuniao Agendada</span>
              <button onClick={() => setShowMeeting(true)} style={{ fontSize: 11, background: "#F97316", color: "#fff", border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>Editar</button>
            </div>
            {contact.meetingDate ? (
              <div style={{ fontSize: 12, color: "#555" }}>
                <div>📆 {new Date(contact.meetingDate + "T12:00").toLocaleDateString("pt-BR")} {contact.meetingTime ? "as " + contact.meetingTime : ""}</div>
                <div>{contact.meetingType === "online" ? "💻 Online" : "📍 Presencial"}</div>
                {contact.meetingLink && <div style={{ wordBreak: "break-all" }}>🔗 {contact.meetingLink}</div>}
                {contact.meetingAddress && <div>📍 {contact.meetingAddress}</div>}
                {contact.meetingNotes && <div>📝 {contact.meetingNotes}</div>}
              </div>
            ) : (
              <button onClick={() => setShowMeeting(true)} style={{ ...S.btnO, fontSize: 11, height: 28 }}>+ Adicionar detalhes</button>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <WppBtn phone={contact.phone || contact.personalContact} />
          {contact.email && <a href={"mailto:" + contact.email} style={{ ...S.btnSm(C.azulPetroleo), textDecoration: "none" }}>{I.mail} E-mail</a>}
          {contact.stage === "comercial_fechou" && (
            <button style={S.btnG} onClick={() => { onConvert(contact); onClose(); }}>Converter para Membro</button>
          )}
          <button style={S.btnD} onClick={() => { onArchive(contact.id); onClose(); }}>Sem Interesse</button>
        </div>

        {showMeeting && (
          <MeetingModal contact={contact} onClose={() => setShowMeeting(false)}
            onSave={data => { onSaveMeeting(contact.id, data); setShowMeeting(false); }} />
        )}
      </div>
    </div>
  );
}

function Comercial() {
  const { contacts, save, moveStage } = useContacts();
  const [cityFilter, setCityFilter] = useState("");
  const [specFilter, setSpecFilter] = useState("");
  const [dragging, setDragging] = useState(null);
  const [sel, setSel] = useState(null);

  const stripState = c => (c||"").replace(/\s*[-\/,]\s*[A-Za-z]{2}$/, "").trim();

  const commercialContacts = contacts.filter(c => COMMERCIAL_STAGES.includes(c.stage));
  const cities = [...new Set(commercialContacts.map(c => stripState(c.city)).filter(Boolean))].sort();
  const specs = [...new Set(commercialContacts.map(c => (c.specialty||"").trim()).filter(Boolean))].sort();

  const norm = s => (s||"").toLowerCase().trim();
  const applyFilters = list => list.filter(c => {
    if (cityFilter && norm(stripState(c.city)) !== norm(cityFilter)) return false;
    if (specFilter && norm(c.specialty) !== norm(specFilter)) return false;
    return true;
  });

  const cols = COMMERCIAL_STAGES.reduce((acc, stage) => {
    acc[stage] = applyFilters(commercialContacts.filter(c => c.stage === stage));
    return acc;
  }, {});

  function advanceStage(id, currentStage) {
    const idx = COMMERCIAL_STAGES.indexOf(currentStage);
    if (idx < COMMERCIAL_STAGES.length - 1) {
      const nextStage = COMMERCIAL_STAGES[idx + 1];
      moveStage(id, nextStage);
      if (sel?.id === id) setSel(prev => ({ ...prev, stage: nextStage }));
    }
  }

  function setStage(id, newStage) {
    moveStage(id, newStage);
    showToast("Movido para " + (COMMERCIAL_CFG[newStage]?.label || newStage));
  }

  function saveMeeting(id, data) {
    const updated = contacts.map(c => c.id === id ? { ...c, ...data } : c);
    save(updated);
    if (sel?.id === id) setSel(prev => ({ ...prev, ...data }));
    // Also save to meetings calendar
    const meetings = DB.get("meetings", []);
    const meetingId = "comercial_" + id;
    const existingIdx = meetings.findIndex(m => m.id === meetingId);
    const contact = contacts.find(c => c.id === id);
    const meetingEntry = {
      id: meetingId,
      title: "Reuniao - " + (contact?.name || ""),
      date: data.meetingDate,
      time: data.meetingTime,
      type: data.meetingType,
      link: data.meetingLink,
      address: data.meetingAddress,
      notes: data.meetingNotes,
      contactId: id,
      color: COMMERCIAL_CFG.comercial_reuniao.color,
    };
    if (existingIdx >= 0) meetings[existingIdx] = meetingEntry;
    else meetings.push(meetingEntry);
    DB.set("meetings", meetings);
    showToast("Reuniao salva no calendario!");
  }

  function sendToArchive(id) {
    moveStage(id, "comercial_sem_interesse");
    if (sel?.id === id) setSel(null);
    showToast("Movido para Arquivo");
  }

  function convertToMember(contact) {
    const members = DB.get("members", []);
    const newMember = {
      id: Date.now() + Math.random(),
      name: contact.name, profession: contact.profession || "Medico",
      specialty: contact.specialty, city: stripState(contact.city),
      state: contact.state, personalContact: contact.phone || contact.personalContact,
      schedulingContact: contact.schedulingContact, email: contact.email,
      instagram: contact.instagram, status: "active", monthlyFee: 297,
      joinedAt: new Date().toISOString(), isAnchor: false,
    };
    DB.set("members", [...members, newMember]);
    moveStage(contact.id, "membro");
    showToast("Convertido para Membro!");
  }

  const totalFechou = contacts.filter(c => c.stage === "comercial_fechou").length;
  const totalActive = commercialContacts.length;
  const conversao = totalActive > 0 ? Math.round((totalFechou / totalActive) * 100) : 0;

  return (
    <div>
      <div style={S.topbar}>
        <div>
          <h1 style={S.sectionTitle}>Pipeline Comercial</h1>
          <p style={S.sectionSub}>
            {totalActive} ativos ·{" "}
            <span style={{ color: "#10B981", fontWeight: 600 }}>{totalFechou} fechados</span> ·{" "}
            <span style={{ background: conversao >= 20 ? "#f0faf4" : "#fef9ec", color: conversao >= 20 ? "#0f6e56" : "#92400e", borderRadius: 99, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{conversao}% conversao</span>
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <select style={{ ...S.select, width: "auto", minWidth: 160, height: 34, fontSize: 12 }}
          value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
          <option value="">Todas as cidades</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select style={{ ...S.select, width: "auto", minWidth: 170, height: 34, fontSize: 12 }}
          value={specFilter} onChange={e => setSpecFilter(e.target.value)}>
          <option value="">Todas especialidades</option>
          {specs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(cityFilter || specFilter) && (
          <button style={{ ...S.btnO, fontSize: 11, height: 30 }} onClick={() => { setCityFilter(""); setSpecFilter(""); }}>x Limpar</button>
        )}
      </div>

      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 12, alignItems: "flex-start" }}>
        {COMMERCIAL_STAGES.map(stage => {
          const cfg = COMMERCIAL_CFG[stage];
          const stageIdx = COMMERCIAL_STAGES.indexOf(stage);
          return (
            <div key={stage}
              style={{ background: cfg.bg, borderRadius: 14, border: "1.5px solid " + cfg.border, minWidth: 300, flex: "0 0 300px", overflow: "hidden" }}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragging) { setStage(dragging, stage); setDragging(null); } }}>
              <div style={{ padding: "12px 14px 10px", borderBottom: "1.5px solid " + cfg.border, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.color }} />
                <span style={{ fontWeight: 800, fontSize: 13, color: cfg.color, flex: 1 }}>{cfg.label}</span>
                <span style={{ background: cfg.color, color: "#fff", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 800 }}>{cols[stage].length}</span>
              </div>
              <div style={{ padding: "8px 8px 10px", maxHeight: 520, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {cols[stage].map(item => {
                  const cityColor = getCityColor(stripState(item.city));
                  const nextStage = COMMERCIAL_STAGES[stageIdx + 1];
                  const nextCfg = nextStage ? COMMERCIAL_CFG[nextStage] : null;
                  const hasMeeting = item.meetingDate;
                  return (
                    <div key={item.id}
                      draggable onDragStart={() => setDragging(item.id)} onDragEnd={() => setDragging(null)}
                      onClick={() => setSel(item)}
                      style={{ background: "#fff", borderRadius: 10, border: "1px solid " + cityColor + "25", borderLeft: "3px solid " + cityColor, padding: "10px 12px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <span style={{ fontSize: 11, background: cityColor + "15", color: cityColor, borderRadius: 99, padding: "3px 9px", fontWeight: 700, display: "inline-block", marginBottom: 8 }}>
                        📍 {stripState(item.city)}
                      </span>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                        <Avatar name={item.name} size={36} city={stripState(item.city)} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                          <p style={{ fontSize: 12, color: "#666", margin: 0 }}>{item.specialty}</p>
                        </div>
                      </div>
                      {stage === "comercial_reuniao" && hasMeeting && (
                        <div style={{ fontSize: 10, background: "#FFF7ED", color: "#92400e", borderRadius: 6, padding: "3px 7px", marginBottom: 5, fontWeight: 600 }}>
                          📅 {new Date(item.meetingDate + "T12:00").toLocaleDateString("pt-BR")} {item.meetingTime ? "as " + item.meetingTime : ""}
                          {item.meetingType === "online" ? " · 💻 Online" : " · 📍 Presencial"}
                        </div>
                      )}
                      {stage === "comercial_reuniao" && !hasMeeting && (
                        <div style={{ fontSize: 10, background: "#fff9ec", color: "#92400e", borderRadius: 6, padding: "3px 7px", marginBottom: 5 }}>
                          ⚠ Clique para agendar detalhes
                        </div>
                      )}
                      {nextCfg && (
                        <button onClick={e => { e.stopPropagation(); advanceStage(item.id, stage); }}
                          style={{ width: "100%", background: nextCfg.color + "15", color: nextCfg.color, border: "1px solid " + nextCfg.color + "30", borderRadius: 6, padding: "7px 0", fontSize: 11, fontWeight: 700, cursor: "pointer", marginBottom: 5 }}>
                          → {nextCfg.label}
                        </button>
                      )}
                      {stage === "comercial_fechou" && (
                        <button onClick={e => { e.stopPropagation(); convertToMember(item); }}
                          style={{ width: "100%", background: "#f0faf4", color: "#0f6e56", border: "1px solid #a7f0d8", borderRadius: 6, padding: "5px 0", fontSize: 10, fontWeight: 700, cursor: "pointer", marginBottom: 4 }}>
                          Converter para Membro
                        </button>
                      )}
                      <div onClick={e => e.stopPropagation()}>
                        <WppBtn phone={item.phone || item.personalContact} />
                      </div>
                      <button onClick={e => { e.stopPropagation(); sendToArchive(item.id); }}
                        style={{ width: "100%", background: "#f7f7f5", color: "#888", border: "1px solid #e5e5e5", borderRadius: 6, padding: "4px 0", fontSize: 10, cursor: "pointer", marginTop: 4 }}>
                        Sem Interesse
                      </button>
                    </div>
                  );
                })}
                {cols[stage].length === 0 && <div style={{ textAlign: "center", padding: "20px 0", color: "#bbb", fontSize: 11 }}>Vazio</div>}
              </div>
            </div>
          );
        })}
      </div>

      {sel && (
        <ContactDetailModal
          contact={sel}
          onClose={() => setSel(null)}
          onStageChange={(id, stage) => { setStage(id, stage); setSel(prev => ({ ...prev, stage })); }}
          onArchive={sendToArchive}
          onConvert={convertToMember}
          onSaveMeeting={(id, data) => { saveMeeting(id, data); setSel(prev => ({ ...prev, ...data })); }}
        />
      )}
    </div>
  );
}



// ─── MEMBROS ──────────────────────────────────────────────────────────────────
function Members() {
  const [members, setMembers] = useState(() => DB.get("members", []));
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterSpec, setFilterSpec] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    name: "", profession: "Medico", specialty: "", subspecialty: "",
    councilNumber: "", rqe: "", personalContact: "", email: "",
    cpf: "", schedulingContact: "", address: "", city: "", state: "",
    clinic: "", instagram: "", monthlyFee: "", status: "active",
    isAnchor: false, notes: "",
  });

  const save = m => { setMembers(m); DB.set("members", m); };

  const activeMembers = members.filter(m => m.status === "active");
  const cities = [...new Set(members.map(m => (m.city||"").trim()).filter(Boolean))].sort();
  const specs = [...new Set(members.map(m => (m.specialty||"").trim()).filter(Boolean))].sort();

  const normalize = s => (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();

  const filtered = members.filter(m => {
    if (filterCity && normalize(m.city) !== normalize(filterCity)) return false;
    if (filterSpec && normalize(m.specialty) !== normalize(filterSpec)) return false;
    if (search && !normalize(m.name).includes(normalize(search))) return false;
    return true;
  });

  function openAdd() {
    setForm({ name: "", profession: "Medico", specialty: "", subspecialty: "", councilNumber: "", rqe: "", personalContact: "", email: "", cpf: "", schedulingContact: "", address: "", city: "", state: "", clinic: "", instagram: "", monthlyFee: "", status: "active", isAnchor: false, notes: "" });
    setEditItem(null);
    setShowAdd(true);
  }

  function openEdit(m) {
    setForm({ ...m });
    setEditItem(m.id);
    setShowAdd(true);
  }

  function saveMember() {
    if (!form.name.trim()) return alert("Nome e obrigatorio");
    if (editItem) {
      save(members.map(m => m.id === editItem ? { ...form, id: editItem } : m));
      showToast("Membro atualizado!");
    } else {
      save([...members, { ...form, id: Date.now() + Math.random(), joinedAt: new Date().toISOString() }]);
      showToast("Membro adicionado!");
    }
    setShowAdd(false);
  }

  function deleteMember(id) {
    if (!confirm("Remover este membro?")) return;
    save(members.filter(m => m.id !== id));
    showToast("Membro removido");
  }

  function exportCSV() {
    const cols = ["name","profession","specialty","subspecialty","councilNumber","rqe","personalContact","email","cpf","schedulingContact","address","city","state","clinic","instagram","monthlyFee","status","notes"];
    const headers = ["Nome","Profissao","Especialidade","Subespecialidade","CRM/Conselho","RQE","Contato Pessoal","Email","CPF/CNPJ","Contato Agendamento","Endereco","Cidade","Estado","Local Atendimento","Instagram","Mensalidade","Status","Observacoes"];
    const rows = filtered.map(m => cols.map(c => String(m[c] || "").replace(/;/g, ",")).join(";"));
    const csv = [headers.join(";"), ...rows].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "membros_partic.csv"; a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exportado!");
  }

  const COLS = [
    { key: "name",              label: "Nome",              width: 200 },
    { key: "profession",        label: "Profissao",         width: 100 },
    { key: "specialty",         label: "Especialidade",     width: 200 },
    { key: "councilNumber",     label: "CRM/Conselho",      width: 110 },
    { key: "rqe",               label: "RQE",               width: 80  },
    { key: "personalContact",   label: "Tel. Pessoal",      width: 150 },
    { key: "email",             label: "E-mail",            width: 200 },
    { key: "cpf",               label: "CPF/CNPJ",          width: 130 },
    { key: "schedulingContact", label: "Tel. Agendamento",  width: 150 },
    { key: "city",              label: "Cidade",            width: 150 },
    { key: "clinic",            label: "Local Atendimento", width: 180 },
    { key: "address",           label: "Endereco",          width: 200 },
    { key: "instagram",         label: "Instagram",         width: 130 },
    { key: "monthlyFee",        label: "Mensalidade",       width: 100 },
    { key: "status",            label: "Status",            width: 90  },
    { key: "actions",           label: "Acoes",             width: 120 },
  ];

  return (
    <div>
      <div style={S.topbar}>
        <div>
          <h1 style={S.sectionTitle}>Membros</h1>
          <p style={S.sectionSub}>
            <span style={{ color: C.azulPetroleo, fontWeight: 600 }}>{activeMembers.length} ativos</span>
            {members.length !== activeMembers.length && <span style={{ color: "#aaa", marginLeft: 8 }}>· {members.length} total</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.btnO} onClick={exportCSV}>📥 Exportar CSV</button>
          <button style={S.btnP} onClick={openAdd}>{I.plus} Novo membro</button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#aaa" }}>{I.search}</span>
          <input style={{ ...S.input, paddingLeft: 28, height: 34, fontSize: 13, width: 220 }}
            placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={{ ...S.select, height: 34, fontSize: 13, minWidth: 180 }}
          value={filterCity} onChange={e => setFilterCity(e.target.value)}>
          <option value="">Todas as cidades</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select style={{ ...S.select, height: 34, fontSize: 13, minWidth: 180 }}
          value={filterSpec} onChange={e => setFilterSpec(e.target.value)}>
          <option value="">Todas especialidades</option>
          {specs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || filterCity || filterSpec) && (
          <button style={{ ...S.btnO, height: 30, fontSize: 11 }} onClick={() => { setSearch(""); setFilterCity(""); setFilterSpec(""); }}>x Limpar</button>
        )}
        <span style={{ fontSize: 12, color: "#aaa", marginLeft: "auto" }}>{filtered.length} membros</span>
      </div>

      {/* Table with horizontal scroll */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "max-content", minWidth: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.noite, position: "sticky", top: 0 }}>
                {COLS.map(col => (
                  <th key={col.key} style={{ ...S.th, width: col.width, minWidth: col.width, color: "#fff", background: C.noite, whiteSpace: "nowrap", padding: "12px 14px" }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, idx) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #f0f0f0", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ ...S.td, width: 200, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar name={m.name} size={32} city={m.city} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{m.name}</div>
                        {m.isAnchor && <span style={{ fontSize: 10, background: C.azulPetroleo + "20", color: C.azulPetroleo, borderRadius: 99, padding: "1px 6px", fontWeight: 700 }}>Ancora</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ ...S.td, width: 100, minWidth: 100 }}><span style={{ fontSize: 12, whiteSpace: "nowrap" }}>{m.profession || "Medico"}</span></td>
                  <td style={{ ...S.td, width: 200, minWidth: 200 }}>
                    <div style={{ fontSize: 13 }}>{m.specialty || "-"}</div>
                    {m.subspecialty && <div style={{ fontSize: 11, color: "#EF4444" }}>{m.subspecialty}</div>}
                  </td>
                  <td style={{ ...S.td, width: 110, minWidth: 110 }}><span style={{ fontSize: 12, whiteSpace: "nowrap" }}>{m.councilNumber || "-"}</span></td>
                  <td style={{ ...S.td, width: 80, minWidth: 80 }}><span style={{ fontSize: 12 }}>{m.rqe || "-"}</span></td>
                  <td style={{ ...S.td, width: 150, minWidth: 150 }}>
                    {m.personalContact
                      ? <WppBtn phone={m.personalContact} size="xs" showNumber={true} />
                      : <span style={{ fontSize: 12, color: "#ccc" }}>-</span>}
                  </td>
                  <td style={{ ...S.td, width: 200, minWidth: 200 }}>
                    {m.email
                      ? <a href={"mailto:" + m.email} style={{ fontSize: 12, color: C.azulPetroleo, whiteSpace: "nowrap" }}>{m.email}</a>
                      : <span style={{ fontSize: 12, color: "#ccc" }}>-</span>}
                  </td>
                  <td style={{ ...S.td, width: 130, minWidth: 130 }}><span style={{ fontSize: 12, whiteSpace: "nowrap" }}>{m.cpf || "-"}</span></td>
                  <td style={{ ...S.td, width: 150, minWidth: 150 }}>
                    {m.schedulingContact
                      ? <WppBtn phone={m.schedulingContact} size="xs" showNumber={true} />
                      : <span style={{ fontSize: 12, color: "#ccc" }}>-</span>}
                  </td>
                  <td style={{ ...S.td, width: 150, minWidth: 150 }}><span style={{ fontSize: 12, whiteSpace: "nowrap" }}>{m.city || "-"}{m.state ? " - " + m.state : ""}</span></td>
                  <td style={{ ...S.td, width: 180, minWidth: 180 }}><span style={{ fontSize: 12, whiteSpace: "nowrap" }}>{m.clinic || "-"}</span></td>
                  <td style={{ ...S.td, width: 200, minWidth: 200 }}><span style={{ fontSize: 12 }}>{m.address || "-"}</span></td>
                  <td style={{ ...S.td, width: 130, minWidth: 130 }}>
                    {m.instagram
                      ? <a href={"https://instagram.com/" + (m.instagram||"").replace("@","")} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#833ab4", whiteSpace: "nowrap" }}>@{(m.instagram||"").replace("@","")}</a>
                      : <span style={{ fontSize: 12, color: "#ccc" }}>-</span>}
                  </td>
                  <td style={{ ...S.td, width: 100, minWidth: 100 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.verdeEscuro }}>
                      {m.monthlyFee ? "R$ " + Number(m.monthlyFee).toLocaleString("pt-BR") : "-"}
                    </span>
                  </td>
                  <td style={{ ...S.td, width: 90, minWidth: 90 }}>
                    <span style={{ fontSize: 11, background: m.status === "active" ? "#f0faf4" : "#f7f7f5", color: m.status === "active" ? "#0f6e56" : "#888", borderRadius: 99, padding: "3px 8px", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {m.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td style={{ ...S.td, width: 120, minWidth: 120 }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => openEdit(m)}
                        style={{ fontSize: 11, background: C.azulPetroleo + "15", color: C.azulPetroleo, border: "1px solid " + C.azulPetroleo + "30", borderRadius: 6, padding: "4px 8px", cursor: "pointer", whiteSpace: "nowrap" }}>
                        Editar
                      </button>
                      <button onClick={() => deleteMember(m.id)}
                        style={{ fontSize: 11, background: "#fff0f0", color: "#a32d2d", border: "1px solid #fca5a5", borderRadius: 6, padding: "4px 7px", cursor: "pointer" }}>
                        {I.trash}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={COLS.length} style={{ padding: "48px", textAlign: "center", color: "#aaa", fontSize: 13 }}>
                    {members.length === 0 ? "Nenhum membro cadastrado. Use Importacao ou adicione manualmente." : "Nenhum membro corresponde aos filtros."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal add/edit */}
      {showAdd && (
        <div style={S.modal} onClick={() => setShowAdd(false)}>
          <div style={{ ...S.modalBox, maxWidth: 640, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 18px" }}>{editItem ? "Editar Membro" : "Novo Membro"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div style={{ gridColumn: "1/-1" }}><label style={S.lbl}>Nome *</label><input style={S.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><label style={S.lbl}>Profissao</label>
                <select style={S.select} value={form.profession} onChange={e => setForm(f => ({ ...f, profession: e.target.value }))}>
                  {["Medico","Dentista","Psicologo","Fisioterapeuta","Nutricionista","Enfermeiro","Outro"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div><label style={S.lbl}>Especialidade</label><input style={S.input} value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} /></div>
              <div><label style={S.lbl}>Subespecialidade</label><input style={S.input} value={form.subspecialty} onChange={e => setForm(f => ({ ...f, subspecialty: e.target.value }))} /></div>
              <div><label style={S.lbl}>CRM/Conselho</label><input style={S.input} value={form.councilNumber} onChange={e => setForm(f => ({ ...f, councilNumber: e.target.value }))} /></div>
              <div><label style={S.lbl}>RQE</label><input style={S.input} value={form.rqe} onChange={e => setForm(f => ({ ...f, rqe: e.target.value }))} /></div>
              <div><label style={S.lbl}>Contato Pessoal (WppBtn)</label><input style={S.input} value={form.personalContact} onChange={e => setForm(f => ({ ...f, personalContact: e.target.value }))} placeholder="(XX) 9XXXX-XXXX" /></div>
              <div><label style={S.lbl}>E-mail</label><input style={S.input} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><label style={S.lbl}>CPF/CNPJ</label><input style={S.input} value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} /></div>
              <div><label style={S.lbl}>Contato Agendamento</label><input style={S.input} value={form.schedulingContact} onChange={e => setForm(f => ({ ...f, schedulingContact: e.target.value }))} placeholder="(XX) 9XXXX-XXXX" /></div>
              <div><label style={S.lbl}>Cidade</label><input style={S.input} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
              <div><label style={S.lbl}>Estado (UF)</label><input style={S.input} value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} maxLength={2} placeholder="SP" /></div>
              <div style={{ gridColumn: "1/-1" }}><label style={S.lbl}>Local de Atendimento</label><input style={S.input} value={form.clinic} onChange={e => setForm(f => ({ ...f, clinic: e.target.value }))} placeholder="Nome da clinica ou consultorio particular" /></div>
              <div style={{ gridColumn: "1/-1" }}><label style={S.lbl}>Endereco Completo</label><input style={S.input} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div><label style={S.lbl}>Instagram</label><input style={S.input} value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} placeholder="@usuario" /></div>
              <div><label style={S.lbl}>Mensalidade (R$)</label><input style={S.input} type="number" value={form.monthlyFee} onChange={e => setForm(f => ({ ...f, monthlyFee: e.target.value }))} /></div>
              <div><label style={S.lbl}>Status</label>
                <select style={S.select} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 20 }}>
                <input type="checkbox" id="isAnchor" checked={form.isAnchor || false} onChange={e => setForm(f => ({ ...f, isAnchor: e.target.checked }))} />
                <label htmlFor="isAnchor" style={{ fontSize: 13, cursor: "pointer" }}>Ancora PARTIC</label>
              </div>
              <div style={{ gridColumn: "1/-1" }}><label style={S.lbl}>Observacoes</label><textarea style={{ ...S.input, height: 70, resize: "none" }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btnP} onClick={saveMember}>{editItem ? "Atualizar" : "Salvar"}</button>
              <button style={S.btnO} onClick={() => setShowAdd(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function Anchors() {
  const members = DB.get("members", []).filter(m => m.isAnchor);
  // Dr. Leon Macedo always first (CEO/Âncora)
  const leon = members.find(m => m.name && m.name.toLowerCase().includes("leon"));
  const others = members.filter(m => !m.name || !m.name.toLowerCase().includes("leon"));
  const sorted = leon ? [leon, ...others] : others;

  const AnchorCard = ({ m, featured }) => (
    <div style={{ ...S.card,
      borderLeft: "3px solid " + getCityColor(m.city),
      background: featured ? "linear-gradient(135deg," + C.noite + "08," + C.azulPetroleo + "08)" : "#fff",
      border: featured ? "2px solid " + C.azulPetroleo : "1px solid #e5e5e5",
      position: "relative",
    }}>
      {featured && (
        <div style={{ position: "absolute", top: -10, left: 16, background: C.azulPetroleo, color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 99, padding: "2px 10px", letterSpacing: 1 }}>
          ⚓ CEO PARTIC
        </div>
      )}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12, marginTop: featured ? 8 : 0 }}>
        <Avatar name={m.name} size={featured ? 56 : 48} city={m.city} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: featured ? 16 : 14, fontWeight: 800, margin: "0 0 2px" }}>{m.name}</p>
          <p style={{ fontSize: 12, color: "#666", margin: "0 0 3px" }}>{m.specialty}{m.subspecialty && <span style={{ color: "#EF4444" }}> · {m.subspecialty}</span>}</p>
          <span style={{ fontSize: 11, background: getCityColor(m.city) + "20", color: getCityColor(m.city), borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>⚓ {m.city}{m.state ? " - " + m.state : ""}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {m.personalContact && <WppBtn phone={m.personalContact} showNumber={true} />}
        {m.email && <a href={"mailto:" + m.email} style={{ ...S.btnSm(C.azulPetroleo), textDecoration: "none" }}>{I.mail} E-mail</a>}
      </div>
    </div>
  );

  return (
    <div>
      <div style={S.topbar}>
        <div>
          <h1 style={S.sectionTitle}>Membros Âncoras</h1>
          <p style={S.sectionSub}>{members.length} âncoras confirmados</p>
        </div>
      </div>

      {leon && (
        <div style={{ marginBottom: 20 }}>
          <AnchorCard m={leon} featured={true} />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
        {others.map(m => (
          <AnchorCard key={m.id} m={m} featured={false} />
        ))}
        {others.length === 0 && !leon && (
          <div style={{ gridColumn: "1/-1", ...S.card, textAlign: "center", padding: "48px 20px", color: "#aaa" }}>
            <p style={{ fontSize: 32, margin: "0 0 10px" }}>⚓</p>
            <p>Nenhum âncora cadastrado ainda. Marque membros como âncora na tela de Membros.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PIPELINE MEMBROS ─────────────────────────────────────────────────────────
function MemberPipeline() {
  const [pipelines, setPipelines] = useState(DB.get("member_pipelines", []));
  const [selPipeline, setSelPipeline] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [dragging, setDragging] = useState(null);
  const save = d => { setPipelines(d); DB.set("member_pipelines", d); };

  const allMembers = DB.get("members", []).filter(m => m.status === "active");

  function createPipeline() {
    if (!newName.trim()) return alert("Nome é obrigatório");
    const np = { id: Date.now(), name: newName, createdAt: new Date().toISOString(), items: [] };
    const updated = [...pipelines, np];
    save(updated); setSelPipeline(np); setShowCreate(false); setNewName("");
    showToast(`Funil "${newName}" criado ✓`);
  }

  function addMemberToPipeline(member) {
    if (!selPipeline) return;
    const already = selPipeline.items.find(i => i.memberId === member.id);
    if (already) return showToast("Membro já está neste funil", "info");
    const item = { id: Date.now(), memberId: member.id, name: member.name, specialty: member.specialty, city: member.city, phone: member.personalContact, email: member.email, stage: "a_fazer", addedAt: new Date().toISOString(), notes: "" };
    const updated = pipelines.map(p => p.id === selPipeline.id ? { ...p, items: [...p.items, item] } : p);
    save(updated); setSelPipeline(updated.find(p => p.id === selPipeline.id));
    setShowAddMember(false); showToast(`${member.name} adicionado ao funil ✓`);
  }

  function moveItem(itemId, stage) {
    const updated = pipelines.map(p => p.id === selPipeline.id ? { ...p, items: p.items.map(i => i.id === itemId ? { ...i, stage } : i) } : p);
    save(updated); setSelPipeline(updated.find(p => p.id === selPipeline.id));
  }

  function deletePipeline(id) {
    if (!confirm("Remover funil?")) return;
    const updated = pipelines.filter(p => p.id !== id);
    save(updated); if (selPipeline?.id === id) setSelPipeline(null);
    showToast("Funil removido", "info");
  }

  if (!selPipeline) return (
    <div>
      <div style={S.topbar}>
        <div>
          <h1 style={S.sectionTitle}>Pipeline de Membros</h1>
          <p style={S.sectionSub}>Funis de ações com membros ativos · {pipelines.length} funis criados</p>
        </div>
        <button style={S.btnP} onClick={() => setShowCreate(true)}>{I.plus} Criar funil</button>
      </div>
      {pipelines.length === 0 ? (
        <div style={{ ...S.card, textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: 36, margin: "0 0 12px" }}>🎯</p>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.azulPetroleo, margin: "0 0 8px" }}>Crie seu primeiro funil</h3>
          <p style={{ fontSize: 13, color: "#888", margin: "0 0 20px" }}>Exemplos: Entrega de Display, Aniversários, Visitas, Kit de Boas-Vindas</p>
          <button style={S.btnP} onClick={() => setShowCreate(true)}>{I.plus} Criar funil</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
          {pipelines.map(p => {
            const done = p.items.filter(i => i.stage === "concluido").length;
            const pct = p.items.length > 0 ? Math.round((done / p.items.length) * 100) : 0;
            return (
              <div key={p.id} style={{ ...S.card, cursor: "pointer" }} onClick={() => setSelPipeline(p)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 3px" }}>{p.name}</h3>
                    <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{p.items.length} membros · criado {new Date(p.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <button style={{ ...S.btnD, padding: "0 8px", height: 26 }} onClick={e => { e.stopPropagation(); deletePipeline(p.id); }}>{I.trash}</button>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: "#888" }}>Progresso</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.verdeMedio }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, background: "#f0f0f0", borderRadius: 99 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: C.verdeMedio, borderRadius: 99 }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {PIPELINE_STAGES.map(st => (
                    <div key={st.id} style={{ flex: 1, background: st.color + "15", borderRadius: 6, padding: "4px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: st.color }}>{p.items.filter(i => i.stage === st.id).length}</div>
                      <div style={{ fontSize: 9, color: st.color }}>{st.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showCreate && (
        <div style={S.modal} onClick={() => setShowCreate(false)}>
          <div style={{ ...S.modalBox, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 8px" }}>Criar Funil</h3>
            <p style={{ fontSize: 12, color: "#888", margin: "0 0 16px" }}>Exemplos: Entrega de Display, Kit Aniversário, Visita ao Consultório</p>
            <label style={S.lbl}>Nome do funil *</label>
            <input style={{ ...S.input, marginBottom: 14 }} value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Entrega Display PARTIC" autoFocus />
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btnP} onClick={createPipeline}>Criar funil</button>
              <button style={S.btnO} onClick={() => setShowCreate(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Vista do funil selecionado
  const pItems = selPipeline.items || [];
  const cols = PIPELINE_STAGES.reduce((acc, s) => { acc[s.id] = pItems.filter(i => i.stage === s.id); return acc; }, {});

  return (
    <div>
      <div style={S.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ ...S.btnO, padding: "0 10px" }} onClick={() => setSelPipeline(null)}>← Voltar</button>
          <div>
            <h1 style={S.sectionTitle}>{selPipeline.name}</h1>
            <p style={S.sectionSub}>{pItems.length} membros neste funil</p>
          </div>
        </div>
        <button style={S.btnP} onClick={() => setShowAddMember(true)}>{I.plus} Adicionar membro</button>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
        {PIPELINE_STAGES.map(stage => (
          <div key={stage.id} style={{ ...S.kanbanCol, borderTop: `3px solid ${stage.color}` }}
            onDragOver={e => e.preventDefault()}
            onDrop={() => { if (dragging) { moveItem(dragging, stage.id); setDragging(null); } }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color }} />
              <span style={{ fontWeight: 700, fontSize: 12 }}>{stage.label}</span>
              <span style={{ marginLeft: "auto", background: stage.color + "20", color: stage.color, borderRadius: 99, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{cols[stage.id].length}</span>
            </div>
            {cols[stage.id].map(item => (
              <div key={item.id} style={S.kanbanCard} draggable onDragStart={() => setDragging(item.id)} onDragEnd={() => setDragging(null)}>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <Avatar name={item.name} size={28} city={item.city} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{item.specialty} · {item.city}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  {item.phone && <a href={`https://wa.me/55${item.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{ ...S.btnSm("#128C7E"), textDecoration: "none" }}>{I.wpp}</a>}
                  {item.email && <a href={`mailto:${item.email}`} style={{ ...S.btnSm(C.azulPetroleo), textDecoration: "none" }}>{I.mail}</a>}
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 7 }}>
                  {PIPELINE_STAGES.filter(s => s.id !== stage.id).map(s => (
                    <button key={s.id} onClick={() => moveItem(item.id, s.id)}
                      style={{ flex: 1, background: s.color + "15", color: s.color, border: `1px solid ${s.color}30`, borderRadius: 5, padding: "3px 0", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
                      → {s.label.replace(" ✓", "")}
                    </button>
                  ))}
                  <button onClick={() => { if (confirm("Remover do funil?")) { const upd = pipelines.map(p => p.id === selPipeline.id ? { ...p, items: p.items.filter(i => i.id !== item.id) } : p); save(upd); setSelPipeline(upd.find(p => p.id === selPipeline.id)); } }}
                    style={{ background: "#fff0f0", color: "#a32d2d", border: "1px solid #fca5a5", borderRadius: 5, padding: "3px 5px", fontSize: 10, cursor: "pointer" }}>{I.trash}</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {showAddMember && (
        <div style={S.modal} onClick={() => setShowAddMember(false)}>
          <div style={{ ...S.modalBox, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 14px" }}>Adicionar Membro ao Funil</h3>
            <div style={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {allMembers.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0", cursor: "pointer" }}
                  onClick={() => addMemberToPipeline(m)}>
                  <Avatar name={m.name} size={30} city={m.city} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{m.name}</p>
                    <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{m.specialty} · {m.city}</p>
                  </div>
                  <span style={{ fontSize: 11, color: C.verdeMedio }}>+ Adicionar</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      )}
    </div>
  );
}



// ─── MAPEAMENTO ───────────────────────────────────────────────────────────────
const VAGAS_CONFIG = {
  medicas: ["Cardiologia","Dermatologia","Endocrinologia","Gastroenterologia","Ginecologia","Neurologia","Oncologia","Ortopedia","Otorrinolaringologia","Pediatria","Pneumologia","Psiquiatria","Reumatologia","Urologia","Oftalmologia","Cirurgia Geral","Cirurgia Plastica","Infectologia","Nefrologia","Hematologia"],
  naoMedicas: ["Nutricao","Psicologia","Fisioterapia","Fonoaudiologia","Odontologia","Enfermagem"],
};

const CIDADES_MAP = [
  { n: "Ribeirao Preto", e: "SP", p: 720000 },
  { n: "Uberlandia", e: "MG", p: 706000 },
  { n: "Sao Jose do Rio Preto", e: "SP", p: 460000 },
  { n: "Bauru", e: "SP", p: 380000 },
  { n: "Uberaba", e: "MG", p: 340000 },
  { n: "Presidente Prudente", e: "SP", p: 230000 },
  { n: "Campinas", e: "SP", p: 1200000 },
  { n: "Sao Paulo", e: "SP", p: 12000000 },
  { n: "Belo Horizonte", e: "MG", p: 2500000 },
  { n: "Curitiba", e: "PR", p: 1900000 },
  { n: "Porto Alegre", e: "RS", p: 1400000 },
  { n: "Goiania", e: "GO", p: 1500000 },
  { n: "Florianopolis", e: "SC", p: 520000 },
  { n: "Brasilia", e: "DF", p: 3000000 },
  { n: "Franca", e: "SP", p: 350000 },
  { n: "Marilia", e: "SP", p: 230000 },
  { n: "Fortaleza", e: "CE", p: 2700000 },
  { n: "Recife", e: "PE", p: 1600000 },
  { n: "Salvador", e: "BA", p: 2900000 },
  { n: "Manaus", e: "AM", p: 2200000 },
];

function calcVagas2(p) {
  var f = Math.pow(p / 700000, 0.6);
  return { macro: Math.max(2, Math.round(6 * f)), nmed: Math.max(2, Math.round(8 * f)) };
}

function normCM(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s*[\/\-,]\s*[a-z]{2}$/i, "").trim(); }
function normSM(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim(); }

function Mapeamento({ onNav }) {
  var [selCity, setSelCity] = useState(null);
  var [search, setSearch] = useState("");
  var members = DB.get("members", []).filter(function(m) { return m.status === "active"; });

  var filtered = search ? CIDADES_MAP.filter(function(c) { return normCM(c.n).includes(normCM(search)); }) : CIDADES_MAP;

  function getCityCount(name) { return members.filter(function(m) { return normCM(m.city) === normCM(name); }).length; }

  var cityMems = selCity ? members.filter(function(m) { return normCM(m.city) === normCM(selCity.n); }) : [];
  var vg = selCity ? calcVagas2(selCity.p) : null;

  function getMUsed(esp) { return cityMems.filter(function(m) { return normSM(m.specialty) === normSM(esp); }).length; }

  function renderRow(esp, used, total, onVer) {
    var livre = Math.max(0, total - used);
    var isFull = livre === 0 && used > 0;
    var pct = Math.min(100, total > 0 ? (used / total) * 100 : 0);
    var rowMems = cityMems.filter(function(m) { return normSM(m.specialty) === normSM(esp); });
    return (
      <div key={esp} style={{ background: isFull ? "#f0fdf4" : "#fafafa", borderRadius: 7, padding: "8px 10px", border: "1px solid " + (isFull ? "#a7f3d0" : "#f0f0f0"), marginBottom: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{esp}</span>
            {livre > 0 && (
              <button onClick={onVer} style={{ fontSize: 10, background: C.azulPetroleo + "20", color: C.azulPetroleo, border: "1px solid " + C.azulPetroleo + "40", borderRadius: 99, padding: "2px 8px", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}>
                Ver Leads
              </button>
            )}
          </div>
          <span style={{ fontSize: 11, color: isFull ? "#0f6e56" : "#888", fontWeight: isFull ? 700 : 400 }}>
            {used}/{total} {isFull ? "Completo" : "(" + livre + " vaga" + (livre !== 1 ? "s" : "") + ")"}
          </span>
        </div>
        <div style={{ width: "100%", height: 4, background: "#f0f0f0", borderRadius: 99, marginBottom: rowMems.length > 0 ? 5 : 0 }}>
          <div style={{ height: "100%", background: isFull ? "#10B981" : C.azulPetroleo, borderRadius: 99, width: pct + "%" }} />
        </div>
        {rowMems.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {rowMems.map(function(m) { return (
              <span key={m.id} style={{ fontSize: 10, background: "#fff", border: "1px solid #e5e5e5", borderRadius: 99, padding: "2px 7px", color: "#555" }}>
                {m.name}
              </span>
            ); })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={S.topbar}>
        <div>
          <h1 style={S.sectionTitle}>Mapeamento de Vagas</h1>
          <p style={S.sectionSub}>Vagas por cidade baseado em membros ativos</p>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: 16, maxWidth: 320 }}>
        <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#aaa" }}>{I.search}</span>
        <input style={{ ...S.input, paddingLeft: 28, height: 34, fontSize: 13 }}
          placeholder="Buscar cidade..." value={search}
          onChange={function(e) { setSearch(e.target.value); }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selCity ? "1fr 1.6fr" : "repeat(auto-fill,minmax(220px,1fr))", gap: 14, alignItems: "start" }}>
        <div style={{ display: "grid", gridTemplateColumns: selCity ? "1fr" : "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
          {filtered.map(function(c) {
            var used = getCityCount(c.n);
            var cv = calcVagas2(c.p);
            var pct = Math.min(100, Math.round((used / Math.max(1, cv.macro * 2)) * 100));
            var isSel = selCity && selCity.n === c.n;
            return (
              <div key={c.n} onClick={function() { setSelCity(isSel ? null : c); }}
                style={{ ...S.card, cursor: "pointer", border: isSel ? "2px solid " + C.azulPetroleo : "1px solid #e5e5e5", background: isSel ? C.azulPetroleo + "08" : "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{c.n}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>{c.e} - {Math.round(c.p / 1000)}k hab</div>
                  </div>
                  <span style={{ fontSize: 12, background: used > 0 ? C.azulPetroleo + "15" : "#f7f7f5", color: used > 0 ? C.azulPetroleo : "#aaa", borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>
                    {used} membros
                  </span>
                </div>
                <div style={{ width: "100%", height: 5, background: "#f0f0f0", borderRadius: 99 }}>
                  <div style={{ height: "100%", background: pct >= 80 ? "#10B981" : C.azulPetroleo, borderRadius: 99, width: pct + "%" }} />
                </div>
                <div style={{ fontSize: 10, color: "#aaa", marginTop: 4 }}>{pct}% preenchido</div>
              </div>
            );
          })}
        </div>

        {selCity && vg && (
          <div>
            <div style={{ background: "linear-gradient(135deg," + C.noite + "," + C.azulPetroleo + ")", borderRadius: 12, padding: "16px 18px", color: "#fff", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{selCity.n} - {selCity.e}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{cityMems.length} membros ativos</div>
                </div>
                <button onClick={function() { setSelCity(null); }} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>
                  Fechar
                </button>
              </div>
            </div>

            <div style={{ ...S.card, marginBottom: 10 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px", color: C.azulPetroleo }}>Especialidades Medicas</h4>
              {VAGAS_CONFIG.medicas.map(function(esp) {
                var used = getMUsed(esp);
                return renderRow(esp, used, vg.macro, function() { onNav && onNav("leads", { city: selCity.n, spec: esp }); });
              })}
            </div>

            <div style={S.card}>
              <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px", color: C.verdeMedio }}>Especialidades Nao Medicas</h4>
              {VAGAS_CONFIG.naoMedicas.map(function(esp) {
                var used = getMUsed(esp);
                return renderRow(esp, used, vg.nmed, function() { onNav && onNav("leads", { city: selCity.n, spec: esp }); });
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── GERADOR DE LEADS IA ──────────────────────────────────────────────────────
const SUBESP_G = { "Cardiologia": ["Eletrofisiologia", "Cardiologia intervencionista", "Insuficiência cardíaca", "Cardiologia esportiva"], "Dermatologia": ["Dermatoscopia", "Tricologia", "Dermato-oncologia"], "Endocrinologia": ["Diabetes mellitus", "Tireoide", "Obesidade e metabolismo"], "Gastroenterologia": ["Endoscopia digestiva", "Hepatologia", "Doenças inflamatórias"], "Ginecologia e Obstetrícia": ["Medicina fetal", "Endometriose", "Reprodução assistida", "Mastologia"], "Neurologia": ["AVC", "Epilepsia", "Demências", "Parkinson", "Cefaleias"], "Oncologia": ["Onco-hematologia", "Imunoterapia", "Oncologia mamária"], "Ortopedia": ["Joelho", "Coluna vertebral", "Quadril", "Trauma"], "Psiquiatria": ["Transtornos do humor", "Ansiedade e TOC", "Dependência química"], "Urologia": ["Uro-oncologia", "Andrologia", "Litíase"], "Oftalmologia": ["Retina", "Córnea", "Glaucoma"], "Cirurgia Geral": ["Laparoscopia", "Cirurgia bariátrica", "Colorretal"], "Nutrição": ["Nutrição esportiva", "Nutrição clínica", "TCA"], "Psicologia": ["TCC", "Neuropsicologia", "ABA e TEA"], "Fisioterapia": ["Ortopédica", "Neurológica", "Pélvica"], "Fonoaudiologia": ["Disfagia", "Voz", "Linguagem infantil"] };
const CIDS_G = ["São Paulo - SP", "Rio de Janeiro - RJ", "Belo Horizonte - MG", "Campinas - SP", "Ribeirão Preto - SP", "Curitiba - PR", "Porto Alegre - RS", "Florianópolis - SC", "Salvador - BA", "Fortaleza - CE", "Recife - PE", "Brasília - DF", "Goiânia - GO", "Manaus - AM", "Uberlândia - MG", "Bauru - SP", "São José do Rio Preto - SP", "Uberaba - MG", "Presidente Prudente - SP", "Natal - RN", "João Pessoa - PB", "Aracaju - SE", "Campo Grande - MS", "Cuiabá - MT"];
const NAO_MED_G = new Set(["Nutrição", "Psicologia", "Fisioterapia", "Fonoaudiologia"]);

async function fetchBatch(form, idx, size) {
  const isMed = !NAO_MED_G.has(form.esp);
  const subPart = form.sub ? " — subespecialidade: " + form.sub : "";
  const medPart = isMed ? "Médico com RQE, formação USP/UNICAMP/UNIFESP/FAMERP/Einstein/Sírio ou equivalente, SEM práticas questionáveis." : "Excelente formação reconhecida, clínicas premium.";
  const acadPart = form.acad === "mestrado_doutorado" ? "Preferência mestrado/doutorado." : "";
  const tipoPart = form.tipo === "particular" ? " Preferência atendimento particular." : "";
  const prompt = "Especialista em mapeamento de profissionais de saúde para PARTIC. Gere " + size + " profissionais REAIS de " + form.esp + subPart + " em " + form.cidade + ". Lote " + (idx + 1) + ".\n" + medPart + "\n" + acadPart + tipoPart + "\nRetorne SOMENTE JSON: {\"p\":[{\"n\":\"Nome\",\"sub\":\"subesp\",\"f\":\"Instituição\",\"h\":\"Hospital\",\"at\":\"Particular\",\"ig\":\"@ig ou A verificar\",\"tel\":\"(XX) 9XXXX-XXXX ou A verificar\",\"email\":\"email ou A verificar\",\"d\":\"Diferenciais\",\"sc\":8,\"j\":\"Justificativa\"}]}";
  const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, messages: [{ role: "user", content: prompt }] }) });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  const raw = (d.content?.find(b => b.type === "text")?.text || "").replace(/```json|```/g, "").trim();
  let parsed; try { parsed = JSON.parse(raw); } catch { try { parsed = JSON.parse(raw + "]}"); } catch { throw new Error("Erro ao interpretar IA."); } }
  const [city, state] = (form.cidade || "").split(" - ");
  return (parsed.p || []).map(p => ({ id: `${Date.now()}-${Math.random()}`, nome: p.n || "", esp: form.esp, sub: p.sub || form.sub || "", cidade: city || "", estado: state || "", formacao: p.f || "", hospital: p.h || "", instagram: p.ig || "A verificar", telefone: p.tel || "A verificar", email: p.email || "A verificar", atendimento: p.at || "A verificar", diferenciais: p.d || "", score: Number(p.sc || 0), justificativa: p.j || "" }));
}

function LeadGenerator({ onNav }) {
  const [form, setForm] = useState({ cidade: "", esp: "", sub: "", acad: "qualquer", tipo: "particular", qtd: "10" });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [expandedId, setExpandedId] = useState(null);
  const subs = form.esp ? (SUBESP_G[form.esp] || []) : [];
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function generate() {
    if (!form.cidade) return alert("Selecione uma cidade");
    if (!form.esp) return alert("Selecione uma especialidade");
    setLoading(true); setLeads([]); setSelected(new Set());
    const total = parseInt(form.qtd); const n = Math.ceil(total / 5); let all = [];
    try {
      for (let i = 0; i < n; i++) {
        const size = Math.min(5, total - i * 5); setProgress(`Lote ${i + 1}/${n}…`);
        const batch = await fetchBatch(form, i, size); all = [...all, ...batch]; setLeads([...all]);
      }
      setSelected(new Set(all.filter(l => l.score >= 7).map(l => l.id)));
      showToast(`${all.length} leads gerados ✓`);
    } catch (e) { alert("Erro: " + e.message); }
    setProgress(""); setLoading(false);
  }

  function sendToLeads() {
    const toAdd = leads.filter(l => selected.has(l.id));
    if (!toAdd.length) return alert("Selecione ao menos um lead");
    const current = DB.get("contacts", []);
    const ids = new Set(current.map(l => String(l.id)));
    const newLeads = toAdd.filter(l => !ids.has(String(l.id))).map(l => ({ id: Date.now() + Math.random(), name: l.nome, profession: NAO_MED_G.has(l.esp) ? l.esp : "Médico", specialty: l.esp, subspecialty: l.sub, city: l.cidade, state: l.estado, formation: l.formacao, phone: l.telefone !== "A verificar" ? l.telefone : "", email: l.email !== "A verificar" ? l.email : "", instagram: l.instagram !== "A verificar" ? l.instagram : "", stage: "curadoria", source: "Gerador IA PARTIC", particScore: l.score, notes: l.diferenciais, sentToCuration: false, createdAt: new Date().toISOString() }));
    const newWithStage = newLeads.map(l => ({ ...l, stage: "lead" }));
    DB.set("contacts", [...current, ...newWithStage]);
    showToast(`${newWithStage.length} leads salvos ✓`);
    setSelected(new Set());
    onNav("leads");
  }

  return (
    <div>
      <div style={S.topbar}>
        <div><h1 style={S.sectionTitle}>✦ Gerador de Leads IA</h1><p style={S.sectionSub}>Score ≥ 7 pré-selecionados · enviados direto para Leads</p></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, alignItems: "start" }}>
        <div style={S.card}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", margin: "0 0 14px" }}>Configurar</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div><label style={S.lbl}>Cidade *</label><select style={S.select} value={form.cidade} onChange={e => setF("cidade", e.target.value)}><option value="">Selecionar...</option>{CIDS_G.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label style={S.lbl}>Especialidade *</label><select style={S.select} value={form.esp} onChange={e => { setF("esp", e.target.value); setF("sub", ""); }}><option value="">Selecionar...</option><optgroup label="Médicos">{Object.keys(SUBESP_G).filter(k => !NAO_MED_G.has(k)).map(e => <option key={e}>{e}</option>)}</optgroup><optgroup label="Não-médicos">{[...NAO_MED_G].map(e => <option key={e}>{e}</option>)}</optgroup></select></div>
            <div><label style={S.lbl}>Subespecialidade {form.esp && `(${subs.length})`}</label><select style={S.select} value={form.sub} onChange={e => setF("sub", e.target.value)} disabled={!form.esp}><option value="">Todas / Geral</option>{subs.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div><label style={S.lbl}>Foco</label><select style={S.select} value={form.acad} onChange={e => setF("acad", e.target.value)}><option value="qualquer">Qualquer</option><option value="mestrado_doutorado">Mestrado/Dr</option><option value="professor">Acadêmico</option></select></div>
              <div><label style={S.lbl}>Qtd</label><select style={S.select} value={form.qtd} onChange={e => setF("qtd", e.target.value)}><option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option></select></div>
            </div>
            <button style={{ ...S.btnP, justifyContent: "center", opacity: loading ? 0.6 : 1 }} onClick={generate} disabled={loading}>{loading ? `⏳ ${progress}` : "✦ Gerar leads com IA"}</button>
          </div>
        </div>
        <div>
          {leads.length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#888" }}>{leads.length} gerados · {selected.size} selecionados</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={S.btnO} onClick={() => setSelected(selected.size === leads.length ? new Set() : new Set(leads.map(l => l.id)))}>{selected.size === leads.length ? "Desmarcar" : "Todos"}</button>
                  {selected.size > 0 && <button style={S.btnG} onClick={sendToLeads}>＋ Salvar {selected.size} em Leads</button>}
                </div>
              </div>
              {leads.map(l => {
                const isSel = selected.has(l.id); const isExp = expandedId === l.id;
                const hasWpp = l.telefone && l.telefone !== "A verificar";
                const hasIG = l.instagram && l.instagram !== "A verificar";
                const hasEmail = l.email && l.email !== "A verificar";
                return (
                  <div key={l.id} style={{ border: isSel ? `1.5px solid ${C.verdeMedio}` : "1px solid #e5e5e5", borderRadius: 10, background: isSel ? "#f0fdfb" : "#fff", marginBottom: 8, overflow: "hidden" }}>
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <button onClick={() => setSelected(prev => { const n = new Set(prev); n.has(l.id) ? n.delete(l.id) : n.add(l.id); return n; })} style={{ marginTop: 2, width: 18, height: 18, borderRadius: 4, border: isSel ? `2px solid ${C.verdeMedio}` : "2px solid #ddd", background: isSel ? C.verdeMedio : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                          {isSel && <span style={{ color: "#fff", fontSize: 10, fontWeight: 900 }}>✓</span>}
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                              <span style={{ fontSize: 13, fontWeight: 700 }}>{l.nome}</span>
                              <span style={{ marginLeft: 6, background: C.azulPetroleo + "15", color: C.azulPetroleo, borderRadius: 99, padding: "1px 7px", fontSize: 10, fontWeight: 600 }}>{l.esp}</span>
                              {l.sub && <span style={{ fontSize: 10, color: "#aaa", marginLeft: 4 }}>· {l.sub}</span>}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: l.score >= 8 ? "#0f6e56" : "#ba7517", background: l.score >= 8 ? "#f0faf4" : "#fef9ec", borderRadius: 99, padding: "1px 8px" }}>{l.score}/10</span>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 12px", marginTop: 4, fontSize: 11, color: "#666" }}>
                            <span>📍 {l.cidade}{l.estado ? `, ${l.estado}` : ""}</span>
                            <span>🏥 {l.hospital || "A verificar"}</span>
                            <span>🎓 {l.formacao || "A verificar"}</span>
                            {hasWpp && <span>📱 {l.telefone}</span>}
                          </div>
                        </div>
                        <button onClick={() => setExpandedId(isExp ? null : l.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 12, flexShrink: 0 }}>{isExp ? "▲" : "▼"}</button>
                      </div>
                    </div>
                    {isExp && (
                      <div style={{ borderTop: "1px solid #f0f0f0", padding: "10px 12px 12px" }}>
                        {l.diferenciais && <p style={{ fontSize: 11, color: "#555", margin: "0 0 6px" }}>⭐ {l.diferenciais}</p>}
                        {l.justificativa && <p style={{ fontSize: 11, color: "#aaa", fontStyle: "italic", margin: "0 0 8px" }}>{l.justificativa}</p>}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          <a href={`https://www.google.com/search?q=${encodeURIComponent(l.nome + " " + l.esp + " " + l.cidade)}`} target="_blank" rel="noreferrer" style={{ ...S.btnSm(C.azulPetroleo), textDecoration: "none" }}>🔍 Google</a>
                          <a href={`https://www.google.com/maps/search/${encodeURIComponent((l.hospital || l.nome) + " " + l.cidade)}`} target="_blank" rel="noreferrer" style={{ ...S.btnSm(C.verdeEscuro), textDecoration: "none" }}>🗺️ Maps</a>
                          {hasIG && <a href={`https://instagram.com/${l.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" style={{ ...S.btnSm("#833ab4"), textDecoration: "none" }}>{I.ig}</a>}
                          {hasWpp && <a href={`https://wa.me/55${l.telefone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{ ...S.btnSm("#128C7E"), textDecoration: "none" }}>{I.wpp} WhatsApp</a>}
                          {hasEmail && <a href={`mailto:${l.email}`} style={{ ...S.btnSm(C.azulPetroleo), textDecoration: "none" }}>{I.mail} E-mail</a>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {leads.length === 0 && !loading && (
            <div style={{ ...S.card, textAlign: "center", padding: "48px 20px" }}>
              <p style={{ fontSize: 32, margin: "0 0 10px" }}>✦</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.azulPetroleo, margin: "0 0 6px" }}>Configure e gere seus leads</p>
              <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>Selecione cidade e especialidade no painel ao lado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ─── CALENDÁRIO ───────────────────────────────────────────────────────────────
const MEETING_TYPES = {
  comercial: { label: "Ação Comercial",     color: "#8B5CF6", bg: "#F5F3FF" },
  prospect:  { label: "Prospect",           color: "#3B82F6", bg: "#EFF6FF" },
  membro:    { label: "Reunião com Membro", color: "#10B981", bg: "#F0FDF4" },
  curadoria: { label: "Curadoria",          color: "#F59E0B", bg: "#FFFBEB" },
  outro:     { label: "Outro",              color: "#94A3B8", bg: "#F8FAFC" },
};

const MONTHS_PT2 = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DAYS_PT2 = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function Calendar() {
  const [meetings, setMeetings] = useState(() => DB.get("meetings", []));
  const [view, setView] = useState("month");
  const [now, setNow] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selMeeting, setSelMeeting] = useState(null);
  const [form, setForm] = useState({ title: "", date: "", time: "", type: "comercial", format: "online", link: "", address: "", notes: "", contactName: "" });

  const year = now.getFullYear();
  const month = now.getMonth();

  const saveMeetings = m => { setMeetings(m); DB.set("meetings", m); };

  function openAdd(dateStr) {
    setForm({ title: "", date: dateStr || "", time: "", type: "comercial", format: "online", link: "", address: "", notes: "", contactName: "" });
    setEditItem(null);
    setShowAdd(true);
  }

  function openEdit(m) {
    setForm({ ...m });
    setEditItem(m.id);
    setShowAdd(true);
  }

  function saveMeeting() {
    if (!form.title.trim()) return alert("Informe o título");
    if (!form.date) return alert("Informe a data");
    if (editItem) {
      saveMeetings(meetings.map(m => m.id === editItem ? { ...form, id: editItem } : m));
      showToast("Reunião atualizada!");
    } else {
      saveMeetings([...meetings, { ...form, id: Date.now() + Math.random(), createdAt: new Date().toISOString() }]);
      showToast("Reunião agendada!");
    }
    setShowAdd(false);
    setSelMeeting(null);
  }

  function deleteMeeting(id) {
    if (!confirm("Excluir esta reunião?")) return;
    saveMeetings(meetings.filter(m => m.id !== id));
    setSelMeeting(null);
    showToast("Reunião excluída");
  }

  function getMeetingsForDay(d) {
    return meetings.filter(m => {
      if (!m.date) return false;
      const md = new Date(m.date + "T12:00:00");
      return md.getFullYear() === year && md.getMonth() === month && md.getDate() === d;
    });
  }

  function getUpcoming() {
    const today = new Date(); today.setHours(0,0,0,0);
    return meetings
      .filter(m => m.date && new Date(m.date + "T12:00:00") >= today)
      .sort((a,b) => new Date(a.date + "T" + (a.time || "00:00")) - new Date(b.date + "T" + (b.time || "00:00")));
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  return (
    <div>
      <div style={S.topbar}>
        <div>
          <h1 style={S.sectionTitle}>Calendário</h1>
          <p style={S.sectionSub}>{meetings.length} reuniões cadastradas</p>
        </div>
        <button style={S.btnP} onClick={() => openAdd("")}>{I.plus} Nova reunião</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["month","list"].map(v => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding: "6px 16px", fontSize: 13, fontWeight: view === v ? 700 : 400, borderRadius: 8, border: view === v ? "2px solid " + C.azulPetroleo : "1px solid #e5e5e5", background: view === v ? C.azulPetroleo + "10" : "#fff", color: view === v ? C.azulPetroleo : "#555", cursor: "pointer" }}>
            {v === "month" ? "📅 Mensal" : "📋 Lista"}
          </button>
        ))}
      </div>

      {view === "month" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <button onClick={() => setNow(new Date(year, month - 1, 1))} style={{ ...S.btnO, padding: "5px 12px" }}>{"<"}</button>
            <span style={{ fontSize: 16, fontWeight: 700, minWidth: 180, textAlign: "center" }}>{MONTHS_PT2[month]} {year}</span>
            <button onClick={() => setNow(new Date(year, month + 1, 1))} style={{ ...S.btnO, padding: "5px 12px" }}>{">"}</button>
            <button onClick={() => setNow(new Date())} style={{ ...S.btnO, fontSize: 11, height: 30 }}>Hoje</button>
          </div>

          <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", background: C.noite }}>
              {DAYS_PT2.map(d => (
                <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={"empty-" + i} style={{ minHeight: 80, borderRight: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayMeetings = getMeetingsForDay(day);
                const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                return (
                  <div key={day} onClick={() => openAdd(year + "-" + String(month+1).padStart(2,"0") + "-" + String(day).padStart(2,"0"))}
                    style={{ minHeight: 80, borderRight: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", padding: 4, cursor: "pointer", background: isToday ? C.azulPetroleo + "05" : "#fff" }}>
                    <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 400, color: isToday ? C.azulPetroleo : "#333", width: 22, height: 22, borderRadius: "50%", background: isToday ? C.azulPetroleo : "transparent", color: isToday ? "#fff" : "#333", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 2 }}>{day}</div>
                    {dayMeetings.slice(0,2).map(m => {
                      const cfg = MEETING_TYPES[m.type] || MEETING_TYPES.outro;
                      return (
                        <div key={m.id} onClick={e => { e.stopPropagation(); setSelMeeting(m); }}
                          style={{ fontSize: 9, background: cfg.bg, color: cfg.color, borderRadius: 4, padding: "1px 4px", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600, cursor: "pointer" }}>
                          {m.time ? m.time + " " : ""}{m.title}
                        </div>
                      );
                    })}
                    {dayMeetings.length > 2 && <div style={{ fontSize: 9, color: "#aaa" }}>+{dayMeetings.length - 2} mais</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {view === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {getUpcoming().length === 0 && (
            <div style={{ ...S.card, textAlign: "center", padding: "48px 20px", color: "#aaa" }}>
              <p style={{ fontSize: 32, margin: "0 0 10px" }}>📅</p>
              <p>Nenhuma reunião próxima. Clique em Nova reunião para agendar.</p>
            </div>
          )}
          {getUpcoming().map(m => {
            const cfg = MEETING_TYPES[m.type] || MEETING_TYPES.outro;
            const d = new Date(m.date + "T12:00:00");
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <div key={m.id} style={{ ...S.card, borderLeft: "3px solid " + cfg.color, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{m.title}</span>
                      <span style={{ fontSize: 11, background: cfg.bg, color: cfg.color, borderRadius: 99, padding: "1px 8px", fontWeight: 600 }}>{cfg.label}</span>
                      {isToday && <span style={{ fontSize: 11, background: "#FEF3C7", color: "#92400E", borderRadius: 99, padding: "1px 8px", fontWeight: 700 }}>HOJE</span>}
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#666", flexWrap: "wrap" }}>
                      <span>📅 {d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}{m.time ? " às " + m.time : ""}</span>
                      <span>{m.format === "online" ? "💻 Online" : "📍 Presencial"}</span>
                      {m.contactName && <span>👤 {m.contactName}</span>}
                    </div>
                    {m.link && <a href={m.link} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: C.azulPetroleo, display: "block", marginTop: 4 }}>🔗 {m.link}</a>}
                    {m.address && <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>📍 {m.address}</div>}
                    {m.notes && <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>📝 {m.notes}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 12 }}>
                    <button onClick={() => openEdit(m)} style={{ fontSize: 11, background: C.azulPetroleo + "15", color: C.azulPetroleo, border: "1px solid " + C.azulPetroleo + "30", borderRadius: 6, padding: "5px 10px", cursor: "pointer" }}>Editar</button>
                    <button onClick={() => deleteMeeting(m.id)} style={{ fontSize: 11, background: "#fff0f0", color: "#a32d2d", border: "1px solid #fca5a5", borderRadius: 6, padding: "5px 8px", cursor: "pointer" }}>{I.trash}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selMeeting && (
        <div style={S.modal} onClick={() => setSelMeeting(null)}>
          <div style={{ ...S.modalBox, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            {(() => {
              const cfg = MEETING_TYPES[selMeeting.type] || MEETING_TYPES.outro;
              const d = new Date(selMeeting.date + "T12:00:00");
              return (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>{selMeeting.title}</h3>
                      <span style={{ fontSize: 12, background: cfg.bg, color: cfg.color, borderRadius: 99, padding: "2px 10px", fontWeight: 600 }}>{cfg.label}</span>
                    </div>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18 }} onClick={() => setSelMeeting(null)}>{I.x}</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, marginBottom: 16 }}>
                    <div>📅 {d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}{selMeeting.time ? " às " + selMeeting.time : ""}</div>
                    <div>{selMeeting.format === "online" ? "💻 Online" : "📍 Presencial"}</div>
                    {selMeeting.contactName && <div>👤 {selMeeting.contactName}</div>}
                    {selMeeting.link && <div>🔗 <a href={selMeeting.link} target="_blank" rel="noreferrer" style={{ color: C.azulPetroleo }}>{selMeeting.link}</a></div>}
                    {selMeeting.address && <div>📍 {selMeeting.address}</div>}
                    {selMeeting.notes && <div>📝 {selMeeting.notes}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={S.btnP} onClick={() => { openEdit(selMeeting); setSelMeeting(null); }}>Editar</button>
                    <button style={{ ...S.btnO, color: "#a32d2d", borderColor: "#fca5a5" }} onClick={() => deleteMeeting(selMeeting.id)}>Excluir</button>
                    <button style={S.btnO} onClick={() => setSelMeeting(null)}>Fechar</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {showAdd && (
        <div style={S.modal} onClick={() => setShowAdd(false)}>
          <div style={{ ...S.modalBox, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 18px" }}>{editItem ? "Editar Reunião" : "Nova Reunião"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <div><label style={S.lbl}>Título *</label><input style={S.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Reunião com Dr. João" /></div>
              <div><label style={S.lbl}>Profissional/Contato</label><input style={S.input} value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} placeholder="Nome do profissional" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={S.lbl}>Data *</label><input type="date" style={S.input} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div><label style={S.lbl}>Horário</label><input type="time" style={S.input} value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></div>
              </div>
              <div><label style={S.lbl}>Tipo</label>
                <select style={S.select} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {Object.entries(MEETING_TYPES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label style={S.lbl}>Formato</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["online","presencial"].map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, format: t }))}
                      style={{ flex: 1, padding: "8px", fontSize: 13, fontWeight: form.format === t ? 700 : 400, borderRadius: 8, border: form.format === t ? "2px solid " + C.azulPetroleo : "1px solid #ddd", background: form.format === t ? C.azulPetroleo + "10" : "#fff", cursor: "pointer", color: form.format === t ? C.azulPetroleo : "#555" }}>
                      {t === "online" ? "💻 Online" : "📍 Presencial"}
                    </button>
                  ))}
                </div>
              </div>
              {form.format === "online" && <div><label style={S.lbl}>Link</label><input style={S.input} value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://meet.google.com/..." /></div>}
              {form.format === "presencial" && <div><label style={S.lbl}>Endereço</label><input style={S.input} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>}
              <div><label style={S.lbl}>Observações</label><textarea style={{ ...S.input, height: 60, resize: "none" }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btnP} onClick={saveMeeting}>{editItem ? "Atualizar" : "Agendar"}</button>
              <button style={S.btnO} onClick={() => setShowAdd(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── MEMBROS ──────────────────────────────────────────────────────────────────

// ─── CALENDÁRIO ───────────────────────────────────────────────────────────────
// ─── ARQUIVO ──────────────────────────────────────────────────────────────────
function Arquivo() {
  const [tab, setTab] = useState("reprovados");
  const [search, setSearch] = useState("");

  const contacts = DB.get("contacts", []);
  const reprovados = contacts.filter(c => c.stage === "curadoria_reprovado");
  const semInteresse = contacts.filter(c => c.stage === "comercial_sem_interesse");

  const stripState = c => (c||"").replace(/[\s]*[-,][\s]*[A-Za-z]{2}$/, "").replace(/\/[A-Za-z]{2}$/, "").trim();

  const filteredRep = reprovados.filter(i => !search || (i.name||"").toLowerCase().includes(search.toLowerCase()) || stripState(i.city||"").toLowerCase().includes(search.toLowerCase()));
  const filteredSem = semInteresse.filter(i => !search || (i.name||"").toLowerCase().includes(search.toLowerCase()) || stripState(i.city||"").toLowerCase().includes(search.toLowerCase()));

  function returnToCuration(item) {
    const all = DB.get("contacts", []);
    DB.set("contacts", all.map(c => c.id === item.id ? { ...c, stage: "curadoria_avaliacao" } : c));
    showToast(item.name + " retornou para Curadoria ✓");
    setSearch(s => s); // force re-render
  }

  function deleteContact(item) {
    if (!confirm("Excluir " + item.name + " permanentemente?")) return;
    const all = DB.get("contacts", []);
    DB.set("contacts", all.filter(c => c.id !== item.id));
    showToast("Contato excluído");
    setSearch(s => s);
  }

  const TableRow = ({ item, type }) => (
    <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
      <td style={S.td}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={item.name} size={28} city={stripState(item.city)} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</div>
            <div style={{ fontSize: 10, color: "#aaa" }}>{item.profession || "Médico"}</div>
          </div>
        </div>
      </td>
      <td style={S.td}>
        <div style={{ fontSize: 12 }}>{item.specialty}</div>
        {item.subspecialty && <div style={{ fontSize: 10, color: "#EF4444", fontWeight: 600 }}>{item.subspecialty}</div>}
      </td>
      <td style={S.td}>
        <span style={{ fontSize: 11, background: getCityColor(stripState(item.city)) + "20", color: getCityColor(stripState(item.city)), borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>
          {stripState(item.city)}{item.state ? " - " + item.state : ""}
        </span>
      </td>
      <td style={S.td}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <WppBtn phone={item.phone || item.personalContact} size="xs" showNumber={true} />
          {item.email && <a href={"mailto:" + item.email} style={{ fontSize: 10, color: C.azulPetroleo }}>{I.mail} {item.email}</a>}
        </div>
      </td>
      <td style={S.td}>
        <span style={{ fontSize: 10, color: "#aaa" }}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("pt-BR") : "—"}</span>
      </td>
      <td style={S.td}>
        <span style={{ background: type === "reprovado" ? "#fff0f0" : "#f7f7f5", color: type === "reprovado" ? "#a32d2d" : "#888", borderRadius: 99, padding: "3px 9px", fontSize: 11, fontWeight: 600 }}>
          {type === "reprovado" ? "Reprovado" : "Sem Interesse"}
        </span>
      </td>
      <td style={S.td}>
        <div style={{ display: "flex", gap: 5 }}>
          <button onClick={() => returnToCuration(item)}
            style={{ fontSize: 10, background: "#f0faf4", color: "#0f6e56", border: "1px solid #a7f0d8", borderRadius: 6, padding: "3px 8px", cursor: "pointer", whiteSpace: "nowrap" }}>
            ↩ Curadoria
          </button>
          <button onClick={() => deleteContact(item)}
            style={{ fontSize: 10, background: "#fff0f0", color: "#a32d2d", border: "1px solid #fca5a5", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>
            {I.trash}
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <div style={S.topbar}>
        <div>
          <h1 style={S.sectionTitle}>Arquivo</h1>
          <p style={S.sectionSub}>Reprovados e sem interesse · não aparecem nos pipelines ativos</p>
        </div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#aaa" }}>{I.search}</span>
          <input style={{ ...S.input, paddingLeft: 28, width: 200 }} placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Reprovados Curadoria", value: reprovados.length, color: "#EF4444", icon: "❌" },
          { label: "Sem Interesse Comercial", value: semInteresse.length, color: "#94A3B8", icon: "🚫" },
          { label: "Total Arquivados", value: reprovados.length + semInteresse.length, color: "#F59E0B", icon: "📁" },
        ].map(s => (
          <div key={s.label} style={{ ...S.card, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderLeft: `3px solid ${s.color}` }}>
            <span style={{ fontSize: 26 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 2, marginBottom: 14, borderBottom: "1px solid #e5e5e5" }}>
        {[
          { id: "reprovados", label: `Reprovados Curadoria (${reprovados.length})`, color: "#EF4444" },
          { id: "sem_interesse", label: `Sem Interesse Comercial (${semInteresse.length})`, color: "#94A3B8" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "7px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", background: "none", border: "none", borderBottom: tab === t.id ? `2px solid ${t.color}` : "2px solid transparent", color: tab === t.id ? t.color : "#aaa", marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f7f7f5" }}>
              {["Profissional", "Especialidade", "Cidade", "Contato", "Data", "Status", "Ações"].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {tab === "reprovados" && filteredRep.map(item => <TableRow key={item.id} item={item} type="reprovado" />)}
            {tab === "sem_interesse" && filteredSem.map(item => <TableRow key={item.id} item={item} type="sem_interesse" />)}
            {((tab === "reprovados" && filteredRep.length === 0) || (tab === "sem_interesse" && filteredSem.length === 0)) && (
              <tr><td colSpan={6} style={{ padding: "40px 20px", textAlign: "center", color: "#aaa", fontSize: 13 }}>Nenhum registro aqui ainda</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}



// ─── IMPORTAÇÃO ───────────────────────────────────────────────────────────────
const FIELD_MAP = {
  name: ["nome do profissional","nome","name","nome completo","profissional"],
  specialty: ["especialidade","specialty","area","especialidade medica"],
  subspecialty: ["subespecialidade","subspecialty","sub especialidade"],
  profession: ["profissao","profissão","profession","categoria","tipo"],
  city: ["cidade","city","municipio","município","cidade-estado","cidade/estado"],
  state: ["estado","state","uf"],
  personalContact: ["contato pessoal","contato pessoal ","telefone pessoal","whatsapp pessoal","celular pessoal","tel pessoal","phone"],
  schedulingContact: ["contato agendamento","contato agendamento ","contato","tel. agendamento","tel agendamento","telefone agendamento","whatsapp agendamento","agendamento","secretaria","telefone/whatsapp para agendamento","telefone","whatsapp","celular","tel"],
  email: ["email","e-mail","mail"],
  instagram: ["instagram","insta","ig","redes sociais","rede social"],
  site: ["site","website","url"],
  formation: ["formacao","formação","faculdade","universidade","instituicao","instituição"],
  councilNumber: ["crm /conselho","crm/conselho","crm","crp","cro","conselho","registro"],
  rqe: ["rqe"],
  cpf: ["cpf","cpf/cnpj","cnpj"],
  address: ["endereco completo","endereço completo","endereco","endereço","address","logradouro","endereco de atendimento","endereço de atendimento"],
  clinic: ["local de atendimento","local atendimento ","local de atendimento ","clinica","clínica","consultorio","consultório","local"],
  source: ["origem","origin","fonte","canal"],
  notes: ["observacoes","observações","obs","notas"],
  monthlyFee: ["mensalidade","fee","valor","plano","valor mensal"],
};

function normKey2(s) {
  return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g,"").trim();
}

function detectField2(col) {
  const n = normKey2(col);
  for (const [field, aliases] of Object.entries(FIELD_MAP)) {
    for (const alias of aliases) {
      if (normKey2(alias) === n) return field;
    }
  }
  for (const [field, aliases] of Object.entries(FIELD_MAP)) {
    for (const alias of aliases) {
      const a = normKey2(alias);
      if (n.includes(a) || a.includes(n)) return field;
    }
  }
  return null;
}

function parseCSV2(text) {
  const lines = text.split(/[\r\n]+/).filter(l => l.trim());
  if (!lines.length) return { headers: [], rows: [] };
  const firstLine = lines[0];
  const delimiters = [";", ",", "\t", "|"];
  const delim = delimiters.reduce((best, d) => (firstLine.split(d).length > firstLine.split(best).length ? d : best), ";");
  function parseLine(line) {
    const result = []; let cur = ""; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQ = !inQ; }
      else if (line[i] === delim && !inQ) { result.push(cur.trim()); cur = ""; }
      else cur += line[i];
    }
    result.push(cur.trim());
    return result;
  }
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(l => parseLine(l));
  return { headers, rows };
}

const FIELD_LABELS = {
  name: "Nome", specialty: "Especialidade", subspecialty: "Subespecialidade",
  profession: "Profissao", city: "Cidade", state: "Estado",
  personalContact: "Contato Pessoal", schedulingContact: "Contato Agendamento",
  email: "E-mail", instagram: "Instagram", site: "Site",
  formation: "Formacao", councilNumber: "CRM/Conselho", rqe: "RQE",
  cpf: "CPF", address: "Endereco", clinic: "Local Atendimento",
  source: "Origem", notes: "Observacoes", monthlyFee: "Mensalidade",
};

function Importacao({ onNav }) {
  const [step, setStep] = useState("upload");
  const [destination, setDestination] = useState("members");
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState(null);
  const [mapping, setMapping] = useState({});
  const [loading, setLoading] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [activeTab, setActiveTab] = useState("import");
  const [importHistory, setImportHistory] = useState(() => DB.get("import_history", []));
  const [viewBase, setViewBase] = useState("members");
  const [baseSearch, setBaseSearch] = useState("");

  const DEST_OPTIONS = [
    { id: "members", label: "Membros", desc: "Profissionais ativos da PARTIC", icon: "⭐" },
    { id: "leads", label: "Leads", desc: "Banco de contatos para prospeccao", icon: "👥" },
    { id: "curation", label: "Curadoria", desc: "Leads em avaliacao", icon: "🔍" },
  ];

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setFileName(file.name);
    try {
      let result;
      if (file.name.toLowerCase().endsWith(".csv")) {
        let text;
        try {
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
            text = new TextDecoder("utf-8").decode(buffer);
          } else {
            try { text = new TextDecoder("utf-8", { fatal: true }).decode(buffer); }
            catch(e) { text = new TextDecoder("windows-1252").decode(buffer); }
          }
        } catch(e) { text = await file.text(); }
        result = parseCSV2(text);
      } else {
        await new Promise((res, rej) => {
          if (window.XLSX) { res(); return; }
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
        const buffer = await file.arrayBuffer();
        const wb = window.XLSX.read(new Uint8Array(buffer), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        const headers = (json[0] || []).map(h => String(h));
        const rows = json.slice(1).map(r => headers.map((_, i) => String(r[i] || "")));
        result = { headers, rows: rows.filter(r => r.some(c => c.trim())) };
      }
      const autoMapping = {};
      result.headers.forEach(h => { const f = detectField2(h); if (f) autoMapping[h] = f; });
      setMapping(autoMapping);
      setParsed(result);
      setStep("mapping");
    } catch(err) { alert("Erro ao ler arquivo: " + err.message); }
    setLoading(false);
  }

  function normContact(raw, dest) {
    // Auto-detect city from address if city is empty
    let cityVal = (raw.city || "").trim();
    if (!cityVal && raw.address) {
      const addr = raw.address.toLowerCase();
      const cityMap = [
        ["ribeirao preto", "Ribeirão Preto"], ["uberlandia", "Uberlândia"],
        ["sao jose do rio preto", "São José do Rio Preto"], ["bauru", "Bauru"],
        ["uberaba", "Uberaba"], ["presidente prudente", "Presidente Prudente"],
        ["campinas", "Campinas"], ["bonfim paulista", "Bonfim Paulista"],
        ["tres coracoes", "Três Corações"], ["tres coracões", "Três Corações"],
      ];
      for (const [key, label] of cityMap) {
        if (addr.includes(key)) { cityVal = label; break; }
      }
    }
    // Extract city from "CidadeNome-SP" format
    if (cityVal && cityVal.includes("-")) {
      const parts = cityVal.split("-");
      if (parts[parts.length-1].trim().length === 2) {
        cityVal = parts.slice(0, -1).join("-").trim();
      }
    }
    const base = {
      id: Date.now() + Math.random(),
      name: (raw.name || "").trim(),
      specialty: (raw.specialty || "").trim(),
      subspecialty: (raw.subspecialty || "").trim(),
      profession: (raw.profession || "Medico").trim(),
      city: cityVal,
      state: (raw.state || "").trim(),
      email: (raw.email || "").trim(),
      instagram: (raw.instagram || "").trim(),
      formation: (raw.formation || "").trim(),
      councilNumber: (raw.councilNumber || "").trim(),
      rqe: (raw.rqe || "").trim(),
      cpf: (raw.cpf || "").trim(),
      address: (raw.address || "").trim(),
      clinic: (raw.clinic || "").trim(),
      source: (raw.source || "Importacao").trim(),
      notes: (raw.notes || "").trim(),
      createdAt: new Date().toISOString(),
    };
    if (dest === "members") {
      return { ...base, personalContact: (raw.personalContact || "").trim(), schedulingContact: (raw.schedulingContact || "").trim(), monthlyFee: parseFloat(raw.monthlyFee) || 0, status: "active", isAnchor: false, joinedAt: new Date().toISOString() };
    }
    return { ...base, phone: (raw.schedulingContact || raw.personalContact || "").trim(), stage: dest === "curation" ? "curadoria_avaliacao" : "lead" };
  }

  function doImport() {
    const normK = c => ((c.name||"").toLowerCase().trim() + "|" + (c.city||"").toLowerCase().trim());
    const allItems = parsed.rows
      .map(row => { const raw = {}; parsed.headers.forEach((h,i) => { if (mapping[h]) raw[mapping[h]] = row[i]; }); return normContact(raw, destination); })
      .filter(c => c.name && c.name.trim());
    const seen = new Set();
    const unique = allItems.filter(c => { const k = normK(c); if (seen.has(k)) return false; seen.add(k); return true; });

    let added = 0;
    if (destination === "members") {
      const existing = DB.get("members", []);
      const existingKeys = new Set(existing.map(normK));
      const newOnes = unique.filter(c => !existingKeys.has(normK(c)));
      DB.set("members", [...existing, ...newOnes]);
      added = newOnes.length;
    } else {
      const existing = DB.get("contacts", []);
      const existingKeys = new Set(existing.map(normK));
      const newOnes = unique.filter(c => !existingKeys.has(normK(c)));
      DB.set("contacts", [...existing, ...newOnes]);
      added = newOnes.length;
    }

    const history = DB.get("import_history", []);
    const newHistory = [{ id: Date.now(), date: new Date().toISOString(), fileName, destination, total: unique.length, added, status: "ativa" }, ...history.slice(0, 19)];
    DB.set("import_history", newHistory);
    setImportHistory(newHistory);
    setImportedCount(added);
    setStep("done");
    showToast("Importacao concluida!");
  }

  function reset() {
    setStep("upload"); setParsed(null); setMapping({});
    setFileName(""); setImportedCount(0);
  }

  const tabStyle = (id) => ({
    padding: "8px 18px", fontSize: 13, fontWeight: activeTab === id ? 700 : 400,
    cursor: "pointer", background: "none", border: "none",
    borderBottom: activeTab === id ? "2px solid " + C.azulPetroleo : "2px solid transparent",
    color: activeTab === id ? C.azulPetroleo : "#aaa", marginBottom: -1,
  });

  return (
    <div>
      <div style={S.topbar}>
        <div>
          <h1 style={S.sectionTitle}>Importacao de Dados</h1>
          <p style={S.sectionSub}>CSV ou XLSX · mapeamento automatico · deduplicacao por nome</p>
        </div>
        {activeTab === "import" && step !== "upload" && (
          <button style={S.btnO} onClick={reset}>← Nova importacao</button>
        )}
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e5e5", marginBottom: 20 }}>
        <button style={tabStyle("import")} onClick={() => setActiveTab("import")}>📥 Nova Importacao</button>
        <button style={tabStyle("history")} onClick={() => setActiveTab("history")}>📋 Historico ({importHistory.length})</button>
        <button style={tabStyle("base")} onClick={() => setActiveTab("base")}>👥 Ver Base de Dados</button>
      </div>

      {activeTab === "history" && (
        <div>
          {importHistory.length === 0 ? (
            <div style={{ ...S.card, textAlign: "center", padding: "40px", color: "#aaa" }}>
              <p style={{ fontSize: 32, margin: "0 0 8px" }}>📋</p>
              <p>Nenhuma importacao realizada ainda</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {importHistory.map(h => (
                <div key={h.id} style={{ ...S.card, padding: "14px 16px", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: 28 }}>📊</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{h.fileName || "Arquivo importado"}</div>
                    <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#888", flexWrap: "wrap" }}>
                      <span>📅 {new Date(h.date).toLocaleDateString("pt-BR")}</span>
                      <span>📁 {h.destination === "members" ? "Membros" : "Leads"}</span>
                      <span style={{ color: "#10B981", fontWeight: 600 }}>✓ {h.added} adicionados</span>
                      <span>{h.total} no arquivo</span>
                    </div>
                  </div>
                  <span style={{ background: "#f0faf4", color: "#0f6e56", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                    {h.status || "ativa"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "base" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
            <select style={{ ...S.select, height: 34, fontSize: 12, width: "auto", minWidth: 160 }}
              value={viewBase} onChange={e => setViewBase(e.target.value)}>
              <option value="members">Membros ({DB.get("members",[]).length})</option>
              <option value="leads">Leads ({DB.get("contacts",[]).filter(c=>c.stage==="lead").length})</option>
            </select>
            <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
              <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#aaa" }}>{I.search}</span>
              <input style={{ ...S.input, paddingLeft: 28, height: 34, fontSize: 12, width: "100%" }}
                placeholder="Buscar por nome..."
                value={baseSearch} onChange={e => setBaseSearch(e.target.value)} />
            </div>
          </div>
          {(() => {
            const rawData = viewBase === "members"
              ? DB.get("members", [])
              : DB.get("contacts", []).filter(c => c.stage === "lead");
            const filtered = baseSearch
              ? rawData.filter(c => (c.name||"").toLowerCase().includes(baseSearch.toLowerCase()))
              : rawData;
            return (
              <div>
                <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>{filtered.length} de {rawData.length} registros</p>
                <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f7f7f5" }}>
                        {["Nome", "Especialidade", "Cidade", "Contato", "Acao"].map(h => <th key={h} style={S.th}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.slice(0, 100).map(item => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                          <td style={S.td}><div style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</div><div style={{ fontSize: 10, color: "#aaa" }}>{item.profession || "Medico"}</div></td>
                          <td style={S.td}><span style={{ fontSize: 12 }}>{item.specialty || "-"}</span></td>
                          <td style={S.td}><span style={{ fontSize: 11, color: "#666" }}>{item.city || "-"}</span></td>
                          <td style={S.td}><WppBtn phone={item.personalContact || item.schedulingContact || item.phone} size="xs" /></td>
                          <td style={S.td}>
                            <button onClick={() => {
                              if (!confirm("Remover " + item.name + "?")) return;
                              if (viewBase === "members") { DB.set("members", DB.get("members",[]).filter(m => m.id !== item.id)); }
                              else { DB.set("contacts", DB.get("contacts",[]).filter(c => c.id !== item.id)); }
                              setBaseSearch(s => s + " ");
                              setTimeout(() => setBaseSearch(s => s.trim()), 50);
                              showToast(item.name + " removido");
                            }} style={{ fontSize: 10, background: "#fff0f0", color: "#a32d2d", border: "1px solid #fca5a5", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>
                              {I.trash}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr><td colSpan={5} style={{ padding: "30px", textAlign: "center", color: "#aaa" }}>Nenhum registro encontrado</td></tr>
                      )}
                    </tbody>
                  </table>
                  {filtered.length > 100 && (
                    <div style={{ padding: "10px 16px", fontSize: 11, color: "#aaa", textAlign: "center" }}>
                      Mostrando 100 de {filtered.length}. Use a busca para encontrar registros especificos.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === "import" && (
        <div>
          {step === "upload" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
                {DEST_OPTIONS.map(d => (
                  <div key={d.id} onClick={() => setDestination(d.id)}
                    style={{ ...S.card, cursor: "pointer", border: destination === d.id ? "2px solid " + C.azulPetroleo : "1px solid #e5e5e5", background: destination === d.id ? C.azulPetroleo + "08" : "#fff" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{d.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: destination === d.id ? C.azulPetroleo : "#1a1a1a" }}>{d.label}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{d.desc}</div>
                    {destination === d.id && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: C.azulPetroleo }}>✓ Selecionado</div>}
                  </div>
                ))}
              </div>
              <label style={{ display: "block", cursor: "pointer" }}>
                <div style={{ border: "2px dashed #ddd", borderRadius: 14, padding: "48px 24px", textAlign: "center", background: "#fafafa" }}>
                  {loading
                    ? <><div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div><p style={{ fontSize: 14, color: C.azulPetroleo, fontWeight: 600, margin: 0 }}>Lendo arquivo...</p></>
                    : <><div style={{ fontSize: 48, marginBottom: 12 }}>📂</div><p style={{ fontSize: 16, fontWeight: 700, color: "#333", margin: "0 0 6px" }}>Arraste seu arquivo aqui</p><p style={{ fontSize: 13, color: "#888", margin: "0 0 16px" }}>ou clique para selecionar · .csv ou .xlsx</p><span style={{ ...S.btnP, display: "inline-flex" }}>Selecionar arquivo</span></>
                  }
                </div>
                <input type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={handleFile} />
              </label>
            </div>
          )}

          {step === "mapping" && parsed && (
            <div>
              <div style={{ ...S.card, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>Mapeamento de Colunas</h3>
                <p style={{ fontSize: 12, color: "#888", margin: "0 0 16px" }}>{parsed.rows.length} linhas · {Object.keys(mapping).length} colunas mapeadas</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {parsed.headers.map(h => (
                    <div key={h} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: mapping[h] ? "#f0faf4" : "#fff9ec", borderRadius: 8, border: "1px solid " + (mapping[h] ? "#a7f0d8" : "#fde68a") }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{mapping[h] ? "✓ " : "⚠ "}{h}</div>
                        {parsed.rows[0] && <div style={{ fontSize: 10, color: "#aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>ex: {parsed.rows[0][parsed.headers.indexOf(h)] || "—"}</div>}
                      </div>
                      <select value={mapping[h] || ""} onChange={e => setMapping(m => ({ ...m, [h]: e.target.value || undefined }))}
                        style={{ fontSize: 11, padding: "3px 6px", border: "1px solid #ddd", borderRadius: 6, background: "#fff", minWidth: 130 }}>
                        <option value="">— ignorar —</option>
                        {Object.entries(FIELD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={S.btnP} onClick={doImport}>✓ Importar agora ({parsed.rows.filter(r => r[0] && r[0].trim()).length} registros)</button>
                <button style={S.btnO} onClick={reset}>Cancelar</button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div style={{ ...S.card, textAlign: "center", padding: "60px 40px" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: C.azulPetroleo, margin: "0 0 8px" }}>{importedCount} contatos importados!</h2>
              <p style={{ fontSize: 14, color: "#888", margin: "0 0 24px" }}>Adicionados em <strong>{DEST_OPTIONS.find(d => d.id === destination)?.label}</strong>.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button style={S.btnP} onClick={reset}>← Importar outro arquivo</button>
                <button style={S.btnG} onClick={() => onNav && onNav(destination)}>Ver dados importados →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─── SCRIPTS OPERACIONAIS ─────────────────────────────────────────────────────
function Scripts() {
  const [scripts, setScripts] = useState(DB.get("scripts", []));
  const [showAdd, setShowAdd] = useState(false);
  const [editS, setEditS] = useState(null);
  const [form, setForm] = useState({ title: "", category: "outro", content: "" });
  const save = d => { setScripts(d); DB.set("scripts", d); };
  return (
    <div>
      <div style={S.topbar}>
        <div><h1 style={S.sectionTitle}>Scripts Operacionais</h1><p style={S.sectionSub}>{scripts.length} scripts · mensagens e fluxos de comunicação</p></div>
        <button style={S.btnP} onClick={() => { setForm({ title: "", category: "outro", content: "" }); setEditS(null); setShowAdd(true); }}>{I.plus} Novo script</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
        {scripts.map(s => (
          <div key={s.id} style={{ ...S.card, borderLeft: `3px solid ${SCRIPT_COLORS[s.category] || "#888"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 5px" }}>{s.title}</h3>
                <Pill color={SCRIPT_COLORS[s.category]}>{SCRIPT_CATS[s.category]}</Pill>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button style={S.btnO} onClick={() => { navigator.clipboard?.writeText(s.content); showToast("Copiado!"); }}>{I.copy}</button>
                <button style={S.btnO} onClick={() => { setForm({ ...s }); setEditS(s); setShowAdd(true); }}>{I.edit}</button>
                <button style={S.btnD} onClick={() => { if (confirm("Remover?")) save(scripts.filter(x => x.id !== s.id)); }}>{I.trash}</button>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#666", lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap", maxHeight: 90, overflow: "hidden" }}>{s.content}</p>
          </div>
        ))}
      </div>
      {showAdd && (
        <div style={S.modal} onClick={() => setShowAdd(false)}>
          <div style={{ ...S.modalBox, maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 18px" }}>{editS ? "Editar Script" : "Novo Script"}</h3>
            <div style={{ marginBottom: 12 }}><label style={S.lbl}>Título</label><input style={S.input} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div style={{ marginBottom: 12 }}><label style={S.lbl}>Categoria</label><select style={S.select} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>{Object.entries(SCRIPT_CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div style={{ marginBottom: 16 }}><label style={S.lbl}>Conteúdo · use {"{{nome}}"}, {"{{cidade}}"} para personalizar</label><textarea style={{ ...S.input, height: 180, resize: "vertical" }} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btnP} onClick={() => { if (!form.title || !form.content) return alert("Preencha título e conteúdo"); if (editS) save(scripts.map(s => s.id === editS.id ? { ...s, ...form } : s)); else save([...scripts, { ...form, id: Date.now() }]); setShowAdd(false); showToast("Script salvo ✓"); }}>Salvar</button>
              <button style={S.btnO} onClick={() => setShowAdd(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      )}
    </div>
  );
}

// ─── CONFIGURAÇÕES ────────────────────────────────────────────────────────────
function Settings({ user, onLogout }) {
  const [tab, setTab] = useState("system");
  const [showClearDone, setShowClearDone] = useState(false);
  const [users, setUsers] = useState(() => { let u = DB.get("users", null); if (!u || u.length === 0) { DB.set("users", SEED_USERS); return SEED_USERS; } return u; });
  const [showAdd, setShowAdd] = useState(false);
  const [editU, setEditU] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user", active: true });
  const saveUsers = d => { setUsers(d); DB.set("users", d); };

  return (
    <div>
      <h1 style={{ ...S.sectionTitle, marginBottom: 18 }}>Configurações</h1>
      <div style={{ display: "flex", gap: 2, marginBottom: 18, borderBottom: "1px solid #e5e5e5" }}>
        {[{ id: "system", label: "Sistema" }, { id: "users", label: `Controle de Acesso (${users.length})` }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "7px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", background: "none", border: "none", borderBottom: tab === t.id ? `2px solid ${C.azulPetroleo}` : "2px solid transparent", color: tab === t.id ? C.azulPetroleo : "#aaa", marginBottom: -1 }}>{t.label}</button>
        ))}
      </div>

      {tab === "system" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={S.card}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 14px" }}>Perfil</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <Avatar name={user?.name} size={46} fixed />
              <div><p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 3px" }}>{user?.name}</p><p style={{ fontSize: 12, color: "#888", margin: "0 0 5px" }}>{user?.email}</p><Pill color={C.azulPetroleo}>{user?.role === "admin" ? "Administrador" : "Usuário"}</Pill></div>
            </div>
            <button style={{ ...S.btnD, width: "100%", justifyContent: "center" }} onClick={onLogout}>{I.logout} Sair da conta</button>
          </div>
          <div style={S.card}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 14px" }}>Dados do Sistema</h3>
            {[["Versão", "PARTIC Flow v3.0"], ["Membros", `${DB.get("members", []).length} cadastrados`], ["Leads", `${DB.get("contacts",[]).filter(c=>c.stage==="lead").length} na base`], ["Em Curadoria", `${DB.get("contacts",[]).filter(c=>c.stage==="curadoria_avaliacao").length} em avaliação`], ["Funis Membros", `${DB.get("member_pipelines", []).length} criados`]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f5f5f5", fontSize: 12 }}><span style={{ color: "#888" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></div>
            ))}
            <button style={{ ...S.btnD, marginTop: 14, fontSize: 11 }} onClick={() => { if (confirm("ATENÇÃO: Limpar todos os dados? Isso não pode ser desfeito!")) { try { localStorage.clear(); } catch(e) {} setShowClearDone(true); } }}>🗑 Limpar todos os dados</button>
            {showClearDone && <div style={{marginTop:8,fontSize:12,color:"#0f6e56",background:"#f0faf4",borderRadius:7,padding:"7px 10px"}}>✓ Dados limpos — recarregue a página para ver o efeito.</div>}
          </div>
        </div>
      )}

      {tab === "users" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ background: "#f0f4ff", borderRadius: 8, padding: "9px 14px", fontSize: 12, color: C.azulPetroleo, flex: 1, marginRight: 12, display: "flex", alignItems: "center", gap: 7 }}>
              {I.shield} Somente <strong>Admins</strong> podem gerenciar acessos. Compartilhe e-mail e senha diretamente com o usuário.
            </div>
            {user?.role === "admin" && <button style={S.btnP} onClick={() => { setForm({ name: "", email: "", password: "", role: "user", active: true }); setEditU(null); setShowAdd(true); }}>{I.plus} Novo usuário</button>}
          </div>
          <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f7f7f5" }}>{["Usuário", "E-mail", "Papel", "Status", ""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={S.td}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={u.name} size={28} fixed /><span style={{ fontSize: 13, fontWeight: 600 }}>{u.name}{u.email === user?.email && <span style={{ fontSize: 10, color: "#aaa", marginLeft: 5 }}>(você)</span>}</span></div></td>
                    <td style={{ ...S.td, color: "#555" }}>{u.email}</td>
                    <td style={S.td}><Pill color={u.role === "admin" ? C.azulPetroleo : C.verdeMedio}>{u.role === "admin" ? "Admin" : "Usuário"}</Pill></td>
                    <td style={S.td}><span style={{ background: u.active !== false ? "#f0faf4" : "#f7f7f5", color: u.active !== false ? "#0f6e56" : "#888", border: `1px solid ${u.active !== false ? "#a7f0d8" : "#e5e5e5"}`, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>{u.active !== false ? "● Ativo" : "○ Inativo"}</span></td>
                    <td style={S.td}>
                      {user?.role === "admin" && <div style={{ display: "flex", gap: 5 }}>
                        <button style={S.btnO} onClick={() => { setForm({ ...u, password: "" }); setEditU(u); setShowAdd(true); }}>{I.edit}</button>
                        {u.email !== user?.email && <button style={S.btnD} onClick={() => { if (confirm("Remover acesso?")) saveUsers(users.filter(x => x.id !== u.id)); }}>{I.trash}</button>}
                      </div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showAdd && (
            <div style={S.modal} onClick={() => setShowAdd(false)}>
              <div style={S.modalBox} onClick={e => e.stopPropagation()}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 18px" }}>{editU ? "Editar Usuário" : "Novo Usuário"}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div style={{ gridColumn: "1/-1" }}><label style={S.lbl}>Nome *</label><input style={S.input} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                  <div style={{ gridColumn: "1/-1" }}><label style={S.lbl}>E-mail *</label><input style={S.input} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                  <div><label style={S.lbl}>{editU ? "Nova senha (deixe em branco para manter)" : "Senha *"}</label><input style={S.input} type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} /></div>
                  <div><label style={S.lbl}>Papel</label><select style={S.select} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}><option value="admin">Admin — acesso total</option><option value="user">Usuário — acesso padrão</option></select></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="checkbox" id="uactive" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} /><label htmlFor="uactive" style={{ fontSize: 13 }}>Acesso ativo</label></div>
                </div>
                <div style={{ background: "#f0f4ff", borderRadius: 8, padding: "9px 13px", fontSize: 12, color: C.azulPetroleo, marginBottom: 14 }}>💡 Compartilhe o e-mail e senha diretamente com a pessoa. Não há envio automático.</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={S.btnP} onClick={() => {
                    if (!form.name || !form.email) return alert("Nome e e-mail são obrigatórios");
                    if (!editU && !form.password) return alert("Senha é obrigatória");
                    if (editU) { saveUsers(users.map(u => u.id === editU.id ? { ...u, ...form, password: form.password || u.password } : u)); }
                    else {
                      if (users.find(u => u.email === form.email)) return alert("E-mail já cadastrado");
                      saveUsers([...users, { ...form, id: Date.now(), createdAt: new Date().toISOString() }]);
                    }
                    setShowAdd(false); showToast(editU ? "Usuário atualizado ✓" : "Usuário criado ✓");
                  }}>{editU ? "Atualizar" : "Criar acesso"}</button>
                  <button style={S.btnO} onClick={() => setShowAdd(false)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      )}
    </div>
  );
}


// ─── STUDIO PARTIC ────────────────────────────────────────────────────────────

// ── Seed data ──
const STUDIO_CLIENTS_SEED = [
  { id: "partic", name: "PARTIC Institucional", color: "#1B6B8A", avatar: "PI", active: true, notes: "" },
];

const STUDIO_TEAM_SEED = [];

const STUDIO_CAMPAIGNS_SEED = [];

const STUDIO_CONTENT_SEED = [];

const STUDIO_LIBRARY_SEED = [];


function studioInit() {
  // Force reset to clear hypothetical data — only runs once per clean install
  if (!DB.get("studio_v2", false)) {
    DB.set("studio_clients", STUDIO_CLIENTS_SEED);
    DB.set("studio_team", STUDIO_TEAM_SEED);
    DB.set("studio_campaigns", STUDIO_CAMPAIGNS_SEED);
    DB.set("studio_content", STUDIO_CONTENT_SEED);
    DB.set("studio_library", STUDIO_LIBRARY_SEED);
    DB.set("studio_v2", true);
    // Clear old flag so reset runs
    try { localStorage.removeItem("partic_studio_v1"); } catch(e) {}
  }
}

// ── Status config ──
const CONTENT_STATUS = {
  em_producao: { label: "Em Produção",    color: "#3B82F6", bg: "#EFF6FF", dot: "🔵" },
  em_revisao:  { label: "Em Revisão",     color: "#F59E0B", bg: "#FFFBEB", dot: "🟡" },
  ajustes:     { label: "Ajustes",        color: "#EF4444", bg: "#FFF5F5", dot: "🔴" },
  aprovado:    { label: "Aprovado",       color: "#10B981", bg: "#F0FDF4", dot: "🟢" },
  publicado:   { label: "Publicado",      color: "#6B7280", bg: "#F3F4F6", dot: "⚫" },
};

const CONTENT_TYPES = {
  feed_post: "📸 Feed Post",
  carrossel: "🎠 Carrossel",
  stories:   "📱 Stories",
  reels:     "🎬 Reels",
  video:     "🎥 Vídeo",
  blog:      "📝 Blog",
  email:     "✉️ E-mail",
  anuncio:   "📢 Anúncio",
};

const ROLE_LABELS = { criacao: "Criação", estrategia: "Estratégia", trafego: "Tráfego" };
const ROLE_COLORS = { criacao: "#1B6B8A", estrategia: "#7153A2", trafego: "#4CAF82" };

// ── Helpers ──
function studioClientColor(clientId) {
  const clients = DB.get("studio_clients", []);
  return clients.find(c => c.id === clientId)?.color || "#888";
}
function studioClientName(clientId) {
  const clients = DB.get("studio_clients", []);
  return clients.find(c => c.id === clientId)?.name || clientId;
}
function studioCampaignName(campaignId) {
  const campaigns = DB.get("studio_campaigns", []);
  return campaigns.find(c => c.id === campaignId)?.name || "";
}
function studioMemberName(memberId) {
  const team = DB.get("studio_team", []);
  return team.find(t => t.id === memberId)?.name || memberId || "—";
}

// ── Sub-components ──

function StudioCalendar({ clientFilter, onOpenContent }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allContent, setAllContent] = useState(DB.get("studio_content", []));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const DAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date();

  const filtered = allContent.filter(c => {
    if (clientFilter && c.clientId !== clientFilter) return false;
    if (!c.date) return false;
    const d = new Date(c.date + "T12:00:00");
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const getDay = (day) => filtered.filter(c => {
    if (!c.date) return false;
    const d = new Date(c.date + "T12:00:00");
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button style={S.btnO} onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>‹ Anterior</button>
        <div style={{ textAlign: "center" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: C.azulPetroleo }}>{MONTHS[month]} {year}</h3>
          <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{filtered.length} conteúdo{filtered.length !== 1 ? "s" : ""} planejados</p>
        </div>
        <button style={S.btnO} onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>Próximo ›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#aaa", padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} style={{ minHeight: 90 }} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayPosts = getDay(day);
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
          return (
            <div key={day} style={{ minHeight: 90, background: isToday ? C.azulPetroleo + "08" : "#fafafa", borderRadius: 8, padding: "5px 5px 4px", border: isToday ? `1.5px solid ${C.azulPetroleo}40` : "1px solid #f0f0f0", overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 400, color: isToday ? C.azulPetroleo : "#555", marginBottom: 4 }}>{day}</div>
              {dayPosts.map(post => {
                const st = CONTENT_STATUS[post.status] || CONTENT_STATUS.em_producao;
                const cl = studioClientColor(post.clientId);
                return (
                  <div key={post.id} onClick={() => onOpenContent(post.id)}
                    style={{ fontSize: 9, background: st.color, color: "#fff", borderRadius: 4, padding: "2px 5px", marginBottom: 2, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", borderLeft: `2px solid ${cl}` }}
                    title={post.title}>
                    {post.title}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        {Object.entries(CONTENT_STATUS).map(([k, v]) => (
          <span key={k} style={{ fontSize: 10, color: v.color, background: v.bg, borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>
            {v.dot} {v.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ContentModal({ contentId, onClose, onSave }) {
  const [content, setContent] = useState(() => {
    const all = DB.get("studio_content", []);
    return all.find(c => c.id === contentId) || null;
  });
  const [newComment, setNewComment] = useState("");
  const [tab, setTab] = useState("midia");
  const [mediaPreview, setMediaPreview] = useState(content?.media || []);
  const team = DB.get("studio_team", []);
  const approvers = team.filter(t => t.canApprove);
  const currentUser = DB.get("session", { name: "Karine Rodrigues", role: "admin" });

  if (!content) return null;

  const st = CONTENT_STATUS[content.status] || CONTENT_STATUS.em_producao;
  const cl = studioClientColor(content.clientId);

  function saveContent(updated) {
    const all = DB.get("studio_content", []);
    const newAll = all.map(c => c.id === contentId ? updated : c);
    DB.set("studio_content", newAll);
    setContent(updated);
    if (onSave) onSave(newAll);
  }

  function addComment() {
    if (!newComment.trim()) return;
    const comment = {
      id: `cm${Date.now()}`,
      author: currentUser.name || "Usuário",
      role: "estrategia",
      text: newComment,
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    saveContent({ ...content, comments: [...(content.comments || []), comment] });
    setNewComment("");
    showToast("Comentário adicionado ✓");
  }

  function toggleResolved(cmId) {
    saveContent({ ...content, comments: content.comments.map(c => c.id === cmId ? { ...c, resolved: !c.resolved } : c) });
  }

  function approve() {
    saveContent({ ...content, status: "aprovado", approvedBy: currentUser.name, approvedAt: new Date().toISOString() });
    showToast("Conteúdo aprovado! 🎉");
  }

  function requestAdjust() {
    saveContent({ ...content, status: "ajustes" });
    showToast("Ajustes solicitados", "info");
  }

  function publish() {
    saveContent({ ...content, status: "publicado", publishedAt: new Date().toISOString() });
    showToast("Marcado como publicado ✓");
  }

  const tabs = [
    { id: "midia", label: "🎨 Mídia" },
    { id: "copy", label: "Copy & Hashtags" },
    { id: "briefing", label: "Briefing" },
    { id: "comments", label: `Comentários (${(content.comments || []).filter(c => !c.resolved).length})` },
    { id: "history", label: "Histórico" },
  ];

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: 680, width: "100%" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 14, background: cl + "20", color: cl, borderRadius: 99, padding: "2px 10px", fontWeight: 700, fontSize: 11 }}>
                {studioClientName(content.clientId)}
              </span>
              <span style={{ fontSize: 11, color: "#aaa" }}>{CONTENT_TYPES[content.type] || content.type}</span>
              <span style={{ background: st.bg, color: st.color, borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>
                {st.dot} {st.label}
              </span>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 3px" }}>{content.title}</h2>
            <div style={{ fontSize: 11, color: "#aaa" }}>
              📅 {content.date ? new Date(content.date + "T12:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "—"} ·
              👤 {studioMemberName(content.responsibleId)} ·
              📣 {studioCampaignName(content.campaignId) || "Sem campanha"}
            </div>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18 }} onClick={onClose}>{I.x}</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e5e5", marginBottom: 14 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: tab === t.id ? 700 : 400, cursor: "pointer", background: "none", border: "none", borderBottom: tab === t.id ? `2px solid ${C.azulPetroleo}` : "2px solid transparent", color: tab === t.id ? C.azulPetroleo : "#aaa", marginBottom: -1 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Mídia */}
        {tab === "midia" && (
          <div>
            {/* Upload área */}
            <label style={{ display: "block", cursor: "pointer", marginBottom: 12 }}>
              <div style={{ border: "2px dashed #ddd", borderRadius: 12, padding: "24px", textAlign: "center", background: "#fafafa", transition: "border-color .2s" }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.azulPetroleo; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = "#ddd"; }}
                onDrop={e => {
                  e.preventDefault(); e.currentTarget.style.borderColor = "#ddd";
                  const files = Array.from(e.dataTransfer.files);
                  files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = ev => {
                      const newMedia = { id: `m_${Date.now()}_${Math.random()}`, name: file.name, type: file.type, dataUrl: ev.target.result, uploadedAt: new Date().toISOString() };
                      const updated = { ...content, media: [...(content.media || []), newMedia] };
                      saveContent(updated);
                      setMediaPreview(updated.media);
                    };
                    reader.readAsDataURL(file);
                  });
                }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎨</div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: "0 0 4px" }}>Arraste a arte aqui ou clique para selecionar</p>
                <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>Imagens, vídeos, PDFs · Estático, Carrossel, Reels</p>
              </div>
              <input type="file" multiple accept="image/*,video/*,.pdf" style={{ display: "none" }}
                onChange={e => {
                  Array.from(e.target.files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = ev => {
                      const newMedia = { id: `m_${Date.now()}_${Math.random()}`, name: file.name, type: file.type, dataUrl: ev.target.result, uploadedAt: new Date().toISOString() };
                      const updated = { ...content, media: [...(content.media || []), newMedia] };
                      saveContent(updated);
                      setMediaPreview(updated.media);
                    };
                    reader.readAsDataURL(file);
                  });
                }} />
            </label>

            {/* Preview grid */}
            {(content.media || []).length > 0 ? (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", margin: "0 0 8px" }}>
                  {(content.media || []).length} arquivo{(content.media || []).length !== 1 ? "s" : ""} anexado{(content.media || []).length !== 1 ? "s" : ""}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                  {(content.media || []).map((m, idx) => (
                    <div key={m.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #e5e5e5", background: "#f7f7f5" }}>
                      {m.type.startsWith("image/") ? (
                        <img src={m.dataUrl} alt={m.name}
                          style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
                      ) : m.type.startsWith("video/") ? (
                        <video src={m.dataUrl} controls
                          style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
                      ) : (
                        <div style={{ height: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <span style={{ fontSize: 36 }}>📄</span>
                          <span style={{ fontSize: 10, color: "#888", textAlign: "center", padding: "0 6px" }}>{m.name}</span>
                        </div>
                      )}
                      {/* Overlay com nome e remover */}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", padding: "20px 6px 6px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <span style={{ fontSize: 9, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{m.name}</span>
                        <button onClick={() => {
                          const updated = { ...content, media: (content.media || []).filter((_, i) => i !== idx) };
                          saveContent(updated);
                          setMediaPreview(updated.media);
                        }} style={{ background: "rgba(255,0,0,0.7)", border: "none", color: "#fff", borderRadius: 4, padding: "2px 5px", fontSize: 10, cursor: "pointer", marginLeft: 4, flexShrink: 0 }}>✕</button>
                      </div>
                      {/* Badge tipo */}
                      <div style={{ position: "absolute", top: 5, left: 5, background: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: 4, padding: "2px 5px", fontSize: 9, fontWeight: 700 }}>
                        {m.type.startsWith("image/") ? "📸" : m.type.startsWith("video/") ? "🎬" : "📄"}
                        {idx === 0 && (content.media || []).length > 1 ? " CAPA" : ""}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 10, color: "#aaa", marginTop: 8 }}>💡 Primeira imagem = capa · Arraste novos arquivos para adicionar mais</p>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#bbb" }}>
                <p style={{ fontSize: 13, margin: 0 }}>Nenhum arquivo anexado ainda</p>
                <p style={{ fontSize: 11, margin: "4px 0 0" }}>Suba a arte para que a equipe de aprovação possa revisar</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Copy */}
        {tab === "copy" && (
          <div>
            <label style={S.lbl}>Legenda / Copy</label>
            <textarea style={{ ...S.input, height: 120, resize: "vertical", marginBottom: 10, whiteSpace: "pre-wrap" }}
              value={content.copy || ""}
              onChange={e => saveContent({ ...content, copy: e.target.value })} />
            <label style={S.lbl}>Hashtags</label>
            <input style={{ ...S.input, marginBottom: 10 }}
              value={content.hashtags || ""}
              onChange={e => saveContent({ ...content, hashtags: e.target.value })} />
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <button style={{ ...S.btnO, fontSize: 11 }}
                onClick={() => { navigator.clipboard?.writeText(`${content.copy || ""}\\n\\n${content.hashtags || ""}`); showToast("Copy copiada!"); }}>
                {I.copy} Copiar tudo
              </button>
            </div>
          </div>
        )}

        {/* Tab: Briefing */}
        {tab === "briefing" && (
          <div>
            <label style={S.lbl}>Briefing / Referências</label>
            <textarea style={{ ...S.input, height: 150, resize: "vertical" }}
              value={content.briefing || ""}
              onChange={e => saveContent({ ...content, briefing: e.target.value })} />
          </div>
        )}

        {/* Tab: Comentários */}
        {tab === "comments" && (
          <div>
            <div style={{ maxHeight: 220, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {(content.comments || []).length === 0 && (
                <p style={{ fontSize: 12, color: "#aaa", textAlign: "center", padding: "20px 0" }}>Nenhum comentário ainda</p>
              )}
              {(content.comments || []).map(cm => (
                <div key={cm.id} style={{ background: cm.resolved ? "#f7f7f5" : ROLE_COLORS[cm.role] + "10", borderRadius: 9, padding: "9px 12px", border: `1px solid ${cm.resolved ? "#e5e5e5" : ROLE_COLORS[cm.role] + "30"}`, opacity: cm.resolved ? 0.6 : 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ROLE_COLORS[cm.role] || "#555" }}>{cm.author}</span>
                      <span style={{ fontSize: 10, background: ROLE_COLORS[cm.role] + "20", color: ROLE_COLORS[cm.role], borderRadius: 99, padding: "1px 6px" }}>{ROLE_LABELS[cm.role] || cm.role}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "#aaa" }}>{new Date(cm.createdAt).toLocaleDateString("pt-BR")}</span>
                      <button onClick={() => toggleResolved(cm.id)}
                        style={{ fontSize: 10, background: cm.resolved ? "#f0f0f0" : "#f0faf4", color: cm.resolved ? "#aaa" : "#0f6e56", border: "none", borderRadius: 5, padding: "2px 7px", cursor: "pointer" }}>
                        {cm.resolved ? "Reabrir" : "✓ Resolver"}
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, margin: 0, color: "#333" }}>{cm.text}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <textarea style={{ ...S.input, flex: 1, height: 60, resize: "none" }}
                placeholder="Adicionar comentário ou solicitar ajuste..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)} />
              <button style={{ ...S.btnP, alignSelf: "flex-end" }} onClick={addComment}>Enviar</button>
            </div>
          </div>
        )}

        {/* Tab: Histórico */}
        {tab === "history" && (
          <div style={{ fontSize: 12, color: "#555" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {content.createdAt && <div style={{ display: "flex", gap: 10, alignItems: "center" }}><span style={{ fontSize: 18 }}>✨</span><div><strong>Criado</strong><div style={{ color: "#aaa", fontSize: 11 }}>{new Date(content.createdAt).toLocaleDateString("pt-BR")}</div></div></div>}
              {content.approvedAt && <div style={{ display: "flex", gap: 10, alignItems: "center" }}><span style={{ fontSize: 18 }}>✅</span><div><strong>Aprovado por {content.approvedBy}</strong><div style={{ color: "#aaa", fontSize: 11 }}>{new Date(content.approvedAt).toLocaleDateString("pt-BR")}</div></div></div>}
              {content.publishedAt && <div style={{ display: "flex", gap: 10, alignItems: "center" }}><span style={{ fontSize: 18 }}>🚀</span><div><strong>Publicado</strong><div style={{ color: "#aaa", fontSize: 11 }}>{new Date(content.publishedAt).toLocaleDateString("pt-BR")}</div></div></div>}
              {(content.comments || []).map(cm => (
                <div key={cm.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>💬</span>
                  <div><strong>Comentário de {cm.author}</strong><div style={{ color: "#aaa", fontSize: 11 }}>{new Date(cm.createdAt).toLocaleDateString("pt-BR")} · {cm.resolved ? "resolvido" : "aberto"}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approval bar */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f0f0f0", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#888", flex: 1 }}>Status atual: <strong style={{ color: st.color }}>{st.dot} {st.label}</strong></span>
          {content.status !== "aprovado" && content.status !== "publicado" && (
            <button style={{ ...S.btnG, height: 34, fontSize: 12 }} onClick={approve}>✔ Aprovar conteúdo</button>
          )}
          {content.status === "aprovado" && (
            <button style={{ ...S.btnP, height: 34, fontSize: 12 }} onClick={publish}>🚀 Marcar como publicado</button>
          )}
          {content.status !== "ajustes" && content.status !== "publicado" && (
            <button style={{ ...S.btnD, height: 34, fontSize: 12 }} onClick={requestAdjust}>✏ Solicitar ajustes</button>
          )}
          {content.status === "ajustes" && (
            <button style={{ ...S.btnO, height: 34, fontSize: 12 }} onClick={() => saveContent({ ...content, status: "em_producao" })}>↩ Voltar para Produção</button>
          )}
        </div>
      </div>
    </div>
  );
}

function StudioMain({ subpage, onNav }) {
  const [content, setContent] = useState(DB.get("studio_content", []));
  const [clients] = useState(DB.get("studio_clients", []));
  const [campaigns] = useState(DB.get("studio_campaigns", []));
  const [team] = useState(DB.get("studio_team", []));
  const [library] = useState(DB.get("studio_library", []));
  const [openContentId, setOpenContentId] = useState(null);
  const [clientFilter, setClientFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", type: "feed_post", clientId: "partic", campaignId: "", status: "em_producao", date: "", copy: "", hashtags: "", briefing: "", responsibleId: "" });

  // Contents filter (hoisted - must be before any conditional returns)
  const [contentsFilter, setContentsFilter] = useState({ client: "", search: "" });
  const [clients2, setClients2] = useState(DB.get("studio_clients", []));
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientForm, setClientForm] = useState({ name: "", color: C.azulPetroleo, notes: "" });
  const [camps, setCamps] = useState(DB.get("studio_campaigns", []));
  const [lib, setLib] = useState(DB.get("studio_library", []));
  const [teamState, setTeamState] = useState(DB.get("studio_team", []));
  // History filters (hoisted)
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [selMonth, setSelMonth] = useState(null);
  const [selClientH, setSelClientH] = useState("");

    // ── Calendário ──
  if (subpage === "studio_calendar") return (
    <div>
      <div style={S.topbar}>
        <div><h1 style={S.sectionTitle}>Calendário de Conteúdos</h1><p style={S.sectionSub}>Planejamento mensal visual</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          <select style={{ ...S.select, width: "auto", minWidth: 200, height: 34, fontSize: 12 }} value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
            <option value="">Todos os clientes</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button style={S.btnP} onClick={() => setShowAdd(true)}>{I.plus} Novo conteúdo</button>
        </div>
      </div>
      <div style={S.card}>
        <StudioCalendar clientFilter={clientFilter} onOpenContent={setOpenContentId} />
      </div>
      {openContentId && <ContentModal contentId={openContentId} onClose={() => setOpenContentId(null)} onSave={setContent} />}
      {showAdd && <AddContentModal form={addForm} setForm={setAddForm} clients={clients} campaigns={campaigns} team={team} onSave={(data) => { const newC = [...content, data]; setContent(newC); DB.set("studio_content", newC); setShowAdd(false); showToast("Conteúdo criado ✓"); }} onClose={() => setShowAdd(false)} />}
    </div>
  );

  // ── Conteúdos (Kanban) ──
  if (subpage === "studio_contents") {
    const filter = contentsFilter;
    const setFilter = setContentsFilter;
    const filtered = content.filter(c => {
      if (filter.client && c.clientId !== filter.client) return false;
      if (filter.search && !c.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
      return true;
    });
    return (
      <div>
        <div style={S.topbar}>
          <div><h1 style={S.sectionTitle}>Conteúdos</h1><p style={S.sectionSub}>{content.length} conteúdos · kanban por status</p></div>
          <div style={{ display: "flex", gap: 8 }}>
            <select style={{ ...S.select, width: "auto", minWidth: 180, height: 34, fontSize: 12 }} value={filter.client} onChange={e => setFilter(f => ({ ...f, client: e.target.value }))}>
              <option value="">Todos os clientes</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#aaa" }}>{I.search}</span>
              <input style={{ ...S.input, width: 160, paddingLeft: 26, height: 34 }} placeholder="Buscar..." value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} />
            </div>
            <button style={S.btnP} onClick={() => setShowAdd(true)}>{I.plus} Novo</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 10 }}>
          {Object.entries(CONTENT_STATUS).map(([status, cfg]) => {
            const cols = filtered.filter(c => c.status === status);
            return (
              <div key={status} style={{ background: cfg.bg, borderRadius: 14, border: `1.5px solid ${cfg.color}30`, minWidth: 220, flex: "0 0 220px", overflow: "hidden" }}>
                <div style={{ padding: "11px 14px 9px", borderBottom: `1.5px solid ${cfg.color}20`, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: cfg.color, flex: 1 }}>{cfg.dot} {cfg.label}</span>
                  <span style={{ background: cfg.color, color: "#fff", borderRadius: 99, padding: "1px 8px", fontSize: 11, fontWeight: 800 }}>{cols.length}</span>
                </div>
                <div style={{ padding: "8px 8px 10px", maxHeight: 480, overflowY: "auto", display: "flex", flexDirection: "column", gap: 7 }}>
                  {cols.map(post => {
                    const cl = studioClientColor(post.clientId);
                    const hasComments = (post.comments || []).filter(c => !c.resolved).length;
                    return (
                      <div key={post.id} onClick={() => setOpenContentId(post.id)}
                        style={{ background: "#fff", borderRadius: 9, border: `1px solid ${cl}25`, borderLeft: `3px solid ${cl}`, padding: "9px 11px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                      {/* Media thumbnail if exists */}
                      {(post.media || []).length > 0 && post.media[0].type.startsWith("image/") && (
                        <div style={{ margin: "-9px -11px 8px", height: 100, overflow: "hidden", borderRadius: "9px 9px 0 0", position: "relative" }}>
                          <img src={post.media[0].dataUrl} alt={post.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <div style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.5)", color: "#fff", borderRadius: 4, padding: "2px 5px", fontSize: 9, fontWeight: 700 }}>
                            {(post.media || []).length > 1 ? `+${(post.media || []).length} arqs` : "📸"}
                          </div>
                        </div>
                      )}
                      {(post.media || []).length > 0 && post.media[0].type.startsWith("video/") && (
                        <div style={{ margin: "-9px -11px 8px", height: 80, overflow: "hidden", borderRadius: "9px 9px 0 0", background: "#0d2233", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 28 }}>🎬</span>
                          <span style={{ color: "#fff", fontSize: 11, marginLeft: 6 }}>{post.media[0].name}</span>
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: cl, fontWeight: 700, marginBottom: 4 }}>{studioClientName(post.clientId)}</div>
                      <p style={{ fontSize: 12, fontWeight: 700, margin: "0 0 3px", lineHeight: 1.3 }}>{post.title}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "#aaa" }}>{CONTENT_TYPES[post.type] || post.type}</span>
                        <div style={{ display: "flex", gap: 5 }}>
                          {(post.media || []).length > 0 && <span style={{ fontSize: 10, background: "#f0f4ff", color: C.azulPetroleo, borderRadius: 99, padding: "1px 6px", fontWeight: 700 }}>📎 {(post.media||[]).length}</span>}
                          {hasComments > 0 && <span style={{ fontSize: 10, background: "#fff0f0", color: "#a32d2d", borderRadius: 99, padding: "1px 6px", fontWeight: 700 }}>💬 {hasComments}</span>}
                          {post.date && <span style={{ fontSize: 10, color: "#aaa" }}>📅 {new Date(post.date + "T12:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                  {cols.length === 0 && <div style={{ textAlign: "center", padding: "16px 0", color: "#ccc", fontSize: 11 }}>Vazio</div>}
                </div>
              </div>
            );
          })}
        </div>
        {openContentId && <ContentModal contentId={openContentId} onClose={() => setOpenContentId(null)} onSave={setContent} />}
        {showAdd && <AddContentModal form={addForm} setForm={setAddForm} clients={clients} campaigns={campaigns} team={team} onSave={(data) => { const newC = [...content, data]; setContent(newC); DB.set("studio_content", newC); setShowAdd(false); showToast("Conteúdo criado ✓"); }} onClose={() => setShowAdd(false)} />}
      </div>
    );
  }

  // ── Aprovações ──
  if (subpage === "studio_approvals") {
    const pending = content.filter(c => c.status === "em_revisao" || c.status === "ajustes");
    const approved = content.filter(c => c.status === "aprovado");
    return (
      <div>
        <div style={S.topbar}>
          <div><h1 style={S.sectionTitle}>Aprovações</h1><p style={S.sectionSub}><span style={{ color: "#F59E0B", fontWeight: 600 }}>{pending.length} pendentes</span> · <span style={{ color: "#10B981", fontWeight: 600 }}>{approved.length} aprovados</span></p></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={S.card}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px", color: "#F59E0B" }}>⏳ Aguardando aprovação ({pending.length})</h3>
            {pending.length === 0 ? <p style={{ fontSize: 12, color: "#aaa", textAlign: "center", padding: "20px 0" }}>Nada pendente 🎉</p> :
              pending.map(post => {
                const st = CONTENT_STATUS[post.status];
                const cl = studioClientColor(post.clientId);
                const openComments = (post.comments || []).filter(c => !c.resolved).length;
                return (
                  <div key={post.id} onClick={() => setOpenContentId(post.id)}
                    style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #f5f5f5", cursor: "pointer", alignItems: "flex-start" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: cl, marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{post.title}</p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, color: cl, fontWeight: 700 }}>{studioClientName(post.clientId)}</span>
                        <span style={{ fontSize: 10, background: st.bg, color: st.color, borderRadius: 99, padding: "1px 7px", fontWeight: 600 }}>{st.dot} {st.label}</span>
                        {openComments > 0 && <span style={{ fontSize: 10, color: "#a32d2d", fontWeight: 700 }}>💬 {openComments} comentário{openComments !== 1 ? "s" : ""}</span>}
                        {post.date && <span style={{ fontSize: 10, color: "#aaa" }}>📅 {new Date(post.date + "T12:00").toLocaleDateString("pt-BR")}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          <div style={S.card}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px", color: "#10B981" }}>✅ Aprovados ({approved.length})</h3>
            {approved.length === 0 ? <p style={{ fontSize: 12, color: "#aaa", textAlign: "center", padding: "20px 0" }}>Nenhum ainda</p> :
              approved.map(post => (
                <div key={post.id} onClick={() => setOpenContentId(post.id)}
                  style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}>
                  <span style={{ fontSize: 16 }}>✅</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, margin: "0 0 1px" }}>{post.title}</p>
                    <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{studioClientName(post.clientId)} · {post.approvedBy ? `Aprovado por ${post.approvedBy}` : ""}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
        {openContentId && <ContentModal contentId={openContentId} onClose={() => setOpenContentId(null)} onSave={setContent} />}
      </div>
    );
  }

  // ── Clientes ──
  if (subpage === "studio_clients") {
    return (
      <div>
        <div style={S.topbar}>
          <div><h1 style={S.sectionTitle}>Clientes</h1><p style={S.sectionSub}>{clients2.length} clientes · workspaces separados</p></div>
          <button style={S.btnP} onClick={() => setShowAddClient(true)}>{I.plus} Novo cliente</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
          {clients2.map(cl => {
            const clContent = content.filter(c => c.clientId === cl.id);
            const pending = clContent.filter(c => c.status === "em_revisao" || c.status === "ajustes").length;
            return (
              <div key={cl.id} style={{ ...S.card, borderLeft: `4px solid ${cl.color}`, cursor: "pointer" }}
                onClick={() => { setClientFilter(cl.id); onNav("studio_calendar"); }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: cl.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>{cl.avatar || cl.name[0]}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, margin: "0 0 2px" }}>{cl.name}</p>
                    <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{clContent.length} conteúdo{clContent.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                {cl.notes && <p style={{ fontSize: 11, color: "#888", margin: "0 0 8px" }}>{cl.notes}</p>}
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, background: "#f0faf4", color: "#0f6e56", borderRadius: 99, padding: "2px 9px", fontWeight: 600 }}>{clContent.filter(c => c.status === "aprovado").length} aprovados</span>
                  {pending > 0 && <span style={{ fontSize: 11, background: "#fff9ec", color: "#92400e", borderRadius: 99, padding: "2px 9px", fontWeight: 600 }}>{pending} pendentes</span>}
                  <span style={{ fontSize: 11, background: "#f7f7f5", color: "#555", borderRadius: 99, padding: "2px 9px" }}>{clContent.filter(c => c.status === "publicado").length} publicados</span>
                </div>
              </div>
            );
          })}
        </div>
        {showAddClient && (
          <div style={S.modal} onClick={() => setShowAddClient(false)}>
            <div style={{ ...S.modalBox, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 16px" }}>Novo Cliente</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                <div><label style={S.lbl}>Nome *</label><input style={S.input} value={clientForm.name} onChange={e => setClientForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><label style={S.lbl}>Cor do cliente</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["#1B6B8A","#7153A2","#4CAF82","#E67E22","#E74C3C","#3498DB","#27AE60","#8E44AD","#F39C12"].map(col => (
                      <div key={col} onClick={() => setClientForm(f => ({ ...f, color: col }))}
                        style={{ width: 28, height: 28, borderRadius: 7, background: col, cursor: "pointer", border: clientForm.color === col ? "3px solid #1a1a1a" : "2px solid transparent" }} />
                    ))}
                  </div>
                </div>
                <div><label style={S.lbl}>Observações</label><textarea style={{ ...S.input, height: 70 }} value={clientForm.notes} onChange={e => setClientForm(f => ({ ...f, notes: e.target.value }))} /></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={S.btnP} onClick={() => {
                  if (!clientForm.name) return alert("Nome é obrigatório");
                  const newC = [...clients2, { ...clientForm, id: `cl_${Date.now()}`, avatar: clientForm.name.slice(0, 2).toUpperCase(), active: true }];
                  setClients2(newC); DB.set("studio_clients", newC); setShowAddClient(false); showToast("Cliente criado ✓");
                }}>Criar cliente</button>
                <button style={S.btnO} onClick={() => setShowAddClient(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Campanhas ──
  if (subpage === "studio_campaigns") {
    return (
      <div>
        <div style={S.topbar}>
          <div><h1 style={S.sectionTitle}>Campanhas</h1><p style={S.sectionSub}>{camps.length} campanhas · agrupamento de conteúdos</p></div>
          <button style={S.btnP} onClick={() => {
            const name = prompt("Nome da campanha:");
            if (!name) return;
            const clientId = clients[0]?.id || "partic";
            const newC = [...camps, { id: `camp_${Date.now()}`, name, clientId, color: C.azulPetroleo, active: true }];
            setCamps(newC); DB.set("studio_campaigns", newC); showToast("Campanha criada ✓");
          }}>{I.plus} Nova campanha</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
          {camps.map(camp => {
            const campContent = content.filter(c => c.campaignId === camp.id);
            const cl = clients.find(c => c.id === camp.clientId);
            return (
              <div key={camp.id} style={{ ...S.card, borderLeft: `4px solid ${camp.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 3px" }}>{camp.name}</p>
                    {cl && <span style={{ fontSize: 11, background: cl.color + "20", color: cl.color, borderRadius: 99, padding: "1px 8px", fontWeight: 600 }}>{cl.name}</span>}
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: camp.color }}>{campContent.length}</span>
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {Object.entries(CONTENT_STATUS).map(([k, v]) => {
                    const n = campContent.filter(c => c.status === k).length;
                    return n > 0 ? <span key={k} style={{ fontSize: 10, background: v.bg, color: v.color, borderRadius: 99, padding: "1px 7px", fontWeight: 600 }}>{v.dot} {n}</span> : null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Biblioteca ──
  if (subpage === "studio_library") {
    const TYPE_LABELS = { logo: "🎨 Logo", foto: "📷 Foto", video: "🎬 Vídeo", template: "📐 Template", identidade: "🎯 Identidade Visual", outro: "📁 Outro" };
    return (
      <div>
        <div style={S.topbar}>
          <div><h1 style={S.sectionTitle}>Biblioteca</h1><p style={S.sectionSub}>Logos, fotos, templates e materiais</p></div>
          <button style={S.btnP} onClick={() => {
            const name = prompt("Nome do material:"); if (!name) return;
            const type = "outro";
            const newL = [...lib, { id: `l_${Date.now()}`, name, type, clientId: "partic", url: "", notes: "" }];
            setLib(newL); DB.set("studio_library", newL); showToast("Material adicionado ✓");
          }}>{I.plus} Adicionar material</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.entries(
            lib.reduce((acc, item) => { const cl = studioClientName(item.clientId); acc[cl] = acc[cl] || []; acc[cl].push(item); return acc; }, {})
          ).map(([clientName, items]) => (
            <div key={clientName} style={S.card}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px", color: C.azulPetroleo }}>📂 {clientName}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
                {items.map(item => (
                  <div key={item.id} style={{ background: "#f7f7f5", borderRadius: 8, padding: "10px 12px", border: "1px solid #e5e5e5" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: "#888", margin: "0 0 4px" }}>{TYPE_LABELS[item.type] || item.type}</p>
                    {item.notes && <p style={{ fontSize: 10, color: "#aaa", margin: 0 }}>{item.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {lib.length === 0 && <div style={{ ...S.card, textAlign: "center", padding: "40px 20px", color: "#aaa" }}>Biblioteca vazia. Adicione logos, fotos e materiais.</div>}
        </div>
      </div>
    );
  }

  // ── Equipe ──
  if (subpage === "studio_team") {
    return (
      <div>
        <div style={S.topbar}>
          <div><h1 style={S.sectionTitle}>Equipe</h1><p style={S.sectionSub}>{teamState.length} colaboradores</p></div>
          <button style={S.btnP} onClick={() => {
            const name = prompt("Nome do colaborador:"); if (!name) return;
            const role = "criacao";
            const newT = [...teamState, { id: `t_${Date.now()}`, name, role, email: "", canApprove: false }];
            setTeamState(newT); DB.set("studio_team", newT); showToast("Colaborador adicionado ✓");
          }}>{I.plus} Adicionar colaborador</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
          {teamState.map(member => {
            const myContent = content.filter(c => c.responsibleId === member.id);
            const pending = myContent.filter(c => c.status === "em_producao" || c.status === "em_revisao" || c.status === "ajustes").length;
            return (
              <div key={member.id} style={{ ...S.card, borderLeft: `3px solid ${ROLE_COLORS[member.role] || "#888"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Avatar name={member.name} size={40} fixed />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{member.name}</p>
                    <span style={{ fontSize: 11, background: ROLE_COLORS[member.role] + "20", color: ROLE_COLORS[member.role], borderRadius: 99, padding: "1px 8px", fontWeight: 600 }}>
                      {ROLE_LABELS[member.role] || member.role}
                    </span>
                    {member.canApprove && <span style={{ marginLeft: 5, fontSize: 10, background: "#f0faf4", color: "#0f6e56", borderRadius: 99, padding: "1px 6px" }}>✓ Pode aprovar</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, background: "#f7f7f5", borderRadius: 7, padding: "6px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.azulPetroleo }}>{myContent.length}</div>
                    <div style={{ fontSize: 10, color: "#888" }}>total</div>
                  </div>
                  <div style={{ flex: 1, background: "#fff9ec", borderRadius: 7, padding: "6px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#F59E0B" }}>{pending}</div>
                    <div style={{ fontSize: 10, color: "#888" }}>em aberto</div>
                  </div>
                  <div style={{ flex: 1, background: "#f0faf4", borderRadius: 7, padding: "6px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#10B981" }}>{myContent.filter(c => c.status === "publicado").length}</div>
                    <div style={{ fontSize: 10, color: "#888" }}>publicados</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Histórico ──
  if (subpage === "studio_history") {

    const MONTHS_H = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

    // Build year list from content dates
    const years = [...new Set(content.map(c => c.date ? new Date(c.date).getFullYear() : null).filter(Boolean))].sort((a,b) => b-a);
    if (!years.includes(new Date().getFullYear())) years.unshift(new Date().getFullYear());

    // Filter content for selected year + optional month + optional client
    const histFiltered = content.filter(c => {
      if (!c.date) return false;
      const d = new Date(c.date);
      if (d.getFullYear() !== selYear) return false;
      if (selMonth !== null && d.getMonth() !== selMonth) return false;
      if (selClientH && c.clientId !== selClientH) return false;
      return true;
    });

    // Group by month
    const byMonth = MONTHS_H.map((name, idx) => ({
      name, idx,
      posts: content.filter(c => {
        if (!c.date) return false;
        const d = new Date(c.date);
        return d.getFullYear() === selYear && d.getMonth() === idx &&
               (!selClientH || c.clientId === selClientH);
      }),
    })).filter(m => m.posts.length > 0 || selMonth === m.idx);

    return (
      <div>
        <div style={S.topbar}>
          <div>
            <h1 style={S.sectionTitle}>Histórico</h1>
            <p style={S.sectionSub}>Todos os conteúdos publicados e planejados por mês e ano</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select style={{ ...S.select, width: "auto", minWidth: 160, height: 34, fontSize: 12 }}
              value={selClientH} onChange={e => setSelClientH(e.target.value)}>
              <option value="">Todos os clientes</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Year selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#888", fontWeight: 600, marginRight: 4 }}>Ano:</span>
          {years.map(y => (
            <button key={y} onClick={() => { setSelYear(y); setSelMonth(null); }}
              style={{ padding: "5px 14px", fontSize: 13, fontWeight: selYear === y ? 800 : 400, borderRadius: 8, border: selYear === y ? `2px solid ${C.azulPetroleo}` : "1px solid #ddd", background: selYear === y ? C.azulPetroleo + "12" : "#fff", color: selYear === y ? C.azulPetroleo : "#555", cursor: "pointer" }}>
              {y}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, alignItems: "start" }}>
          {/* Month list */}
          <div style={{ ...S.card, padding: "10px 0" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", padding: "0 14px", margin: "0 0 8px" }}>Meses em {selYear}</p>
            <button onClick={() => setSelMonth(null)}
              style={{ width: "100%", padding: "8px 14px", textAlign: "left", background: selMonth === null ? C.azulPetroleo + "12" : "transparent", color: selMonth === null ? C.azulPetroleo : "#555", border: "none", borderLeft: selMonth === null ? `3px solid ${C.azulPetroleo}` : "3px solid transparent", cursor: "pointer", fontSize: 13, fontWeight: selMonth === null ? 700 : 400, display: "flex", justifyContent: "space-between" }}>
              <span>Todos os meses</span>
              <span style={{ fontSize: 11, color: selMonth === null ? C.azulPetroleo : "#aaa", fontWeight: 700 }}>{content.filter(c => c.date && new Date(c.date).getFullYear() === selYear && (!selClientH || c.clientId === selClientH)).length}</span>
            </button>
            {MONTHS_H.map((name, idx) => {
              const monthPosts = content.filter(c => {
                if (!c.date) return false;
                const d = new Date(c.date);
                return d.getFullYear() === selYear && d.getMonth() === idx && (!selClientH || c.clientId === selClientH);
              });
              if (monthPosts.length === 0) return null;
              const published = monthPosts.filter(c => c.status === "publicado").length;
              return (
                <button key={idx} onClick={() => setSelMonth(idx)}
                  style={{ width: "100%", padding: "8px 14px", textAlign: "left", background: selMonth === idx ? C.azulPetroleo + "12" : "transparent", color: selMonth === idx ? C.azulPetroleo : "#555", border: "none", borderLeft: selMonth === idx ? `3px solid ${C.azulPetroleo}` : "3px solid transparent", cursor: "pointer", fontSize: 13, fontWeight: selMonth === idx ? 700 : 400 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{name}</span>
                    <span style={{ fontSize: 11, color: selMonth === idx ? C.azulPetroleo : "#aaa", fontWeight: 700 }}>{monthPosts.length}</span>
                  </div>
                  {published > 0 && (
                    <div style={{ fontSize: 10, color: "#10B981", marginTop: 1 }}>✓ {published} publicado{published !== 1 ? "s" : ""}</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content list */}
          <div>
            <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: C.azulPetroleo }}>
                {selMonth !== null ? MONTHS_H[selMonth] : "Todos os meses"} · {selYear}
              </h3>
              <span style={{ fontSize: 12, color: "#aaa" }}>{histFiltered.length} conteúdo{histFiltered.length !== 1 ? "s" : ""}</span>
            </div>

            {histFiltered.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", padding: "48px 20px", color: "#aaa" }}>
                <p style={{ fontSize: 32, margin: "0 0 8px" }}>📅</p>
                <p style={{ margin: 0 }}>Nenhum conteúdo neste período</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {histFiltered
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map(post => {
                    const st = CONTENT_STATUS[post.status] || CONTENT_STATUS.em_producao;
                    const cl = studioClientColor(post.clientId);
                    const hasMedia = (post.media || []).length > 0;
                    const openComments = (post.comments || []).filter(c => !c.resolved).length;
                    return (
                      <div key={post.id} onClick={() => setOpenContentId(post.id)}
                        style={{ ...S.card, padding: "12px 16px", cursor: "pointer", borderLeft: `3px solid ${cl}`, display: "flex", alignItems: "center", gap: 14 }}>
                        {/* Thumbnail */}
                        {hasMedia && post.media[0].type.startsWith("image/") ? (
                          <img src={post.media[0].dataUrl} alt={post.title}
                            style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 54, height: 54, borderRadius: 8, background: cl + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>
                            {CONTENT_TYPES[post.type]?.split(" ")[0] || "📄"}
                          </div>
                        )}
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{post.title}</span>
                            <span style={{ fontSize: 10, background: st.bg, color: st.color, borderRadius: 99, padding: "1px 7px", fontWeight: 600 }}>{st.dot} {st.label}</span>
                          </div>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 11, color: cl, fontWeight: 600 }}>{studioClientName(post.clientId)}</span>
                            <span style={{ fontSize: 11, color: "#aaa" }}>{CONTENT_TYPES[post.type] || post.type}</span>
                            <span style={{ fontSize: 11, color: "#aaa" }}>📅 {new Date(post.date + "T12:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                            {studioCampaignName(post.campaignId) && <span style={{ fontSize: 11, color: "#aaa" }}>📣 {studioCampaignName(post.campaignId)}</span>}
                            {hasMedia && <span style={{ fontSize: 11, color: C.azulPetroleo }}>📎 {(post.media||[]).length} arquivo{(post.media||[]).length !== 1 ? "s" : ""}</span>}
                            {openComments > 0 && <span style={{ fontSize: 11, color: "#EF4444" }}>💬 {openComments}</span>}
                          </div>
                        </div>
                        {/* Aprovado por */}
                        {post.approvedBy && (
                          <div style={{ fontSize: 11, color: "#10B981", textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontWeight: 700 }}>✓ Aprovado</div>
                            <div style={{ color: "#aaa" }}>por {post.approvedBy}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
            {openContentId && <ContentModal contentId={openContentId} onClose={() => setOpenContentId(null)} onSave={setContent} />}
          </div>
        </div>
      </div>
    );
  }

  // ── Default: dashboard do studio ──
  const totalContent = content.length;
  const pendingApproval = content.filter(c => c.status === "em_revisao" || c.status === "ajustes").length;
  const publishedThisMonth = content.filter(c => {
    if (c.status !== "publicado" || !c.publishedAt) return false;
    const d = new Date(c.publishedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div>
      <div style={S.topbar}>
        <div><h1 style={S.sectionTitle}>Studio PARTIC</h1><p style={S.sectionSub}>Hub operacional de marketing e conteúdo</p></div>
        <button style={S.btnP} onClick={() => onNav("studio_calendar")}>{I.calendar} Ver Calendário</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Total de conteúdos", value: totalContent, color: C.azulPetroleo, icon: "📄" },
          { label: "Aguardando aprovação", value: pendingApproval, color: "#F59E0B", icon: "⏳" },
          { label: "Publicados este mês", value: publishedThisMonth, color: "#10B981", icon: "🚀" },
          { label: "Clientes ativos", value: clients.filter(c => c.active).length, color: C.roxo, icon: "👥" },
        ].map(k => (
          <div key={k.label} style={{ ...S.card, borderLeft: `3px solid ${k.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 11, color: "#888", margin: "0 0 4px" }}>{k.label}</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: k.color, margin: 0, lineHeight: 1 }}>{k.value}</p>
              </div>
              <span style={{ fontSize: 24 }}>{k.icon}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={S.card}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>⏳ Pendentes de aprovação</h3>
          {content.filter(c => c.status === "em_revisao" || c.status === "ajustes").slice(0, 5).map(post => {
            const st = CONTENT_STATUS[post.status];
            const cl = studioClientColor(post.clientId);
            return (
              <div key={post.id} onClick={() => { setOpenContentId(post.id); }}
                style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid #f5f5f5", cursor: "pointer", alignItems: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: cl, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</p>
                  <p style={{ fontSize: 10, color: "#aaa", margin: 0 }}>{studioClientName(post.clientId)}</p>
                </div>
                <span style={{ fontSize: 10, background: st.bg, color: st.color, borderRadius: 99, padding: "1px 7px", fontWeight: 600 }}>{st.dot} {st.label}</span>
              </div>
            );
          })}
          {pendingApproval === 0 && <p style={{ fontSize: 12, color: "#aaa", textAlign: "center", padding: "16px 0" }}>Nada pendente 🎉</p>}
        </div>
        <div style={S.card}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>📊 Por status</h3>
          {Object.entries(CONTENT_STATUS).map(([k, v]) => {
            const n = content.filter(c => c.status === k).length;
            const pct = totalContent > 0 ? Math.round((n / totalContent) * 100) : 0;
            return (
              <div key={k} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 11, color: v.color, fontWeight: 600 }}>{v.dot} {v.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: v.color }}>{n}</span>
                </div>
                <div style={{ height: 5, background: "#f0f0f0", borderRadius: 99 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: v.color, borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {openContentId && <ContentModal contentId={openContentId} onClose={() => setOpenContentId(null)} onSave={setContent} />}
    </div>
  );
}

// ── Add content modal (shared) ──
function AddContentModal({ form, setForm, clients, campaigns, team, onSave, onClose }) {
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 18px" }}>Novo Conteúdo</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div style={{ gridColumn: "1/-1" }}><label style={S.lbl}>Título *</label><input style={S.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div><label style={S.lbl}>Tipo</label>
            <select style={S.select} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {Object.entries(CONTENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label style={S.lbl}>Cliente</label>
            <select style={S.select} value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label style={S.lbl}>Campanha</label>
            <select style={S.select} value={form.campaignId} onChange={e => setForm(f => ({ ...f, campaignId: e.target.value }))}>
              <option value="">Sem campanha</option>
              {campaigns.filter(c => !form.clientId || c.clientId === form.clientId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label style={S.lbl}>Data de publicação</label><input style={S.input} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
          <div><label style={S.lbl}>Responsável</label>
            <select style={S.select} value={form.responsibleId} onChange={e => setForm(f => ({ ...f, responsibleId: e.target.value }))}>
              <option value="">Sem responsável</option>
              {team.map(t => <option key={t.id} value={t.id}>{t.name} ({ROLE_LABELS[t.role]})</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}><label style={S.lbl}>Briefing</label><textarea style={{ ...S.input, height: 70, resize: "none" }} value={form.briefing} onChange={e => setForm(f => ({ ...f, briefing: e.target.value }))} /></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.btnP} onClick={() => {
            if (!form.title) return alert("Título é obrigatório");
            onSave({ ...form, id: `p_${Date.now()}`, comments: [], createdAt: new Date().toISOString() });
          }}>Criar conteúdo</button>
          <button style={S.btnO} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ─── CENTRAL OPERACIONAL ──────────────────────────────────────────────────────
function CentralOperacional() {
  const [tasks, setTasks] = useState(() => DB.get("tasks", []));
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterResp, setFilterResp] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [tab, setTab] = useState("active"); // active | archive
  const [form, setForm] = useState({ title: "", desc: "", responsible: "", date: "", priority: "media", notes: "", status: "pendente" });

  const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  const STATUS_CFG = {
    pendente:    { label: "Pendente",      color: "#EF4444", bg: "#FFF5F5", dot: "🔴" },
    andamento:   { label: "Em Andamento",  color: "#F59E0B", bg: "#FFFBEB", dot: "🟡" },
    concluida:   { label: "Concluída",     color: "#10B981", bg: "#F0FDF4", dot: "🟢" },
  };

  const PRIORITY_CFG = {
    alta:  { label: "Alta",   color: "#EF4444" },
    media: { label: "Média",  color: "#F59E0B" },
    baixa: { label: "Baixa",  color: "#10B981" },
  };

  const save = t => { setTasks(t); DB.set("tasks", t); };

  const activeTasks = tasks.filter(t => t.status !== "concluida");
  const archivedTasks = tasks.filter(t => t.status === "concluida");

  const responsibles = [...new Set(tasks.map(t => t.responsible).filter(Boolean))];

  const applyFilters = list => list.filter(t => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterResp && t.responsible !== filterResp) return false;
    if (filterMonth && t.date) {
      const d = new Date(t.date + "T12:00");
      const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
      if (key !== filterMonth) return false;
    }
    return true;
  });

  const displayTasks = applyFilters(tab === "active" ? activeTasks : archivedTasks)
    .sort((a, b) => {
      const pOrder = { alta: 0, media: 1, baixa: 2 };
      return (pOrder[a.priority] || 1) - (pOrder[b.priority] || 1);
    });

  function addTask() {
    if (!form.title.trim()) return alert("Título é obrigatório");
    save([...tasks, { ...form, id: Date.now() + Math.random(), createdAt: new Date().toISOString() }]);
    setShowAdd(false);
    setForm({ title: "", desc: "", responsible: "", date: "", priority: "media", notes: "", status: "pendente" });
    showToast("Tarefa criada ✓");
  }

  function updateStatus(id, status) {
    save(tasks.map(t => t.id === id ? { ...t, status, concludedAt: status === "concluida" ? new Date().toISOString() : null } : t));
    if (status === "concluida") showToast("Tarefa concluída! ✓");
  }

  function deleteTask(id) {
    if (!confirm("Excluir esta tarefa?")) return;
    save(tasks.filter(t => t.id !== id));
  }

  const pendentes = activeTasks.filter(t => t.status === "pendente").length;
  const andamento = activeTasks.filter(t => t.status === "andamento").length;

  return (
    <div>
      <div style={S.topbar}>
        <div>
          <h1 style={S.sectionTitle}>Central Operacional</h1>
          <p style={S.sectionSub}>
            <span style={{ color: "#EF4444", fontWeight: 600 }}>{pendentes} pendentes</span> ·{" "}
            <span style={{ color: "#F59E0B", fontWeight: 600 }}>{andamento} em andamento</span> ·{" "}
            <span style={{ color: "#aaa" }}>{archivedTasks.length} concluídas</span>
          </p>
        </div>
        <button style={S.btnP} onClick={() => setShowAdd(true)}>{I.plus} Nova tarefa</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e5e5", marginBottom: 14 }}>
        {[{ id: "active", label: "Ativas (" + activeTasks.length + ")" }, { id: "archive", label: "Concluídas (" + archivedTasks.length + ")" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "7px 18px", fontSize: 13, fontWeight: tab === t.id ? 700 : 400, cursor: "pointer", background: "none", border: "none", borderBottom: tab === t.id ? "2px solid " + C.azulPetroleo : "2px solid transparent", color: tab === t.id ? C.azulPetroleo : "#aaa", marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <select style={{ ...S.select, width: "auto", minWidth: 150, height: 34, fontSize: 12 }}
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Todos os status</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.dot} {v.label}</option>)}
        </select>
        <select style={{ ...S.select, width: "auto", minWidth: 160, height: 34, fontSize: 12 }}
          value={filterResp} onChange={e => setFilterResp(e.target.value)}>
          <option value="">Todos os responsáveis</option>
          {responsibles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {tab === "archive" && (
          <input type="month" style={{ ...S.input, width: "auto", height: 34, fontSize: 12 }}
            value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
        )}
        {(filterStatus !== "all" || filterResp || filterMonth) && (
          <button style={{ ...S.btnO, height: 30, fontSize: 11 }} onClick={() => { setFilterStatus("all"); setFilterResp(""); setFilterMonth(""); }}>✕ Limpar</button>
        )}
        <span style={{ fontSize: 11, color: "#aaa", marginLeft: "auto" }}>{displayTasks.length} tarefa{displayTasks.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Task grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {displayTasks.map(task => {
          const st = STATUS_CFG[task.status] || STATUS_CFG.pendente;
          const pr = PRIORITY_CFG[task.priority] || PRIORITY_CFG.media;
          const isOverdue = task.date && task.status !== "concluida" && new Date(task.date + "T23:59") < new Date();
          return (
            <div key={task.id} style={{ ...S.card, padding: "14px 16px", borderLeft: "3px solid " + st.color, opacity: task.status === "concluida" ? 0.7 : 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{task.title}</span>
                    <span style={{ fontSize: 10, background: st.bg, color: st.color, borderRadius: 99, padding: "1px 8px", fontWeight: 600 }}>{st.dot} {st.label}</span>
                    <span style={{ fontSize: 10, background: pr.color + "15", color: pr.color, borderRadius: 99, padding: "1px 8px", fontWeight: 600 }}>⚡ {pr.label}</span>
                    {isOverdue && <span style={{ fontSize: 10, background: "#fff0f0", color: "#a32d2d", borderRadius: 99, padding: "1px 8px", fontWeight: 700 }}>⚠ Atrasada</span>}
                  </div>
                  {task.desc && <p style={{ fontSize: 12, color: "#555", margin: "0 0 6px", lineHeight: 1.5 }}>{task.desc}</p>}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11, color: "#888" }}>
                    {task.responsible && <span>👤 {task.responsible}</span>}
                    {task.date && <span style={{ color: isOverdue ? "#EF4444" : "#888", fontWeight: isOverdue ? 700 : 400 }}>
                      📅 {new Date(task.date + "T12:00").toLocaleDateString("pt-BR")}
                    </span>}
                    {task.notes && <span>📝 {task.notes}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {task.status === "pendente" && (
                    <button onClick={() => updateStatus(task.id, "andamento")}
                      style={{ fontSize: 11, background: "#fff9ec", color: "#92400e", border: "1px solid #fde68a", borderRadius: 6, padding: "4px 9px", cursor: "pointer" }}>
                      🟡 Iniciar
                    </button>
                  )}
                  {task.status === "andamento" && (
                    <button onClick={() => updateStatus(task.id, "concluida")}
                      style={{ fontSize: 11, background: "#f0faf4", color: "#0f6e56", border: "1px solid #a7f0d8", borderRadius: 6, padding: "4px 9px", cursor: "pointer", fontWeight: 700 }}>
                      ✓ Concluir
                    </button>
                  )}
                  {task.status === "concluida" && (
                    <button onClick={() => updateStatus(task.id, "pendente")}
                      style={{ fontSize: 11, background: "#f7f7f5", color: "#888", border: "1px solid #e5e5e5", borderRadius: 6, padding: "4px 9px", cursor: "pointer" }}>
                      ↩ Reabrir
                    </button>
                  )}
                  <button onClick={() => deleteTask(task.id)}
                    style={{ fontSize: 11, background: "#fff0f0", color: "#a32d2d", border: "1px solid #fca5a5", borderRadius: 6, padding: "4px 7px", cursor: "pointer" }}>
                    {I.trash}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {displayTasks.length === 0 && (
          <div style={{ ...S.card, textAlign: "center", padding: "48px 20px", color: "#aaa" }}>
            <p style={{ fontSize: 32, margin: "0 0 8px" }}>✅</p>
            <p style={{ margin: 0 }}>{tab === "active" ? "Nenhuma tarefa ativa. Clique em Nova tarefa para começar." : "Nenhuma tarefa concluída ainda."}</p>
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div style={S.modal} onClick={() => setShowAdd(false)}>
          <div style={{ ...S.modalBox, maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 18px" }}>Nova Tarefa</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <div><label style={S.lbl}>Título *</label><input style={S.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Ligar para Dr. João" /></div>
              <div><label style={S.lbl}>Descrição</label><textarea style={{ ...S.input, height: 70, resize: "none" }} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={S.lbl}>Responsável</label><input style={S.input} value={form.responsible} onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))} placeholder="Nome da pessoa" /></div>
                <div><label style={S.lbl}>Data</label><input type="date" style={S.input} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div><label style={S.lbl}>Prioridade</label>
                  <select style={S.select} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="alta">🔴 Alta</option>
                    <option value="media">🟡 Média</option>
                    <option value="baixa">🟢 Baixa</option>
                  </select>
                </div>
                <div><label style={S.lbl}>Status inicial</label>
                  <select style={S.select} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="pendente">🔴 Pendente</option>
                    <option value="andamento">🟡 Em Andamento</option>
                  </select>
                </div>
              </div>
              <div><label style={S.lbl}>Observações</label><input style={S.input} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btnP} onClick={addTask}>Criar tarefa</button>
              <button style={S.btnO} onClick={() => setShowAdd(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      )}
    </div>
  );
}


// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ page, onNav, user }) {
  const _sidebarContacts = DB.get("contacts", []);
  const inEval = _sidebarContacts.filter(c => c.stage === "curadoria_avaliacao").length;
  const [membersOpen, setMembersOpen] = useState(["members", "anchors", "member_pipeline"].includes(page));
  const [studioOpen, setStudioOpen] = useState(page.startsWith("studio"));

  const NavItem = ({ id, label, icon, badge, indent = false }) => (
    <button style={{ ...S.navItem(page === id), paddingLeft: indent ? 32 : 14 }} onClick={() => onNav(id)}>
      <span style={{ flexShrink: 0, opacity: indent ? 0.85 : 1 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: indent ? 12 : 13 }}>{label}</span>
      {badge > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{badge}</span>}
    </button>
  );

  const navItemStyle = (active) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", margin: "1px 6px",
    borderRadius: 8, cursor: "pointer", color: active ? C.verdeMedio : "rgba(255,255,255,0.65)",
    background: active ? "rgba(76,175,130,0.15)" : "transparent", fontWeight: active ? 600 : 400,
    fontSize: 13, transition: "all .15s", border: "none", width: "calc(100% - 12px)", textAlign: "left",
  });

  return (
    <div style={S.sidebar}>
      <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Logo dark size="md" />
      </div>

      <div style={{ flex: 1, padding: "6px 0", overflowY: "auto" }}>
        {[
          { id: "dashboard", label: "Dashboard", icon: I.dashboard },
          { id: "leads", label: "Leads", icon: I.leads },
          { id: "curadoria", label: "Curadoria", icon: I.curadoria, badge: inEval },
          { id: "comercial", label: "Comercial", icon: I.comercial },
          { id: "calendar", label: "Calendário", icon: I.calendar },
        ].map(item => (
          <button key={item.id} style={navItemStyle(page === item.id)} onClick={() => onNav(item.id)}>
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{item.badge}</span>}
          </button>
        ))}

        {/* Membros com submenu */}
        <button style={navItemStyle(["members", "anchors", "member_pipeline"].includes(page))} onClick={() => { setMembersOpen(o => !o); if (!membersOpen) onNav("members"); }}>
          <span style={{ flexShrink: 0 }}>{I.members}</span>
          <span style={{ flex: 1 }}>Membros</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", transition: "transform .2s", transform: membersOpen ? "rotate(90deg)" : "none" }}>{I.chev}</span>
        </button>
        {membersOpen && (
          <div style={{ marginLeft: 12, paddingLeft: 10, borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
            {[
              { id: "members", label: "Todos Membros", icon: I.members },
              { id: "anchors", label: "Âncoras", icon: I.anchor },
              { id: "member_pipeline", label: "Pipeline", icon: I.pipeline },
            ].map(item => (
              <button key={item.id} style={{ ...navItemStyle(page === item.id), fontSize: 12, padding: "7px 12px", margin: "1px 4px", width: "calc(100% - 8px)" }} onClick={() => onNav(item.id)}>
                <span style={{ flexShrink: 0, opacity: 0.85 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {[
          { id: "mapeamento", label: "Mapeamento", icon: I.map },

          { id: "scripts", label: "Scripts Operacionais", icon: I.scripts },
          { id: "importacao", label: "Importação", icon: I.upload },
          { id: "arquivo", label: "Arquivo", icon: I.arquivo },

          { id: "central", label: "Central Operacional", icon: I.task },
          { id: "settings", label: "Configurações", icon: I.settings },
        ].map(item => (
          <button key={item.id} style={navItemStyle(page === item.id)} onClick={() => onNav(item.id)}>
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
          </button>
        ))}

        {/* Studio PARTIC submenu */}
        <div style={{ margin: "4px 6px 0", height: "1px", background: "rgba(255,255,255,0.08)" }} />
        <button style={{ ...navItemStyle(page.startsWith("studio")), marginTop: 4 }} onClick={() => { setStudioOpen(o => !o); if (!studioOpen) onNav("studio"); }}>
          <span style={{ flexShrink: 0 }}>{I.studio}</span>
          <span style={{ flex: 1, fontWeight: 700 }}>Studio PARTIC</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", transition: "transform .2s", transform: studioOpen ? "rotate(90deg)" : "none" }}>{I.chev}</span>
        </button>
        {studioOpen && (
          <div style={{ marginLeft: 12, paddingLeft: 10, borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
            {[
              { id: "studio", label: "Visão Geral", icon: I.dashboard },
              { id: "studio_calendar", label: "Calendário", icon: I.calendar },
              { id: "studio_contents", label: "Conteúdos", icon: I.leads },
              { id: "studio_approvals", label: "Aprovações", icon: I.curadoria },
              { id: "studio_clients", label: "Clientes", icon: I.members },
              { id: "studio_campaigns", label: "Campanhas", icon: I.comercial },
              { id: "studio_library", label: "Biblioteca", icon: I.map },
              { id: "studio_team", label: "Equipe", icon: I.users },
              { id: "studio_history", label: "Histórico", icon: I.arquivo },
            ].map(item => (
              <button key={item.id} style={{ ...navItemStyle(page === item.id), fontSize: 12, padding: "7px 12px", margin: "1px 4px", width: "calc(100% - 8px)" }} onClick={() => onNav(item.id)}>
                <span style={{ flexShrink: 0, opacity: 0.85 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={user?.name} size={26} fixed />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0 }}>{user?.role === "admin" ? "Admin" : "Usuário"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DIAGNÓSTICO ──────────────────────────────────────────────────────────────
const DIAG_Q = [
  { id: "type", q: "Que tipo de negócio você gerencia?", opts: ["Consultório médico solo", "Clínica multiprofissional", "Rede de clínicas", "Clínica odontológica", "Outro"] },
  { id: "size", q: "Quantos profissionais atendem?", opts: ["Apenas eu", "2 a 5 profissionais", "6 a 15 profissionais", "Mais de 15"] },
  { id: "patients", q: "Como chegam seus pacientes hoje?", opts: ["Indicação", "Instagram", "Google / SEO", "Planos de saúde", "Múltiplos canais"] },
  { id: "pain", q: "Qual sua maior dificuldade?", opts: ["Converter contato em consulta", "Fazer pacientes voltarem", "Organizar contatos e agenda", "Montar equipe de qualidade", "Crescimento e faturamento"] },
  { id: "attendance", q: "Modelo de atendimento?", opts: ["100% particular", "Particular + convênio", "100% convênio", "Online e presencial"] },
];

function Diagnostic({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [gen, setGen] = useState(false);

  function answer(val) {
    const q = DIAG_Q[step - 1];
    const na = { ...answers, [q.id]: val };
    setAnswers(na);
    if (step < DIAG_Q.length) setStep(step + 1);
    else { setGen(true); setTimeout(() => { setGen(false); setDone(true); }, 1800); }
  }

  function accept() {
    const pipelines = [{ id: Date.now(), name: "Primeiro Contato", color: "#3B82F6", stages: ["Contato feito", "Resposta recebida", "Reunião agendada", "Convertido"], createdAt: new Date().toISOString(), items: [] }, { id: Date.now() + 1, name: "Reativação de Leads", color: "#F59E0B", stages: ["Identificado", "Contato feito", "Retorno agendado", "Reativado"], createdAt: new Date().toISOString(), items: [] }];
    DB.set("member_pipelines", [...(DB.get("member_pipelines", [])), ...pipelines]);
    DB.set("diagnosticDone", true);
    showToast("Pipelines criados com sucesso! 🎉");
    onComplete();
  }

  if (step === 0) return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg,${C.noite},${C.azulPetroleo})`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>🧠</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.azulPetroleo, margin: "0 0 10px" }}>Diagnóstico Inteligente</h2>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, margin: "0 0 24px" }}>Responda 5 perguntas e criaremos os pipelines ideais para o seu negócio.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button style={S.btnP} onClick={() => setStep(1)}>Começar →</button>
          <button style={S.btnO} onClick={onComplete}>Pular por agora</button>
        </div>
      </div>
    </div>
  );

  if (step >= 1 && step <= DIAG_Q.length) {
    const q = DIAG_Q[step - 1]; const pct = Math.round((step / DIAG_Q.length) * 100);
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(135deg,${C.noite},${C.azulPetroleo})`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "32px", maxWidth: 520, width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><span style={{ fontSize: 12, color: "#aaa" }}>{step}/{DIAG_Q.length}</span><span style={{ fontSize: 12, color: C.verdeMedio, fontWeight: 700 }}>{pct}%</span></div>
          <div style={{ height: 4, background: "#f0f0f0", borderRadius: 99, marginBottom: 22 }}><div style={{ width: `${pct}%`, height: "100%", background: C.verdeMedio, borderRadius: 99, transition: "width .4s" }} /></div>
          <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 18px" }}>{q.q}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {q.opts.map(opt => <button key={opt} onClick={() => answer(opt)} style={{ background: "#fafafa", border: "1.5px solid #e5e5e5", borderRadius: 10, padding: "12px 16px", textAlign: "left", cursor: "pointer", fontSize: 13, color: "#333", fontWeight: 500 }} onMouseEnter={e => { e.target.style.borderColor = C.verdeMedio; e.target.style.background = "#f0fdfb"; }} onMouseLeave={e => { e.target.style.borderColor = "#e5e5e5"; e.target.style.background = "#fafafa"; }}>{opt}</button>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg,${C.noite},${C.azulPetroleo})`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "32px", maxWidth: 500, width: "100%", textAlign: "center" }}>
        {gen ? <><div style={{ fontSize: 40, marginBottom: 14 }}>🧠</div><h3 style={{ color: C.azulPetroleo }}>Analisando seu negócio...</h3></> :
          done ? <><div style={{ fontSize: 40, marginBottom: 14 }}>🎯</div><h3 style={{ fontSize: 18, fontWeight: 800, color: C.azulPetroleo, margin: "0 0 10px" }}>Pronto!</h3><p style={{ fontSize: 13, color: "#666", margin: "0 0 20px" }}>Criaremos 2 funis no Pipeline de Membros com base no seu perfil.</p><div style={{ display: "flex", gap: 10, justifyContent: "center" }}><button style={S.btnG} onClick={accept}>✓ Criar meus pipelines</button><button style={S.btnO} onClick={onComplete}>Pular</button></div></> : null}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user] = useState({ id: 1, name: "Karine Rodrigues", email: "karine@partic.com.br", role: "admin" });

  const [page, setPage] = useState("dashboard");

  useEffect(() => { initData(); }, []);
  // Diagnostic only shown manually via menu

  function handleLogout() { showToast("Logout simulado — login será reativado em breve", "info"); }
  const [navParams, setNavParams] = useState({});
  function navigate(p, params) { setPage(p); setNavParams(params || {}); }



  const PAGES = {
    dashboard: <Dashboard onNav={navigate} user={user} />,
    leads: <Leads onNav={navigate} initialFilters={navParams} />,
    curadoria: <Curadoria onNav={navigate} />,
    comercial: <Comercial />,
    calendar: <CalendarPage />,
    members: <Members />,
    anchors: <Anchors />,
    member_pipeline: <MemberPipeline />,
    mapeamento: <Mapeamento onNav={navigate} />,

    scripts: <Scripts />,
    importacao: <Importacao onNav={navigate} />,
    arquivo: <Arquivo />,

    central: <CentralOperacional />,
    settings: <Settings user={user} onLogout={handleLogout} />,
    studio: <StudioMain subpage="studio" onNav={navigate} />,
    studio_calendar: <StudioMain subpage="studio_calendar" onNav={navigate} />,
    studio_contents: <StudioMain subpage="studio_contents" onNav={navigate} />,
    studio_approvals: <StudioMain subpage="studio_approvals" onNav={navigate} />,
    studio_clients: <StudioMain subpage="studio_clients" onNav={navigate} />,
    studio_campaigns: <StudioMain subpage="studio_campaigns" onNav={navigate} />,
    studio_library: <StudioMain subpage="studio_library" onNav={navigate} />,
    studio_team: <StudioMain subpage="studio_team" onNav={navigate} />,
    studio_history: <StudioMain subpage="studio_history" onNav={navigate} />,
  };

  return (
    <div style={S.app}>
      <style>{`* { box-sizing: border-box; } textarea { font-family: inherit; } button:hover { opacity: 0.9; }`}</style>
      <Sidebar page={page} onNav={setPage} user={user} />
      <div style={S.main}>{PAGES[page] || PAGES.dashboard}</div>
    </div>
  );
}
