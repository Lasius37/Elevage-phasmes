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
const LOGOS = new URL("logos/", STATIC).href;
const CSS = new URL("css/", STATIC).href;
const DATA = new URL("data/", STATIC).href;
const JS = new URL("js/", STATIC).href;
const IMAGES = new URL("images/", STATIC).href;
const PAGES = new URL("pages/", ROOT).href;

const MENU_DATA_FILE = new URL("menu.json", DATA).href;
const FOOTER_DATA_FILE = new URL("footer.json", DATA).href;
const LOGO_IMG = new URL("logo.png", LOGOS).href;


// Charge les données du menu depuis le fichier JSON ----------------------------------------------
async function loadJsonData(file) {
    const response = await fetch(file);

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
        const menu = await loadJsonData(MENU_DATA_FILE);
        const mainUl = document.createElement("ul");

        menu.forEach(section => {
            const sectionLi = document.createElement("li");

            // Ajout du titre de la section, s’il existe
            if (section.title) {
                sectionLi.classList.add("main-menu")
                const span = document.createElement("span");

                span.textContent = section.title;
                span.classList.add("main-menu-title");

                sectionLi.appendChild(span);
            }
            else {
                sectionLi.classList.add("main-menu-home");
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
                    a.classList.add("home")
                    const logo = document.createElement("img");
                    logo.src = LOGO_IMG;
                    logo.classList.add("logo-img");

                    const span = document.createElement("span");
                    span.textContent = link.text;

                    a.appendChild(logo);
                    a.appendChild(span);
                } else {
                    a.href = new URL(`${link.href}.html`, PAGES).href;
                    a.textContent = link.text;
                }

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


// Crée le footer ---------------------------------------------------------------------------------
async function createFooter() {
    const footer = document.querySelector("footer");

    if (!footer) {
        console.error("Impossible de créer le footer : aucun élément <footer> trouvé la page.");
        return;
    }

    try {
        const footerData = await loadJsonData(FOOTER_DATA_FILE);

        footerData.forEach(elementData => {
            const element = document.createElement(elementData.tag);

            elementData.children.forEach(childData => {
                if (childData.type === "text") {
                    const text = document.createTextNode(childData.content);
                    element.appendChild(text);
                } else if (childData.type === "link") {
                    const link = document.createElement("a");

                    link.href = childData.href;
                    link.target = childData.target;
                    link.rel = childData.rel;

                    const image = document.createElement("img");
                    const path = new URL(childData.imageFile, LOGOS).href;

                    image.src = path;
                    image.alt = childData.imageAlt;
                    image.classList.add(childData.imageClasses);

                    link.appendChild(image);
                    element.appendChild(link);
                }
            });

            footer.appendChild(element);
        });
    } catch (error) {
        console.error("Erreur lors de la création du footer :", error);
    }
}


// Lance la création du menu lorsque le document HTML est chargé ---------------------------------
document.addEventListener("DOMContentLoaded", () => {
    createMenu();
    createFooter();
});

const header = document.querySelector("header");

const observer = new ResizeObserver(() => {
    document.documentElement.style.setProperty(
        "--header-height",
        `${header.offsetHeight}px`
    );
});

observer.observe(header);