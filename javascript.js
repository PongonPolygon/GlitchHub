// get page ?page=
const params = new URLSearchParams(window.location.search);
const page = params.get("page");
let startpage = "";

if (page == "play") {
    startpage = "play";
} else if (page == "watch") {
    startpage = "watch";
} else if (page == "help") {
    startpage = "help";
} else {
    startpage = "play";
}

// toggling visibility for sections
function toggleSection(section) {
    document.getElementById("playSection").classList.remove("active");
    document.getElementById("watchSection").classList.remove("active");
    document.getElementById("helpSection").classList.remove("active");
    document.getElementById("playButton").classList.remove("active-button");
    document.getElementById("watchButton").classList.remove("active-button");
    document.getElementById("helpButton").classList.remove("active-button");

    if (section == "play") {
        document.getElementById("playSection").classList.add("active");
        document.getElementById("playButton").classList.add("active-button");

        document.getElementById("searchBar").style.display = "inline";
        document.title = "GlitchHub | Play";
    } else if (section == "watch") {
        document.getElementById("watchSection").classList.add("active");
        document.getElementById("watchButton").classList.add("active-button");

        document.getElementById("searchBar").style.display = "inline";
        document.title = "GlitchHub | Watch";
    } else if (section == "help") {
        document.getElementById("helpSection").classList.add("active");
        document.getElementById("helpButton").classList.add("active-button");

        document.getElementById("searchBar").style.display = "none";
        document.title = "GlitchHub | Help";
    }
}
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("playButton")
        .addEventListener("click", () => toggleSection("play"));

    document.getElementById("watchButton")
        .addEventListener("click", () => toggleSection("watch"));

    document.getElementById("helpButton")
        .addEventListener("click", () => toggleSection("help"));
    toggleSection(startpage);
});

let scrollPosition = 0;
let isTicking = 0;

function updateAnimation() {
    document.getElementById("body").style.backgroundPositionY = scrollPosition * 0.5 + "px";
    document.getElementById("title").style.top = ((scrollPosition * 0.25)-20) + "px";
    isTicking = false;
}

function handleScroll() {
    scrollPosition = window.scrollY;
    if (!isTicking) {
        window.requestAnimationFrame(updateAnimation);
        isTicking = true;
    }
}
window.addEventListener("scroll", handleScroll);
let descriptions = [];

// get links and add them
async function loadLinks() {
    try {
        const resp = await fetch("lists.json");
        if (!resp.ok) throw new Error("Failed to get sites");
        
        const data = await resp.json();
        
        Object.keys(data).forEach(listName => {
            if (listName != "descriptions") {
                const container = document.getElementById(listName);
                if (!container) return;

                data[listName].forEach(item => {
                    const link = document.createElement("a");
                    link.href = item.url;
                    link.textContent = item.name;

                    if (item.tag) {
                        link.className = item.tag;
                    }

                    container.appendChild(link);
                    container.appendChild(document.createElement("br"));
                });
            } else {
                data[listName].forEach(item => {
                    descriptions.push(item);
                });
            }
        });
        onLinksReady();
        
    } catch (error) {
        console.error("error for data:", error);
    }
    
    function onLinksReady() {
        console.log("Loaded all URLS!");
        //set cookie
        function setCookie(name, value) {
            const expires = new Date(Date.now() + 3153600000*864e5).toUTCString();
            document.cookie = `${name}=${value}; expires=${expires}; path=/`;
        }
        //get cookies
        function getCookie(name) {
            return document.cookie.split("; ").find(row => row.startsWith(name + "="))?.split("=")[1];
        }
        //checking for filter enabled
        let enabled = getCookie("18Filter") !== "false";
        //if not enabled set checkbox for user interface
        if (!enabled) {
            document.getElementById("18Check").checked = false;
        }
        //add br and remove br for 18+
        function removeBr(el) {
            if (el && el.nextSibling) {
                let next = el.nextSibling;
                while (next && next.nodeType === Node.TEXTNODE) {
                    next = next.nextSibling;
                }
                
                if (next && next.tagName === "BR") {
                    next.remove();
                }
            }
        }
        function addBr(el) {
            if (el) {
                const br = document.createElement("br");
                el.insertAdjacentElement("afterend", br);
            }
        }
        
        // checking when filter is checked or unchecked
        const searchableContainers = [
            document.getElementById("play"),
            document.getElementById("watch")
        ];
        //get searchbar
        const searchBar = document.getElementById("searchBar");
        //normalize string for searching
        function normalize(str) {
            return str.toLowerCase().replace(/[':.,]/g, "").replace(/[-]/g, " ").trim();
        }
        //filtering links
        function filterLinks() {
            let play = 0;
            let watch = 0;
            
            const query = normalize(searchBar.value);
            
            searchableContainers.forEach(container => {
                if (!container) return;
                
                const links = container.getElementsByTagName("a");
                
                for (let link of links) {
                const is18 = link.classList.contains("18");
                const text = normalize(link.textContent);
                const href = normalize(link.getAttribute("href"));

                // Determine if link should be visible
                let visible = true;

                if (is18 && enabled) {
                    // 18+ filter is ON → hide all 18 links
                    visible = false;
                } else if (query && !(text.includes(query) || href.includes(query))) {
                    // Search query doesn’t match → hide
                    visible = false;
                }

                // Apply visibility
                link.style.display = visible ? "" : "none";
                if (link.nextElementSibling && link.nextElementSibling.tagName === "BR") {
                    link.nextElementSibling.style.display = visible ? "" : "none";
                }

                // Count only visible links
                if (visible) {
                    if (container === document.getElementById("play")) play++;
                    else if (container === document.getElementById("watch")) watch++;
                }
            }

            });
            document.getElementById("playCount").textContent = "Games (" + play + ")";
            document.getElementById("watchCount").textContent = "Movies & Shows (" + watch + ")";
        }
        searchableContainers.forEach(container => {
            if (!container) return;
            
            const links = container.getElementsByTagName("a");
            
            for (let link of links) {
                if (link.classList.contains("18")) {
                    link.style.display = "none";
                    removeBr(link);
                }
            }
        });
        
        //18+ cookie check change
        document.getElementById("18Check").addEventListener("change", function() {
            if (this.checked) {
                enabled = true;
                setCookie("18Filter", "true");
                
                searchableContainers.forEach(container => {
                    if (!container) return;
                    const links = container.getElementsByTagName("a");
                    
                    for (let link of links) {
                        if (link.classList.contains("18")) {
                            link.style.display = "none";
                            removeBr(link);
                        }
                    }
                });
            } else {
                enabled = false;
                setCookie("18Filter", "false");
                
                searchableContainers.forEach(container => {
                    if (!container) return;
                    const links = container.getElementsByTagName("a");
                    
                    for (let link of links) {
                        if (link.classList.contains("18")) {
                            link.style.cssText = "";
                            addBr(link);
                        }
                    }
                });
            }
            
            filterLinks();
        });
        
        // search bar
        document.getElementById("searchBar").addEventListener("input", filterLinks);
        // end of filter URLS
        
        // add icons to each URL
        document.querySelectorAll("a").forEach((link) => {
            if (link.querySelector("img")) return;
            
            let domain;
            
            try {
                domain = new URL(link.href).origin;
            } catch {
                return;
            }
            
            const icon = document.createElement("img");
            icon.src = `https://www.google.com/s2/favicons?sz=32&domain_url=${domain}`;
            icon.alt = "favicon";
            icon.style.width = "1em";
            icon.style.height = "1em";
            icon.style.verticalAlign = "middle";
            icon.style.marginTop = "-.4em";
            icon.style.marginRight = "6px";
            icon.style.borderRadius = "25%";
            link.prepend(icon);
        });
        
        //description
        document.getElementById("description").textContent =
        descriptions[Math.floor(Math.random() * descriptions.length)];
        
        //initial count
        if (enabled) {
            searchableContainers.forEach(container => {
                if (!container) return;
                const links = container.getElementsByTagName("a");

                for (let link of links) {
                    if (link.classList.contains("18")) {
                        link.style.display = "none";
                        removeBr(link);
                    }
                }
            });
        } else {
            searchableContainers.forEach(container => {
                if (!container) return;
                const links = container.getElementsByTagName("a");

                for (let link of links) {
                    if (link.classList.contains("18")) {
                        link.style.cssText = "";
                        addBr(link);
                    }
                }
            });
        }

        filterLinks();
        document.getElementById("loading").remove();
        document.getElementById("main").style.display = "block";
    }
}

loadLinks();
