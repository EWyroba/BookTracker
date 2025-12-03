// frontend/src/utils/constants.ts

// Podstawowy URL API
// Dla development - lokalny serwer backend
// Dla production - zmień na URL produkcyjny
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Inne stałe aplikacji
export const APP_NAME = 'BookTracker';
export const APP_VERSION = '1.0.0';

// Ustawienia paginacji
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

// Statusy czytania (powinny zgadzać się z backendem)
export const READING_STATUS = {
    WANT_TO_READ: 'chce_przeczytac',
    READING: 'aktualnie_czytam',
    READ: 'przeczytana',
    ABANDONED: 'porzucona'
} as const;

// Gatunki książek
export const GENRES = [
    'Fantastyka',
    'Science Fiction',
    'Kryminał',
    'Thriller',
    'Romans',
    'Horror',
    'Literatura piękna',
    'Literatura popularnonaukowa',
    'Biografia',
    'Autobiografia',
    'Historyczna',
    'Przygodowa',
    'Dramat',
    'Poezja',
    'Komedia',
    'Young Adult',
    'Dziecięca',
    'Poradnik',
    'Reportaż',
    'Publicystyka',
    'Klasyka',
    'Obyczajowa',
    'Sensacja',
    'Fantasy',
    'Paranormal',
    'Postapokaliptyczna',
    'Urban Fantasy',
    'High Fantasy',
    'Cyberpunk',
    'Steampunk',
    'Space Opera',
    'Military SF',
    'Hard SF',
    'Kryminał policyjny',
    'Kryminał sądowy',
    'Noir',
    'Thriller psychologiczny',
    'Thriller polityczny',
    'Thriller medyczny',
    'Romans historyczny',
    'Romans współczesny',
    'Romans erotyczny',
    'New Adult',
    'Literatura faktu',
    'Podróżnicza',
    'Kucharska',
    'Poradnik psychologiczny',
    'Rozwój osobisty',
    'Biznes',
    'Inne'
] as const;

// Walidacja
export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30,
    EMAIL_MAX_LENGTH: 255,
    BOOK_TITLE_MAX_LENGTH: 255,
    AUTHOR_MAX_LENGTH: 100,
    GENRE_MAX_LENGTH: 100,
    NOTE_MAX_LENGTH: 1000,
    QUOTE_MAX_LENGTH: 500,
    REVIEW_MAX_LENGTH: 2000
} as const;

// Cache
export const CACHE_DURATION = {
    SEARCH: 15 * 60 * 1000, // 15 minut
    STATS: 5 * 60 * 1000,   // 5 minut
    BOOKS: 10 * 60 * 1000   // 10 minut
} as const;

// Typy exportowane
export type ReadingStatus = typeof READING_STATUS[keyof typeof READING_STATUS];
export type Genre = typeof GENRES[number];