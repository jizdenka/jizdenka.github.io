
/**
 * Note class
 */
class Note {
    constructor(text, header, time, urgency, id) {
        this.text = text;
        this.header = header;
        this.time = time;
        this.urgency = urgency;
        this.id = id;
        this.deleted = false;
    }

    /**
     * Method to turn note into undraggable html object
     * @returns string html version of note object
     */
    toHtml() {
        if (this.deleted) return "";
        return `<div id = '${this.id}' class = 'note ${this.urgency ? 'urgent' : ''}'><h1>${this.header}</h1><h3 class = delete onclick = deleteNote(event)>delete</h2><p>${this.text}</p><p>Target time is ${this.time}</p></div>`;
    }

    /**
     * Method to turn note into draggable html object
     * @returns string html version of note object
     */
    toHtmlDraggable() {
        if (this.deleted) return "";
        return `<div ondragstart="drag(event)" id = '${this.id}' draggable = 'true' class = 'note ${this.urgency ? 'urgent' : ''}'><h1>${this.header}</h1><p>${this.text}</p><p>Created on ${this.time}</p></div>`;
    }
}


/**
 * Button to turn on menu on small screens
 */
class MenuSVG {
    constructor() {
        this.firstline = document.getElementById("toggle-menu-svg").childNodes[1];
        this.secondline = document.getElementById("toggle-menu-svg").childNodes[3];
    }

    /**
     * Menu opened and button makes arrow
     */
    makeArrow() {
        this.firstline.setAttribute("transform", "rotate(-16, 40, 12)");
        this.secondline.setAttribute("transform", "rotate(16, 40, 28)");
        console.log("Making arrow")
    }

    /**
     * Menu closed and button returns to original position
     */
    makeLines() {
        this.firstline.setAttribute("transform", "rotate(0, 40, 12)");
        this.secondline.setAttribute("transform", "rotate(0, 40, 28)");
    }

}


/**
 * Form for getting new notes
 */
class NoteForm {


    constructor() {
        this.name = document.getElementById("notename");
        this.text = document.getElementById("notetext");
        this.time = document.getElementById("notetime");
        this.urgency = document.getElementById('urgency');
    }


    /**
     * Gets data from form and makes it a note
     * @returns note 
     */
    getData() {
        let date = this.time.value;
        
        if (date == '')
        {
            console.log('a');
            date = new Date();
            date.setDate(date.getDate() + 1)
            date = date.toUTCString();
            console.log(date);
        }
        else
        {
            date = new Date(Date.parse(date));
            date = date.toUTCString();
        }
        const note = new Note( escapehtml(this.text.value),escapehtml(this.name.value), date, (this.urgency.value === "urgent" ? true : false), notes.length);
        this.name.value = this.text.value = this.time.value = "";
        return note;
    }
}


/**
 * Class for page routing
 */
class PageRouter {
    constructor(pages, defaultPage) {
        this.pages = pages;
        this.defaultPage = defaultPage;
        this.actualPage = null;
        this.errorPage = new ErrorPage({ key: 'error page', title: "Page not found" });
        console.log(this.pages);
        this.route(window.location.href);


        /**
         * History is changing => user wants to change page
         * route by url
         */
        window.addEventListener('popstate', e => { 
            this.route(window.location.href);
        }
        )


        /**
         * Add all in-page links different behaviour
         */

        document.querySelectorAll('header a').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                this.route(link.href);
                window.history.pushState(null, null, link.href);
                //console.log("routed by a");
            })
        })

         document.querySelectorAll('aside a').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                this.route(link.href);
                window.history.pushState(null, null, link.href);
            })
        })
        
    }

    /**
     * Changes page
     * @param {url to locate} urlString 
     */
    route(urlString) {
        const url = new URL(urlString)
        const page = url.searchParams.get('page')

        if (this.actualPage) {
            this.actualPage.hidePage();
        }

        this.actualPage = this.pages.find(p => p.key === (page ?? this.defaultPage));
        if (!this.actualPage) this.actualPage =  this.errorPage;
        this.actualPage.showPage();
    }
}


/**
 * Main class for pages with showPage and hidePage methods
 */
class Page {
    key
    title
    pageElement
    constructor({ key, title }) {
        this.key = key;
        this.title = title;
        this.pageElement = document.getElementsByClassName('maincontainer')[0];
    }


    /**
     * Draw this page in main container
     */
    showPage() {
        document.title = this.title;
        this.pageElement.innerHTML = this.gethtml();

    }

    /**
     * Remove this page from main container 
     */
    hidePage() {
        this.pageElement.innerHTML = '';
    }

    /**
     * 
     * @returns HTML of this page
     */
    gethtml() {
        return "";
    }
}


/**
 * All notes page that inherits Page class
 */
class AllNotesPage extends Page {
    constructor(settings) {
        super(settings);
    }

    gethtml() {
        let string = "<div class = 'notecontainer'>";
        notes.forEach(e => { string += e.toHtml() });
        string += '</div>';
        return string;
    }
}

/**
 * Change urgency page inherits Page class
 */
class ChangeUrgencyPage extends Page {
    constructor(settings) {
        super(settings);
    }

    gethtml() {
        let maincontainer = `<div class = "urgencymain" style = "display: flex;justify-content: space-around;">`;
        let nonUrgentContainer = `<div class = "urgencycontainer" ondrop="drop(event)" ondragover="allowDrop(event)" >`;
        let urgentContainer = `<div class = "urgencycontainer urgent" ondrop="drop(event)" ondragover="allowDrop(event)"" >`
        notes.forEach(e => {
            e.urgency ? urgentContainer += e.toHtmlDraggable() : nonUrgentContainer += e.toHtmlDraggable();
        });
        urgentContainer += '</div>';
        nonUrgentContainer += '<div>';
        maincontainer += urgentContainer + nonUrgentContainer + "</div>";
        return maincontainer;
    }
}


/**
 * Error page inherits Page class
 */
class ErrorPage extends Page {
    constructor(settings) {
        super(settings);
    }
    gethtml() {
        return "<h1>Sorry, looks like this page does not exist</h1>"
    }
}


/**
 * Form page inherits Page class
 */
class FormPage extends Page {
    constructor(settings) {
        super(settings);
    }
    gethtml() {
        return `<form class = 'noteform'>
            <div>
                <label for = 'notename'>Note name</label>
                <br>
                <input type ='text' id = 'notename' required>
            </div> 
            <div>
                <label for = 'notetext'>Note text</label>
                <br>
                <textarea id = 'notetext' required></textarea>
            </div>
            <div>
                <label for = 'notetime'>Target time</label>
                <br>
                <input type = 'datetime-local' id = "notetime">
            </div>
            <div>
                <select id = "urgency">
                    <option value = "default">Default</option>
                    <option value = "urgent">Urgent</option>
                </select>
            </div>
            <div>
                <button type="submit">Save locally</button>
            </div>
            <p>Saves data locally. For saving data to server use buttons in right top corner.</p>
            </form>`;
    }

    showPage() {
        super.showPage();
        noteForm = new NoteForm()
        document.querySelector("form").addEventListener("submit", e => {
            e.preventDefault();
            //noteForm.getData();
            notes.push(noteForm.getData());
            updateStorage();
        })
    }
}


/**
 * If user is offline, he must know
 */
window.addEventListener("offline", e => addOffline())
function addOffline()
{
    alert("Seems that you are offline. You can use webpage, but can not upload or download notes to server");
}

/**
 * Beginning variables
 * */


// Load notes from local storage
var notes = (function loadNotes() {
    const fromStorage = JSON.parse(localStorage.getItem("notes"));
    if (fromStorage == undefined) return [];
    //console.log(fromStorage)
    objectlist = fromStorage.map(element => {
        note = new Note(element.text, element.header, element.time, element.urgency, element.id);
        return note;
    });
    //console.log(objectlist);
    return objectlist;
})()

let menuToggled = false;
// Make menu button
const menusvg = new MenuSVG();
const sidemenu = document.getElementsByClassName('sidemenu')[0];
const showContainer = document.getElementById("maincontainer");
const toggleMenuDiv = document.getElementById("toggle-menu-svg");
// Make form for adding new notes
let noteForm = new NoteForm();

/**
 * Functions
 * */


/**
 * Change menu button
 */
function changeSVG() {
    if (menuToggled) {
        menusvg.makeArrow();
    }
    else {
        menusvg.makeLines();
    }
}


/**
 * toggle left menu 
 */
function toggleMenu() {
    if (menuToggled) {
        sidemenu.removeAttribute("style")
        sidemenu.classList.remove('hidden-side-menu');
    }
    else {
        sidemenu.setAttribute("style", "left:-200px")
        sidemenu.classList.add('hidden-side-menu')
    }
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function allowDrop(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const elementId = e.dataTransfer.getData("text");
    const element = document.getElementById(elementId);
    console.log(e.target.classList)
    if (e.target.classList.contains("urgent")) {
        notes.map(elem => {
            if (elem.id == elementId) {
                elem.urgency = true;
            }
            return e;
        })
        element.classList.add('urgent');
    }
    else {
        notes.map(elem => {
            if (elem.id == elementId) {
                elem.urgency = false;
            }
            return elem;
        })
        element.classList.remove('urgent');

    }
    updateStorage();
    e.target.appendChild(element);
}

/**
 * Prevents XSS
 * @param {oldText} text 
 * @returns text without XSS vulnerabilities
 */
function escapehtml(text) {
    return text
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
  }

  /**
   * Sends HTTP request to server to get notes
   */
function loadNotesFromRemote()
{
    alert("Notes are updating. Please wait for the next alert");
    fetch("https://kinetic-genre-388410.wl.r.appspot.com/api/notes", {method: "GET"})
    .then(responce => {
        //console.log(responce)
        return responce.json()})
    .then((fromStorage) => 
        {
            console.log("Got responce in json");
            console.log(fromStorage);
            if (fromStorage == undefined) 
            {
                notes = [];
                updateStorage();
                return;
            }
            console.log(fromStorage)
            const objectlist = fromStorage.map(
                element => 
                {
                    note = new Note(element.text, element.header, element.time, element.urgency, element.id);
                    return note;
                });
            notes = objectlist;
            updateStorage();
            pageRouter.actualPage.showPage();
            //console.log(notes);
            alert("Notes were updated from server");
        })
        .catch(e => alert("Sorry, can not load notes"));
    
}

/**
   * Sends HTTP request to server to send notes
   */
function uploadNotesToRemote()
{
    alert("Notes are updating. Please wait for the next alert");
    let jsonList = JSON.stringify(notes);
    params = {"notes": notes}
    console.log(jsonList)
    fetch("https://kinetic-genre-388410.wl.r.appspot.com/api/notes", {method:"POST",headers: {
    "Content-Type": "application/json",
  }, body:jsonList})
    .then(responce => {
        if(Math.floor(responce.status/100)==2)
        {
            alert("Notes were successfully uploaded to server");
        }
        else
        {
            alert("Sorry, can not upload your notes");
        }
    })
    .catch(error => alert(error));
}


/**
 * Update notes in local storage
 */
function updateStorage() {
    let jsonList = JSON.stringify(notes);
    localStorage.setItem('notes', jsonList);
}



function deleteNote(e)
{
    let id = e.target.parentNode.id;
    //console.log(id);
    notes = notes.map(note => {
        if (note.id==id)
        {
            note.deleted = true;
        }
        return note;
    })
    updateStorage();
    pageRouter.actualPage.showPage();
    //console.log(notes);
}

toggleMenuDiv.addEventListener('click', e => {
    menuToggled = !menuToggled;
    //console.log(menuToggled);
    changeSVG();
    toggleMenu();
})

document.getElementById('download').addEventListener('click', e => loadNotesFromRemote());
document.getElementById('upload').addEventListener('click', e => uploadNotesToRemote());



const pageRouter = new PageRouter(
    [
        new FormPage({ key: 'add', title: 'Add note!' }),
        new AllNotesPage({ key: 'all', title: "All notes" }),
        new FormPage({ key: 'form', title: 'Not Found!' }),
        new ChangeUrgencyPage({ key: 'urgency', title: 'Urgency change' })
    ],
    'all'
);