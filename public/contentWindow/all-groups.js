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

// GROUP FILTERING PANEL
const searchForm = document.querySelector("#search-panel-form");
searchForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const params = extractSearchData();
  document.querySelectorAll(".group-card")?.forEach((groupCard) => {
    matchAndSetGroupCardVisibility(groupCard, params);
  });
});

searchForm?.addEventListener("change", (e) => {
  e.preventDefault();
  const params = extractSearchData();
  document.querySelectorAll(".group-card")?.forEach((groupCard) => {
    matchAndSetGroupCardVisibility(groupCard, params);
  });
});

const extractSearchData = () => {
  let groupName = document.querySelector("#group-name-search").value;
  let description = document.querySelector("#description-search").value;
  let minMembers = document.querySelector("#min-members-search").value;
    groupName = groupName ? groupName.toLowerCase() : "";
    description = description ? description.toLowerCase() : "";

  return { groupName, description, minMembers };
};

const showGroupCard = (groupCard) => {
  // setting empty resets to default
  groupCard.style.display = "";
};

const hideGroupCard = (groupCard) => {
  groupCard.style.display = "none";
};

function matchAndSetGroupCardVisibility(groupCard, params = {}) {
  let match = true;
  if (!groupCard) {
    console.error("missing groupCard in match function");
    return;
  }

  if (!params) {
    showGroupCard(groupCard);
    return match;
  }

  if (params.groupName) {
    params.groupName = params.groupName.toLowerCase()
    let groupName = groupCard.dataset.group;
    if (!groupName.toLowerCase().includes(params.groupName)) {
      hideGroupCard(groupCard);
      match = false;
      return match;
    }
  }

  if (params.minMembers) {
    let membersCount = 0;
    try {
      membersCount = parseInt(groupCard.querySelector(".group-members-count").dataset.membersCount);
    } catch {}

    if (membersCount < params.minMembers) {
      hideGroupCard(groupCard);
      match = false;
      return match;
    }
  }

  if (params.description) {
    params.description = params.description.toLowerCase()
    const groupDescription = groupCard.querySelector(".group-description").textContent;
    const matchFound = groupDescription.toLowerCase().includes(params.description);

    if (!matchFound) {
      hideGroupCard(groupCard);
      match = false;
      return match;
    }
  }

  showGroupCard(groupCard);
  return match;
}
