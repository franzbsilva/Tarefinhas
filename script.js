// CONEXÃO COM O SUPABASE
const SUPABASE_URL = 'https://tpekttzyidlsjhvrgohl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_o7GkoqfM-QdNKBa_Pc9MqA_FTYKjmvr';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);// CONEXÃO COM O SUPABASE

let currentKid = null;
let currentParentId = null;

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
// 🚀 INSTALAÇÃO DO APP (PWA)
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
    if (!isRunningStandalone()) {
        installBanner.classList.remove('hidden');
    }
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

// ==========================================
// MÁSCARAS E MODAIS
// ==========================================
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
function closeModal() { document.getElementById('custom-modal').classList.add('hidden'); }

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
    document.getElementById(id).classList.remove('hidden');
}

// ==========================================
// LOGIN & CADASTRO
// ==========================================
async function registerParent() {
    const email = document.getElementById('new-parent-email').value.trim();
    const phone = document.getElementById('new-parent-phone').value.trim();
    const pass = document.getElementById('new-parent-pass').value;
    const acceptedTerms = document.getElementById('accept-terms').checked;

    if (!email || !phone) { showModal('Atenção', 'Preencha o e-mail e telefone.', 'error'); return; }
    if (pass.length < 6) { showModal('Atenção', 'A senha deve ter pelo menos 6 caracteres.', 'error'); return; }
    if (!acceptedTerms) { showModal('Atenção', 'Você deve concordar com os Termos.', 'error'); return; }

    const { data, error } = await db.auth.signUp({ email: email, password: pass });
    if (error) { showModal('Erro', error.message, 'error'); return; }

    await db.from('parents').insert([{ id: data.user.id, email: email, phone: phone, is_approved: false }]);
    showModal('Sucesso!', 'Conta criada! Aguarde aprovação.', 'success');
    toggleSignup();
}

async function handleLogin() {
    const user = document.getElementById('user').value.toLowerCase().trim();
    const pass = document.getElementById('pass').value;
    const btn = document.getElementById('btn-login-text');
    const err = document.getElementById('login-error');

    if (!user || !pass) { err.innerText = "Preencha tudo!"; err.classList.remove('hidden'); return; }
    btn.innerText = "Mágica acontecendo..."; err.classList.add('hidden');

    // 1. LOGIN DO PAI
    if (user.includes('@')) {
        const { data: authData, error: authErr } = await db.auth.signInWithPassword({ email: user, password: pass });
        if (authErr) { err.innerText = "E-mail ou senha incorretos!"; err.classList.remove('hidden'); btn.innerText = "Entrar"; return; }

        currentParentId = authData.user.id;
        const { data: parentData } = await db.from('parents').select('*').eq('id', currentParentId).single();

        if (!parentData || !parentData.is_approved) {
            await db.auth.signOut();
            showModal('Acesso Negado', 'Sua conta ainda não foi aprovada.', 'error');
            btn.innerText = "Entrar"; return;
        }

        if (parentData.is_super_admin) {
            document.getElementById('btn-tab-superadmin').classList.remove('hidden');
            loadPendingParents();
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

    // 2. LOGIN DO FILHO
    const { data: kidData } = await db.from('kids').select('*').eq('login', user).eq('pass', pass).maybeSingle();

    if (kidData) {
        currentKid = kidData;
        document.getElementById('filho-welcome').innerText = `Olá, ${kidData.name}! 🏆`;
        document.getElementById('btn-support').classList.add('hidden'); // Esconde suporte para a criança
        showPanel('filho-panel');
        await loadFilhoData();
    } else {
        err.innerText = "Usuário ou senha da criança incorretos!";
        err.classList.remove('hidden');
    }
    btn.innerText = "Entrar";
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
// ABA: FILHOS & RELATÓRIOS
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

    // Ganhos do Mês Atual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { data: monthLogs } = await db.from('daily_log').select('*').eq('kid_id', kidId).gte('created_at', firstDay);
    let earned = 0;
    if (monthLogs) monthLogs.forEach(l => { if (!l.is_penalty) earned += l.value; });
    document.getElementById('admin-month-money').innerText = `R$ ${earned.toFixed(2).replace('.', ',')}`;

    // Histórico de Hoje
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

// NOVO: ABRIR RELATÓRIO ANUAL E MENSAL
async function openYearlyReport() {
    if (!currentKid) return;
    document.getElementById('report-kid-name').innerText = currentKid.name;
    document.getElementById('yearly-report-modal').classList.remove('hidden');
    document.getElementById('yearly-report-content').innerHTML = '<p>Carregando dados mágicos...</p>';

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1).toISOString();
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59).toISOString();

    const { data: logs } = await db.from('daily_log')
        .select('*')
        .eq('kid_id', currentKid.id)
        .gte('created_at', startOfYear)
        .lte('created_at', endOfYear);

    let monthlyTotals = Array(12).fill(0);
    let yearlyTotal = 0;

    if (logs) {
        logs.forEach(log => {
            // Soma apenas o que ele GANHOU de positivo
            if (!log.is_penalty) {
                const month = new Date(log.created_at).getMonth();
                monthlyTotals[month] += log.value;
                yearlyTotal += log.value;
            }
        });
    }

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    let html = '<ul style="list-style: none; padding: 0;">';

    for (let i = 0; i < 12; i++) {
        // Mostra o mês se ele tiver ganhos OU se for o mês atual
        if (monthlyTotals[i] > 0 || i === new Date().getMonth()) {
            html += `
            <li style="display:flex; justify-content:space-between; padding: 10px; border-bottom: 1px solid #ddd; font-size: 15px;">
                <span>${monthNames[i]}</span>
                <strong style="color: var(--secondary);">R$ ${monthlyTotals[i].toFixed(2).replace('.', ',')}</strong>
            </li>`;
        }
    }
    html += '</ul>';

    document.getElementById('yearly-report-content').innerHTML = html;
    document.getElementById('yearly-total-money').innerText = `R$ ${yearlyTotal.toFixed(2).replace('.', ',')}`;
}

function closeYearlyReport() {
    document.getElementById('yearly-report-modal').classList.add('hidden');
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
// ABA: SUPER ADMIN
// ==========================================
async function loadPendingParents() {
    const { data } = await db.from('parents').select('*').eq('is_approved', false);
    const list = document.getElementById('pending-parents-list');
    list.innerHTML = '';
    if (!data || data.length === 0) { list.innerHTML = '<li>Nenhum pendente.</li>'; return; }
    data.forEach(p => {
        list.innerHTML += `<li style="background:#fff; padding:10px; margin-bottom:5px; border-radius:10px; border:1px solid #ddd;">
            ${p.email} <button onclick="approveParent('${p.id}')" style="background:var(--secondary); color:#fff; padding:5px; border-radius:5px; width:auto; float:right;">Aprovar</button>
        </li>`;
    });
}
async function approveParent(id) {
    await db.from('parents').update({ is_approved: true }).eq('id', id);
    loadPendingParents();
    showModal('Sucesso', 'Pai aprovado!', 'success');
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