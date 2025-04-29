Le développement de l’extension (JavaScript, HTML, CSS) a été assisté par ChatGPT car je maitrise pas ces language afin d’accélérer la création et garantir une structure fonctionnelle.

# 🧩 Vishap Scan Saver

**Extension de navigateur** + **API locale Flask** pour suivre et enregistrer les chapitres lus sur des sites de scan manga.  
Pas de compte, pas de cloud — juste ton navigateur et tes données locales.

---
## 🚀 Fonctionnalités à venir

-📏Mode compact
- 🔍Barre de recherche
- Plus de sites(si vous voulez proposer moi des site via discord)

## 🚀 Fonctionnalités

- 🕵️ Détecte les chapitres lus sur les sites pris en charge
- 📦 Sauvegarde ta progression localement (via `chrome.storage.local`)
- 🔄 Prend en charge plusieurs sites :
  - scan-manga.com  
  - phenix-scans.com  
  - rimuscans.fr  
  - poseidonscans.fr  
- 🔗 Communique avec une API Flask locale légère

---

## 🧠 Comment ça fonctionne ?

1. L’extension surveille les onglets et détecte les URLs des sites supportés.
2. Si l'URL correspond, elle est envoyée à l’API locale (`http://localhost:8765/process_url`).
3. L’API extrait automatiquement le titre et le numéro du chapitre.
4. L’extension enregistre ces infos localement et affiche une notification via badge.

---

## 📦 Installation

### 🔌 Extension (installation manuelle)
1. Clone ce dépôt Git
2. Ouvre `chrome://extensions/` (ou `about:debugging` sur Firefox)
3. Active **le mode développeur**
4. Clique sur **Charger l’extension non empaquetée** et sélectionne le dossier
5. Mettre vishap.py en .exe
6. L'ajouter au démarrage du pc
   

### 🧪 API locale (Flask)

```bash
pip install flask flask-cors
python vishap.py
```

---

### Image 🖼

![image](https://github.com/user-attachments/assets/0a14b590-275c-4036-ad27-4d693b7df6c5)
![image](https://github.com/user-attachments/assets/98966637-52a2-4db9-bde6-5580ffb9a7ed)
