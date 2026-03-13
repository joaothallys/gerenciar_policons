import React from "react";
import { toast } from "react-toastify";

const normalizeMessage = (message) => {
    if (message === null || message === undefined) return "Ocorreu uma resposta inesperada da API.";
    return String(message).trim() || "Ocorreu uma resposta inesperada da API.";
};

const escapeHtml = (value) =>
    normalizeMessage(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

const extractApiMessageFromDetails = (details) => {
    const normalizedDetails = details ? normalizeMessage(details) : "";
    if (!normalizedDetails) return "";

    try {
        const parsed = JSON.parse(normalizedDetails);
        const apiMessage = parsed?.message || parsed?.error || parsed?.detail || "";
        return normalizeMessage(apiMessage || normalizedDetails);
    } catch (error) {
        return normalizedDetails;
    }
};

const renderNotificationContent = ({ title, message, details = "", variant = "info" }) => {
    const normalizedMessage = normalizeMessage(message);
    const normalizedDetails = details ? normalizeMessage(details) : "";
    const extractedApiMessage = extractApiMessageFromDetails(normalizedDetails);
    const shouldShowApiMessage = extractedApiMessage && extractedApiMessage !== normalizedMessage;
    const shouldShowDetails = normalizedDetails && normalizedDetails !== normalizedMessage && normalizedDetails !== extractedApiMessage;

    const palette = {
        success: {
            border: "#bbf7d0",
            soft: "#f0fdf4",
            title: "#166534",
            text: "#166534",
        },
        warning: {
            border: "#fcd34d",
            soft: "#fffbeb",
            title: "#92400e",
            text: "#78350f",
        },
        error: {
            border: "#fecaca",
            soft: "#fff5f5",
            title: "#b91c1c",
            text: "#7f1d1d",
        },
        info: {
            border: "#bfdbfe",
            soft: "#eff6ff",
            title: "#1d4ed8",
            text: "#1e3a8a",
        },
    };

    const colors = palette[variant] || palette.info;

    return React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "10px" } },
        React.createElement(
            "div",
            { style: { fontSize: "14px", fontWeight: 700, color: "#111827" } },
            title
        ),
        React.createElement(
            "div",
            { style: { fontSize: "13px", lineHeight: 1.5, color: "#374151", wordBreak: "break-word" } },
            normalizedMessage
        ),
        shouldShowApiMessage
            ? React.createElement(
                "div",
                {
                    style: {
                        background: "#fff7ed",
                        border: "1px solid #fdba74",
                        borderRadius: "8px",
                        padding: "10px",
                    },
                },
                React.createElement(
                    "div",
                    { style: { fontSize: "12px", fontWeight: 700, color: "#9a3412", marginBottom: "4px" } },
                    "Mensagem da API"
                ),
                React.createElement(
                    "div",
                    { style: { fontSize: "12px", lineHeight: 1.5, color: "#7c2d12", wordBreak: "break-word" } },
                    extractedApiMessage
                )
            )
            : null,
        shouldShowDetails
            ? React.createElement(
                "div",
                {
                    style: {
                        background: colors.soft,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "8px",
                        padding: "10px",
                    },
                },
                React.createElement(
                    "div",
                    { style: { fontSize: "12px", fontWeight: 700, color: colors.title, marginBottom: "4px" } },
                    "Retorno bruto da API"
                ),
                React.createElement(
                    "pre",
                    {
                        style: {
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            fontSize: "11px",
                            lineHeight: 1.5,
                            color: colors.text,
                            fontFamily: "Menlo, Monaco, Consolas, monospace",
                        },
                    },
                    normalizedDetails
                )
            )
            : null
    );
};

const baseOptions = {
    position: "top-right",
    pauseOnHover: true,
    draggable: true,
    closeOnClick: false,
    style: {
        width: "420px",
    },
};

export const showSuccessPopup = (message, title = "Sucesso") =>
    toast.success(renderNotificationContent({ title, message, variant: "success" }), {
        ...baseOptions,
        autoClose: 2600,
    });

export const showSuccessDetailsPopup = (message, title = "Sucesso", details = "") => {
    return toast.success(renderNotificationContent({ title, message, details, variant: "success" }), {
        ...baseOptions,
        autoClose: 5000,
    });
};

export const showWarningPopup = (message, title = "Atenção") =>
    toast.warning(renderNotificationContent({ title, message, variant: "warning" }), {
        ...baseOptions,
        autoClose: 3500,
    });

export const showErrorPopup = (message, title = "Erro", details = "") => {
    return toast.error(renderNotificationContent({ title, message, details, variant: "error" }), {
        ...baseOptions,
        autoClose: 8000,
    });
};