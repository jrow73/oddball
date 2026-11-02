const year = document.querySelector("#current-year");
const storageStatus = document.querySelector("#storage-status");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

if (storageStatus) {
  try {
    const key = "oddball.storage-check";
    window.localStorage.setItem(key, "ready");
    window.localStorage.removeItem(key);
    storageStatus.textContent = "Local ready";
  } catch {
    storageStatus.textContent = "Unavailable";
  }
}

