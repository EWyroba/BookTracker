export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const READING_STATUS = {
    WANT_TO_READ: 'chce_przeczytac',
    READING: 'aktualnie_czytam',
    READ: 'przeczytana',
    PAUSED: 'wstrzymana',
    ABANDONED: 'porzucona'
} as const;