import { fromKebabCase } from "@/utils/strings";

export const downloadComponent = (locale: string, locationCode: string) => {
  const now = new Date().toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const pageHTML = document.querySelector("#chat-messages")!.outerHTML;
  const head = `<head><title>Chat ${fromKebabCase(locationCode)} - ${now}</title><script src="https://cdn.tailwindcss.com"></script></head`;
  const styles = `
<style>

</style>

  `;
  const blob = new Blob([head + styles + pageHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const tempEl = document.createElement("a");
  document.body.appendChild(tempEl);
  tempEl.style.display = "none";
  tempEl.href = url;
  tempEl.download = `chat-${now}.html`;
  tempEl.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    tempEl?.parentNode?.removeChild(tempEl);
  }, 2000);
};
