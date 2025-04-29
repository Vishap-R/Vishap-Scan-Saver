from flask import Flask, request, jsonify
from flask_cors import CORS
from urllib.parse import urlparse

app = Flask(__name__)
CORS(app)

# === Config des sites supportés ===
SITES_SUPPORTES = {
    "scan-manga.com": "SCANMANGA",
    "phenix-scans.com" : "PHENIXSCANS",
    "rimuscans.fr" : "RIMUSCANS",
    "poseidonscans.fr" : "POSEIDONSCAN",
}

# === Détection du site ===
def detect_site(url):
    parsed = urlparse(url)
    domaine = parsed.netloc
    domaine_sans_port = domaine.split(":")[0]
    domaine_principal = ".".join(domaine_sans_port.split(".")[-2:])
    return SITES_SUPPORTES.get(domaine_principal)

# === Parseur spécifique à Phenix Scans phenix-scans.com ===
def extract_PhenixScans(url):
    try:
        if "/chapitre" not in url:
            return None
        titre = url.split('/chapitre')[0].rsplit('manga/', 1)[-1].replace("-", " ").replace("_", " ").strip()
        chapitre = url.rsplit('chapitre/', 1)[-1].replace("-", "").replace("_", "").strip()
        return {
            "nom_oeuvre": titre.title(),  # Optionnel : .title() pour jolie casse
            "chapitre": chapitre,
            "url" : url
        }
    except Exception as e:
        raise ValueError(f"Erreur de parsing Phenix Scans: {e}")

# === Parseur spécifique à ScanManga scan-manga.com ===
def extract_scanmanga(url):
    try:
        if "Chapitre-" not in url:
            return None
        titre = url.split('-Chapitre')[0].rsplit('ligne/', 1)[-1].replace("-", " ").replace("_", " ").strip()
        chapitre = url.split('-FR')[0].rsplit('-Chapitre', 1)[-1].replace("-", "").replace("_", "").strip()
        return {
            "nom_oeuvre": titre.title(),  # Optionnel : .title() pour jolie casse
            "chapitre": chapitre,
            "url" : url
        }
    except Exception as e:
        raise ValueError(f"Erreur de parsing ScanManga: {e}")

# === Parseur spécifique à Rimu Scans rimuscans.fr ===
def extract_RimuScans(url):
    try:
        if "chapitre" not in url:
            return None
        titre = url.split('-chapitre')[0].rsplit('fr/', 1)[-1].replace("-", " ").replace("_", " ").strip()
                # Récupère le bout après 'chapitre-'
        partie_chapitre = url.split('-chapitre')[-1]
        # Enlève les éventuels '/' à la fin
        chapitre = partie_chapitre.replace("/", "").replace("-", "").replace("_", "").strip()
        return {
            "nom_oeuvre": titre.title(),
            "chapitre": chapitre,
            "url" : url
        }
    except Exception as e:
        raise ValueError(f"Erreur de parsing Rimu Scans: {e}")
    
# === Parseur spécifique à Poseidon Scans poseidonscans.fr === /serie/childhood-friend-of-the-zenith/chapter/1
def extract_PoseidonScans(url):

    try:
        if "chapter" not in url:
            return None
        titre = url.split('/chapter')[0].rsplit('serie/', 1)[-1].replace("-", " ").replace("_", " ").strip()
        chapitre = url.rsplit('/', 1)[-1].strip()
        print(titre)
        return {
            "nom_oeuvre": titre.title(),
            "chapitre": chapitre,
            "url" : url
        }
    except Exception as e:
        raise ValueError(f"Erreur de parsing Poseidon Scans: {e}")


# === API principale ===
@app.route("/process_url", methods=["POST"])
def process_url():
    try:
        data = request.get_json()
        url = data.get("url")

        site_detecte = detect_site(url)
        if not site_detecte:
            return jsonify({
                "status": "error",
                "reason": "Site non supporté"
            }), 400

        if site_detecte == "SCANMANGA":
            info = extract_scanmanga(url)
        elif site_detecte == "PHENIXSCANS":
            info = extract_PhenixScans(url)
        elif site_detecte == "RIMUSCANS":
            info = extract_RimuScans(url)
        elif site_detecte == "POSEIDONSCAN":
            info = extract_PoseidonScans(url)
        else:
            return jsonify({
                "status": "error",
                "reason": f"Pas de parseur pour le site: {site_detecte}"
            }), 501

        return jsonify({
            "status": "ok",
            "data": info
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "reason": str(e)
        }), 500

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "ok", "message": "API opérationnelle"}), 200

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8765)
