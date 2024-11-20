import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function generatePDF(reportId: string) {
  const element = document.getElementById("report-content");
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
    pdf.save(`verification-report-${reportId}.pdf`);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
  }
}