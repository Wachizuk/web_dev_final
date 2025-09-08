const changeBtn = document.getElementById("change-avatar-btn");
const fileInput = document.getElementById("avatar-input");
const avatarImg = document.getElementById("profile-avatar");

changeBtn.addEventListener("click", () => {
  fileInput.click(); // simulate click on hidden input
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  try {
    // send raw file to server
    const buf = await file.arrayBuffer();
    const res = await fetch("/uploads/avatar/new", {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: buf,
    });

    const data = await res.json();
    if (res.ok) {
      // update the img src dynamically
      avatarImg.src = data.url + "?t=" + new Date().getTime(); // add timestamp to avoid caching
    } else {
      alert(data.error || "Failed to upload");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
});

const replaceAdress = () => {
  const form = document.getElementById("address-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newAddress = form.querySelector("input").value;
    if (!newAddress) return;
    console.log(newAddress);
    try {
      const res = await fetch("/user/change-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: newAddress }),
      });

      const data = await res.json();
      if (data.success) {
        window.location.reload();

      } else {
        alert(data.message || "Failed to update address");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating address");
    }
  });
}
replaceAdress();

// ---- read server seed ----
const seedEl = document.getElementById("stats-data");
// grab initial stats from server or fallback to empty data
const seed   = seedEl ? JSON.parse(seedEl.dataset.json) : { perDay: [], byGroup: [] };

// ---- tiny helpers ----
function clear(svg) { svg.selectAll("*").remove(); } // clear everything inside the svg

function svgSize(svg, fallbackW = 320, fallbackH = 200) {
  const rect = svg.node().getBoundingClientRect(); // get element size on screen
  const W = Math.max(rect.width  || +svg.attr("width")  || fallbackW, fallbackW); // pick width
  const H = Math.max(rect.height || +svg.attr("height") || fallbackH, fallbackH); // pick height
  svg.attr("viewBox", `0 0 ${W} ${H}`); // make it responsive
  return { W, H };
}

function showMsg(svg, text) {
  clear(svg);                        // reset svg
  const { W, H } = svgSize(svg);     // resize correctly
  svg.append("text")                 // show text in the middle
     .attr("x", "50%").attr("y", "50%")
     .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
     .attr("fill", "currentColor").text(text);
}

// ---- line: posts per day ----
function drawPerDay(data) {
  const svg = d3.select("#chart-per-day");
  if (svg.empty()) return;                         // no element found
  if (!Array.isArray(data) || data.length === 0) { // nothing to show
    showMsg(svg, "No posts");
    return;
  }

  clear(svg);                                      // start fresh
  const pts = data.map(d => ({ date: new Date(d.date), count: +d.count })); // format data
  const { W, H } = svgSize(svg, 320, 200);
  const m = { top: 16, right: 12, bottom: 28, left: 36 }; // margins
  const w = W - m.left - m.right, h = H - m.top - m.bottom;

  const x = d3.scaleUtc()
    .domain(d3.extent(pts, d => d.date))           // range of dates
    .range([0, w]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(pts, d => d.count) || 1]).nice() // range of counts
    .range([h, 0]);

  const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

  g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(5)); // x axis
  g.append("g").call(d3.axisLeft(y).ticks(5));                                          // y axis

  g.append("path").datum(pts)                     // draw the line
    .attr("fill", "none").attr("stroke", "currentColor").attr("stroke-width", 2)
    .attr("d", d3.line().x(d => x(d.date)).y(d => y(d.count)));

  g.selectAll("circle").data(pts).enter().append("circle") // add points on the line
    .attr("r", 3).attr("cx", d => x(d.date)).attr("cy", d => y(d.count))
    .attr("fill", "currentColor");
}

// ---- bars: posts by group ----
function drawByGroup(data) {
  const svg = d3.select("#chart-by-group");
  if (svg.empty()) return;                         // no element found
  if (!Array.isArray(data) || data.length === 0) { // nothing to show
    showMsg(svg, "No groups yet");
    return;
  }

  clear(svg);                                      // start fresh
  const rows = data.map(d => ({
    group: String(d.label ?? d.groupName ?? d.group ?? "No Group"), // pick a name
    count: Number(d.count)                                          // make sure it's a number
  }));
  const { W, H } = svgSize(svg, 320, 220);
  const m = { top: 16, right: 12, bottom: 40, left: 36 }; // margins
  const w = W - m.left - m.right, h = H - m.top - m.bottom;

  const x = d3.scaleBand().domain(rows.map(d => d.group)).range([0, w]).padding(0.2); // x bands
  const y = d3.scaleLinear().domain([0, d3.max(rows, d => d.count) || 1]).nice().range([h, 0]); // y scale

  const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

  g.append("g").attr("transform", `translate(0,${h})`)   // x axis with rotated labels
    .call(d3.axisBottom(x))
    .selectAll("text").attr("transform", "rotate(-30)").style("text-anchor", "end");

  g.append("g").call(d3.axisLeft(y).ticks(5));           // y axis

  g.selectAll("rect").data(rows).enter().append("rect")  // draw bars
    .attr("x", d => x(d.group)).attr("y", d => y(d.count))
    .attr("width", x.bandwidth()).attr("height", d => h - y(d.count))
    .attr("fill", "currentColor");
}

// ---- run ----
drawPerDay(seed.perDay);   // render daily posts line chart
drawByGroup(seed.byGroup); // render posts by group bar chart