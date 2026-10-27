export function getRemaining(targetMs, nowMs) {
    if(!Number.isFinite(targetMs) || !Number.isFinite(nowMs)) {
        throw new TypeError("Countdown timestamps must be finite numbers");
    }

    const totalSeconds = Math.max(0, Math.ceil((targetMs - nowMs) / 1000), );

    return {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        expired: nowMs >= targetMs
    };
}