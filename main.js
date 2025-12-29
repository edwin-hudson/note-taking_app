let notes = []
let editingNoteId = null

function loadNotes() {
    const savedNotes = localStorage.getItem('quickNotes')
    return savedNotes ? JSON.parse(savedNotes) : []
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function formatDateTime(d = new Date()) {
    const month = months[d.getMonth()]
    const day = d.getDate()
    const year = d.getFullYear()
    let hour = d.getHours()
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const ampm = hour >= 12 ? 'PM' : 'AM'
    hour = hour % 12
    if (hour === 0) hour = 12
    return `${day} ${month} ${year}, ${hour}:${minutes} ${ampm}`
}

function saveNote(event) {
    event.preventDefault()

    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    // compute date/time at the moment of saving
    const newDate = formatDateTime();

    if(editingNoteId) {
        // Updating existing note
        const noteIndex = notes.findIndex(note => note.id === editingNoteId)
        if (noteIndex !== -1) {
            notes[noteIndex] = {
                ...notes[noteIndex],
                title: title,
                content: content,
                date: newDate // optionally update timestamp on edit
            }
        }
    }else{
        // Add new note
        notes.unshift({
            id: generateId(),
            title: title,
            content: content,
            date: newDate
        }) 
    }

    closeNoteDialog()
    saveNotes()
    renderNotes()
}

function generateId() {
    return Date.now().toString()
}

function saveNotes() {
    localStorage.setItem('quickNotes', JSON.stringify(notes))
}

function deleteNote(noteId) {
    notes = notes.filter(note => note.id !== noteId)
    saveNotes()
    renderNotes()
}

function renderNotes() {
    const notesContainer = document.getElementById('notesContainer');

    if(notes.length === 0) {
        // show fall back elements prompt when no notes is saved
        notesContainer.innerHTML = `
            <div class="empty-state">
                <h2>No notes yet ?</h2>
                <p>Create your first note to get started!</p>
                <button class="add-note-btn" onclick="openNoteDialog()"><i class="fa-regular fa-plus"></i> Add Your First Note</button>
            </div>
        `
        return
    }

    notesContainer.innerHTML = notes.map(note => `
        <div class="note-card">
            <h3 class="note-title">${note.title}</h3>
            <p class="note-content">${note.content}</p>
            <div class="note-footer">
                <p class="date-content">${note.date}</p>
                <button type="button" class="card-sub-menu">
                    <i class="card-menu-btn fa-solid fa-ellipsis-vertical"></i>
                        <div class="card-sub-btn">
                        </div>
                </button>
            </div>
            <div class="note-actions">
                <button class="edit-btn fa-regular fa-pen-to-square" onclick="openNoteDialog('${note.id}')" title="Edit Note"></button>
                <button class="delete-btn fa-regular fa-trash-can" onclick="deleteNote('${note.id}')" title="Delete Note">
                </button>
            </div>
        </div>
        `).join('')
}


function openNoteDialog(noteId = null) {
    const dialog = document.getElementById('noteDialog'),
    titleInput = document.getElementById('noteTitle'),
    contentInput = document.getElementById('noteContent');

    if(noteId) {
        // Edit mode
        const noteToEdit = notes.find(note => note.id === noteId)
        editingNoteId = noteId
        document.getElementById('dialogTitle').textContent = 'Edit Note'
        titleInput.value = noteToEdit.title
        contentInput.value = noteToEdit.content
    }else{
        // Add mode
        editingNoteId = null
        document.getElementById('dialogTitle').textContent = 'Add New Note'
        titleInput.value = ''
        contentInput.value = ''
    }

    dialog.showModal()
    titleInput.focus()
}

function closeNoteDialog() {
    document.getElementById('noteDialog').close()
}

// Theme function
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')

    const themeIcon = document.getElementById('themeToggleBtn')
    if (!themeIcon) return

    // set icon classes explicitly instead of mutating classList properties incorrectly
    themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'
    themeIcon.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme')
    themeIcon.title = isDark ? 'Switch to light theme' : 'Switch to dark theme'
}

// Applying theme function
function applyStoredTheme() {
    const theme = localStorage.getItem('theme') || 'light'
    const themeIcon = document.getElementById('themeToggleBtn')

    if (theme === 'dark') {
        document.body.classList.add('dark-theme')
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun'
    } else {
        document.body.classList.remove('dark-theme')
        if (themeIcon) themeIcon.className = 'fa-solid fa-moon'
    }

    if (themeIcon) {
        themeIcon.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme')
        themeIcon.title = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    }
}

document.addEventListener('DOMContentLoaded', function() {
    applyStoredTheme()
    notes = loadNotes()
    renderNotes()

    document.getElementById('noteForm').addEventListener('submit', saveNote)
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme)

    document.getElementById('noteDialog').addEventListener('click', function(event) {
        if(event.target === this) {
            closeNoteDialog()
        }
    })
})

