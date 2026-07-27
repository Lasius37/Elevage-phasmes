// Détermine l’URL du fichier HTML dans lequel s’exécute ce script -------------------------------
const CURRENT_URL = new URL(window.location.href);


// Détermine le dossier racine du projet ----------------------------------------------------------
let ROOT;

if (CURRENT_URL.pathname.includes("/pages/")) {
    // Le fichier HTML se trouve dans le dossier pages
    ROOT = new URL("../", CURRENT_URL).href;
} else {
    // Le fichier HTML est index.html
    ROOT = new URL("./", CURRENT_URL).href;
}


// Création des chemins vers les différents répertoires -------------------------------------------
const STATIC = new URL("static/", ROOT).href;
const CSS = new URL("css/", STATIC).href;
const DATA = new URL("data/", STATIC).href;
const JS = new URL("js/", STATIC).href;
const PAGES = new URL("pages/", ROOT).href;

const MENU_DATA_FILE = new URL("menu.json", DATA).href;


// Charge les données du menu depuis le fichier JSON ----------------------------------------------
async function loadMenuData() {
    const response = await fetch(MENU_DATA_FILE);

    if (!response.ok) {
        throw new Error(
            `Impossible de charger le menu : erreur HTTP ${response.status}`
        );
    }

    return await response.json();
}


// Crée le menu de navigation ---------------------------------------------------------------------
async function createMenu() {
    const nav = document.querySelector("header nav");

    if (!nav) {
        console.error("Impossible de créer le menu : aucun élément <nav> trouvé dans <header>.");
        return;
    }

    try {
        const menu = await loadMenuData();
        const mainUl = document.createElement("ul");

        menu.forEach(section => {
            const sectionLi = document.createElement("li");
            sectionLi.classList.add("main-menu");

            // Ajout du titre de la section, s’il existe
            if (section.title) {
                const span = document.createElement("span");

                span.textContent = section.title;
                span.classList.add("main-menu-title");

                sectionLi.appendChild(span);
            }

            // Création du sous-menu
            const subUl = document.createElement("ul");
            subUl.classList.add("menu");

            section.links.forEach(link => {
                const li = document.createElement("li");
                const a = document.createElement("a");

                li.classList.add("sub-menu");
                a.classList.add("sub-menu-link");

                // L’accueil se trouve à la racine.
                // Les autres pages se trouvent dans le dossier pages.
                if (link.href === "index") {
                    a.href = new URL("index.html", ROOT).href;
                } else {
                    a.href = new URL(`${link.href}.html`, PAGES).href;
                }

                a.textContent = link.text;

                li.appendChild(a);
                subUl.appendChild(li);
            });

            sectionLi.appendChild(subUl);
            mainUl.appendChild(sectionLi);
        });

        nav.appendChild(mainUl);
    } catch (error) {
        console.error("Erreur lors de la création du menu :", error);
    }
}


// Lance la création du menu lorsque le document HTML est chargé ---------------------------------
document.addEventListener("DOMContentLoaded", createMenu);