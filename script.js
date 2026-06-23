// 🔥 1. Live Verified Firebase Configuration Details
const firebaseConfig = {
    apiKey: "AIzaSyDjZjvBpyqn1yuJcRLC1ZljrZGrFTv7LhM",
    authDomain: "html-student-dashboard-project.firebaseapp.com",
    projectId: "html-student-dashboard-project",
    storageBucket: "html-student-dashboard-project.firebasestorage.app",
    messagingSenderId: "891816409405",
    appId: "1:891816409405:web:f002687f193f354374ed54",
    measurementId: "G-N3LXE6CMKH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let students = [];
let eventsList = [];
let calendar;
let marksChart, branchChart;

// Auto Case Formatting Controls
document.addEventListener('input', function (e) {
    if (e.target.tagName === 'INPUT') {
        if (e.target.type === 'email') e.target.value = e.target.value.toLowerCase();
        else if (e.target.type === 'text') e.target.value = e.target.value.toUpperCase();
    }
});

// 🔐 Security Session Check
auth.onAuthStateChanged(user => {
    const navButtons = document.querySelectorAll('.sidebar button');
    if (user) {
        // Active links and sync background database streams
        navButtons.forEach(btn => btn.style.display = 'block');
        loadDataFromFirebase();
    } else {
        // Force back to login view if session ends
        navButtons.forEach(btn => btn.style.display = 'none');
        showPage('auth-page');
    }
});

// 🔒 Firebase Sign In Router Handler
function handleSignIn(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            // Entry into the dashboard immediately upon successful click
            showPage('dashboard-page');
        })
        .catch(error => alert("ERROR: " + error.message));
}

// 📝 Firebase Registration Router Handler
function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            alert("REGISTRATION SUCCESSFUL!");
            // Entry into the dashboard immediately upon successful click
            showPage('dashboard-page');
        })
        .catch(error => alert("ERROR: " + error.message));
}

// 🚪 Firebase Session Destroyer
function handleLogout() {
    auth.signOut();
}

// Real-time Database Stream Listeners
function loadDataFromFirebase() {
    db.collection("students").onSnapshot(snapshot => {
        students = [];
        snapshot.forEach(doc => {
            let data = doc.data();
            data.id = doc.id;
            students.push(data);
        });
        renderTable();
    });

    db.collection("events").onSnapshot(snapshot => {
        eventsList = [];
        if(calendar) calendar.removeAllEvents();
        snapshot.forEach(doc => {
            let eventData = doc.data();
            eventsList.push(eventData);
            if(calendar) calendar.addEvent(eventData);
        });
    });
}

function addStudent(e) {
    e.preventDefault();
    const name = document.getElementById('std-name').value.toUpperCase();
    const branch = document.getElementById('std-branch').value;
    const marks = parseInt(document.getElementById('std-marks').value);

    db.collection("students").add({ name, branch, marks })
        .then(() => {
            document.getElementById('std-name').value = "";
            document.getElementById('std-marks').value = "";
            alert("STUDENT RECORD ADDED!");
        })
        .catch(error => alert("Error adding student: " + error.message));
}

// Delete Operations
function deleteStudent(id) {
    if(confirm("ARE YOU SURE YOU WANT TO DELETE THIS STUDENT?")) {
        db.collection("students").doc(id).delete()
            .catch(error => alert("Error deleting: " + error.message));
    }
}

function addEvent(e) {
    e.preventDefault();
    const title = document.getElementById('event-title').value.toUpperCase();
    const date = document.getElementById('event-date').value;

    db.collection("events").add({ title: title, start: date })
        .then(() => {
            alert("EVENT ADDED SUCCESSFULLY!");
            document.getElementById('event-title').value = "";
            document.getElementById('event-date').value = "";
        })
        .catch(error => alert("Error adding event: " + error.message));
}

function renderTable() {
    const tbody = document.getElementById('student-table-body');
    if (tbody) {
        tbody.innerHTML = "";
        students.forEach(student => {
            tbody.innerHTML += `<tr>
                <td>${student.name}</td>
                <td>${student.branch}</td>
                <td>${student.marks}</td>
                <td><button class="btn-delete" onclick="deleteStudent('${student.id}')">DELETE</button></td>
            </tr>`;
        });
    }
    updateCharts();
}

// Navigation Route Engine
function showPage(pageId) {
    if(!auth.currentUser && pageId !== 'auth-page') {
        showPage('auth-page');
        return;
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
    
    const target = document.getElementById(pageId);
    if(target) target.classList.add('active');

    const btn = document.getElementById('btn-' + pageId.replace('-page', ''));
    if(btn) btn.classList.add('active');

    if(pageId === 'events-page' && calendar) { 
        setTimeout(() => { calendar.render(); }, 200); 
    }
}

function toggleAuth(showSignIn) {
    document.getElementById('signin-box').style.display = showSignIn ? 'block' : 'none';
    document.getElementById('register-box').style.display = showSignIn ? 'none' : 'block';
}

// Real-time Computation Logic for Charts
function updateCharts() {
    let divisions = { 'DISTINCTION (>=75)': 0, 'FIRST CLASS (60-74)': 0, 'PASS (35-59)': 0, 'FAIL (<35)': 0 };
    let branchCounts = { 'CSE': 0, 'ECE': 0, 'EEE': 0, 'MECH': 0, 'CIVIL': 0 };

    students.forEach(s => {
        if(s.marks >= 75) divisions['DISTINCTION (>=75)']++;
        else if(s.marks >= 60) divisions['FIRST CLASS (60-74)']++;
        else if(s.marks >= 35) divisions['PASS (35-59)']++;
        else divisions['FAIL (<35)']++;

        if(branchCounts[s.branch] !== undefined) {
            branchCounts[s.branch]++;
        }
    });

    if(marksChart && marksChart.data) { 
        marksChart.data.datasets[0].data = Object.values(divisions); 
        marksChart.update(); 
    }
    
    if(branchChart && branchChart.data) { 
        branchChart.data.datasets[0].data = [
            branchCounts['CSE'],
            branchCounts['ECE'],
            branchCounts['EEE'],
            branchCounts['MECH'],
            branchCounts['CIVIL']
        ]; 
        branchChart.update(); 
    }
}

// Render Engine Configuration on DOM Boot
document.addEventListener('DOMContentLoaded', function() {
    const canvasMarks = document.getElementById('marksChart');
    if(canvasMarks && typeof Chart !== 'undefined') {
        marksChart = new Chart(canvasMarks.getContext('2d'), {
            type: 'bar',
            data: { 
                labels: ['DISTINCTION (>=75)', 'FIRST CLASS (60-74)', 'PASS (35-59)', 'FAIL (<35)'], 
                datasets: [{ label: 'NUMBER OF STUDENTS', data: [0, 0, 0, 0], backgroundColor: ['#2ECC71', '#3498DB', '#F1C40F', '#E74C3C'] }] 
                    },
            options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
        });
    }

    const canvasBranch = document.getElementById('branchChart');
    if(canvasBranch && typeof Chart !== 'undefined') {
        branchChart = new Chart(canvasBranch.getContext('2d'), {
            type: 'pie',
            data: { 
                labels: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'], 
                datasets: [{ 
                    label: 'STUDENT COUNT',
                    data: [0, 0, 0, 0, 0], 
                    backgroundColor: ['#E74C3C', '#3498DB', '#9B59B6', '#F1C40F', '#1ABC9C'] 
                }] 
            },
            options: { 
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Students Distribution by Branch' }
                }
            }
        });
    }

    const calendarEl = document.getElementById('calendar');
    if(calendarEl && typeof FullCalendar !== 'undefined') { 
        calendar = new FullCalendar.Calendar(calendarEl, { initialView: 'dayGridMonth' }); 
    }
});
