/** The sidebar and overview groups. tests/site.test.ts checks that every registry item is in exactly one. */
export const groups = [
  { title: "Foundation", items: ["theme", "fonts", "utils"] },
  { title: "Brand", items: ["brand-mark"] },
  {
    title: "Controls",
    items: [
      "button",
      "input",
      "input-group",
      "field-message",
      "textarea",
      "select",
      "native-select",
      "checkbox",
      "switch",
      "label",
    ],
  },
  { title: "Display", items: ["alert", "badge", "card", "disclosure", "skeleton", "spinner", "status-label", "table"] },
  {
    title: "Overlays",
    items: ["alert-dialog", "context-menu", "dialog", "dropdown-menu", "popover", "sheet", "sonner", "tooltip"],
  },
  { title: "Marketing", items: ["container", "section-heading", "text-link", "icon-tile", "prose"] },
];
