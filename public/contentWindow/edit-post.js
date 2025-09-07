import { deletePost, getPost, updatePost, uploadPostFile } from "../posts.js";
import { renderContentWindow } from "../utils/renderer.js";
import { routes } from "../utils/routes.js";

const contentList = document.getElementById("content-input-list");
const postForm = document.getElementById("edit-post-form");
const postId = postForm.dataset.postId;
let numOfBlocks = 0;

//creates a post block with default selection, DOES NOT ADD IT TO THE PAGE
function createContentBlock() {
  const contentBlock = document.createElement("div");
  contentBlock.classList.add("edit-post-content-block");
  contentBlock.id = `edit-post-content-block-${numOfBlocks}`;

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
    const contentBlock = selectElem.closest(".edit-post-content-block");
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
  preview.classList.add("img-fluid", "mt-2", "preview");
  preview.style.maxHeight = "250px";
  preview.dataset.changed = true;
  input.addEventListener("change", () => {
    const file = input.files[0];
    preview.src = URL.createObjectURL(file);
    preview.dataset.changed = true;
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
  preview.classList.add("mt-2", "preview");
  preview.controls = true;
  preview.style.maxHeight = "250px";
  preview.dataset.changed = true;

  //change preview when file is uploaded
  input.addEventListener("change", () => {
    const file = input.files[0];
    preview.src = URL.createObjectURL(file);
    preview.dataset.changed = true;
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

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { title, contentBlocks, group, mediaContentBlocks } = extractFormData();

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

  console.log(countTextInputs + mediaContentBlocks.length);
  console.log(contentBlocks.length);

  if (countTextInputs + mediaContentBlocks.length !== contentBlocks.length) {
    alert(`missing media input`);
    return;
  }

  const post = await updatePost(postId, title, contentBlocks, group);

  if (!post) {
    alert("failed editing post");
    return;
  }

  let success = 0;

  for (let index = 0; index < mediaContentBlocks.length; index++) {
    const block = mediaContentBlocks[index];

    //file was not changed so no need to change preview
    if (!block.changed) {
      success++;
      continue;
    }

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

  // await changeGroup(group);
  renderContentWindow(routes.mainFeed);
});

function extractFormData() {
  const title = document.getElementById("input-post-title").value.trim();
  const group = document.getElementById("group-select").value;
  const contentBlocks = [];
  const mediaContentBlocks = [];

  document
    .querySelectorAll(".edit-post-content-block")
    .forEach((block, index) => {
      const type = block.querySelector(".content-type").value;
      const input = block.querySelector(".content-input");

      if (type === "text") {
        contentBlocks.push({ type, value: input.value.trim() });
      } else if (type === "image" || type === "video") {
        const preview = block.querySelector(".preview");
        console.log(preview.dataset.changed == "false")
        if (preview.dataset.changed == "true") {
           console.log("here true")
          contentBlocks.push({ type, value: "value" });
          if (!input.files || input.files.length === 0) return;
          mediaContentBlocks.push({
            type,
            blockIndex: index,
            changed: true,
            file: input.files[0],
          });
        } else {
          console.log("here false")
          // if file was not changed keep the old src
          contentBlocks.push({ type, value: preview.src });
          mediaContentBlocks.push({
            type,
            blockIndex: index,
            changed: false
          });
        }
      }
    });

  return { title, group, contentBlocks, mediaContentBlocks };
}

async function loadPostData(postId) {
  const post = await getPost(postId);
  document.getElementById("input-post-title").value = post.title;

  post.content.forEach((contentBlock) => {
    const type = contentBlock.type;
    const contentBlockInput = createContentBlock();
    contentBlockInput.querySelector("select").value = type;
    changeContentInputType(contentBlockInput, type);

    //if its image or video just show what exists already,
    // if the file was not changed send the existing ones
    if (type === "text") {
      contentBlockInput.querySelector(".content-input").value =
        contentBlock.value;
    } else if (type === "image") {
      // show the image
      const img = contentBlockInput.querySelector("img");
      img.src = contentBlock.value;
      img.dataset.changed = false;
      contentBlockInput
        .querySelector(".content-input-wrapper")
        .appendChild(img);
    } else if (type === "video") {
      const video = contentBlockInput.querySelector("video");
      video.src = contentBlock.value;
      video.controls = true;
      video.dataset.changed = false;
      contentBlockInput
        .querySelector(".content-input-wrapper")
        .appendChild(video);
    }

    contentList.appendChild(contentBlockInput);
  });
}

loadPostData(postId);

const deleteBtn = document.getElementById("delete-post-btn");

deleteBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await deletePost(postId);
    alert("delete success");
    renderContentWindow(routes.mainFeed);
  } catch {
    alert("delete failed");
  }
});
