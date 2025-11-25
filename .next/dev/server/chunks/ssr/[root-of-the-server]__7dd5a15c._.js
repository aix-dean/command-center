module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/Github Projects/command-center/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Github Projects/command-center/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Github Projects/command-center/app/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

const playNotificationSound = async ()=>{
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Resume AudioContext if it's suspended (required in some browsers)
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        // Alert sound pattern: alternating high-low frequencies
        const now = audioContext.currentTime;
        oscillator.frequency.setValueAtTime(1000, now); // High pitch
        oscillator.frequency.setValueAtTime(800, now + 0.2); // Lower
        oscillator.frequency.setValueAtTime(1000, now + 0.4); // High again
        oscillator.frequency.setValueAtTime(800, now + 0.6); // Lower
        oscillator.frequency.setValueAtTime(1000, now + 0.8); // High
        oscillator.frequency.setValueAtTime(800, now + 1.0); // Lower
        oscillator.frequency.setValueAtTime(1200, now + 1.2); // Even higher for alert
        oscillator.frequency.setValueAtTime(1000, now + 1.4); // Back down
        oscillator.frequency.setValueAtTime(1200, now + 1.6); // High again
        oscillator.frequency.setValueAtTime(1000, now + 1.8); // Down
        oscillator.frequency.setValueAtTime(1200, now + 2.0); // Final high
        // Louder volume
        gainNode.gain.setValueAtTime(0.6, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 2.5);
        oscillator.start(now);
        oscillator.stop(now + 2.5);
    } catch (error) {
        console.warn("Could not play notification sound:", error);
    }
};
}),
"[project]/Github Projects/command-center/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Github Projects/command-center/app/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7dd5a15c._.js.map