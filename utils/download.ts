import { fromKebabCase } from "@/utils/strings";

export const generateLocationChatHTML = (locationCode: string) => {
  const locale = process.env.LOCALE || "en-US";
  const now = new Date().toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const pageHTML = document.querySelector("#chat-messages")!.outerHTML;
  return generateLocationChatTemplate(locale, locationCode, now, pageHTML);
};

export const downloadLocationChatHTML = (locationCode: string) => {
  const locale = process.env.LOCALE || "en-US";
  const now = new Date().toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const pageHTML = document.querySelector("#chat-messages")!.outerHTML;
  const generatedHTML = generateLocationChatTemplate(
    locale,
    locationCode,
    now,
    pageHTML,
  );

  const blob = new Blob([generatedHTML], { type: "text/html" });
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

const generateLocationChatTemplate = (
  locale: string,
  locationCode: string,
  now: string,
  pageHTML: string,
) => {
  return `<!DOCTYPE html>
  <html lang="${locale.substring(0, 2)}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fromKebabCase(locationCode)} - ${now}</title>
    <style>
      html, body { 
        height: 100%;
        margin: 0;
        padding: 0;
      }
    </style>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    ${pageHTML}
  </body>
  </html>`;
};
