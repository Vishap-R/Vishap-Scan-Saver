// === Configuration ===
const SUPPORTED_DOMAINS = [
  "phenix-scans.com",
  "www.scan-manga.com",
  "scan-manga.com",
  "rimuscans.fr",
  "poseidonscans.fr"
];
const API_ENDPOINT = "http://localhost:8765/process_url";

// === Cache de dernière URL par onglet + compteur de nouveautés ===
let lastProcessedUrlByTab = {};
let newChapterCount = 0;

// === Sauvegarde dans chrome.storage.local ===
function saveToStorage(data) {
  const key = "scanTrackerData";

  chrome.storage.local.get([key], (result) => {
    const trackerData = result[key] || [];

    // Trouve le chapitre max existant pour cette œuvre
    const existingEntry = trackerData.find(item =>
      item.nom_oeuvre === data.nom_oeuvre
    );

    const newChapitre = parseFloat(data.chapitre);

    const shouldSave = !existingEntry || (
      parseFloat(existingEntry.chapitre) < newChapitre
    );

    if (shouldSave) {
      // Si existant, remplace ; sinon ajoute
      const updatedData = trackerData.filter(item => item.nom_oeuvre !== data.nom_oeuvre);
      updatedData.push(data);

      chrome.storage.local.set({ [key]: updatedData }, () => {
        console.log("📦 Nouveau chapitre enregistré :", data);

        newChapterCount++;
        chrome.action.setBadgeText({ text: newChapterCount.toString() });
        chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
      });
    } else {
      console.log("🔁 Chapitre déjà lu ou inférieur :", data);
    }
  });
}

// === Traitement de la réponse de l'API Python ===
async function handlePythonResponse(response) {
  if (response?.status === "ok" && response.data) {
    saveToStorage(response.data);
  } else {
    console.error("❌ Erreur dans la réponse API :", response?.reason || response);
  }
}

// === Analyse de l'URL ===
async function processUrl(url, tabId) {
  const lastUrl = lastProcessedUrlByTab[tabId];
  if (lastUrl === url) return;

  lastProcessedUrlByTab[tabId] = url;

  try {
    const urlObj = new URL(url);
    if (!SUPPORTED_DOMAINS.includes(urlObj.hostname)) return;

    console.log("📤 Envoi à l'API :", url);

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, tabId, timestamp: Date.now() })
    });

    const data = await response.json();
    await handlePythonResponse(data);
  } catch (error) {
    console.error("🚨 Erreur communication API :", error);
  }
}

// === Détection de changement d'URL ou d'actualisation ===
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

const debouncedUrlChange = debounce((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    processUrl(changeInfo.url, tabId);
  } else if (changeInfo.status === "complete" && tab.url) {
    // Pour détecter les actualisations même sans changement d'URL
    processUrl(tab.url, tabId);
  }
}, 300);

// === Événements Chrome ===
chrome.tabs.onUpdated.addListener(debouncedUrlChange);

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId).then((tab) => {
    if (tab?.url) processUrl(tab.url, tabId);
  });
});

// === Réinitialisation du badge quand popup ouverte ===
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "popup_opened") {
    newChapterCount = 0;
    chrome.action.setBadgeText({ text: "" });
    sendResponse({ success: true });
  }
});

// === Test API au démarrage ===
async function testApiConnection() {
  try {
    const response = await fetch("http://localhost:8765/ping");
    const data = await response.json();
    if (data.status === "ok") {
      console.log("✅ API connectée :", data.message);
    } else {
      console.warn("⚠️ API en ligne, mais réponse inattendue");
    }
  } catch (e) {
    console.error("❌ Impossible de contacter l'API Flask :", e);
  }
}

testApiConnection();

console.log("🚀 Extension Scan Tracker active !");
