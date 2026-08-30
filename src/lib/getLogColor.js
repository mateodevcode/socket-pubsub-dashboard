export const getLogColor = (type) => {
  const colors = {
    info: "text-blue-400",
    success: "text-emerald-400",
    error: "text-red-400",
    warning: "text-amber-400",
    header: "text-purple-400 font-bold",
    output: "text-slate-300",
  };
  return colors[type] || "text-slate-300";
  //   Prof
};
