import { createPost } from "../posts.js";

const contentList = document.getElementById("content-input-list");

let numOfBlocks = 0;

//creates a post block with default selection, DOES NOT ADD IT TO THE PAGE
function createContentBlock() {
  const contentBlock = document.createElement("div");
  contentBlock.classList.add("create-post-content-block");
  contentBlock.id = `create-post-content-block-${numOfBlocks}`;

  const label = document.createElement("label");
  label.textContent = "Content Type";
  label.for = "content";

  //type selection
  const select = document.createElement("select");
  select.classList.add("form-select", "content-type");

  const inputOptions = ["text", "image", "video"];

  //text selected by default
  inputOptions.forEach((type, index) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    // make the first option selected
    option.selected = index === 0 ? true : false;
    select.appendChild(option);
  });

  //on change of select value change input type
  select.addEventListener("change", (e) => {
    const selectElem = e.target.closest("select");
    const contentBlock = selectElem.closest(".create-post-content-block");
    changeContentInputType(contentBlock, selectElem.value);
  });

  contentBlock.appendChild(select);

  changeContentInputType(contentBlock, inputOptions[0]);

  numOfBlocks++;
  return contentBlock;
}

/**
 *  changes the input type inside the content block
 * @param {HTMLDivElement} contentBlock - content block element
 * @param {String} type
 */
function changeContentInputType(contentBlock, type) {
  console.log("type to change to: " + type);
  if (!type) {
    type = contentBlock.querySelector(".content-type").value;
  }

  //remove existing inputs if exist
  contentBlock.querySelector(".content-input-wrapper")?.remove();

  //add new input type
  contentBlock.appendChild(createContentInputElement(type));
}

function createInputWrapper() {
  const wrapper = document.createElement("div");
  wrapper.classList.add("content-input-wrapper", "mb-3");
  return wrapper;
}

function createTextContentInput() {
  const wrapper = createInputWrapper();
  //text area is basically a multiline text input
  const input = document.createElement("textArea");
  input.classList.add("content-input", "form-control", "text-input");
  wrapper.appendChild(input);
  return wrapper;
}
function createImageContentInput() {
  const wrapper = createInputWrapper();

  const input = document.createElement("input");
  input.type = "file";
  //restrict to images
  (input.accept = "image/*"),
    input.classList.add("form-control", "content-input", "image-input");
  wrapper.appendChild(input);
  return wrapper;
}
function createVideoContentInput() {
  const wrapper = createInputWrapper();

  const input = document.createElement("input");
  input.type = "file";
  //restrict to videos
  (input.accept = "video/*"),
    input.classList.add("form-control", "content-input", "video-input");
  wrapper.appendChild(input);
  return wrapper;
}

function createContentInputElement(type) {
  switch (type) {
    case "text":
      return createTextContentInput();
    case "image":
      return createImageContentInput();
    case "video":
      return createVideoContentInput();
  }

  return createTextContentInput();
}

document
  .getElementById("add-content-input-btn")
  .addEventListener("click", (e) => {
    e.preventDefault();
    contentList.appendChild(createContentBlock());
  });

contentList.appendChild(createContentBlock());

document.getElementById('create-post-form').addEventListener("submit", async (e) => {
    e.preventDefault();
    const {title, contentBlocks} = extractFormData()
    createPost(title, contentBlocks)
})

function extractFormData() {
  const title = document.getElementById("input-post-title").value.trim();
  const contentBlocks = [];

  document.querySelectorAll(".create-post-content-block").forEach(block => {
    const type = block.querySelector(".content-type").value;
    const input = block.querySelector(".content-input");

    if (type === "text") {
      contentBlocks.push({ type, value: input.value.trim() });
    } else if (type === "image" || type === "video") {
        console.log("skipping post file upload because of missing implementation");
    }
  });

  return {title, contentBlocks};
}
