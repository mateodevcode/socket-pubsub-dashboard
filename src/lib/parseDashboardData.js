export const parseDashboardData = (rawOutput) => {
  if (!rawOutput) return null;
  if (typeof rawOutput === "object") return rawOutput;
  if (typeof rawOutput === "string") {
    try {
      return JSON.parse(rawOutput);
    } catch (e1) {
      try {
        return JSON.parse(rawOutput.replace(/^"|"$/g, "").replace(/\\"/g, '"'));
      } catch (e2) {
        console.warn("Fallo al parsear string escapado:", rawOutput);
        return null;
      }
    }
  }
  return null;
};
