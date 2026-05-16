// 1. LISTAR AVALIAÇÕES (Com botão de PDF)
async function listarAvaliacoesDoCliente(clienteId) {
    const corpoTabela = document.getElementById("tabela-avaliacoes-corpo");
    if (!corpoTabela) return;

    try {
        const response = await apiFetch(`/avaliacoes/cliente/${clienteId}`);
        
        if (response && response.ok) {
            const avaliacoes = await response.json();
            corpoTabela.innerHTML = "";

            if (avaliacoes.length === 0) {
                corpoTabela.innerHTML = "<tr><td colspan='4' class='text-center'>Nenhuma avaliação encontrada.</td></tr>";
                return;
            }

            avaliacoes.forEach(av => {
                const valorData = av.data || av.dataCriacao;
                let dataExibicao = "Data pendente";

                if (valorData) {
                    const dataObjeto = Array.isArray(valorData) 
                        ? new Date(valorData[0], valorData[1] - 1, valorData[2], valorData[3] || 0, valorData[4] || 0)
                        : new Date(valorData);
                    
                    if (!isNaN(dataObjeto.getTime())) {
                        dataExibicao = dataObjeto.toLocaleString('pt-BR');
                    }
                }

                corpoTabela.innerHTML += `
                    <tr>
                        <td class="ps-4 align-middle">${dataExibicao}</td>
                        <td class="align-middle">${av.peso} kg</td>
                        <td class="align-middle">${av.altura} m</td>
                        <td class="text-end pe-4">
                            
                            <button class="btn btn-sm btn-danger me-1" onclick="gerarPDF(${av.id})" title="Gerar PDF">
                                <i class="bi bi-file-earmark-pdf"></i> PDF
                            </button>
                            <button class="btn btn-sm btn-primary me-1" onclick="visualizarOuEditarAvaliacao(${av.id})">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="excluirAvaliacao(${av.id}, ${clienteId})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>`;
            });
        }
    } catch (error) {
        corpoTabela.innerHTML = "<tr><td colspan='4' class='text-center text-danger'>Erro ao carregar dados.</td></tr>";
    }
}

// 2. BUSCAR DETALHES E ABRIR MODAL
async function visualizarOuEditarAvaliacao(avaliacaoId) {
    // 1. Log para ver se o ID está chegando certo do botão
    console.log("Tentando editar a avaliação com ID:", avaliacaoId);

    if (!avaliacaoId || avaliacaoId === "undefined") {
        console.error("Erro: O ID da avaliação não foi passado corretamente!");
        alert("Erro interno: ID da avaliação inválido.");
        return;
    }

    try {
        const url = `/avaliacoes/${avaliacaoId}`;
        console.log("Chamando URL:", url);

        const response = await apiFetch(url);
        
        // 2. Log para ver a resposta bruta do servidor
        console.log("Resposta do Servidor:", response);

        if (response && response.ok) {
            const av = await response.json();
            console.log("Dados da avaliação recebidos:", av);

            // Preenchimento dos campos
            document.getElementById('editAvaliacaoId').value = av.id;
            document.getElementById('editClienteId').value = av.cliente.id;
            document.getElementById('editPeso').value = av.peso;
            document.getElementById('editAltura').value = av.altura;
            
            // Garante que campos nulos virem 0 para não quebrar o formulário
            document.getElementById('editTriceps').value = av.triceps || 0;
            document.getElementById('editPeitoral').value = av.peitoral || 0;
            document.getElementById('editAbdomen').value = av.abdomen || 0;
            document.getElementById('editSupraIliaca').value = av.supraIliaca || 0;
            document.getElementById('editAxialMedia').value = av.axialMedia || 0;
            document.getElementById('editSubEscapular').value = av.subEscapular || 0;
            document.getElementById('editCoxa').value = av.coxa || 0;

            const modalElement = document.getElementById('modalEditarAvaliacao');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        } else {
            // Se cair aqui, o Java respondeu algo como 403, 404 ou 500
            console.error("Erro na requisição. Status Code:", response ? response.status : "Sem resposta");
            alert(`Erro no servidor (Status ${response ? response.status : 'desconhecido'}).`);
        }
    } catch (error) {
        console.error("Erro técnico capturado:", error);
        alert("Erro ao buscar detalhes da avaliação.");
    }
}

// 3. SALVAR EDIÇÃO NO BANCO
async function salvarEdicaoAvaliacao() {
    const id = document.getElementById('editAvaliacaoId').value;
    const clienteId = document.getElementById('editClienteId').value;

    const dados = {
        peso: parseFloat(document.getElementById('editPeso').value),
        altura: parseFloat(document.getElementById('editAltura').value),
        triceps: parseFloat(document.getElementById('editTriceps').value),
        peitoral: parseFloat(document.getElementById('editPeitoral').value),
        abdomen: parseFloat(document.getElementById('editAbdomen').value),
        supraIliaca: parseFloat(document.getElementById('editSupraIliaca').value),
        axialMedia: parseFloat(document.getElementById('editAxialMedia').value),
        subEscapular: parseFloat(document.getElementById('editSubEscapular').value),
        coxa: parseFloat(document.getElementById('editCoxa').value)
    };

    const response = await apiFetch(`/avaliacoes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados)
    });

    if (response && response.ok) {
        alert("Avaliação atualizada com sucesso!");
        bootstrap.Modal.getInstance(document.getElementById('modalEditarAvaliacao')).hide();
        listarAvaliacoesDoCliente(clienteId);
    }
}

// 4. EXCLUIR AVALIAÇÃO
async function excluirAvaliacao(avaliacaoId, clienteId) {
    if (!confirm("Deseja realmente excluir esta avaliação?")) return;

    const response = await apiFetch(`/avaliacoes/${avaliacaoId}`, { method: 'DELETE' });
    if (response && response.ok) {
        listarAvaliacoesDoCliente(clienteId);
    }
}


async function gerarPDF(avaliacaoId) {
    try {
        // Verifica se a biblioteca jsPDF está disponível
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert("Erro: Biblioteca de PDF não carregada. Verifique o seu HTML.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Busca os dados da avaliação no backend
        const response = await apiFetch(`/avaliacoes/${avaliacaoId}`);
        if (!response || !response.ok) throw new Error("Erro ao buscar dados no servidor");
        
        const av = await response.json();
        console.log("Dados para o PDF:", av);

        // 1. Cabeçalho Estilizado
        doc.setFillColor(0, 123, 255); // Azul padrão do AvaliaFit
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("AVALIAFIT PRO - RELATÓRIO", 105, 25, { align: "center" });

        // 2. Informações do Aluno
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(12);
        doc.text(`Aluno: ${av.cliente ? av.cliente.nome : 'N/A'}`, 20, 50);
        
        // Formata a data vinda do LocalDateTime (Array) ou String
        const dataAv = Array.isArray(av.data) 
            ? `${av.data[2]}/${av.data[1]}/${av.data[0]}`
            : (av.data ? new Date(av.data).toLocaleDateString('pt-BR') : 'Data pendente');
        doc.text(`Data: ${dataAv}`, 160, 50);

        // 3. Tabela de Resultados Principais
        doc.autoTable({
            startY: 60,
            head: [['Indicador Corporativo', 'Resultado']],
            body: [
                ['Peso Corporal', `${av.peso || 0} kg`],
                ['Estatura', `${av.altura || 0} m`],
                ['IMC (Índice de Massa Corporal)', `${av.imc ? av.imc.toFixed(2) : '--'}`],
                ['Percentual de Gordura (%G)', `${av.percentualGordura ? av.percentualGordura.toFixed(2) : '--'}%`]
            ],
            theme: 'striped',
            headStyles: { fillColor: [0, 123, 255] }
        });

        // 4. Tabela de Dobras Cutâneas (Incluindo Axilar Média)
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Dobra Cutânea', 'Medida (mm)']],
            body: [
                ['Tríceps', `${av.triceps || 0} mm`],
                ['Peitoral', `${av.peitoral || 0} mm`],
                ['Axilar Média', `${av.axialMedia || 0} mm`],
                ['Subescapular', `${av.subEscapular || 0} mm`],
                ['Abdomem', `${av.abdomen || 0} mm`],
                ['Supra-Ilíaca', `${av.supraIliaca || 0} mm`],
                ['Coxa', `${av.coxa || 0} mm`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [100, 100, 100] }
        });

        // 5. Seção de Referências Normativas
        let finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text("Valores de Referência (Normativas)", 20, finalY);

        // Tabela IMC (Lado Esquerdo)
        doc.autoTable({
            startY: finalY + 5,
            head: [['Classificação IMC', 'Intervalo']],
            body: [
                ['Abaixo do peso', '< 18.5'],
                ['Peso Normal', '18.5 - 24.9'],
                ['Sobrepeso', '25.0 - 29.9'],
                ['Obesidade', '> 30.0']
            ],
            margin: { right: 107 },
            styles: { fontSize: 8 }
        });

        // Tabela %Gordura (Lado Direito - Baseado no Sexo)
        const sexo = av.cliente ? av.cliente.sexo : 'M';
        const refGordura = (sexo === 'M') ? 
            [['Atleta', '6-13%'], ['Fitness', '14-17%'], ['Normal', '18-24%'], ['Risco', '> 25%']] :
            [['Atleta', '14-20%'], ['Fitness', '21-24%'], ['Normal', '25-31%'], ['Risco', '> 32%']];

        doc.autoTable({
            startY: finalY + 5,
            head: [[`Ref. %Gordura (${sexo === 'M' ? 'Homens' : 'Mulheres'})`, 'Intervalo']],
            body: refGordura,
            margin: { left: 107 },
            styles: { fontSize: 8 },
            headStyles: { fillColor: [40, 167, 69] } // Verde para saúde
        });

        // Rodapé final
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text("Gerado por AvaliaFit Pro - Sistema de Gestão Fitness", 105, 285, { align: "center" });

        // Salva o arquivo com o nome do cliente
        const nomePdf = av.cliente ? av.cliente.nome.replace(/\s/g, '_') : 'Avaliacao';
        doc.save(`Relatorio_${nomePdf}.pdf`);

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Erro ao processar os dados para o PDF.");
    }
}


async function salvarNovaAvaliacao() {
    const clienteId = document.getElementById('novoClienteId').value;
    
    const dados = {
        // MUDANÇA AQUI: Enviamos um objeto cliente com o ID
        // Isso evita o NullPointerException no AvaliacaoService.java
        cliente: {
            id: parseInt(clienteId)
        },
        peso: parseFloat(document.getElementById('novoPeso').value),
        altura: parseFloat(document.getElementById('novoAltura').value),
        triceps: parseFloat(document.getElementById('novoTriceps').value) || 0,
        peitoral: parseFloat(document.getElementById('novoPeitoral').value) || 0,
        axialMedia: parseFloat(document.getElementById('novoAxialMedia').value) || 0,
        subEscapular: parseFloat(document.getElementById('novoSubEscapular').value) || 0,
        abdomen: parseFloat(document.getElementById('novoAbdomen').value) || 0,
        supraIliaca: parseFloat(document.getElementById('novoSupraIliaca').value) || 0,
        coxa: parseFloat(document.getElementById('novoCoxa').value) || 0
    };

    try {
        const response = await apiFetch('/avaliacoes', {
            method: 'POST',
            body: JSON.stringify(dados)
        });

        if (response && response.ok) {
            alert("Avaliação salva com sucesso!");
            
            // Fecha o modal
            const modalElement = document.getElementById('modalNovaAvaliacao');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            
            // Opcional: Se estiver na aba de avaliações, recarregue a lista
            if (typeof listarAvaliacoesDoCliente === "function") {
                listarAvaliacoesDoCliente(clienteId);
            }
        } else {
            // Se o servidor retornar erro, mostramos o alerta da sua imagem
            alert("Erro ao salvar: Verifique os dados ou a conexão com o servidor.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}