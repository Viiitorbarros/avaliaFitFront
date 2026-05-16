async function listarClientesNoDashboard() {
    const corpo = document.getElementById("tabela-clientes-corpo");
    const response = await apiFetch('/clientes');
    if (response && response.ok) {
        const clientes = await response.json();
        corpo.innerHTML = "";
        clientes.forEach(c => {
            corpo.innerHTML += `
                <tr>
                    <td>${c.nome}</td>
                    <td>${c.idade}</td>
                    <td>${c.sexo}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-success text-white me-1" onclick="abrirModalNovaAvaliacao(${c.id}, '${c.nome}')" title="Nova Avaliação">
                            <i class="bi bi-book"> Nova Avaliação </i>
                        </button>
                        <button class="btn btn-sm btn-info text-white" onclick="verAvaliacao(${c.id})">Avaliações</button>
                        <button class="btn btn-sm btn-warning"
                            onclick="abrirModalEditarCliente(${c.id}, '${c.nome}', '${c.telefone}', ${c.idade}, '${c.sexo}')">
                            Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmarExclusao(${c.id})">Excluir</button>
                    </td>
                </tr>`;
        });
    }
}

async function salvarNovoCliente() {
    const dados = {
        nome: document.getElementById("nomeCliente").value,
        telefone: document.getElementById("telefoneCliente").value,
        idade: parseInt(document.getElementById("idadeCliente").value),
        sexo: document.getElementById("sexoCliente").value
    };
    const response = await apiFetch('/clientes', { method: 'POST', body: JSON.stringify(dados) });
    if (response.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalNovoCliente')).hide();
        carregarSecao('cliente');
    }
}

async function confirmarExclusao(id) {
    if (!confirm("Tem certeza? Isso excluirá o cliente e todas as suas avaliações!")) return;

    try {
        const response = await apiFetch(`/clientes/${id}`, { method: 'DELETE' });
        if (response && response.ok) {
            alert("Cliente e avaliações removidos com sucesso!");
            carregarSecao('cliente'); // Recarrega a aba sem dar reload na página
        }
    } catch (error) {
        console.error("Erro ao excluir:", error);
    }
}

function verAvaliacao(clienteId) {
    // Chama a função do dashboard passando o ID do cliente selecionado
    carregarSecao('avaliacao', clienteId); 
}


function filtrarClientes() {
    // 1. Pega o valor digitado e transforma em minúsculo para comparar
    const termo = document.getElementById('inputPesquisaCliente').value.toLowerCase();
    const tabela = document.getElementById('tabelaClientes');
    const linhas = tabela.getElementsByTagName('tr');

    // 2. Percorre todas as linhas da tabela (pulando o cabeçalho)
    for (let i = 1; i < linhas.length; i++) {
        const colunaNome = linhas[i].getElementsByTagName('td')[0]; // A primeira coluna é o Nome
        
        if (colunaNome) {
            const nomeTexto = colunaNome.textContent || colunaNome.innerText;
            
            // 3. Se o termo estiver contido no nome, mostra a linha. Se não, esconde.
            if (nomeTexto.toLowerCase().indexOf(termo) > -1) {
                linhas[i].style.display = "";
            } else {
                linhas[i].style.display = "none";
            }
        }
    }
    
}


// Função para o botão do livrinho na lista de clientes
function abrirModalNovaAvaliacao(id, nome) {
    // 1. Define o ID do cliente no campo oculto do formulário
    const campoId = document.getElementById('novoClienteId');
    if (campoId) campoId.value = id;

    // 2. Mostra o nome do aluno no título do modal
    const campoNome = document.getElementById('nomeAlunoAvaliar');
    if (campoNome) campoNome.innerText = nome;

    // 3. Limpa o formulário para uma nova entrada
    const form = document.getElementById('formNovaAvaliacao');
    if (form) form.reset();

    // 4. Abre o modal
    const modalElement = document.getElementById('modalNovaAvaliacao');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}


function abrirModalEditarCliente(id, nome, telefone, idade, sexo) {
    document.getElementById("editClienteId").value = id;
    document.getElementById("editNomeCliente").value = nome;
    document.getElementById("editTelefoneCliente").value = telefone;
    document.getElementById("editIdadeCliente").value = idade;
    document.getElementById("editSexoCliente").value = sexo;

    const modal = new bootstrap.Modal(document.getElementById('modalEditarCliente'));
    modal.show();
}

async function salvarEdicaoCliente() {
    const id = document.getElementById("editClienteId").value;
    
    const dados = {
        nome: document.getElementById("editNomeCliente").value,
        telefone: document.getElementById("editTelefoneCliente").value,
        idade: parseInt(document.getElementById("editIdadeCliente").value),
        sexo: document.getElementById("editSexoCliente").value
    };

    try {
        const response = await apiFetch(`/clientes/${id}`, { 
            method: 'PUT', 
            body: JSON.stringify(dados) 
        });

        if (response && response.ok) {
            // Fecha o modal
            const modalElement = document.getElementById('modalEditarCliente');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            // Atualiza a lista de clientes
            carregarSecao('cliente');
            alert("Cliente atualizado com sucesso!");
        } else {
            alert("Erro ao atualizar cliente.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}