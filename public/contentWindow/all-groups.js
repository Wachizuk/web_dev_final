import { renderContentWindow } from "../utils/renderer.js";
import { routes } from "../utils/routes.js";

console.log("all groups page loaded");

const wrap = document.getElementById("all-groups-container");
if (wrap) {
  wrap.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action='open-group']");
    const card = e.target.closest("[data-group]");
    const groupName = (btn?.dataset.group || card?.dataset.group || "").trim();
    if (!groupName) return;

    await renderContentWindow(routes.groups.groupName(groupName));
  });
}