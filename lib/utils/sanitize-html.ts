import sanitizeHtmlLib from "sanitize-html";

export function sanitizeHtml(html: string): string {
  return sanitizeHtmlLib(html, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "code", "pre", "blockquote",
      "h1", "h2", "h3", "ul", "ol", "li", "a", "table", "thead", "tbody",
      "tr", "th", "td", "img", "input", "label", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
      input: ["type", "checked", "disabled"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
