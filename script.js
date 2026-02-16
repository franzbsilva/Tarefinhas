// SUAS CHAVES DO SUPABASE
const SUPABASE_URL = 'https://tpekttzyidlsjhvrgohl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_o7GkoqfM-QdNKBa_Pc9MqA_FTYKjmvr';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentKid = null;
let currentParentId = null;

const defaultTasks = [
    { description: "Leitura Diária (Mínimo de 15 a 20 minutos com resumo)", value: 0.50, is_obligatory: true },
    { description: "Lição no Duolingo (Completar pelo menos uma unidade/lição)", value: 0.50, is_obligatory: true },
    { description: "Lavar a louça (refeição leve)", value: 0.25, is_obligatory: false },
    { description: "Secar e guardar a louça", value: 0.25, is_obligatory: false },
    { description: "Arrumar a própria cama", value: 0.20, is_obligatory: false },
    { description: "Recolher e guardar os próprios brinquedos", value: 0.30, is_obligatory: false },
    { description: "Colocar roupa suja no cesto", value: 0.10, is_obligatory: false },
    { description: "Ajudar a pôr ou tirar a mesa", value: 0.15, is_obligatory: false },
    { description: "Brincar com o irmão (sem briga por 30 min)", value: 0.50, is_obligatory: false },
    { description: "Emprestar um brinquedo sem reclamar", value: 0.25, is_obligatory: false },
    { description: "Brincar sozinho com seus brinquedos (foco)", value: 0.25, is_obligatory: false },
    { description: "Iniciativa (fazer algo sem ser pedido)", value: 0.50, is_obligatory: false }
];

// ==========================================
// EFEITOS E MÁSCARAS
// ==========================================
function openTerms() { document.getElementById('terms-modal').classList.remove('hidden'); }
function closeTerms() { document.getElementById('terms-modal').classList.add('hidden'); }

function maskCurrency(input) {
    let value = input.value.replace(/\D/g, '');
    if (value === "") { input.dataset.raw = 0; input.value = ""; return; }
    let numericValue = (parseInt(value) / 100).toFixed(2);
    input.dataset.raw = numericValue;
    input.value = 'R$ ' + numericValue.replace('.', ',');
}

window.onscroll = function () {
    let btn = document.getElementById("btn-top");
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        btn.style.display = "flex";
    } else {
        btn.style.display = "none";
    }
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

// Lógica de fechar o Modal Flutuante clicando fora dele
function closeEditTaskModal(event) {
    if (event.target.id === 'edit-task-modal') {
        forceCloseEditTask();
    }
}
function forceCloseEditTask() {
    document.getElementById('edit-task-modal').classList.add('hidden');
}

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
    if (!acceptedTerms) { showModal('Atenção', 'Você deve ler e concordar com os Termos de Uso.', 'error'); return; }

    const { data, error } = await db.auth.signUp({ email: email, password: pass });
    if (error) { showModal('Erro', error.message, 'error'); return; }

    await db.from('parents').insert([{ id: data.user.id, email: email, phone: phone, is_approved: false }]);
    showModal('Sucesso!', 'Conta criada! O dono do aplicativo precisa aprovar seu acesso.', 'success');
    toggleSignup();
}

async function handleLogin() {
    const user = document.getElementById('user').value.toLowerCase().trim();
    const pass = document.getElementById('pass').value;
    const btn = document.getElementById('btn-login-text');
    const err = document.getElementById('login-error');

    if (!user || !pass) { err.innerText = "Preencha tudo!"; err.classList.remove('hidden'); return; }
    btn.innerText = "Mágica acontecendo..."; err.classList.add('hidden');

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
        await loadTasksForAdmin();
        await populateKidSelector();
        btn.innerText = "Entrar"; return;
    }

    const { data: kidData } = await db.from('kids').select('*').eq('login', user).eq('pass', pass).maybeSingle();

    if (kidData) {
        currentKid = kidData;
        document.getElementById('filho-welcome').innerText = `Olá, ${kidData.name}! 🏆`;
        showPanel('filho-panel');
        await loadFilhoData();
    } else {
        err.innerText = "Usuário ou senha da criança incorretos!";
        err.classList.remove('hidden');
    }
    btn.innerText = "Entrar";
}

// ==========================================
// SUPER ADMIN
// ==========================================
async function loadPendingParents() {
    const { data } = await db.from('parents').select('*').eq('is_approved', false);
    const list = document.getElementById('pending-parents-list');
    list.innerHTML = '';

    if (!data || data.length === 0) { list.innerHTML = '<li>Nenhum pai aguardando aprovação.</li>'; return; }

    data.forEach(p => {
        list.innerHTML += `
            <li style="background: white; padding: 10px; border-radius: 10px; border: 1px solid #ddd; margin-bottom: 10px;">
                <strong>${p.email}</strong> <br> <small>📱 ${p.phone || 'Sem número'}</small>
                <button onclick="approveParent('${p.id}')" style="background: var(--secondary); color: white; padding: 5px 15px; border-radius: 5px; width: 100%; margin-top: 10px;">Aprovar Acesso</button>
            </li>`;
    });
}

async function approveParent(id) {
    await db.from('parents').update({ is_approved: true }).eq('id', id);
    showModal('Pronto!', 'Pai aprovado com sucesso!', 'success');
    loadPendingParents();
}

// ==========================================
// ABA: TAREFAS (MODAL FLUTUANTE)
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

// Abre a Janela Flutuante de Edição
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

    if (!desc || isNaN(val)) { showModal('Atenção', 'Preencha o nome e valor da nova tarefa.', 'error'); return; }

    await db.from('tasks').insert([{ parent_id: currentParentId, description: desc, value: val, is_obligatory: isObligatory }]);

    document.getElementById('new-task-desc').value = '';
    document.getElementById('new-task-val').value = '';
    document.getElementById('new-task-val').dataset.raw = '';

    showModal('Feito!', 'Nova tarefa adicionada.', 'success');
    loadTasksForAdmin();
}

async function saveEditedTask() {
    const id = document.getElementById('edit-modal-task-id').value;
    const desc = document.getElementById('edit-modal-task-desc').value.trim();
    const valRaw = document.getElementById('edit-modal-task-val').dataset.raw;
    const val = parseFloat(valRaw);
    const isObligatory = document.getElementById('edit-modal-task-type').value === 'true';

    if (!desc || isNaN(val)) { showModal('Atenção', 'Preencha tudo.', 'error'); return; }

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
// ABA: FILHOS (EDITAR DADOS COMPLETOS)
// ==========================================
async function addKid() {
    const name = document.getElementById('add-kid-name').value;
    const login = document.getElementById('add-kid-login').value.toLowerCase().trim();
    const pass = document.getElementById('add-kid-pass').value;

    if (!name || !login || !pass) { showModal('Atenção', 'Preencha todos os campos.', 'error'); return; }

    const { error } = await db.from('kids').insert([{ parent_id: currentParentId, name: name, login: login, pass: pass }]);
    if (error) { showModal('Erro', 'Este login já está sendo usado.', 'error'); }
    else {
        showModal('Sucesso', 'Cofre da criança criado!', 'success');
        document.getElementById('add-kid-name').value = ''; document.getElementById('add-kid-login').value = ''; document.getElementById('add-kid-pass').value = '';
        populateKidSelector();
    }
}

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
    document.getElementById('admin-total-money').innerText = `R$ ${kid.balance.toFixed(2).replace('.', ',')}`;

    // CARREGA DADOS PRO FORMULÁRIO DE EDIÇÃO DO FILHO
    currentKid = kid;
    document.getElementById('edit-kid-name').value = kid.name;
    document.getElementById('edit-kid-login').value = kid.login;
    document.getElementById('edit-kid-pass').value = kid.pass;

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: monthLogs } = await db.from('daily_log').select('*').eq('kid_id', kidId).gte('created_at', firstDayOfMonth);
    let earnedThisMonth = 0;
    if (monthLogs) { monthLogs.forEach(log => { if (!log.is_penalty) earnedThisMonth += log.value; }); }
    document.getElementById('admin-month-money').innerText = `R$ ${earnedThisMonth.toFixed(2).replace('.', ',')}`;

    const today = now.toISOString().split('T')[0];
    const { data: dailyLogs } = await db.from('daily_log').select('*').eq('kid_id', kidId).gte('created_at', `${today}T00:00:00Z`).order('created_at', { ascending: false });

    const adminLogDiv = document.getElementById('admin-daily-log');
    adminLogDiv.innerHTML = '';
    if (!dailyLogs || dailyLogs.length === 0) { adminLogDiv.innerHTML = '<p style="text-align:center; color:#888;">Nada hoje.</p>'; }
    else {
        dailyLogs.forEach(log => {
            const time = new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            if (log.is_penalty) adminLogDiv.innerHTML += `<div class="log-item penalty">❌ ${time} - ${log.description} (-R$ ${log.value.toFixed(2).replace('.', ',')})</div>`;
            else adminLogDiv.innerHTML += `<div class="log-item">✅ ${time} - ${log.description} (+R$ ${log.value.toFixed(2).replace('.', ',')})</div>`;
        });
    }
}

// NOVA FUNÇÃO: ATUALIZAR DADOS DO FILHO (NOME, LOGIN, SENHA)
async function updateKidData() {
    if (!currentKid) return;
    const newName = document.getElementById('edit-kid-name').value.trim();
    const newLogin = document.getElementById('edit-kid-login').value.trim().toLowerCase();
    const newPass = document.getElementById('edit-kid-pass').value.trim();

    if (!newName || !newLogin || !newPass) { showModal('Atenção', 'Preencha o Nome, Login e Senha.', 'error'); return; }

    const { error } = await db.from('kids').update({ name: newName, login: newLogin, pass: newPass }).eq('id', currentKid.id);

    if (error) {
        showModal('Ops!', 'Esse login já existe. Tente outro.', 'error');
    } else {
        showModal('Pronto!', 'Os dados da criança foram atualizados.', 'success');
        populateKidSelector(); // Recarrega o select com o novo nome
    }
}

async function applyPenaltyCustom() {
    const kidId = document.getElementById('kid-selector').value;
    const desc = document.getElementById('penalty-desc').value.trim();
    const valRaw = document.getElementById('penalty-val').dataset.raw;
    const val = parseFloat(valRaw);

    if (!kidId) { showModal('Erro', 'Selecione um filho.', 'error'); return; }
    if (!desc || isNaN(val)) { showModal('Erro', 'Preencha o motivo e valor.', 'error'); return; }

    const { data: kid } = await db.from('kids').select('balance').eq('id', kidId).single();
    let newBalance = Math.max(0, kid.balance - val);

    await db.from('kids').update({ balance: newBalance }).eq('id', kidId);
    await db.from('daily_log').insert([{ kid_id: kidId, description: desc, value: val, is_penalty: true }]);

    document.getElementById('penalty-desc').value = ''; document.getElementById('penalty-val').value = ''; document.getElementById('penalty-val').dataset.raw = '';
    showModal('Penalidade!', 'Desconto aplicado.', 'penalty');
    loadKidDataForAdmin();
}

// ==========================================
// PAINEL DO FILHO
// ==========================================
async function loadFilhoData() {
    const { data: dbTasks } = await db.from('tasks').select('*').eq('parent_id', currentKid.parent_id);
    const obligatory = dbTasks.filter(t => t.is_obligatory);
    const extras = dbTasks.filter(t => !t.is_obligatory);

    const today = new Date().toISOString().split('T')[0];
    const { data: logs } = await db.from('daily_log').select('*').eq('kid_id', currentKid.id).gte('created_at', `${today}T00:00:00Z`).order('created_at', { ascending: false });

    document.getElementById('total-money').innerText = `R$ ${currentKid.balance.toFixed(2).replace('.', ',')}`;

    const obDiv = document.getElementById('obligatory-tasks');
    const exDiv = document.getElementById('extra-tasks');
    obDiv.innerHTML = ''; exDiv.innerHTML = '';

    let completedObCount = 0;
    if (obligatory.length === 0) obDiv.innerHTML = '<p style="color:#666;">Nenhuma diária.</p>';

    obligatory.forEach(t => {
        const isDone = logs && logs.some(log => log.description === t.description);
        if (isDone) completedObCount++;
        obDiv.innerHTML += `<div class="task-item ${isDone ? 'task-done' : ''}"><div class="task-desc">${t.description} <br><small style="color:var(--secondary)">R$ ${t.value.toFixed(2).replace('.', ',')}</small></div><div class="task-action">${isDone ? '<span>✅ Feito</span>' : `<button onclick="saveKidTask('${t.description}', ${t.value})" style="background:var(--secondary); color:white; padding: 10px;">Fiz isso!</button>`}</div></div>`;
    });

    const allDone = obligatory.length > 0 && completedObCount === obligatory.length;
    document.getElementById('extra-section').classList.toggle('locked', !allDone);

    if (extras.length === 0) exDiv.innerHTML = '<p style="color:#666;">Nenhuma extra.</p>';
    extras.forEach(t => {
        exDiv.innerHTML += `<div class="task-item"><div class="task-desc">${t.description} <br><small style="color:var(--secondary)">R$ ${t.value.toFixed(2).replace('.', ',')}</small></div><div class="task-action"><button onclick="saveKidTask('${t.description}', ${t.value})" style="background:var(--secondary); color:white; padding: 10px;">+ Adicionar</button></div></div>`;
    });

    renderLogForFilho(logs);
}

function renderLogForFilho(logs) {
    const pList = document.getElementById('penalty-list'); const hList = document.getElementById('filho-daily-log');
    pList.innerHTML = ''; hList.innerHTML = ''; let hasP = false, hasE = false;
    if (logs) {
        logs.forEach(l => {
            const time = new Date(l.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            if (l.is_penalty) { hasP = true; pList.innerHTML += `<div class="penalty-item">❌ ${time} - ${l.description}</div>`; }
            else { hasE = true; hList.innerHTML += `<div class="log-item">✅ ${time} - ${l.description}</div>`; }
        });
    }
    document.getElementById('penalty-section').classList.toggle('hidden', !hasP);
    document.getElementById('history-section').classList.toggle('hidden', !hasE);
}

async function saveKidTask(desc, val) {
    let newBalance = currentKid.balance + val;
    await db.from('kids').update({ balance: newBalance }).eq('id', currentKid.id);
    currentKid.balance = newBalance;
    await db.from('daily_log').insert([{ kid_id: currentKid.id, description: desc, value: val, is_penalty: false }]);
    showModal('Mandou Bem!', `Você ganhou R$ ${val.toFixed(2).replace('.', ',')}!`, 'success');
    loadFilhoData();
}

async function logout() { await db.auth.signOut(); location.reload(); }