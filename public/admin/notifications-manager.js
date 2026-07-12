import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Initialize Firebase App reusing existing initialization if possible
const firebaseConfig = window.FIREBASE_CONFIG || {};
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========================================================
// Dynamic Custom Toast Notification System overriding native alert()
// ========================================================
function showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed bottom-6 right-6 z-[9999] flex flex-col space-y-3 pointer-events-none max-w-sm w-full px-4 sm:px-0';
        document.body.appendChild(container);
    }

    const lowerMsg = message.toLowerCase();
    let type = 'info';
    let iconClass = 'fa-solid fa-circle-info text-indigo-400';
    let borderClass = 'border-indigo-500/30';
    let bgClass = 'bg-gray-950/90';
    let textClass = 'text-indigo-400';

    if (lowerMsg.includes('success') || lowerMsg.includes('approved') || lowerMsg.includes('perfectly') || lowerMsg.includes('optimized') || lowerMsg.includes('resolved') || lowerMsg.includes('verified')) {
        type = 'success';
        iconClass = 'fa-solid fa-circle-check text-emerald-500';
        borderClass = 'border-emerald-500/30';
        bgClass = 'bg-[#0b1a13]/95';
        textClass = 'text-emerald-400';
    } else if (lowerMsg.includes('failed') || lowerMsg.includes('error') || lowerMsg.includes('rejected') || lowerMsg.includes('denied') || lowerMsg.includes('locked') || lowerMsg.includes('invalid')) {
        type = 'error';
        iconClass = 'fa-solid fa-circle-xmark text-rose-500';
        borderClass = 'border-rose-500/30';
        bgClass = 'bg-[#1f0d11]/95';
        textClass = 'text-rose-400';
    } else if (lowerMsg.includes('deleted') || lowerMsg.includes('removed') || lowerMsg.includes('purged')) {
        type = 'warning';
        iconClass = 'fa-solid fa-trash-can text-amber-500';
        borderClass = 'border-amber-500/30';
        bgClass = 'bg-[#1a140b]/95';
        textClass = 'text-amber-400';
    }

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto border ${borderClass} ${bgClass} rounded-xl shadow-2xl p-4 flex items-start space-x-3 transition duration-300 transform translate-y-4 opacity-0 backdrop-blur-md`;
    
    toast.innerHTML = `
        <div class="shrink-0 mt-0.5">
            <i class="${iconClass} text-lg"></i>
        </div>
        <div class="flex-1 min-w-0">
            <p class="text-[10px] font-bold ${textClass} tracking-wider uppercase">${type}</p>
            <p class="text-xs text-gray-200 mt-0.5 leading-relaxed font-semibold">${message}</p>
        </div>
        <button class="shrink-0 text-gray-500 hover:text-gray-300 transition focus:outline-none text-xs p-0.5">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);

    const dismiss = () => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
            if (container.children.length === 0 && container.parentNode) {
                document.body.removeChild(container);
            }
        }, 300);
    };

    toast.querySelector('button').addEventListener('click', dismiss);
    setTimeout(dismiss, 4000);
}

// Override native window.alert globally across all components
window.alert = showToast;


// Global arrays for notification caching
let latestClubs = [];
let latestEvents = [];
let latestPosts = [];
let latestReviews = [];
let globalNotifications = [];

// Helper to extract timestamp from Firestore document
function getDocTimestamp(docData) {
    let ts = docData.createdTime || docData.created_time || docData.createdAt || docData.time_posted || docData.submittedAt || docData.timestamp;

    // Fallback to eventDate for events
    if (!ts && docData.eventDate) {
        ts = docData.eventDate;
    }

    if (!ts) return 0;
    if (ts.toDate) return ts.toDate().getTime();
    if (ts.seconds) return ts.seconds * 1000;

    const parsed = new Date(ts).getTime();
    return isNaN(parsed) ? 0 : parsed;
}

function formatTimeAgo(timestamp) {
    if (!timestamp) return "Just now";
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function updateNotifications() {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    let notifications = [];

    let seenIds = [];
    try {
        seenIds = JSON.parse(localStorage.getItem('mm_seen_notifications') || '[]');
    } catch (e) {
        seenIds = [];
    }

    // Clubs
    latestClubs.forEach(docData => {
        const timestamp = getDocTimestamp(docData);
        if (timestamp && timestamp >= oneDayAgo) {
            const notifId = `club_${docData.id}`;
            notifications.push({
                id: notifId,
                type: 'club',
                title: 'New Club Registered',
                message: docData.name || 'Unnamed Club',
                timestamp: timestamp,
                link: 'clubs.html',
                read: seenIds.includes(notifId)
            });
        }
    });

    // Events
    latestEvents.forEach(docData => {
        const timestamp = getDocTimestamp(docData);
        if (timestamp && timestamp >= oneDayAgo) {
            const notifId = `event_${docData.id}`;
            notifications.push({
                id: notifId,
                type: 'event',
                title: 'New Event Scheduled',
                message: docData.eventName || 'Unnamed Event',
                timestamp: timestamp,
                link: 'events.html',
                read: seenIds.includes(notifId)
            });
        }
    });

    // Posts
    latestPosts.forEach(docData => {
        const timestamp = getDocTimestamp(docData);
        if (timestamp && timestamp >= oneDayAgo) {
            const notifId = `post_${docData.id}`;
            notifications.push({
                id: notifId,
                type: 'post',
                title: 'New Post Created',
                message: `${docData.display_name || 'User'} shared a post`,
                timestamp: timestamp,
                link: 'posts-collections.html',
                read: seenIds.includes(notifId)
            });
        }
    });

    // Reviews
    latestReviews.forEach(docData => {
        const timestamp = getDocTimestamp(docData);
        if (timestamp && timestamp >= oneDayAgo) {
            const notifId = `review_${docData.id}`;
            notifications.push({
                id: notifId,
                type: 'review',
                title: 'New Review Submitted',
                message: `${docData.userName || 'User'}: "${docData.reviewText || ''}"`,
                timestamp: timestamp,
                link: 'reviews.html',
                read: seenIds.includes(notifId)
            });
        }
    });

    notifications.sort((a, b) => b.timestamp - a.timestamp);
    globalNotifications = notifications;
    renderNotifications(notifications, seenIds);
}

function renderNotifications(notifications, seenIds) {
    const badge = document.getElementById('notificationBadge');
    const list = document.getElementById('notificationList');
    const unreadNotifications = notifications.filter(n => !n.read);
    const unreadCount = unreadNotifications.length;

    if (badge) {
        if (unreadCount > 0) {
            badge.innerText = unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    if (list) {
        list.innerHTML = '';
        if (unreadNotifications.length === 0) {
            list.innerHTML = `
                <div class="p-6 text-center text-gray-500 flex flex-col items-center justify-center space-y-1">
                    <i class="fa-regular fa-bell-slash text-xl text-gray-700 mb-1"></i>
                    <p>No recent notifications</p>
                </div>`;
            return;
        }

        unreadNotifications.forEach(n => {
            let bgClass = 'bg-indigo-500/10 text-indigo-400';
            let iconClass = 'fa-solid fa-map-pin';
            if (n.type === 'event') {
                bgClass = 'bg-amber-500/10 text-amber-500';
                iconClass = 'fa-solid fa-calendar-days';
            } else if (n.type === 'post') {
                bgClass = 'bg-blue-500/10 text-blue-400';
                iconClass = 'fa-solid fa-images';
            } else if (n.type === 'review') {
                bgClass = 'bg-rose-500/10 text-rose-400';
                iconClass = 'fa-solid fa-comments';
            }

            const item = document.createElement('a');
            item.href = n.link;
            item.className = `p-3 hover:bg-gray-800/40 transition flex items-start space-x-3 cursor-pointer border-l-2 border-indigo-500 bg-indigo-500/[0.02]`;
            item.innerHTML = `
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bgClass}">
                    <i class="${iconClass}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-200 truncate">${n.title}</p>
                    <p class="text-gray-400 text-[11px] truncate">${n.message}</p>
                    <span class="text-[10px] text-gray-500 mt-1 block">${formatTimeAgo(n.timestamp)}</span>
                </div>
            `;

            item.addEventListener('click', (e) => {
                seenIds.push(n.id);
                localStorage.setItem('mm_seen_notifications', JSON.stringify(seenIds));
            });

            list.appendChild(item);
        });
    }
}

// Inject DOM Elements dynamically into the page header
function injectNotificationDOM() {
    const header = document.querySelector('header');
    if (!header) return;

    let rightSide = header.querySelector('.flex.items-center.space-x-4');
    if (!rightSide) {
        const children = Array.from(header.children);
        if (children.length > 1) {
            const secondChild = children[1];
            rightSide = document.createElement('div');
            rightSide.className = 'flex items-center space-x-4';
            header.replaceChild(rightSide, secondChild);
            rightSide.appendChild(secondChild);
        } else {
            rightSide = document.createElement('div');
            rightSide.className = 'flex items-center space-x-4';
            header.appendChild(rightSide);
        }
    }

    if (!document.getElementById('notificationBellBtn')) {
        const container = document.createElement('div');
        container.className = 'relative';
        container.innerHTML = `
            <button id="notificationBellBtn"
                class="text-gray-400 hover:text-white transition relative p-2 rounded-lg bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800 focus:outline-none">
                <i class="fa-solid fa-bell text-base"></i>
                <span id="notificationBadge"
                    class="absolute -top-1 -right-1 bg-indigo-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center hidden animate-pulse">0</span>
            </button>
            
            <div id="notificationDropdown"
                class="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-55 hidden flex flex-col overflow-hidden">
                <div class="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-gray-950/40">
                    <span class="font-bold text-xs tracking-wider uppercase text-gray-400">Notifications</span>
                    <button id="markAllReadBtn"
                        class="text-[10px] text-indigo-400 hover:text-indigo-300 transition font-medium focus:outline-none">Mark all read</button>
                </div>
                <div id="notificationList" class="max-h-72 overflow-y-auto divide-y divide-gray-800/60 text-xs">
                    <div class="p-6 text-center text-gray-500 flex flex-col items-center justify-center space-y-1">
                        <i class="fa-regular fa-bell-slash text-xl text-gray-700 mb-1"></i>
                        <p>No recent notifications</p>
                    </div>
                </div>
            </div>
        `;
        rightSide.appendChild(container);
    }

    const bellBtn = document.getElementById('notificationBellBtn');
    const dropdown = document.getElementById('notificationDropdown');
    const markAllReadBtn = document.getElementById('markAllReadBtn');

    if (bellBtn && dropdown) {
        bellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !bellBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }

    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let seenIds = [];
            try {
                seenIds = JSON.parse(localStorage.getItem('mm_seen_notifications') || '[]');
            } catch (e) {
                seenIds = [];
            }

            globalNotifications.forEach(n => {
                if (!seenIds.includes(n.id)) {
                    seenIds.push(n.id);
                }
            });
            localStorage.setItem('mm_seen_notifications', JSON.stringify(seenIds));
            updateNotifications();
        });
    }
}

// Set up snapshot streams
function initializeStreams() {
    onSnapshot(collection(db, "clubs"), (snap) => {
        latestClubs = [];
        snap.forEach(docSnap => {
            latestClubs.push({ id: docSnap.id, ...docSnap.data() });
        });
        updateNotifications();
    });

    onSnapshot(collection(db, "events"), (snap) => {
        latestEvents = [];
        snap.forEach(docSnap => {
            latestEvents.push({ id: docSnap.id, ...docSnap.data() });
        });
        updateNotifications();
    });

    onSnapshot(collection(db, "postCollection"), (snap) => {
        latestPosts = [];
        snap.forEach(docSnap => {
            latestPosts.push({ id: docSnap.id, ...docSnap.data() });
        });
        updateNotifications();
    });

    onSnapshot(collection(db, "reviews"), (snap) => {
        latestReviews = [];
        snap.forEach(docSnap => {
            latestReviews.push({ id: docSnap.id, ...docSnap.data() });
        });
        updateNotifications();
    });
}

// Run injection and listener setup exactly once
let isNotificationsInitialized = false;
function initNotificationsSystem() {
    if (isNotificationsInitialized) return;
    isNotificationsInitialized = true;
    injectNotificationDOM();
    initializeStreams();
}

document.addEventListener('DOMContentLoaded', initNotificationsSystem);

if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initNotificationsSystem();
}
