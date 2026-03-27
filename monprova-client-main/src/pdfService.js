import http from "./httpservice";

const pdfService = {
  downloadPDF: async (appointmentId) => {
    try {
      const apiURL = `https://monprova-server.vercel.app/api/pdf/getpdf/${appointmentId}`;

      const response = await http.get(apiURL, {
        responseType: "blob",
        headers: {
          Accept: "application/pdf",
        },
        timeout: 60000,
      });

      return response;
    } catch (error) {
      console.error("PDF Service Error:", error);
      throw error;
    }
  },
};



export default pdfService;
