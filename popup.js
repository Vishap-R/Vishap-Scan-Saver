document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage("popup_opened", () => {});

  const list = document.getElementById("chapter-list");
  const resetButton = document.getElementById("reset");
  const settingsButton = document.getElementById("settings");
  const settingsMenu = document.getElementById("settings-menu");
  const notification = document.getElementById("notification");
  const popupTitle = document.getElementById("popup-title");
  const searchInput = document.getElementById("search");
  const exportButton = document.getElementById("export-favorites");
  const confirmResetBox = document.getElementById("confirm-reset");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");

  let settingsOpen = false;
  let chapters = [];

  // 🔥 Sync dans localStorage
  function syncToLocalStorage() {
    try {
      localStorage.setItem("scanTrackerData", JSON.stringify(chapters));
    } catch (e) {
      console.error("Erreur de sync vers LocalStorage :", e);
    }
  }

  // Charger les données
  chrome.storage.local.get(["scanTrackerData"], (result) => {
    chapters = result.scanTrackerData || [];
    displayChapters(chapters);
    resetButton.classList.remove("hidden");
    syncToLocalStorage();
  });

  function displayChapters(data) {
    list.innerHTML = "";
    if (data.length === 0) {
      list.innerHTML = "<li class='fade-in'>Aucune donnée enregistrée 📭</li>";
    } else {
      data.slice().reverse().forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>📚 ${item.nom_oeuvre}</strong><br><span class="chapter">🔖 Chapitre ${item.chapitre}</span>`;
        li.classList.add("fade-in");
        if (item.url) {
          li.style.cursor = "pointer";
          li.addEventListener("click", () => {
            chrome.tabs.create({ url: item.url });
          });
        }
        list.appendChild(li);
      });
    }
    syncToLocalStorage(); // 🔥 A chaque display
  }

  // Reset avec confirmation propre
  resetButton.addEventListener("click", () => {
    confirmResetBox.style.display = "block";
  });

  confirmYes.addEventListener("click", () => {
    chrome.storage.local.remove("scanTrackerData", () => {
      chapters = [];
      displayChapters(chapters);
      confirmResetBox.style.display = "none";
      showNotification("Données réinitialisées !");
      syncToLocalStorage();
    });
  });

  confirmNo.addEventListener("click", () => {
    confirmResetBox.style.display = "none";
  });

  // Open/close Settings
  settingsButton.addEventListener("click", () => {
    settingsOpen = !settingsOpen;
    if (settingsOpen) {
      document.body.classList.add("settings-open");
      popupTitle.textContent = "⚙️ Paramètres";
      settingsButton.textContent = "❌ Fermer";
      searchInput.classList.remove("hidden");
      settingsMenu.classList.remove("hidden");
      list.style.display = "none";
      resetButton.style.display = "none";
    } else {
      document.body.classList.remove("settings-open");
      popupTitle.textContent = "📖 Derniers Chapitres";
      settingsButton.textContent = "⚙️ Paramètres";
      searchInput.classList.add("hidden");
      settingsMenu.classList.add("hidden");
      list.style.display = "block";
      resetButton.style.display = "block";
      searchInput.value = "";
      displayChapters(chapters);
    }
  });

  // Export vers fichier .json
  exportButton.addEventListener("click", () => {
    if (chapters.length === 0) {
      showNotification("Aucune donnée à exporter.");
      return;
    }

    const dataStr = JSON.stringify(chapters, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "scan-tracker-export.json";
    a.click();
    URL.revokeObjectURL(url);

    showNotification("Exporté en .json !");
  });


  // Notifications
  function showNotification(message) {
    notification.textContent = message;
    notification.style.display = "block";
    setTimeout(() => {
      notification.style.opacity = 1;
      notification.style.bottom = "50px";
    }, 100);

    setTimeout(() => {
      notification.style.opacity = 0;
      notification.style.bottom = "20px";
      setTimeout(() => {
        notification.style.display = "none";
      }, 500);
    }, 2500);
  }
});
