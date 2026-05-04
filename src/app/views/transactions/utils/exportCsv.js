import { transactionService } from "app/services/transactionService";
import { productService } from "app/services/productService";

// Escape CSV values (handle quotes and commas)
const escapeCsvValue = (value) => {
  const stringValue = value === null || value === undefined ? "" : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
};

// Filter transactions by search term
const applySearchFilter = (tx, searchTerm) => {
  if (!searchTerm) return true;
  const term = searchTerm.toLowerCase();
  return (
    tx.userID.toString().includes(searchTerm) ||
    tx.userName.toLowerCase().includes(term) ||
    tx.type_name.toLowerCase().includes(term) ||
    tx.productName.toLowerCase().includes(term)
  );
};

// Fetch all product names in parallel
const fetchProductNames = async (productIds) => {
  const missingIds = [...new Set(productIds)].filter((id) => Number.isInteger(id) && id > 0);

  if (missingIds.length === 0) return {};

  const productResponses = await Promise.all(
    missingIds.map(async (productId) => {
      try {
        const data = await productService.getById(productId);
        return {
          id: productId,
          name: data?.name || "-",
        };
      } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        return null;
      }
    })
  );

  return productResponses.reduce((acc, item) => {
    if (item?.id) {
      acc[item.id] = item.name;
    }
    return acc;
  }, {});
};

// Map raw API transactions to normalized format
const mapTransactions = (rawTransactions, productsById) => {
  return rawTransactions.map((t) => ({
    id: t.id,
    userID: t.user_id || t.user?.id || "",
    userName: t.user?.username || `Usuário ${t.user_id}`,
    userEmail: t.user?.email || "",
    type_name: (t.type && t.type.name) || t.type_name || "",
    points: t.points || 0,
    payment_method_name: t.payment_method?.name || "",
    productID: t.product_id || null,
    productName: t.product?.name || productsById[t.product_id] || "-",
    created_at: t.created_at || "",
  }));
};

// Main export function
export const exportTransactionsToCsv = async (filters = {}) => {
  const { userId = null, startDate = null, endDate = null, searchTerm = "" } = filters;

  try {
    // Fetch all transactions across all pages
    const allTransactions = await transactionService.getAllPages({
      userId,
      perPage: 10,
      startDate,
      endDate,
    });

    // Collect all product IDs
    const productIds = allTransactions
      .map((t) => Number(t.product_id))
      .filter((id) => Number.isInteger(id) && id > 0);

    // Fetch all missing product names
    const productsById = await fetchProductNames(productIds);

    // Map transactions to normalized format
    const mappedTransactions = mapTransactions(allTransactions, productsById);

    // Apply search filter
    const filteredTransactions = mappedTransactions.filter((tx) =>
      applySearchFilter(tx, searchTerm)
    );

    // Build CSV header
    const header = [
      "id",
      "usuario_id",
      "usuario_nome",
      "usuario_email",
      "tipo_transacao",
      "produto_id",
      "produto_nome",
      "metodo_pagamento",
      "pontos",
      "data_criacao",
    ];

    // Build CSV rows
    const lines = [
      header.map(escapeCsvValue).join(","),
      ...filteredTransactions.map((row) =>
        [
          row.id,
          row.userID,
          row.userName,
          row.userEmail,
          row.type_name,
          row.productID || "",
          row.productName,
          row.payment_method_name,
          row.points,
          row.created_at,
        ]
          .map(escapeCsvValue)
          .join(",")
      ),
    ];

    // Create CSV content with BOM for Excel UTF-8 support
    const csvContent = `﻿${lines.join("\n")}`;

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileDate = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute("download", `transacoes-policoins-${fileDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      count: filteredTransactions.length,
      message: `CSV exportado com ${filteredTransactions.length} transações.`,
    };
  } catch (error) {
    console.error("Error exporting CSV:", error);
    throw error;
  }
};
