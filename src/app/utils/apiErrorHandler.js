/**
 * Interpreta erros da API e retorna mensagens amigáveis para o usuário
 * @param {string} errorMessage - Mensagem de erro retornada pela API
 * @param {number} statusCode - Código HTTP do erro
 * @param {string} context - Contexto da operação (opcional: "create", "update", "delete", etc.)
 * @returns {string} - Mensagem amigável para o usuário
 */
export const interpretApiError = (errorMessage, statusCode, context = "") => {
    // Garantir que errorMessage seja string
    const errorStr = String(errorMessage || "");

    // ===== ERROS DE CONSTRAINT/BANCO DE DADOS =====

    // Duplicação de registros
    if (errorStr.includes("duplicate key value violates unique constraint")) {
        if (errorStr.includes("uni_store_products_name") || errorStr.includes("products_name")) {
            return "Já existe um produto com este nome. Por favor, escolha outro nome.";
        }
        if (errorStr.includes("users_email") || errorStr.includes("email")) {
            return "Este e-mail já está cadastrado no sistema.";
        }
        if (errorStr.includes("users_username") || errorStr.includes("username")) {
            return "Este nome de usuário já está em uso. Por favor, escolha outro.";
        }
        return "Este registro já existe no sistema. Por favor, verifique os dados.";
    }

    // Foreign key constraints
    if (errorStr.includes("foreign key constraint") || errorStr.includes("violates foreign key")) {
        if (context === "delete") {
            return "Não é possível deletar: este registro possui vínculos ativos no sistema (ex: pedidos, trocas, histórico).";
        }
        return "Operação inválida: este registro está vinculado a outros dados.";
    }

    // ===== ERROS DE VALIDAÇÃO =====

    // Validação genérica
    if (errorStr.includes("validation failed") || errorStr.includes("invalid input")) {
        return "Dados inválidos. Verifique os campos e tente novamente.";
    }

    // E-mail inválido
    if (errorStr.includes("invalid email") || errorStr.includes("email format")) {
        return "E-mail inválido. Por favor, insira um e-mail válido.";
    }

    // Senha
    if (errorStr.includes("password")) {
        if (errorStr.includes("too short") || errorStr.includes("minimum")) {
            return "Senha muito curta. Use pelo menos 6 caracteres.";
        }
        if (errorStr.includes("too weak") || errorStr.includes("strength")) {
            return "Senha muito fraca. Use letras, números e caracteres especiais.";
        }
        if (errorStr.includes("incorrect") || errorStr.includes("wrong password")) {
            return "Senha incorreta. Tente novamente.";
        }
        return "Erro relacionado à senha. Verifique e tente novamente.";
    }

    // ===== ERROS DE IMAGEM/ARQUIVO =====

    if (errorStr.includes("image") || errorStr.includes("file") || errorStr.includes("upload") || errorStr.includes("arquivo")) {
        if (errorStr.includes("tipo de arquivo não suportado") || errorStr.includes("unsupported file type")) {
            return "Tipo de arquivo não suportado. Use apenas imagens PNG (.png).";
        }
        if (errorStr.includes("size") || errorStr.includes("too large") || errorStr.includes("exceeds")) {
            return "Arquivo muito grande. O tamanho máximo é 5MB.";
        }
        if (errorStr.includes("format") || errorStr.includes("type") || errorStr.includes("extension")) {
            return "Formato de arquivo inválido. Apenas imagens PNG (.png) são aceitas.";
        }
        return "Erro ao processar o arquivo. Use apenas imagens PNG (.png).";
    }

    // ===== ERROS DE PONTOS/VALORES =====

    if (errorStr.includes("points") || errorStr.includes("pontos")) {
        if (errorStr.includes("insufficient") || errorStr.includes("not enough")) {
            return "Pontos insuficientes para realizar esta operação.";
        }
        if (errorStr.includes("must be") || errorStr.includes("invalid")) {
            return "Valor de pontos inválido. Deve ser um número positivo.";
        }
        return "Erro relacionado aos pontos. Verifique o valor informado.";
    }

    // ===== ERROS DE ESTOQUE =====

    if (errorStr.includes("stock") || errorStr.includes("estoque") || errorStr.includes("out of stock")) {
        return "Produto sem estoque disponível.";
    }

    // ===== ERROS DE PERMISSÃO =====

    if (errorStr.includes("permission") || errorStr.includes("forbidden") || errorStr.includes("not allowed")) {
        return "Você não tem permissão para realizar esta ação.";
    }

    // ===== ERROS DE AUTENTICAÇÃO =====

    if (errorStr.includes("unauthorized") || errorStr.includes("invalid token") || errorStr.includes("token expired")) {
        return "Sessão expirada ou inválida. Faça login novamente.";
    }

    // ===== ERROS DE NÃO ENCONTRADO =====

    if (errorStr.includes("not found") || errorStr.includes("does not exist")) {
        if (context === "product") return "Produto não encontrado.";
        if (context === "user") return "Usuário não encontrado.";
        if (context === "transaction") return "Transação não encontrada.";
        return "Registro não encontrado.";
    }

    // ===== ERROS POR CÓDIGO HTTP =====

    switch (statusCode) {
        case 400:
            return `Requisição inválida: ${errorStr || "Verifique os dados enviados."}`;
        case 401:
            return "Sessão expirada. Faça login novamente.";
        case 403:
            return "Sem permissão para realizar esta operação.";
        case 404:
            if (context === "delete") return "Registro não encontrado. Pode já ter sido deletado.";
            return "Registro não encontrado.";
        case 409:
            return "Conflito: este registro já existe ou está em uso.";
        case 422:
            return `Dados inválidos: ${errorStr || "Verifique os campos obrigatórios."}`;
        case 429:
            return "Muitas requisições. Aguarde um momento e tente novamente.";
        case 500:
            return "Erro interno do servidor. Tente novamente mais tarde.";
        case 502:
            return "Servidor temporariamente indisponível. Tente novamente em instantes.";
        case 503:
            return "Serviço temporariamente indisponível. Tente novamente em alguns minutos.";
        default:
            break;
    }

    // ===== MENSAGEM PADRÃO =====

    // Se houver mensagem de erro, retorná-la (até 150 caracteres)
    if (errorStr && errorStr.length > 0) {
        const cleanMessage = errorStr.replace(/^(Error:|Erro:)\s*/i, "").trim();
        return cleanMessage.length > 150
            ? cleanMessage.substring(0, 150) + "..."
            : cleanMessage;
    }

    return "Erro desconhecido ao processar a requisição. Tente novamente.";
};

/**
 * Extrai a mensagem de erro de uma resposta da API
 * @param {Response} response - Resposta do fetch
 * @returns {Promise<string>} - Mensagem de erro extraída
 */
export const extractErrorMessage = async (response) => {
    try {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            return errorData.message || errorData.error || errorData.detail || "";
        }

        return await response.text();
    } catch (e) {
        return "";
    }
};

/**
 * Trata erro de uma requisição fetch e retorna mensagem amigável
 * @param {Response} response - Resposta do fetch
 * @param {string} context - Contexto da operação (opcional)
 * @returns {Promise<string>} - Mensagem amigável de erro
 */
export const handleApiError = async (response, context = "") => {
    const errorMessage = await extractErrorMessage(response);
    return interpretApiError(errorMessage, response.status, context);
};
