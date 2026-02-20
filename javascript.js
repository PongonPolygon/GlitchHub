/*
 _______  ___      _______  _______  _______  _______    
|       ||   |    |       ||   _   ||       ||       |   
|    _  ||   |    |    ___||  |_|  ||  _____||    ___|   
|   |_| ||   |    |   |___ |       || |_____ |   |___    
|    ___||   |___ |    ___||       ||_____  ||    ___|   
|   |    |       ||   |___ |   _   | _____| ||   |___    
|___|    |_______||_______||__| |__||_______||_______|   
 ______   _______  __    _  _______                      
|      | |       ||  |  | ||       |                     
|  _    ||   _   ||   |_| ||_     _|                     
| | |   ||  | |  ||       |  |   |                       
| |_|   ||  |_|  ||  _    |  |   |                       
|       ||       || | |   |  |   |                       
|______| |_______||_|  |__|  |___|                       
 _______  _______  _______  _______  ___                 
|       ||       ||       ||   _   ||   |                
|  _____||_     _||    ___||  |_|  ||   |                
| |_____   |   |  |   |___ |       ||   |                
|_____  |  |   |  |    ___||       ||   |___             
 _____| |  |   |  |   |___ |   _   ||       |            
|_______|  |___|  |_______||__| |__||_______|            
 _______  _______  ______   _______    __     __     __  
|       ||       ||      | |       |  |  |   |  |   |  | 
|       ||   _   ||  _    ||    ___|  |  |   |  |   |  | 
|       ||  | |  || | |   ||   |___   |  |   |  |   |  | 
|      _||  |_|  || |_|   ||    ___|  |__|   |__|   |__| 
|     |_ |       ||       ||   |___    __     __     __  
|_______||_______||______| |_______|  |__|   |__|   |__| 

I worked hard on this and it would be annoying to have precious code taken (unless you add credits!)
*/





// get page ?page=
const debug = false; // for debug printing

let siteReady = false;

const params = new URLSearchParams(window.location.search);
let page = params.get("page") || "play";
let search = params.get("search");

function syncPageFromURL() {
    if (!siteReady) return; // wait until links + UI exist
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page") || "play";
    toggleSection(page);
}

if (search != null) {
    document.getElementById("searchBar").value = search;
    params.delete("search");
 
    const newURL = `${window.location.pathname}?${params.toString()}`;
    history.replaceState({}, "", newURL);
}

window.addEventListener("pageshow", syncPageFromURL);
window.addEventListener("popstate", syncPageFromURL);


window.addEventListener("pageshow", (event) => {
    // fires on normal load AND when coming back from another site
    syncPageFromURL();
});

function setParams(name, value, replace = false) {
    const param = new URLSearchParams(window.location.search);
    param.set(name, value);
    const newURL = `${window.location.pathname}?${param.toString()}`;
    
    if (replace)
        history.replaceState({}, "", newURL);
    else
        history.pushState({}, "", newURL);
}

// first load should REPLACE, not push
setParams("page", page, true);

window.addEventListener("popstate", syncPageFromURL);

// toggling visibility for sections
function toggleSection(section) {
    document.getElementById("playSection").classList.remove("active");
    document.getElementById("watchSection").classList.remove("active");
    document.getElementById("helpSection").classList.remove("active");
    document.getElementById("playButton").classList.remove("active-button");
    document.getElementById("watchButton").classList.remove("active-button");
    document.getElementById("helpButton").classList.remove("active-button");
    
    document.getElementById(section + "Section").classList.add("active");
    document.getElementById(section + "Button").classList.add("active-button");
    document.title = "GlitchHub | " + section.charAt(0).toUpperCase() + section.slice(1);
    if (section != "help") {
        document.getElementById("searchBar").style.display = "inline";
    } else {
        document.getElementById("searchBar").style.display = "none";
    }
}
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("playButton").addEventListener("click", function() {
        toggleSection("play");
        setParams("page", "play");
    });
    
    document.getElementById("watchButton").addEventListener("click", function() {
        toggleSection("watch");
        setParams("page", "watch");
    });

    document.getElementById("helpButton").addEventListener("click", function() {
        toggleSection("help");
        setParams("page", "help");
    });
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

                    let addtype = false;
                    if (item.type) {
                        addtype = true;
                    }
                    if (addtype) {
                        document.getElementById(item.type).appendChild(link);
                        document.getElementById(item.type).appendChild(document.createElement("br"));
                    } else {
                        container.appendChild(link);
                        container.appendChild(document.createElement("br"));
                    }
                    if (debug) {
                        console.log("Added '" + link.textContent + "' to " + listName + " section.");
                    }
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
            str = String(str ?? "");
            const base = str.toLowerCase().replace(/[':.,]/g, "").trim();

            return [
                base,
                base.replace(/[-_/]/g, " "),
                base.replace(/[-_/]/g, ""),
            ];
        }
        function matchesSearch(query, text, href) {
            if (!query) return true;

            const qForms = normalize(query);
            const textForms = normalize(text);
            const hrefForms = normalize(href);

            return qForms.some(q =>
                textForms.some(t => t.includes(q)) ||
                hrefForms.some(h => h.includes(q))
            );
        }
        //filtering links
        function filterLinks() {
            let play = 0;
            let watch = 0;
            
            const query = searchBar.value;
            
            // loop throug all the containers
            searchableContainers.forEach(container => {
                if (!container) return;
                
                const links = container.getElementsByTagName("a");
                
                for (let link of links) {
                const is18 = link.classList.contains("18");
                const text = link.textContent;
                const href = normalize(link.getAttribute("href"));

                // determine if link should be visible
                let visible = true;

                if (is18 && enabled) {
                    visible = false;
                } else if (!matchesSearch(query, text, href)) {
                    visible = false;
                }

                // set visibility
                link.style.display = visible ? "" : "none";
                if (link.nextElementSibling && link.nextElementSibling.tagName === "BR") {
                    link.nextElementSibling.style.display = visible ? "" : "none";
                }

                // count only visible links
                if (visible) {
                    if (container === document.getElementById("play")) play++;
                    else if (container === document.getElementById("watch")) watch++;
                }
            }

            });
            
            // update count for titles
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
        //18+ filter isnt used right now cuz it just annoying tbh
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
        const STORAGE_KEY = "FAVICON_CACHE";
        const faviconCache = new Map(Object.entries(
            JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
        ));

        function saveCache() {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(Object.fromEntries(faviconCache))
            );
        }

        document.querySelectorAll("a").forEach((link) => {
            if (link.querySelector("img")) return;

            let hostname, origin;

            try {
                const url = new URL(link.href);
                hostname = url.hostname;
                origin = url.origin;
            } catch {
                return;
            }


            let faviconURL;

            if (faviconCache.has(hostname)) {
                faviconURL = faviconCache.get(hostname);
            } else {
                faviconURL = `https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(origin)}`;
                faviconCache.set(hostname, faviconURL);
                saveCache();
            }

            // create image but DO NOT attach yet
            const icon = new Image();

            icon.alt = hostname;
            icon.style.width = "1em";
            icon.style.height = "1em";
            icon.style.verticalAlign = "middle";
            icon.style.marginTop = "-.4em";
            icon.style.marginRight = "6px";
            icon.style.borderRadius = "25%";

            // only insert after load
            icon.addEventListener("load", () => {
                link.prepend(icon);
            });

            // optional: if favicon fails, remove cache entry so it can retry later
            icon.addEventListener("error", () => {
                faviconCache.delete(hostname);
                saveCache();
            });

            // start loading AFTER listeners are attached
            icon.src = faviconURL;
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
        
        siteReady = true;
        syncPageFromURL();
    }
}

loadLinks();
