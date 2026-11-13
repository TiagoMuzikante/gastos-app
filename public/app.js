// ============================================================
// app.js — Lógica do Controle de Gastos (localStorage)
// ============================================================

// ---- Chave usada para salvar os dados no localStorage ----
const CHAVE_LOCAL = 'gastos_app';

// ---- Referências aos elementos do HTML ----
const formGasto        = document.getElementById('formGasto');
const inputNome        = document.getElementById('nome');
const inputData        = document.getElementById('data');
const inputCategoria   = document.getElementById('categoria');
const inputValor       = document.getElementById('valor');
const tabelaGastos     = document.getElementById('tabelaGastos');
const totalGeral       = document.getElementById('totalGeral');
const resumoCategorias = document.getElementById('resumoCategorias');
const filtroMes        = document.getElementById('filtroMes');
const btnFiltrar       = document.getElementById('btnFiltrar');
const btnLimparFiltro  = document.getElementById('btnLimparFiltro');

// ---- Inicializa a data de hoje no campo de data ----
inputData.value = new Date().toISOString().split('T')[0];

// ============================================================
// FUNÇÕES DE ACESSO AO localStorage
// ============================================================

// Lê e retorna a lista de gastos salva
function carregarGastos() {
  const dados = localStorage.getItem(CHAVE_LOCAL);
  return dados ? JSON.parse(dados) : [];
}

// Salva a lista de gastos no localStorage
function salvarGastos(lista) {
  localStorage.setItem(CHAVE_LOCAL, JSON.stringify(lista));
}

// ============================================================
// REGISTRO DE GASTO
// ============================================================

formGasto.addEventListener('submit', function (evento) {
  evento.preventDefault(); // impede o envio padrão do formulário

  // Lê os valores do formulário
  const novoGasto = {
    id: Date.now(),                       // ID único baseado no timestamp
    nome: inputNome.value.trim(),
    data: inputData.value,
    categoria: inputCategoria.value,
    valor: parseFloat(inputValor.value)
  };

  // Adiciona à lista e salva
  const lista = carregarGastos();
  lista.push(novoGasto);
  salvarGastos(lista);

  // Atualiza a tela
  renderizarTabela(lista);

  // Limpa os campos (mantém a data de hoje)
  inputNome.value = '';
  inputCategoria.value = '';
  inputValor.value = '';
  inputData.value = new Date().toISOString().split('T')[0];

  alert('Gasto registrado com sucesso!');
});

// ============================================================
// RENDERIZAÇÃO DA TABELA
// ============================================================

// Recebe a lista (já filtrada ou completa) e monta a tabela
function renderizarTabela(lista) {
  // Ordena por data (mais recente primeiro)
  const ordenada = [...lista].sort((a, b) => new Date(b.data) - new Date(a.data));

  // Monta as linhas
  if (ordenada.length === 0) {
    tabelaGastos.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted">Nenhum gasto encontrado.</td>
      </tr>`;
    totalGeral.textContent = 'R$ 0,00';
    resumoCategorias.innerHTML = '';
    return;
  }

  let html = '';
  let total = 0;

  ordenada.forEach((gasto, index) => {
    total += gasto.valor;

    // Formata a data de yyyy-mm-dd para dd/mm/yyyy
    const [ano, mes, dia] = gasto.data.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;

    // Escolhe a cor do badge conforme a categoria
    const corBadge = corPorCategoria(gasto.categoria);

    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${gasto.nome}</td>
        <td>${dataFormatada}</td>
        <td>
          <span class="badge ${corBadge} badge-categoria">
            ${gasto.categoria}
          </span>
        </td>
        <td>R$ ${gasto.valor.toFixed(2).replace('.', ',')}</td>
      </tr>`;
  });

  tabelaGastos.innerHTML = html;
  totalGeral.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

  // Atualiza o resumo por categoria
  renderizarResumoCategorias(ordenada);
}

// ============================================================
// RESUMO POR CATEGORIA
// ============================================================

function renderizarResumoCategorias(lista) {
  // Agrupa os valores por categoria usando um objeto simples
  const agrupado = {};

  lista.forEach(gasto => {
    if (!agrupado[gasto.categoria]) {
      agrupado[gasto.categoria] = 0;
    }
    agrupado[gasto.categoria] += gasto.valor;
  });

  // Monta os cards de resumo
  let html = '<div class="row g-2">';

  for (const categoria in agrupado) {
    const cor = corPorCategoria(categoria);
    const valor = agrupado[categoria].toFixed(2).replace('.', ',');

    html += `
      <div class="col-6 col-md-3">
        <div class="card text-center p-2 border-0 shadow-sm">
          <span class="badge ${cor} mb-1">${categoria}</span>
          <strong>R$ ${valor}</strong>
        </div>
      </div>`;
  }

  html += '</div>';
  resumoCategorias.innerHTML = html;
}

// ============================================================
// FILTRAGEM POR MÊS
// ============================================================

btnFiltrar.addEventListener('click', function () {
  const mesSelecionado = filtroMes.value; // formato: "2024-03"

  if (!mesSelecionado) {
    alert('Selecione um mês para filtrar.');
    return;
  }

  const todos = carregarGastos();

  // Filtra os gastos cujo campo "data" começa com o mês selecionado
  const filtrados = todos.filter(gasto => gasto.data.startsWith(mesSelecionado));

  renderizarTabela(filtrados);
});

btnLimparFiltro.addEventListener('click', function () {
  filtroMes.value = '';
  renderizarTabela(carregarGastos());
});

// ============================================================
// UTILITÁRIO: cor do badge por categoria
// ============================================================

function corPorCategoria(categoria) {
  const cores = {
    'Alimentação':  'bg-success',
    'Moradia':      'bg-primary',
    'Transporte':   'bg-warning text-dark',
    'Saúde':        'bg-danger',
    'Educação':     'bg-info text-dark',
    'Lazer':        'bg-purple',   // fallback para secondary
    'Vestuário':    'bg-secondary',
    'Outros':       'bg-dark'
  };
  return cores[categoria] || 'bg-secondary';
}

// ============================================================
// INICIALIZAÇÃO: carrega os gastos ao abrir a página
// ============================================================
renderizarTabela(carregarGastos());
