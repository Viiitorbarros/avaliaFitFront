
// js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Proteção: Se não estiver logado, volta para o login
    if (!localStorage.getItem("token")) {
        window.location.href = "index.html";
        return;
    }

    // 2. Ativa os cliques nos botões da barra lateral
    document.querySelectorAll('.nav-link').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Estética: Muda qual botão aparece como ativo
            document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Carrega a seção correspondente
            const section = button.getAttribute('data-section');
            carregarSecao(section);
        });
    });

    // Carrega a tela inicial por padrão ao entrar
    carregarSecao('inicio');
});

async function carregarSecao(sectionName, clienteId = null) {
    const contentArea = document.getElementById('content-area');

    switch (sectionName) {
        case 'inicio':
            contentArea.innerHTML = `
                <div class="text-center mt-5">
                    <img src="img/logo.png" alt="Logo" class="img-fluid mb-4" style="max-height: 200px;">
                    <h2 class="fw-bold">Bem-vindo ao AvaliaFit Pro</h2>
                    <p class="text-muted">Selecione uma opção ao lado para gerenciar seus alunos.</p>
                </div>`;
            break;

        case 'cliente':
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold">Gestão de Clientes</h2>
            <button class="btn text-white" style="background-color: #08700f; border-color: #08700f;" data-bs-toggle="modal" data-bs-target="#modalNovoCliente">
                <i class="bi bi-person-plus-fill me-1"></i> Novo Cliente
            </button>
        </div>
        
        <div class="card border-0 shadow-sm mb-3">
            <div class="card-body">
                <div class="input-group">
                    <span class="input-group-text bg-white border-end-0">
                        <i class="bi bi-search text-muted"></i>
                    </span>
                    <input type="text" id="inputPesquisaCliente" class="form-control border-start-0 ps-0" 
                           placeholder="Pesquisar cliente por nome..." onkeyup="filtrarClientes()">
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
                <table class="table table-hover mb-0" id="tabelaClientes">
                    <thead class="table-light">
                        <tr>
                            <th class="ps-4">Nome</th>
                            <th>Idade</th>
                            <th>Sexo</th>
                            <th class="text-end pe-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tabela-clientes-corpo">
                        <tr><td colspan="4" class="text-center">Carregando clientes...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="modal fade" id="modalNovoCliente" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title fw-bold">Cadastrar Novo Aluno</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Nome Completo</label>
                            <input type="text" id="nomeCliente" class="form-control" placeholder="Ex: Vitor Barros" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Telefone/WhatsApp</label>
                            <input type="text" id="telefoneCliente" class="form-control" placeholder="(22) 99999-9999">
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-bold">Idade</label>
                                <input type="number" id="idadeCliente" class="form-control" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-bold">Sexo</label>
                                <select id="sexoCliente" class="form-select" required>
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="salvarNovoCliente()">Salvar Aluno</button>
                    </div>
                </div>
            </div>
        </div>
        
        </div> <div class="modal fade" id="modalEditarCliente" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-dark">
                        <h5 class="modal-title fw-bold">Editar Aluno</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="editClienteId">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Nome Completo</label>
                            <input type="text" id="editNomeCliente" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Telefone/WhatsApp</label>
                            <input type="text" id="editTelefoneCliente" class="form-control">
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-bold">Idade</label>
                                <input type="number" id="editIdadeCliente" class="form-control" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-bold">Sexo</label>
                                <select id="editSexoCliente" class="form-select" required>
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-warning" onclick="salvarEdicaoCliente()">Atualizar Aluno</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="modalNovaAvaliacao" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-success text-white py-3">
                        <h5 class="modal-title fw-bold">Nova Avaliação: <span id="nomeAlunoAvaliar"></span></h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <form id="formNovaAvaliacao">
                            <input type="hidden" id="novoClienteId">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Peso (kg)</label>
                                    <input type="number" step="0.1" id="novoPeso" class="form-control" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Altura (m)</label>
                                    <input type="number" step="0.01" id="novoAltura" class="form-control" required>
                                </div>
                                <div class="col-12"><hr></div>
                                <p class="fw-bold text-success mb-1">Dobras Cutâneas (mm)</p>
                                <div class="col-md-4">
                                    <label class="form-label small">Tríceps</label>
                                    <input type="number" id="novoTriceps" class="form-control" value="0">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small">Peitoral</label>
                                    <input type="number" id="novoPeitoral" class="form-control" value="0">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small">Axilar Média</label>
                                    <input type="number" id="novoAxialMedia" class="form-control" value="0">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small">Subescapular</label>
                                    <input type="number" id="novoSubEscapular" class="form-control" value="0">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small">Abdomen</label>
                                    <input type="number" id="novoAbdomen" class="form-control" value="0">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small">Supra-Ilíaca</label>
                                    <input type="number" id="novoSupraIliaca" class="form-control" value="0">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small">Coxa</label>
                                    <input type="number" id="novoCoxa" class="form-control" value="0">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-success" onclick="salvarNovaAvaliacao()">Salvar Avaliação</button>
                    </div>
                </div>
            </div>
        </div>`;
    
    await listarClientesNoDashboard();
    break;

        case 'avaliacao':
            if (clienteId) {
                contentArea.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="fw-bold">Histórico de Avaliações</h2>
                        <button class="btn btn-outline-secondary" onclick="carregarSecao('cliente')">
                            <i class="bi bi-arrow-left"></i> Voltar para Clientes
                        </button>
                    </div>
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-body p-0">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th class="ps-4">Data</th>
                                        <th>Peso</th>
                                        <th>Altura</th>
                                        <th class="text-end pe-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="tabela-avaliacoes-corpo">
                                    <tr><td colspan="4" class="text-center">Buscando avaliações...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="modal fade" id="modalEditarAvaliacao" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header bg-primary text-white">
                                    <h5 class="modal-title fw-bold">Editar Avaliação Física</h5>
                                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body">
                                    <form id="formEditarAvaliacao">
                                        <input type="hidden" id="editAvaliacaoId">
                                        <input type="hidden" id="editClienteId">
                                        <div class="row g-3">
                                            <div class="col-md-6"><label class="form-label fw-bold">Peso (kg)</label><input type="number" step="0.1" id="editPeso" class="form-control" required></div>
                                            <div class="col-md-6"><label class="form-label fw-bold">Altura (m)</label><input type="number" step="0.01" id="editAltura" class="form-control" required></div>
                                            <div class="col-12 mt-4"><h6 class="text-primary border-bottom pb-2 fw-bold">Dobras Cutâneas (mm)</h6></div>
                                            <div class="col-md-3"><label class="form-label">Tríceps</label><input type="number" id="editTriceps" class="form-control"></div>
                                            <div class="col-md-3"><label class="form-label">Peitoral</label><input type="number" id="editPeitoral" class="form-control"></div>
                                            <div class="col-md-3"><label class="form-label">Abdomem</label><input type="number" id="editAbdomen" class="form-control"></div>
                                            <div class="col-md-3"><label class="form-label">Supra-Ilíaca</label><input type="number" id="editSupraIliaca" class="form-control"></div>
                                            <div class="col-md-4"><label class="form-label">Axilar Média</label><input type="number" id="editAxialMedia" class="form-control"></div>
                                            <div class="col-md-4"><label class="form-label">Subescapular</label><input type="number" id="editSubEscapular" class="form-control"></div>
                                            <div class="col-md-4"><label class="form-label">Coxa</label><input type="number" id="editCoxa" class="form-control"></div>
                                        </div>
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                    <button type="button" class="btn btn-success" onclick="salvarEdicaoAvaliacao()">Salvar Alterações</button>
                                </div>
                            </div>
                        </div>
                    </div>`;
                listarAvaliacoesDoCliente(clienteId);
            }
            break;


        case 'agendamento':
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold"><i class="bi bi-calendar3 me-2 text-primary"></i>Agenda de Alunos</h2>
            <button class="btn text-white" style="background-color: #08700f; border-color: #08700f;" onclick="abrirModalAgendamento()">
                <i class="bi bi-plus-lg me-1"></i> Novo Agendamento
            </button>
        </div>
        
        <div class="card border-0 shadow-sm p-4">
            <div id="calendar"></div>
        </div>

        <div class="modal fade" id="modalAgendamento" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title fw-bold" id="tituloModalAgendamento">Agendamento</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <form id="formAgendamento">
                            <input type="hidden" id="agen-id">
                            <div class="mb-3">
                                <label class="form-label fw-bold">Nome do Aluno</label>
                                <input type="text" id="agen-nome" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold">Telefone</label>
                                <input type="tel" id="agen-telefone" class="form-control">
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold">Data e Hora</label>
                                <input type="datetime-local" id="agen-dataHora" class="form-control" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer d-flex justify-content-between">
                        <button type="button" class="btn btn-danger" id="btnExcluirAgendamento" style="display:none" onclick="handleExcluir()">Excluir</button>
                        <div>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary px-4" onclick="handleSalvar()">Salvar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    
    // Inicia o calendário após injetar o HTML
    setTimeout(inicializarCalendario, 100); 
    break;
    }
}