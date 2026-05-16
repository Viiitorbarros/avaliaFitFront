let calendar;

async function inicializarCalendario() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'pt-br',
        initialView: 'timeGridWeek',
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
        buttonText: { today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia' },
        slotMinTime: '06:00:00', // Baseado no seu horário de trabalho
        
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                const response = await apiFetch('/agendamento');
                const dados = await response.json();
                const eventos = dados.map(a => ({
                    id: a.id,
                    title: a.nome,
                    start: a.dataHora,
                    extendedProps: { telefone: a.telefone }
                }));
                successCallback(eventos);
            } catch (err) { failureCallback(err); }
        },

        eventClick: function(info) {
            abrirModalAgendamento(info.event);
        },
        
        dateClick: function(info) {
            abrirModalAgendamento(null, info.dateStr);
        }
    });

    calendar.render();
}

function abrirModalAgendamento(event = null, dataStr = null) {
    const form = document.getElementById('formAgendamento');
    form.reset();
    
    const btnExcluir = document.getElementById('btnExcluirAgendamento');
    const titulo = document.getElementById('tituloModalAgendamento');

    if (event) { // MODO EDIÇÃO
        titulo.innerText = "Editar Agendamento";
        btnExcluir.style.display = "block";
        document.getElementById('agen-id').value = event.id;
        document.getElementById('agen-nome').value = event.title;
        document.getElementById('agen-telefone').value = event.extendedProps.telefone || '';
        document.getElementById('agen-dataHora').value = event.start.toISOString().slice(0, 16);
    } else { // MODO NOVO
        titulo.innerText = "Novo Agendamento";
        btnExcluir.style.display = "none";
        document.getElementById('agen-id').value = "";
        if (dataStr) document.getElementById('agen-dataHora').value = dataStr.slice(0, 16);
    }

    new bootstrap.Modal(document.getElementById('modalAgendamento')).show();
}

async function handleSalvar() {
    const id = document.getElementById('agen-id').value;

    const dados = {
        nome: document.getElementById('agen-nome').value,
        telefone: document.getElementById('agen-telefone').value,
        dataHora: document.getElementById('agen-dataHora').value
    };

    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `/agendamento/${id}` : '/agendamento';

    const response = await apiFetch(url, {
        method: metodo,
        body: JSON.stringify(dados)
    });

    // 🔥 TRATAMENTO DE ERRO
    if (!response.ok) {
        const erro = await response.text();

        if (response.status === 409) {
            alert("Já existe um agendamento nesse horário!");
        } else {
            alert("Erro ao salvar agendamento");
        }

        return;
    }

    // SUCESSO
    bootstrap.Modal.getInstance(document.getElementById('modalAgendamento')).hide();
    calendar.refetchEvents();
}

async function handleExcluir() {
    const id = document.getElementById('agen-id').value;
    if (confirm("Deseja excluir este agendamento?")) {
        const response = await apiFetch(`/agendamento/${id}`, { method: 'DELETE' });
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('modalAgendamento')).hide();
            calendar.refetchEvents();
        }
    }
}