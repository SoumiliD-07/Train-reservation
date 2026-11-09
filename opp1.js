// System Parameters
const TOTAL_SEATS = 10;
let pnrCounter = 1001;

// Data Structures State
let seats = new Array(TOTAL_SEATS).fill(null); // Array for seats (null = empty, object = passenger)
let confirmedList = null; // Linked List head pointer
let waitingQueue = { front: null, rear: null, count: 0 }; // FIFO Queue

// Linked List Node Class
class Node {
constructor(pnr, name, age, gender, seatNumber) {
this.pnr = pnr;
this.name = name;
this.age = age;
this.gender = gender;
this.seatNumber = seatNumber;
this.next = null;
}
}

// Queue Node Class
class QueueNode {
constructor(pnr, name, age, gender) {
this.pnr = pnr;
this.name = name;
this.age = age;
this.gender = gender;
this.next = null;
}
}

// Initial setup on Window Load
window.onload = function() {
renderSeatsArray();
renderLinkedList();
renderQueue();
updateStats();
};

// Tab Switching Logic
function switchTab(tabName) {
const tabs = ['interactive', 'docs'];
tabs.forEach(t => {
document.getElementById(view-${t}).classList.add('hidden');
document.getElementById(tab-${t}).classList.remove('bg-brand-600', 'text-white', 'shadow-sm');
document.getElementById(tab-${t}).classList.add('text-slate-600');
});

document.getElementById(`view-${tabName}`).classList.remove('hidden');
document.getElementById(`tab-${tabName}`).classList.add('bg-brand-600', 'text-white', 'shadow-sm');
document.getElementById(`tab-${tabName}`).classList.remove('text-slate-600');


}

// Handle Booking Form Submission
function handleBookTicket(e) {
e.preventDefault();
const nameInput = document.getElementById('passenger-name');
const ageInput = document.getElementById('passenger-age');
const genderInput = document.getElementById('passenger-gender');

const name = nameInput.value.trim();
const age = parseInt(ageInput.value);
const gender = genderInput.value;

if (!name || isNaN(age)) return;

processReservation(name, age, gender);

// Reset Form Inputs
nameInput.value = '';
ageInput.value = '';


}

// Main Core Logic for Reservation
function processReservation(name, age, gender) {
// Find first vacant seat in array (O(N) search)
let allocatedSeat = -1;
for (let i = 0; i < TOTAL_SEATS; i++) {
if (seats[i] === null) {
allocatedSeat = i + 1;
break;
}
}

const currentPNR = pnrCounter++;

if (allocatedSeat !== -1) {
    // 1. Mark Array Index
    seats[allocatedSeat - 1] = { pnr: currentPNR, name };

    // 2. Insert into Singly Linked List (Head Insertion)
    const newNode = new Node(currentPNR, name, age, gender, allocatedSeat);
    newNode.next = confirmedList;
    confirmedList = newNode;
} else {
    // 3. System Full -> Enqueue onto FIFO Queue
    enqueueQueue(currentPNR, name, age, gender);
}

updateUI();


}

// Cancel Ticket Function
function cancelTicket(pnr) {
let prev = null;
let curr = confirmedList;

// Search linked list for PNR
while (curr !== null && curr.pnr !== pnr) {
    prev = curr;
    curr = curr.next;
}

if (!curr) return;

const freedSeat = curr.seatNumber;

// Unlink Node from Linked List
if (prev === null) {
    confirmedList = curr.next;
} else {
    prev.next = curr.next;
}

// Free array slot
seats[freedSeat - 1] = null;

// Check FIFO Queue for Auto Promotion
if (waitingQueue.front !== null) {
    const promoted = dequeueQueue();
    if (promoted) {
        // Mark array
        seats[freedSeat - 1] = { pnr: promoted.pnr, name: promoted.name };
        
        // Insert to Linked List
        const newNode = new Node(promoted.pnr, promoted.name, promoted.age, promoted.gender, freedSeat);
        newNode.next = confirmedList;
        confirmedList = newNode;
    }
}

updateUI();


}

// Enqueue FIFO Queue Helper
function enqueueQueue(pnr, name, age, gender) {
const qNode = new QueueNode(pnr, name, age, gender);
if (waitingQueue.rear === null) {
waitingQueue.front = qNode;
waitingQueue.rear = qNode;
} else {
waitingQueue.rear.next = qNode;
waitingQueue.rear = qNode;
}
waitingQueue.count++;
}

// Dequeue FIFO Queue Helper
function dequeueQueue() {
if (waitingQueue.front === null) return null;
const temp = waitingQueue.front;
waitingQueue.front = waitingQueue.front.next;

if (waitingQueue.front === null) {
    waitingQueue.rear = null;
}
waitingQueue.count--;
return temp;


}

// UI RENDERERS
function updateUI() {
renderSeatsArray();
renderLinkedList();
renderQueue();
updateStats();
}

// Render Seats Grid (Array)
function renderSeatsArray() {
const container = document.getElementById('seats-grid');
container.innerHTML = '';

for (let i = 0; i < TOTAL_SEATS; i++) {
    const isBooked = seats[i] !== null;
    const seatNo = i + 1;
    
    const card = document.createElement('div');
    card.className = `p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
        isBooked 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
    }`;
    
    card.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono font-bold">#${seatNo}</span>
            <i class="fa-solid ${isBooked ? 'fa-user-check text-emerald-600' : 'fa-chair text-slate-300'} text-xs"></i>
        </div>
        <div class="mt-3">
            <p class="text-xs font-semibold truncate">${isBooked ? seats[i].name : 'Vacant'}</p>
            <p class="text-[9px] font-mono ${isBooked ? 'text-emerald-700/80' : 'text-slate-400'}">
                ${isBooked ? 'PNR ' + seats[i].pnr : 'seats[' + i + ']'}
            </p>
        </div>
    `;
    container.appendChild(card);
}


}

// Render Linked List (Confirmed)
function renderLinkedList() {
const container = document.getElementById('linked-list-container');
container.innerHTML = '';

if (confirmedList === null) {
    container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <i class="fa-solid fa-link-slash text-2xl mb-2"></i>
            <p class="text-xs">Linked list is empty. No active reservations.</p>
        </div>
    `;
    return;
}

let curr = confirmedList;
while (curr !== null) {
    const nodeEl = document.createElement('div');
    nodeEl.className = 'bg-white border border-brand-200 hover:border-brand-500 p-3 rounded-xl flex items-center justify-between shadow-sm transition-all';
    
    nodeEl.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                S${curr.seatNumber}
            </div>
            <div>
                <div class="flex items-center space-x-2">
                    <p class="text-xs font-semibold text-slate-800">${curr.name}</p>
                    <span class="text-[10px] bg-brand-50 text-brand-600 border border-brand-200 px-1.5 py-0.5 rounded font-mono">PNR: ${curr.pnr}</span>
                </div>
                <p class="text-[10px] text-slate-500">${curr.gender}, ${curr.age} yrs • Node ptr: <span class="font-mono text-slate-400">${curr.next ? '0x' + curr.next.pnr : 'NULL'}</span></p>
            </div>
        </div>
        <button onclick="cancelTicket(${curr.pnr})" class="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1">
            <i class="fa-solid fa-xmark"></i>
            <span>Cancel</span>
        </button>
    `;
    container.appendChild(nodeEl);
    curr = curr.next;
}


}

// Render FIFO Queue (Waiting List)
function renderQueue() {
const container = document.getElementById('queue-container');
container.innerHTML = '';

if (waitingQueue.front === null) {
    container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <i class="fa-solid fa-check-circle text-2xl mb-2 text-slate-300"></i>
            <p class="text-xs">Waiting queue is empty. Seats available!</p>
        </div>
    `;
    return;
}

let curr = waitingQueue.front;
let pos = 1;
while (curr !== null) {
    const isFront = pos === 1;
    const isRear = curr.next === null;

    const qEl = document.createElement('div');
    qEl.className = 'bg-white border border-amber-200 p-3 rounded-xl flex items-center justify-between shadow-sm';
    
    qEl.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                #${pos}
            </div>
            <div>
                <div class="flex items-center space-x-2">
                    <p class="text-xs font-semibold text-slate-800">${curr.name}</p>
                    <span class="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-mono">PNR: ${curr.pnr}</span>
                </div>
                <p class="text-[10px] text-slate-500">${curr.gender}, ${curr.age} yrs</p>
            </div>
        </div>
        <div class="flex space-x-1">
            ${isFront ? '<span class="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded">FRONT (Next Up)</span>' : ''}
            ${isRear ? '<span class="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded">REAR</span>' : ''}
        </div>
    `;
    container.appendChild(qEl);
    curr = curr.next;
    pos++;
}


}

// Stats Updates
function updateStats() {
let bookedCount = 0;
for (let i = 0; i < TOTAL_SEATS; i++) {
if (seats[i] !== null) bookedCount++;
}

document.getElementById('stat-confirmed').innerText = bookedCount;
document.getElementById('stat-waiting').innerText = waitingQueue.count;

const statusEl = document.getElementById('stat-status');
if (bookedCount < TOTAL_SEATS) {
    statusEl.className = 'text-sm font-semibold text-emerald-600 mt-2 flex items-center';
    statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></span> Seats Available (${TOTAL_SEATS - bookedCount})`;
} else {
    statusEl.className = 'text-sm font-semibold text-amber-600 mt-2 flex items-center';
    statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-ping"></span> House Full (Waitlisting)`;
}


}

// Seed Random Mock Passengers
function seedRandomPassengers() {
const names = ['Ananya Roy', 'Vikram Das', 'Priya Patel', 'Siddharth Rao', 'Sneha Kapoor', 'Amitabh Sen', 'Tanya Verma'];
const genders = ['Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female'];

for (let i = 0; i < 5; i++) {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomAge = Math.floor(Math.random() * 40) + 18;
    const randomGender = genders[Math.floor(Math.random() * genders.length)];
    processReservation(`${randomName}`, randomAge, randomGender);
}


}

// Reset System
function resetSystem() {
seats = new Array(TOTAL_SEATS).fill(null);
confirmedList = null;
waitingQueue = { front: null, rear: null, count: 0 };
pnrCounter = 1001;
updateUI();
}