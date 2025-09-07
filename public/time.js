// public/time.js
(() => {
  const el = document.getElementById("nav-time");
  if (!el) return;

  const TZ = el.dataset.tz;
  let offset = 0; // difference between API time and local device time

  // Fetch current time from API once in a while
  async function syncTime() {
    try {
      const res = await fetch(
        `https://worldtimeapi.org/api/timezone/${encodeURIComponent(TZ)}`
      );
      const data = await res.json();
      const apiNow = new Date(data.datetime).getTime();
      offset = apiNow - Date.now(); // calculate offset
      el.title = data.timezone;
    } catch {
      offset = 0; // fallback: use local device time
      el.title = "Device time (fallback)";
    }
  }

  // Update the clock display
  function render() {
    const now = new Date(Date.now() + offset);
    el.textContent = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Initial sync + render
  syncTime().then(render);

  // Update every second
  setInterval(render, 1000);

  // Re-sync with API every 10 minutes
  setInterval(syncTime, 10 * 60 * 1000);
})();
