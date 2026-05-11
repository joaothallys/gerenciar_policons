import { transactionService } from "app/services/transactionService";

export const exportTransactionsToCsv = async (filters = {}) => {
  const { userId, startDate, endDate, transactionTypeId } = filters;

  try {
    const blob = await transactionService.exportExcel({
      userId,
      startDate,
      endDate,
      transactionTypeId,
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileDate = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.setAttribute("download", `transacoes-policoins-${fileDate}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: "Excel exportado com sucesso.",
    };
  } catch (error) {
    console.error("Error exporting Excel:", error);
    throw error;
  }
};
