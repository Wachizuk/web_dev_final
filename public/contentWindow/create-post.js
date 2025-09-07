import { createPost, deletePost, uploadPostFile } from "../posts.js";
import { renderContentWindow } from "../utils/renderer.js";
import { routes } from "../utils/routes.js";

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

  //remove btn
  const remBtn = document.createElement("button");
  remBtn.classList.add("btn");
  remBtn.textContent = "remove part";
  remBtn.type = "button";
  remBtn.addEventListener("click", () => {
    contentBlock.remove();
  });
  contentBlock.appendChild(remBtn);

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
  input.accept = "image/*";
  input.classList.add("form-control", "content-input", "image-input");

  const preview = document.createElement("img");
  preview.classList.add("img-fluid", "mt-2");
  preview.style.maxHeight = "250px";

  input.addEventListener("change", () => {
    const file = input.files[0];
    preview.src = URL.createObjectURL(file);
  });

  wrapper.appendChild(input);
  wrapper.appendChild(preview);
  return wrapper;
}
function createVideoContentInput() {
  const wrapper = createInputWrapper();

  const input = document.createElement("input");
  input.type = "file";
  //restrict to videos
  input.accept = "video/*";
  input.classList.add("form-control", "content-input", "video-input");

  const preview = document.createElement("video");
  preview.classList.add("mt-2");
  preview.controls = true;
  preview.style.maxHeight = "250px";

  //change preview when file is uploaded
  input.addEventListener("change", () => {
    const file = input.files[0];
    preview.src = URL.createObjectURL(file);
  });

  wrapper.appendChild(input);
  wrapper.appendChild(preview);
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

document
  .getElementById("create-post-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const { title, contentBlocks, mediaContentBlocks, group } =
      extractFormData();

    if (!title) {
      alert("title missing");
      return;
    }

    let countTextInputs = 0;

    contentBlocks.forEach((block, index) => {
      if (block.type == "text") countTextInputs++;
      if (block.type == "text" && !block.value.trim()) {
        alert(`missing input at entry ${index + 1}`);
        return;
      }
    });

    if (countTextInputs + mediaContentBlocks.length !== contentBlocks.length) {
      alert(`missing media input`);
      return;
    }

    const post = await createPost(title, contentBlocks, group);

    if (!post) {
      alert("failed creating post");
      return;
    }

    let success = 0;

    for (let index = 0; index < mediaContentBlocks.length; index++) {
      const block = mediaContentBlocks[index];

      const file = block.file;
      if (!file) {
        console.log("failed file upload for block " + index);
        return;
      }

      const result = await uploadPostFile(file, post._id, block.blockIndex);
      if (result) {
        success++;
      }
    }

    mediaContentBlocks?.forEach(async (block, index) => {});

    if (success < mediaContentBlocks.length) {
      // await deletePost(post._id);
      await deletePost(postId);
      alert("Failed uploading post files :(");
    } else {
      alert("Post Created :)");
      renderContentWindow(routes.mainFeed);
    }
  });

function extractFormData() {
  const title = document.getElementById("input-post-title").value.trim();
  const group = document.getElementById("group-select").value;
  const contentBlocks = [];
  const mediaContentBlocks = [];

  document
    .querySelectorAll(".create-post-content-block")
    .forEach((block, index) => {
      const type = block.querySelector(".content-type").value;
      const input = block.querySelector(".content-input");

      if (type === "text") {
        contentBlocks.push({ type, value: input.value.trim() });
      } else if (type === "image" || type === "video") {
        contentBlocks.push({ type, value: "value" });
        if (!input.files || input.files.length === 0) return;
        mediaContentBlocks.push({
          type,
          blockIndex: index,
          file: input.files[0],
        });
      }
    });

  return { title, contentBlocks, mediaContentBlocks, group };
}
