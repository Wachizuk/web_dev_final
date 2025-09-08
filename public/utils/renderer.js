//first is also default
const routeDefenitions = [
  "/main-feed",
  "/my-feed",
  "/my-posts",
  "/groups/new",
  "/groups/:groupName",
  "/user/settings",
  "/posts/create",
  "/posts/create/:groupName",
  "/user/profile",
  "/posts/edit/:postId",
  "/user/profile/:username",
  "/posts/page/:postId",
  "/groups/allGroups"
];

/**
 *
 * @param {String} path
 */
function pathToRegex(path) {
  const keys = [];
  // the g makes it match all, we take each instance of :something and replace it with the regex we want
  const regex =
    "^" +
    path.replace(/:[^/]+/g, (match) => {
      keys.push(match.replace(":", ""));
      return "([^/]+)";
    }) +
    "$";

  return { regex: new RegExp(regex), keys };
}

const routeIdentifiers = routeDefenitions.map((path) => pathToRegex(path));

/**
 *  gets the content window that matches the path, default is main-feed
 * @param {String} path
 * @returns
 */
async function getHtmlFromPath(path) {
  try {
    const res = await fetch(path);

    if (!res.ok) {
      throw new Error(`response status code: ${res.status}`);
    }

    return res.text();
  } catch (err) {
    console.error(
      `failed getting content window for ${path}, error message: ${err.message}`
    );
  }
}

async function runInnerScripts(scriptContainer) {
  //when a script is added via js it gets run,
  // we copy the original and replace it to make it run
  scriptContainer.querySelectorAll("script").forEach((script) => {
    const scriptCopy = document.createElement("script");
    scriptCopy.type = script.type;
    // the + "?t=" + Date.now() is important,
    //  without it the script will run only the first time
    scriptCopy.src = script.src + "?t=" + Date.now();
    scriptCopy.async = script.async;

    script.parentNode.replaceChild(scriptCopy, script);
  });
}
//defines it only once, this is used to stop hashchange event listener from triggering renderer again
if (typeof internalHashChange === "undefined")
  var stateTracker = { internalHashChange: false };

/**
 * renders the content window according to path and updates window.location.hash to path
 * @param {String} path
 */
async function renderContentWindow(path, outerHashChange = false) {
  console.log("attempting to get path: " + path);
  if (typeof path === "string" && path[0] !== "/") {
    path = "/" + path;
  }

  let match = false;
  for (let index = 0; index < routeIdentifiers.length; index++) {
    match = path.match(routeIdentifiers[index].regex);
    if (match) break;
  }

  //default path in case of no match
  if (!match) {
    console.error(`renderer found no match for the path: ${path}
    rendering ${routeDefenitions[0]} instead
    update legal paths in renderer if this path is desiered`);
    path = routeDefenitions[0];
  } // main-feed

  const contentWindow = document.getElementById("content-window");
  const result = await getHtmlFromPath(path);
  contentWindow.innerHTML = result
    ? result
    : "Could not retrive the page from the server";

  // this var is initialized in main_page
  // prevents rerun from hashchange event listenter
  if (!outerHashChange) {
    stateTracker.internalHashChange = true;
    window.location.hash = path;
  }

  await runInnerScripts(contentWindow);
}

export { renderContentWindow, getHtmlFromPath, stateTracker };
