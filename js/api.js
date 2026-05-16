async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    
    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
            ...options,
            headers
        });

        // Só desloga se for 401 (não autenticado)
        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "index.html";
            return;
        }

        // NÃO deslogar para 403, 409, 500, etc
        return response;

    } catch (error) {
        console.error("Erro na API:", error);
        throw error;
    }
}