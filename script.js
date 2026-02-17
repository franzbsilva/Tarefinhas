// CONEXÃO COM O SUPABASE
const SUPABASE_URL = 'https://tpekttzyidlsjhvrgohl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_o7GkoqfM-QdNKBa_Pc9MqA_FTYKjmvr';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);// CONEXÃO COM O SUPABASE


let currentKid = null;
let currentParentId = null;
let reportCurrentYear = new Date().getFullYear();

// TAREFAS OFICIAIS (O Método Padrão do App)
const defaultTasks = [
    { description: "Higiene Matinal (Escovar dentes/Lavar rosto)", value: 0.20, is_obligatory: true },
    { description: "Trocar de roupa sozinho (Pijama para roupa do dia)", value: 0.20, is_obligatory: true },
    { description: "Colocar o sapato/tênis", value: 0.15, is_obligatory: true },
    { description: "Leitura Diária (15-20 min + resumo)", value: 0.50, is_obligatory: true },
    { description: "Lição no Duolingo (1 unidade)", value: 0.50, is_obligatory: true },
    { description: "Tarefa de casa da escola (com capricho)", value: 0.50, is_obligatory: true },
    { description: "Organizar a mochila para o dia seguinte", value: 0.30, is_obligatory: true },
    { description: "Tomar banho sem resistência/na hora certa", value: 0.30, is_obligatory: true },
    { description: "Escovar os dentes antes de dormir", value: 0.20, is_obligatory: true },
    { description: "Apagar as luzes ao sair dos cômodos", value: 0.10, is_obligatory: true },
    { description: "Lavar a louça (refeição leve)", value: 0.25, is_obligatory: false },
    { description: "Secar e guardar a louça", value: 0.25, is_obligatory: false },
    { description: "Arrumar a própria cama", value: 0.20, is_obligatory: false },
    { description: "Recolher e guardar brinquedos", value: 0.30, is_obligatory: false },
    { description: "Colocar roupa suja no cesto", value: 0.10, is_obligatory: false },
    { description: "Ajudar a pôr ou tirar a mesa", value: 0.15, is_obligatory: false },
    { description: "Regar as plantas", value: 0.20, is_obligatory: false },
    { description: "Alimentar o pet (se houver)", value: 0.20, is_obligatory: false },
    { description: "Levar o lixo pequeno para fora", value: 0.20, is_obligatory: false },
    { description: "Brincar com o irmão (30 min sem briga)", value: 0.50, is_obligatory: false },
    { description: "Dividir/Emprestar algo sem reclamar", value: 0.25, is_obligatory: false },
    { description: "Brincar sozinho com foco (autonomia)", value: 0.25, is_obligatory: false },
    { description: "Iniciativa (fazer algo sem ser pedido)", value: 0.50, is_obligatory: false },
    { description: "Dizer 'Por favor', 'Obrigado' e 'Com licença' o dia todo", value: 0.30, is_obligatory: false }
];

// ==========================================
// 🚀 EVENTOS DE AUTENTICAÇÃO E RECUPERAÇÃO DE SENHA
// ==========================================
db.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
        document.getElementById('update-password-modal').classList.remove('hidden');
    }
});

function openForgotPassword() { document.getElementById('forgot-password-modal').classList.remove('hidden'); }
function closeForgotPassword() { document.getElementById('forgot-password-modal').classList.add('hidden'); }

async function sendPasswordReset() {
    const email = document.getElementById('reset-email-input').value.trim();
    if (!email) { showModal('Atenção', 'Digite o seu e-mail.', 'error'); return; }

    const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
    });

    if (error) {
        showModal('Erro', error.message, 'error');
    } else {
        closeForgotPassword();
        showModal('Sucesso!', 'Link enviado! Verifique a sua caixa de entrada ou SPAM.', 'success');
    }
}

async function saveNewPassword() {
    const btn = document.querySelector('#update-password-modal .btn-action');
    const newPass = document.getElementById('new-password-input').value;

    if (newPass.length < 6) {
        showModal('Atenção', 'A senha deve ter no mínimo 6 letras.', 'error');
        return;
    }

    btn.innerText = "A atualizar...";
    btn.disabled = true;

    const { error } = await db.auth.updateUser({ password: newPass });

    if (error) {
        btn.innerText = "Atualizar Senha";
        btn.disabled = false;
        showModal('Erro', error.message, 'error');
    } else {
        document.getElementById('update-password-modal').classList.add('hidden');
        window.history.pushState({}, document.title, window.location.pathname);
        await db.auth.signOut();

        showModal('Sucesso!', 'Senha atualizada com sucesso!', 'success');

        const btnModal = document.querySelector('.btn-modal');
        btnModal.innerText = "Ir para o Login";

        btnModal.onclick = () => {
            document.getElementById('custom-modal').classList.add('hidden');
            btnModal.onclick = closeModal;
            btnModal.innerText = "Oba! Entendi";

            showPanel('login-screen');
            document.getElementById('pass').value = '';
            document.getElementById('new-password-input').value = '';

            btn.innerText = "Atualizar Senha";
            btn.disabled = false;
        };
    }
}

// ==========================================
// 🚀 INSTALAÇÃO DO APP E TERMOS
// ==========================================
let deferredPrompt;
const installBanner = document.getElementById('install-banner');

function isRunningStandalone() {
    return (window.matchMedia('(display-mode: standalone)').matches) ||
        (window.navigator.standalone) ||
        document.referrer.includes('android-app://');
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!isRunningStandalone()) { installBanner.classList.remove('hidden'); }
});

async function triggerInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') { installBanner.classList.add('hidden'); }
        deferredPrompt = null;
    }
}
function closeInstallBanner() { installBanner.classList.add('hidden'); }

document.addEventListener("DOMContentLoaded", () => {
    const termosAceitos = localStorage.getItem("termos_magicos_aceitos");
    if (!termosAceitos) document.getElementById('terms-modal').classList.remove('hidden');
});

function openTerms() { document.getElementById('terms-modal').classList.remove('hidden'); }
function acceptAndCloseTerms() {
    localStorage.setItem("termos_magicos_aceitos", "sim");
    const checkbox = document.getElementById('accept-terms');
    if (checkbox) checkbox.checked = true;
    document.getElementById('terms-modal').classList.add('hidden');
}

// ==========================================
// UI E MÁSCARAS
// ==========================================

// NOVA FUNÇÃO: Máscara para Telefone Padrão BR (00) 0 0000-0000
function maskPhone(input) {
    let v = input.value.replace(/\D/g, ''); // Remove tudo o que não for número
    if (v.length > 11) v = v.substring(0, 11); // Limita a 11 dígitos no máximo

    let formatted = '';
    if (v.length > 0) { formatted += '(' + v.substring(0, 2); }
    if (v.length > 2) { formatted += ') ' + v.substring(2, 3); }
    if (v.length > 3) { formatted += ' ' + v.substring(3, 7); }
    if (v.length > 7) { formatted += '-' + v.substring(7, 11); }

    input.value = formatted;
}

function maskCurrency(input) {
    let value = input.value.replace(/\D/g, '');
    if (value === "") { input.dataset.raw = 0; input.value = ""; return; }
    let numericValue = (parseInt(value) / 100).toFixed(2);
    input.dataset.raw = numericValue;
    input.value = 'R$ ' + numericValue.replace('.', ',');
}

window.onscroll = function () {
    let btn = document.getElementById("btn-top");
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) btn.style.display = "flex";
    else btn.style.display = "none";
};
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

function showModal(title, message, type = 'success') {
    const modal = document.getElementById('custom-modal');
    const icon = document.getElementById('modal-icon');
    const titleEl = document.getElementById('modal-title');
    const btn = document.querySelector('.btn-modal');

    document.getElementById('modal-message').innerText = message;
    titleEl.innerText = title;

    if (type === 'success') { icon.innerText = '🌟'; titleEl.style.color = '#4CAF50'; btn.style.background = '#4CAF50'; }
    else if (type === 'error') { icon.innerText = '💔'; titleEl.style.color = '#FF4B2B'; btn.style.background = '#FF4B2B'; }
    else if (type === 'penalty') { icon.innerText = '⚠️'; titleEl.style.color = '#FF4B2B'; btn.style.background = '#333'; }

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('custom-modal').classList.add('hidden');
    const btnModal = document.querySelector('.btn-modal');
    btnModal.onclick = closeModal;
    btnModal.innerText = "Oba! Entendi";
}

function closeEditTaskModal(event) { if (event.target.id === 'edit-task-modal') forceCloseEditTask(); }
function forceCloseEditTask() { document.getElementById('edit-task-modal').classList.add('hidden'); }

function toggleSignup() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('signup-form').classList.toggle('hidden');
    document.getElementById('login-error').classList.add('hidden');
}

function switchTab(tabName) {
    document.getElementById('tab-filhos').classList.add('hidden');
    document.getElementById('tab-tarefas').classList.add('hidden');
    document.getElementById('tab-superadmin').classList.add('hidden');
    document.getElementById('btn-tab-filhos').classList.remove('tab-active');
    document.getElementById('btn-tab-tarefas').classList.remove('tab-active');
    document.getElementById('btn-tab-superadmin').classList.remove('tab-active');
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    document.getElementById(`btn-tab-${tabName}`).classList.add('tab-active');
}

function showPanel(id) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('filho-panel').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
}

// ==========================================
// LOGIN & CADASTRO
// ==========================================
async function registerParent() {
    const name = document.getElementById('new-parent-name').value.trim();
    const email = document.getElementById('new-parent-email').value.trim();
    const phone = document.getElementById('new-parent-phone').value.trim();
    const pass = document.getElementById('new-parent-pass').value;
    const acceptedTerms = document.getElementById('accept-terms').checked;

    if (!name || !email || !phone) { showModal('Atenção', 'Preencha o Nome, E-mail e Telefone.', 'error'); return; }
    if (pass.length < 6) { showModal('Atenção', 'A senha deve ter no mínimo 6 caracteres.', 'error'); return; }
    if (!acceptedTerms) { showModal('Atenção', 'Você deve concordar com os Termos.', 'error'); return; }

    const { data, error } = await db.auth.signUp({ email: email, password: pass });
    if (error) { showModal('Erro', 'Este e-mail já existe ou é inválido.', 'error'); return; }

    await db.from('parents').insert([{ id: data.user.id, name: name, email: email, phone: phone, is_approved: false }]);
    showModal('Sucesso!', 'Conta criada! O acesso será liberado em breve.', 'success');
    toggleSignup();
}

async function handleLogin() {
    const user = document.getElementById('user').value.toLowerCase().trim();
    const pass = document.getElementById('pass').value;
    const btn = document.getElementById('btn-login-text');
    const err = document.getElementById('login-error');

    if (!user || !pass) { err.innerText = "Preencha tudo!"; err.classList.remove('hidden'); return; }
    btn.innerText = "Carregando..."; err.classList.add('hidden');

    if (user.includes('@')) {
        const { data: authData, error: authErr } = await db.auth.signInWithPassword({ email: user, password: pass });
        if (authErr) { err.innerText = "E-mail ou senha incorretos!"; err.classList.remove('hidden'); btn.innerText = "Entrar"; return; }

        currentParentId = authData.user.id;
        const { data: parentData } = await db.from('parents').select('*').eq('id', currentParentId).single();

        if (!parentData || !parentData.is_approved) {
            await db.auth.signOut();
            showModal('Acesso Negado', 'Sua conta encontra-se pendente ou bloqueada.', 'error');
            btn.innerText = "Entrar"; return;
        }

        if (parentData.is_super_admin) {
            document.getElementById('btn-tab-superadmin').classList.remove('hidden');
            loadAllParentsForAdmin();
        }

        const { data: tasksCheck } = await db.from('tasks').select('id').eq('parent_id', currentParentId);
        if (tasksCheck.length === 0) {
            const tasksToInsert = defaultTasks.map(t => ({ parent_id: currentParentId, ...t }));
            await db.from('tasks').insert(tasksToInsert);
        }

        showPanel('admin-panel');
        document.getElementById('btn-support').classList.remove('hidden');
        await loadTasksForAdmin();
        await populateKidSelector();
        btn.innerText = "Entrar"; return;
    }

    const { data: kidData } = await db.from('kids').select('*').eq('login', user).eq('pass', pass).maybeSingle();

    if (kidData) {
        currentKid = kidData;
        document.getElementById('filho-welcome').innerText = `Olá, ${kidData.name}! 🏆`;
        document.getElementById('btn-support').classList.add('hidden');
        showPanel('filho-panel');
        await loadFilhoData();
    } else {
        err.innerText = "Usuário ou senha da criança incorretos!";
        err.classList.remove('hidden');
    }
    btn.innerText = "Entrar";
}

// ==========================================
// SUPER ADMIN: GESTÃO COMPLETA DE PAIS
// ==========================================
async function loadAllParentsForAdmin() {
    const { data } = await db.from('parents').select('*').order('email', { ascending: true });
    const list = document.getElementById('all-parents-list');
    list.innerHTML = '';

    if (!data || data.length === 0) { list.innerHTML = '<p>Nenhum cliente cadastrado.</p>'; return; }

    data.forEach(p => {
        if (p.is_super_admin) return;

        const statusBadge = p.is_approved ? '<span style="color: #4CAF50; font-weight: bold;">✅ Aprovado</span>' : '<span style="color: #FF4B2B; font-weight: bold;">❌ Suspenso/Pendente</span>';
        const toggleBtn = p.is_approved
            ? `<button onclick="toggleParentStatus('${p.id}', false)" style="background: var(--danger); color: white; padding: 8px; border-radius: 8px; flex: 1;">Bloquear</button>`
            : `<button onclick="toggleParentStatus('${p.id}', true)" style="background: var(--secondary); color: white; padding: 8px; border-radius: 8px; flex: 1;">Aprovar</button>`;

        const displayName = p.name ? p.name : 'Sem nome definido';

        list.innerHTML += `
            <div style="background: white; padding: 15px; border-radius: 12px; border: 1px solid #ccc; margin-bottom: 15px; text-align: left;">
                <strong style="font-size: 16px; color: purple;">${displayName}</strong><br>
                <span style="font-size: 14px;">${p.email}</span>
                <div style="margin: 5px 0; font-size: 13px; color: #555;">📱 ${p.phone || 'Sem número'} <br> Status: ${statusBadge}</div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    ${toggleBtn}
                    <button onclick="openEditParentModal('${p.id}', '${p.email}', '${p.name || ''}', '${p.phone || ''}')" style="background: #e0e0e0; color: #333; padding: 8px; border-radius: 8px; flex: 1;">Editar Dados</button>
                </div>
            </div>`;
    });
}

async function toggleParentStatus(id, newStatus) {
    await db.from('parents').update({ is_approved: newStatus }).eq('id', id);
    showModal('Sucesso', newStatus ? 'Cliente Aprovado!' : 'Acesso Bloqueado!', 'success');
    loadAllParentsForAdmin();
}

function openEditParentModal(id, email, name, phone) {
    document.getElementById('edit-parent-id').value = id;
    document.getElementById('edit-parent-email-display').innerText = email;
    document.getElementById('edit-parent-name').value = name;
    document.getElementById('edit-parent-phone').value = phone;
    document.getElementById('edit-parent-modal').classList.remove('hidden');
}

function closeEditParentModal() { document.getElementById('edit-parent-modal').classList.add('hidden'); }

async function saveParentEdit() {
    const id = document.getElementById('edit-parent-id').value;
    const newName = document.getElementById('edit-parent-name').value.trim();
    const newPhone = document.getElementById('edit-parent-phone').value.trim();

    await db.from('parents').update({ name: newName, phone: newPhone }).eq('id', id);
    closeEditParentModal();
    showModal('Salvo', 'Os dados do cliente foram atualizados.', 'success');
    loadAllParentsForAdmin();
}

// ==========================================
// ABA: TAREFAS (EDITAR/REMOVER)
// ==========================================
async function loadTasksForAdmin() {
    const { data: dbTasks } = await db.from('tasks').select('*').eq('parent_id', currentParentId).order('is_obligatory', { ascending: false });
    const list = document.getElementById('admin-task-list');
    list.innerHTML = '';

    if (!dbTasks || dbTasks.length === 0) { list.innerHTML = '<li>Nenhuma tarefa criada.</li>'; return; }

    dbTasks.forEach(t => {
        const tipo = t.is_obligatory ? '⚡ Obrigatória' : '🚀 Extra';
        list.innerHTML += `
            <li style="background: #fff; margin: 8px 0; padding: 12px; border-radius: 10px; border: 1px solid #ddd;">
                <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong>${t.description}</strong>
                    <span style="font-size:12px; color:#666;">${tipo} | R$ ${t.value.toFixed(2).replace('.', ',')}</span>
                </div>
                <div style="display:flex; gap: 10px;">
                    <button onclick="openEditTaskModal('${t.id}', '${t.description}', ${t.value}, ${t.is_obligatory})" style="background: var(--primary); color: #333; padding: 5px; border-radius: 5px; flex: 1;">Editar</button>
                    <button onclick="deleteTask('${t.id}')" style="background: var(--danger); color: white; padding: 5px; border-radius: 5px; flex: 1;">Remover</button>
                </div>
            </li>`;
    });
}

function openEditTaskModal(id, desc, val, isObligatory) {
    document.getElementById('edit-modal-task-id').value = id;
    document.getElementById('edit-modal-task-desc').value = desc;
    const valInput = document.getElementById('edit-modal-task-val');
    valInput.dataset.raw = val;
    valInput.value = 'R$ ' + val.toFixed(2).replace('.', ',');
    document.getElementById('edit-modal-task-type').value = isObligatory.toString();
    document.getElementById('edit-task-modal').classList.remove('hidden');
}

async function createAdminTask() {
    const desc = document.getElementById('new-task-desc').value.trim();
    const valRaw = document.getElementById('new-task-val').dataset.raw;
    const val = parseFloat(valRaw);
    const isObligatory = document.getElementById('new-task-type').value === 'true';

    if (!desc || isNaN(val)) { showModal('Atenção', 'Preencha o nome e valor.', 'error'); return; }

    await db.from('tasks').insert([{ parent_id: currentParentId, description: desc, value: val, is_obligatory: isObligatory }]);
    document.getElementById('new-task-desc').value = '';
    document.getElementById('new-task-val').value = '';
    showModal('Feito!', 'Nova tarefa adicionada.', 'success');
    loadTasksForAdmin();
}

async function saveEditedTask() {
    const id = document.getElementById('edit-modal-task-id').value;
    const desc = document.getElementById('edit-modal-task-desc').value.trim();
    const valRaw = document.getElementById('edit-modal-task-val').dataset.raw;
    const val = parseFloat(valRaw);
    const isObligatory = document.getElementById('edit-modal-task-type').value === 'true';

    await db.from('tasks').update({ description: desc, value: val, is_obligatory: isObligatory }).eq('id', id);
    forceCloseEditTask();
    showModal('Feito!', 'Tarefa atualizada.', 'success');
    loadTasksForAdmin();
}

async function deleteTask(id) {
    if (confirm("Apagar essa tarefa de todos os seus filhos?")) {
        await db.from('tasks').delete().eq('id', id);
        loadTasksForAdmin();
    }
}

// ==========================================
// ABA: FILHOS E DADOS
// ==========================================
async function populateKidSelector() {
    const { data } = await db.from('kids').select('*').eq('parent_id', currentParentId);
    const selector = document.getElementById('kid-selector');
    if (!data || data.length === 0) { selector.innerHTML = '<option value="">Crie um cofre acima 👆</option>'; return; }
    selector.innerHTML = '<option value="">Selecione um filho...</option>';
    data.forEach(k => { selector.innerHTML += `<option value="${k.id}">${k.name}</option>`; });
}

async function loadKidDataForAdmin() {
    const kidId = document.getElementById('kid-selector').value;
    const detailsDiv = document.getElementById('admin-kid-details');
    if (!kidId) { detailsDiv.classList.add('hidden'); return; }
    detailsDiv.classList.remove('hidden');

    const { data: kid } = await db.from('kids').select('*').eq('id', kidId).single();
    currentKid = kid;
    document.getElementById('admin-total-money').innerText = `R$ ${kid.balance.toFixed(2).replace('.', ',')}`;

    document.getElementById('edit-kid-name').value = kid.name;
    document.getElementById('edit-kid-login').value = kid.login;
    document.getElementById('edit-kid-pass').value = kid.pass;

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { data: monthLogs } = await db.from('daily_log').select('*').eq('kid_id', kidId).gte('created_at', firstDay);
    let earned = 0;
    if (monthLogs) monthLogs.forEach(l => { if (!l.is_penalty) earned += l.value; });
    document.getElementById('admin-month-money').innerText = `R$ ${earned.toFixed(2).replace('.', ',')}`;

    const today = now.toISOString().split('T')[0];
    const { data: dailyLogs } = await db.from('daily_log').select('*').eq('kid_id', kidId).gte('created_at', `${today}T00:00:00Z`).order('created_at', { ascending: false });
    const logDiv = document.getElementById('admin-daily-log');
    logDiv.innerHTML = '';
    if (!dailyLogs || dailyLogs.length === 0) logDiv.innerHTML = '<p>Nada hoje.</p>';
    else {
        dailyLogs.forEach(l => {
            const time = new Date(l.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            if (l.is_penalty) logDiv.innerHTML += `<div class="log-item penalty">❌ ${time} - ${l.description} (-R$ ${l.value.toFixed(2).replace('.', ',')})</div>`;
            else logDiv.innerHTML += `<div class="log-item">✅ ${time} - ${l.description} (+R$ ${l.value.toFixed(2).replace('.', ',')})</div>`;
        });
    }
}

async function updateKidData() {
    if (!currentKid) return;
    const n = document.getElementById('edit-kid-name').value;
    const l = document.getElementById('edit-kid-login').value.toLowerCase();
    const p = document.getElementById('edit-kid-pass').value;
    await db.from('kids').update({ name: n, login: l, pass: p }).eq('id', currentKid.id);
    showModal('Pronto!', 'Dados atualizados.', 'success');
    populateKidSelector();
}

async function applyPenaltyBtn(desc, val) {
    if (!currentKid) { showModal('Erro', 'Selecione um filho.', 'error'); return; }
    let newB = Math.max(0, currentKid.balance - val);
    await db.from('kids').update({ balance: newB }).eq('id', currentKid.id);
    await db.from('daily_log').insert([{ kid_id: currentKid.id, description: desc, value: val, is_penalty: true }]);
    showModal('Penalidade!', 'Valor descontado.', 'penalty');
    loadKidDataForAdmin();
}

async function applyPenaltyCustom() {
    const desc = document.getElementById('penalty-desc').value;
    const val = parseFloat(document.getElementById('penalty-val').dataset.raw);
    if (!desc || isNaN(val)) { showModal('Erro', 'Preencha motivo e valor.', 'error'); return; }
    applyPenaltyBtn(desc, val);
}

// ==========================================
// 📊 RELATÓRIO ANUAL INTELIGENTE 
// ==========================================
async function openYearlyReport() {
    if (!currentKid) return;
    reportCurrentYear = new Date().getFullYear();
    document.getElementById('yearly-report-modal').classList.remove('hidden');
    await loadYearData();
}

function closeYearlyReport() { document.getElementById('yearly-report-modal').classList.add('hidden'); }

async function changeReportYear(direction) {
    reportCurrentYear += direction;
    await loadYearData();
}

function toggleMonthAccordion(monthIndex) {
    const content = document.getElementById(`month-content-${monthIndex}`);
    const icon = document.getElementById(`month-icon-${monthIndex}`);
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.innerText = "▼";
    } else {
        content.classList.add('hidden');
        icon.innerText = "▶";
    }
}

async function loadYearData() {
    document.getElementById('report-year-display').innerText = reportCurrentYear;
    document.getElementById('yearly-report-content').innerHTML = '<p style="text-align:center;">Buscando mágica...</p>';

    const startOfYear = new Date(reportCurrentYear, 0, 1).toISOString();
    const endOfYear = new Date(reportCurrentYear, 11, 31, 23, 59, 59).toISOString();

    const { data: logs } = await db.from('daily_log')
        .select('*')
        .eq('kid_id', currentKid.id)
        .gte('created_at', startOfYear)
        .lte('created_at', endOfYear)
        .order('created_at', { ascending: false });

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    let monthlyData = Array(12).fill(null).map(() => ({ total: 0, days: {} }));
    let yearlyTotal = 0;

    if (logs) {
        logs.forEach(log => {
            const logDate = new Date(log.created_at);
            const m = logDate.getMonth();
            const dStr = logDate.toLocaleDateString('pt-BR');

            if (!monthlyData[m].days[dStr]) monthlyData[m].days[dStr] = [];
            monthlyData[m].days[dStr].push(log);

            if (!log.is_penalty) {
                monthlyData[m].total += log.value;
                yearlyTotal += log.value;
            }
        });
    }

    let html = '';
    let hasAnyData = false;

    for (let i = 11; i >= 0; i--) {
        if (Object.keys(monthlyData[i].days).length > 0) {
            hasAnyData = true;
            html += `
            <div style="background: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; margin-bottom: 8px; overflow: hidden;">
                <button onclick="toggleMonthAccordion(${i})" style="width: 100%; background: #eee; border: none; padding: 12px; text-align: left; display: flex; justify-content: space-between; align-items: center; border-radius: 0; box-shadow: none; margin: 0; font-size: 16px; color: #333;">
                    <span><strong style="color: var(--secondary); margin-right: 10px;">R$ ${monthlyData[i].total.toFixed(2).replace('.', ',')}</strong> ${monthNames[i]}</span>
                    <span id="month-icon-${i}" style="font-size: 12px; color: #888;">▶</span>
                </button>
                <div id="month-content-${i}" class="hidden" style="padding: 10px;">`;

            for (const [dayString, dayLogs] of Object.entries(monthlyData[i].days)) {
                html += `<div style="margin-bottom: 10px;">
                            <strong style="font-size: 13px; color: #666; display: block; border-bottom: 1px solid #ccc; margin-bottom: 5px;">📅 ${dayString}</strong>`;

                dayLogs.forEach(l => {
                    const time = new Date(l.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    if (l.is_penalty) {
                        html += `<div style="font-size: 13px; color: var(--danger); margin-bottom: 3px;">❌ ${time} - ${l.description} (-R$ ${l.value.toFixed(2).replace('.', ',')})</div>`;
                    } else {
                        html += `<div style="font-size: 13px; color: #444; margin-bottom: 3px;">✅ ${time} - ${l.description} (+R$ ${l.value.toFixed(2).replace('.', ',')})</div>`;
                    }
                });
                html += `</div>`;
            }
            html += `</div></div>`;
        }
    }

    if (!hasAnyData) html = '<p style="text-align:center; color:#888;">Nenhuma atividade neste ano.</p>';

    document.getElementById('yearly-report-content').innerHTML = html;
    document.getElementById('yearly-total-money').innerText = `R$ ${yearlyTotal.toFixed(2).replace('.', ',')}`;
}

// ==========================================
// PAINEL DO FILHO
// ==========================================
async function loadFilhoData() {
    const { data: tasks } = await db.from('tasks').select('*').eq('parent_id', currentKid.parent_id);
    const today = new Date().toISOString().split('T')[0];
    const { data: logs } = await db.from('daily_log').select('*').eq('kid_id', currentKid.id).gte('created_at', `${today}T00:00:00Z`);

    document.getElementById('total-money').innerText = `R$ ${currentKid.balance.toFixed(2).replace('.', ',')}`;
    const obDiv = document.getElementById('obligatory-tasks');
    const exDiv = document.getElementById('extra-tasks');
    obDiv.innerHTML = ''; exDiv.innerHTML = '';
    let doneOb = 0; let totalOb = tasks.filter(t => t.is_obligatory).length;

    tasks.forEach(t => {
        const isDone = logs && logs.some(l => l.description === t.description);
        if (isDone && t.is_obligatory) doneOb++;
        const html = `<div class="task-item ${isDone ? 'task-done' : ''}">
            <div class="task-desc">${t.description} <br><small>R$ ${t.value.toFixed(2).replace('.', ',')}</small></div>
            <div class="task-action">${isDone ? '✅' : `<button onclick="saveKidTask('${t.description}', ${t.value})" style="background:var(--secondary); color:#fff; padding:8px;">Fiz!</button>`}</div>
        </div>`;
        if (t.is_obligatory) obDiv.innerHTML += html; else exDiv.innerHTML += html;
    });
    document.getElementById('extra-section').classList.toggle('locked', doneOb < totalOb);
    renderLogForFilho(logs);
}

function renderLogForFilho(logs) {
    const pList = document.getElementById('penalty-list'); const hList = document.getElementById('filho-daily-log');
    pList.innerHTML = ''; hList.innerHTML = ''; let hp = false, he = false;
    if (logs) logs.forEach(l => {
        const time = new Date(l.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        if (l.is_penalty) { hp = true; pList.innerHTML += `<div class="penalty-item">❌ ${time} - ${l.description}</div>`; }
        else { he = true; hList.innerHTML += `<div class="log-item">✅ ${time} - ${l.description}</div>`; }
    });
    document.getElementById('penalty-section').classList.toggle('hidden', !hp);
    document.getElementById('history-section').classList.toggle('hidden', !he);
}

async function saveKidTask(desc, val) {
    let newB = currentKid.balance + val;
    await db.from('kids').update({ balance: newB }).eq('id', currentKid.id);
    currentKid.balance = newB;
    await db.from('daily_log').insert([{ kid_id: currentKid.id, description: desc, value: val, is_penalty: false }]);
    showModal('Boa!', `Ganhou R$ ${val.toFixed(2).replace('.', ',')}!`, 'success');
    loadFilhoData();
}

async function logout() { await db.auth.signOut(); location.reload(); }