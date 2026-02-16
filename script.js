// CONEXÃO COM O SUPABASE
const SUPABASE_URL = 'https://tpekttzyidlsjhvrgohl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_o7GkoqfM-QdNKBa_Pc9MqA_FTYKjmvr';

// CORREÇÃO: Usando 'db' (database) para não conflitar com a biblioteca do Supabase
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const taskData = {
    obligatory: [
        { id: 'leitura', desc: "Leitura Diária: R$ 0,50 (Mínimo de 15 a 20 minutos com resumo).", val: 0.50 },
        { id: 'duolingo', desc: "Lição no Duolingo: R$ 0,50 (Completar pelo menos uma unidade/lição).", val: 0.50 }
    ],
    extras: [
        { id: 'louca_l', desc: "Lavar a louça (refeição leve): R$ 0,25.", val: 0.25 },
        { id: 'louca_s', desc: "Secar e guardar a louça: R$ 0,25.", val: 0.25 },
        { id: 'cama', desc: "Arrumar a própria cama: R$ 0,20.", val: 0.20 },
        { id: 'brinquedos', desc: "Recolher e guardar os próprios brinquedos: R$ 0,30.", val: 0.30 },
        { id: 'roupa', desc: "Colocar roupa suja no cesto: R$ 0,10.", val: 0.10 },
        { id: 'mesa', desc: "Ajudar a pôr ou tirar a mesa: R$ 0,15.", val: 0.15 },
        { id: 'brincar_irmao', desc: "Brincar com o irmão (sem briga por 30 min): R$ 0,50.", val: 0.50 },
        { id: 'emprestar', desc: "Emprestar um brinquedo sem reclamar: R$ 0,25.", val: 0.25 },
        { id: 'sozinho', desc: "Brincar sozinho com seus brinquedos (foco): R$ 0,25.", val: 0.25 },
        { id: 'iniciativa', desc: "Iniciativa (fazer algo sem ser pedido): R$ 0,50.", val: 0.50 }
    ]
};

let currentKid = null;

// ==========================================
// SISTEMA DE MODAL ANIMADO
// ==========================================
function showModal(title, message, type = 'success') {
    const modal = document.getElementById('custom-modal');
    const icon = document.getElementById('modal-icon');
    const titleEl = document.getElementById('modal-title');
    const btn = document.querySelector('.btn-modal');

    document.getElementById('modal-message').innerText = message;
    titleEl.innerText = title;

    if (type === 'success') {
        icon.innerText = '🌟';
        titleEl.style.color = '#4CAF50';
        btn.style.background = '#4CAF50';
        btn.innerText = 'Oba! Entendi';
    } else if (type === 'error') {
        icon.innerText = '💔';
        titleEl.style.color = '#FF4B2B';
        btn.style.background = '#FF4B2B';
        btn.innerText = 'Poxa vida...';
    } else if (type === 'penalty') {
        icon.innerText = '⚠️';
        titleEl.style.color = '#FF4B2B';
        btn.style.background = '#333';
        btn.innerText = 'Feito!';
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('custom-modal').classList.add('hidden');
}


// ==========================================
// LOGIN INTELIGENTE
// ==========================================
async function handleLogin() {
    const user = document.getElementById('user').value.toLowerCase().trim();
    const pass = document.getElementById('pass').value;
    const btn = document.getElementById('btn-login-text');

    if (!user || !pass) {
        document.getElementById('login-error').innerText = "Preencha tudo para entrar!";
        document.getElementById('login-error').classList.remove('hidden');
        return;
    }

    btn.innerText = "Mágica acontecendo...";
    document.getElementById('login-error').classList.add('hidden');

    if (user.includes('@')) {
        const { data, error } = await db.auth.signInWithPassword({
            email: user,
            password: pass,
        });

        if (error) {
            document.getElementById('login-error').innerText = "E-mail ou senha do Pai incorretos!";
            document.getElementById('login-error').classList.remove('hidden');
            btn.innerText = "Entrar";
            return;
        }

        showPanel('admin-panel');
        await populateKidSelector();
        btn.innerText = "Entrar";
        return;
    }

    const { data, error } = await db
        .from('kids')
        .select('*')
        .eq('login', user)
        .eq('pass', pass)
        .single();

    if (data) {
        currentKid = data;
        document.getElementById('filho-welcome').innerText = `Olá, ${data.name}! 🏆`;
        showPanel('filho-panel');
        await loadFilhoData();
    } else {
        document.getElementById('login-error').innerText = "Usuário ou senha da criança incorretos!";
        document.getElementById('login-error').classList.remove('hidden');
    }

    btn.innerText = "Entrar";
}

function showPanel(id) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
}


// ==========================================
// FUNÇÕES DO PAI (ADMIN)
// ==========================================
async function populateKidSelector() {
    const { data } = await db.from('kids').select('*').eq('role', 'filho');
    const selector = document.getElementById('kid-selector');

    if (!data || data.length === 0) {
        selector.innerHTML = '<option value="">Nenhuma criança encontrada no banco.</option>';
        return;
    }

    selector.innerHTML = '<option value="">Selecione uma criança...</option>';
    data.forEach(k => {
        selector.innerHTML += `<option value="${k.id}">${k.name}</option>`;
    });
}

async function loadKidDataForAdmin() {
    const kidId = document.getElementById('kid-selector').value;
    const detailsDiv = document.getElementById('admin-kid-details');

    if (!kidId) { detailsDiv.classList.add('hidden'); return; }

    detailsDiv.classList.remove('hidden');

    const { data: kid } = await db.from('kids').select('*').eq('id', kidId).single();

    const today = new Date().toISOString().split('T')[0];
    const { data: logs } = await db
        .from('daily_log')
        .select('*')
        .eq('kid_id', kidId)
        .gte('created_at', `${today}T00:00:00Z`)
        .order('created_at', { ascending: false });

    currentKid = kid;
    document.getElementById('admin-total-money').innerText = `R$ ${kid.balance.toFixed(2).replace('.', ',')}`;

    document.getElementById('edit-kid-login').value = kid.login;
    document.getElementById('edit-kid-pass').value = kid.pass;

    const adminLogDiv = document.getElementById('admin-daily-log');
    adminLogDiv.innerHTML = '';

    if (!logs || logs.length === 0) {
        adminLogDiv.innerHTML = '<p style="text-align:center; color:#888;">Nenhuma atividade registrada hoje.</p>';
    } else {
        logs.forEach(log => {
            const time = new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            if (log.is_penalty) {
                adminLogDiv.innerHTML += `<div class="log-item penalty">❌ ${time} - ${log.description} (-R$ ${log.value.toFixed(2).replace('.', ',')})</div>`;
            } else {
                adminLogDiv.innerHTML += `<div class="log-item">✅ ${time} - ${log.description} (+R$ ${log.value.toFixed(2).replace('.', ',')})</div>`;
            }
        });
    }
}

async function updateKidCredentials() {
    if (!currentKid || !currentKid.id) return;

    const newLogin = document.getElementById('edit-kid-login').value.trim().toLowerCase();
    const newPass = document.getElementById('edit-kid-pass').value.trim();
    const btn = document.getElementById('btn-update-cred');

    if (!newLogin || !newPass) {
        showModal('Atenção', 'O login e a senha não podem ficar vazios!', 'error');
        return;
    }

    btn.innerText = "Salvando...";

    const { error } = await db
        .from('kids')
        .update({ login: newLogin, pass: newPass })
        .eq('id', currentKid.id);

    if (error) {
        showModal('Ops!', 'Esse login já existe. Escolha outro.', 'error');
    } else {
        showModal('Pronto!', 'O acesso de ' + currentKid.name + ' foi atualizado com sucesso.', 'success');
        currentKid.login = newLogin;
        currentKid.pass = newPass;
    }

    btn.innerText = "Salvar Alterações";
}


// ==========================================
// FUNÇÕES DO FILHO
// ==========================================
async function loadFilhoData() {
    const today = new Date().toISOString().split('T')[0];
    const { data: logs } = await db
        .from('daily_log')
        .select('*')
        .eq('kid_id', currentKid.id)
        .gte('created_at', `${today}T00:00:00Z`)
        .order('created_at', { ascending: false });

    document.getElementById('total-money').innerText = `R$ ${currentKid.balance.toFixed(2).replace('.', ',')}`;

    const obDiv = document.getElementById('obligatory-tasks');
    const exDiv = document.getElementById('extra-tasks');
    obDiv.innerHTML = ''; exDiv.innerHTML = '';

    let completedObligatoryCount = 0;

    taskData.obligatory.forEach(t => {
        const isDone = logs && logs.some(log => log.description === t.desc);
        if (isDone) completedObligatoryCount++;

        obDiv.innerHTML += `
            <div class="task-item ${isDone ? 'task-done' : ''}">
                <div class="task-desc">${t.desc}</div>
                <div class="task-action">
                    <span>${isDone ? '✅ Feito' : ''}</span>
                    ${!isDone ? `<button onclick="saveTask('${t.desc}', ${t.val}, false)" style="background:var(--secondary); color:white; padding: 10px 15px;">Fiz isso!</button>` : ''}
                </div>
            </div>`;
    });

    const allDone = completedObligatoryCount === taskData.obligatory.length;
    document.getElementById('extra-section').classList.toggle('locked', !allDone);

    taskData.extras.forEach(t => {
        exDiv.innerHTML += `
            <div class="task-item">
                <div class="task-desc">${t.desc}</div>
                <div class="task-action">
                    <button onclick="saveTask('${t.desc}', ${t.val}, false)" style="background:var(--secondary); color:white; padding: 10px 15px;">+ Adicionar</button>
                </div>
            </div>`;
    });

    renderLogForFilho(logs);
}

function renderLogForFilho(logs) {
    const penaltyList = document.getElementById('penalty-list');
    const historyList = document.getElementById('filho-daily-log');
    penaltyList.innerHTML = ''; historyList.innerHTML = '';

    let hasP = false, hasE = false;

    if (logs) {
        logs.forEach(log => {
            const time = new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            if (log.is_penalty) {
                hasP = true;
                penaltyList.innerHTML += `<div class="penalty-item">❌ ${time} - ${log.description}</div>`;
            } else {
                hasE = true;
                historyList.innerHTML += `<div class="log-item">✅ ${time} - ${log.description}</div>`;
            }
        });
    }

    document.getElementById('penalty-section').classList.toggle('hidden', !hasP);
    document.getElementById('history-section').classList.toggle('hidden', !hasE);
}


// ==========================================
// GRAVAÇÃO DE DADOS (Dinheiro e Log)
// ==========================================
async function saveTask(desc, val, isPenalty) {
    let newBalance = isPenalty ? Math.max(0, currentKid.balance - val) : currentKid.balance + val;

    await db.from('kids').update({ balance: newBalance }).eq('id', currentKid.id);
    currentKid.balance = newBalance;

    await db.from('daily_log').insert([{
        kid_id: currentKid.id,
        description: desc,
        value: val,
        is_penalty: isPenalty
    }]);

    if (document.getElementById('filho-panel').classList.contains('hidden')) {
        showModal('Penalidade Aplicada!', 'O valor foi descontado do cofre da criança.', 'penalty');
        loadKidDataForAdmin();
    } else {
        showModal('Mandou Bem!', `Você ganhou R$ ${val.toFixed(2).replace('.', ',')}! Continue assim!`, 'success');
        loadFilhoData();
    }
}

function applyPenalty(desc, val) {
    if (!currentKid) {
        showModal('Erro', 'Selecione uma criança primeiro.', 'error');
        return;
    }
    saveTask(desc, val, true);
}


// ==========================================
// SAIR DO APP
// ==========================================
async function logout() {
    await db.auth.signOut();
    location.reload();
}