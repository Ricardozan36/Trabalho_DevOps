
// Seleção dos elementos do HTML para manipulação via JS
const formulario = document.querySelector('#formulario-tarefa');
const listaTarefas = document.querySelector('#lista-tarefas');
const filtroPrioridade = document.querySelector('#prioridade-filtro');
const filtroStatus = document.querySelector('#status-filtro');


// Lógica para garantir o ID durante a edição de uma tarefa
const inputIdEdicao = document.querySelector('#tarefa-id-edicao') || Object.assign(document.createElement('input'), {type: 'hidden', id: 'tarefa-id-edicao'});
if (!document.querySelector('#tarefa-id-edicao')) formulario.appendChild(inputIdEdicao);


// Salva os dados utilizando LocalStorage
let tarefas = JSON.parse(localStorage.getItem('minhas-tarefas')) || [];

function atualizarDados() {
    localStorage.setItem('minhas-tarefas', JSON.stringify(tarefas));
    renderizar();
}

// Define a cor da prioridade baixa, media e alta
function obterCorPrioridade(prioridade) {
    switch (prioridade) {
        case 'Alta': return '#dc3545';
        case 'Média': return '#ffc107';
        case 'Baixa': return '#198754';
        default: return '#333';
    }
}

//Renderização, limpa a lista e reconstrói na tela
function renderizar() {
    listaTarefas.innerHTML = '';

    const prioridadeSelecionada = filtroPrioridade.value;
    const statusSelecionado = filtroStatus.value;

// Aplica os filtros de Prioridade e Status selecionados na navbar
    const tarefasFiltradas = tarefas.filter(t => {
        const matchPrioridade = prioridadeSelecionada === 'Todas' || t.prioridade === prioridadeSelecionada;
        const matchStatus = statusSelecionado === 'Todos' || t.status === statusSelecionado;
        return matchPrioridade && matchStatus;
    });

    // Mensagem caso não haja tarefas cadastradas
    if (tarefasFiltradas.length === 0) {
        listaTarefas.innerHTML = `
            <div style="text-align:center; padding:40px; color:#666;">
                <p>Nenhuma tarefa encontrada.</p>
            </div>`;
        return;
    }

    // Cria dinamicamente o HTML de cada tarefa filtrada
    tarefasFiltradas.forEach(t => {
        const item = document.createElement('div');
        item.className = `item-tarefa ${t.prioridade} ${t.status === 'Concluída' ? 'concluida' : ''}`;

        item.innerHTML = `
            <div class="info-tarefa">
                <span style="font-weight:bold; color:${obterCorPrioridade(t.prioridade)}">${t.prioridade}</span>
                <h3>${t.titulo}</h3>
                <p>${t.descricao}</p>
            </div>
            <div class="meta-tarefa">
                <span>📅 ${t.dataCriacao}</span><br>
                <strong>${t.status}</strong>
            </div>
            <div class="acoes">
                <button class="btn-acao btn-editar" onclick="prepararEdicao(${t.id})" title="Editar" style="color: #3b71ca;">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-acao btn-concluir" onclick="alternarStatus(${t.id})" title="Marcar como concluída">
                    <i class="fa-solid ${t.status === 'Concluída' ? 'fa-circle-left' : 'fa-circle-check'}"></i>
                </button>
                <button class="btn-acao btn-excluir" onclick="excluirTarefa(${t.id})" title="Excluir">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        listaTarefas.appendChild(item);
    });
}

// Função para preencher o formulário com os dados da tarefa a ser editada
window.prepararEdicao = (id) => {
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa) {
        document.getElementById('titulo-tarefa').value = tarefa.titulo;
        document.getElementById('descricao-tarefa').value = tarefa.descricao;
        document.getElementById('prioridade-tarefa').value = tarefa.prioridade;
        document.getElementById('tarefa-id-edicao').value = tarefa.id;

        // Altera visualmente o botão para indicar modo de edição
        const btn = document.getElementById('btn-adicionar');
        btn.textContent = "Salvar Alterações";
        btn.style.background = "#ffc107";
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Reprocessa as informações da tarefa
formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const idEdicao = document.getElementById('tarefa-id-edicao').value;
    const titulo = document.getElementById('titulo-tarefa').value;
    const descricao = document.getElementById('descricao-tarefa').value;
    const prioridade = document.getElementById('prioridade-tarefa').value;

// Edição da tarefa, localiza a tarefa pelo ID e substitui os dados
    if (idEdicao) {
        tarefas = tarefas.map(t => {
            if (t.id === parseInt(idEdicao)) {
                return { ...t, titulo, descricao, prioridade };
            }
            return t;
        });
        
        // Retorna o botão ao estado original de "Adicionar"
        const btn = document.getElementById('btn-adicionar');
        btn.textContent = "Adicionar";
        btn.style.background = "#3b71ca";
        document.getElementById('tarefa-id-edicao').value = "";

// Adição tarefa, cria um novo objeto de tarefa com ID único
    } else {
        const novaTarefa = {
            id: Date.now(),
            titulo,
            descricao,
            prioridade,
            dataCriacao: new Date().toLocaleDateString('pt-BR'),
            status: 'Pendente'
        };
        tarefas.push(novaTarefa);
    }

    formulario.reset();
    atualizarDados();
});

// Altera o status entre 'Pendente' e 'Concluída'
window.alternarStatus = (id) => {
    tarefas = tarefas.map(t => {
        if (t.id === id) {
            return { ...t, status: t.status === 'Pendente' ? 'Concluída' : 'Pendente' };
        }
        return t;
    });
    atualizarDados();
};

// Remove a tarefa com confirmação
window.excluirTarefa = (id) => {
    if (confirm('Deseja excluir esta tarefa?')) {
        const botao = event.currentTarget; 
        const card = botao.closest('.item-tarefa'); 

        card.classList.add('removendo');

        setTimeout(() => {
            tarefas = tarefas.filter(t => t.id !== id);
            atualizarDados();
        }, 400);
    }
};

// Re-renderização quando o usuário muda o filtro
filtroPrioridade.addEventListener('change', renderizar);
filtroStatus.addEventListener('change', renderizar);

renderizar();
