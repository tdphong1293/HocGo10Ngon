export const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const formatTimeTextShort = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return  `${String(hours).padStart(2, '0')}h${String(minutes).padStart(2, '0')}m${String(secs).padStart(2, '0')}s`;
};

export const formatTimeTextLong = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return  `${String(hours).padStart(2, '0')} giờ ${String(minutes).padStart(2, '0')} phút ${String(secs).padStart(2, '0')} giây`;
}

export const formatTimeTextCompact = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return  `${hours > 0 ? String(hours).padStart(2, '0') + ' giờ' : ''}${minutes > 0 ? String(minutes).padStart(2, '0') + ' phút' : ''}${secs > 0 ? String(secs).padStart(2, '0') + ' giây' : ''}`;
}