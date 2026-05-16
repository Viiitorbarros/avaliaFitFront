

async function realizarLogin(event) {
    event.preventDefault(); // Impede o formulário de limpar a tela

    // Captura os valores dos inputs do seu HTML
    const loginDigitado = document.getElementById("login").value;
    const senhaDigitada = document.getElementById("password").value;

    try {
        // Faz a chamada para a sua URL exata: http://localhost:8080/auth/login
        const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // O corpo do JSON deve ter as chaves 'login' e 'password'
            // que batem com o seu modelo Usuario.java no Backend
            body: JSON.stringify({
                login: loginDigitado,
                password: senhaDigitada
            })
        });

        if (response.ok) {
            const data = await response.json();
            
            // SUCESSO: Salva o seu Token JWT no "cofre" do navegador
            // Sem isso, você não consegue buscar clientes depois
            localStorage.setItem("token", data.token);
            
            console.log("Login realizado com sucesso! Token armazenado.");
            
            // Redireciona para o seu Dashboard (a tela do menu azul)
            window.location.href = "dashboard.html";
        } else {
            // Se o Java retornar erro (Usuário não existe ou senha errada)
            alert("Erro: Usuário ou senha incorretos.");
        }

    } catch (error) {
        console.error("Erro de conexão:", error);
        alert("Não foi possível conectar ao servidor. Verifique se o IntelliJ está rodando o projeto.");
    }
}

// Função para o botão de 'Sair' do seu Dashboard
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html"; // Volta para a tela de login
}