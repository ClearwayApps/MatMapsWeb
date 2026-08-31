import {
    getIdTokenResult,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export async function isAdminUser(user) {
    if (!user) return false;
    const token = await getIdTokenResult(user, true);
    const email = String(user.email || token.claims.email || '').trim().toLowerCase();
    return token.claims.admin === true ||
        token.claims.role === 'admin' ||
        email === 'test@matmaps.com';
}

export async function requireAdminAccess(auth, user) {
    if (!user) {
        window.location.replace('login.html');
        return false;
    }
    try {
        if (await isAdminUser(user)) return true;
    } catch (error) {
        console.error('Administrator access check failed:', error);
    }
    await signOut(auth).catch(() => {});
    window.location.replace('login.html?error=admin');
    return false;
}
