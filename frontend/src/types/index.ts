export interface User {
    id: number;
    nazwa_uzytkownika: string;
    email: string;
    nazwa_wyswietlana: string;
    url_avatara?: string;
    bio?: string;
    cel_czytania: number;
}

export interface Book {
    id: string;
    tytul: string;
    autorzy?: string[] | string;
    autor?: string;
    isbn?: string;
    opis?: string;
    liczba_stron?: number;
    data_wydania?: string;
    gatunek?: string;
    jezyk?: string;
    url_okladki?: string;
    wydawnictwo?: string;
    status?: string;
    aktualna_strona?: number;
    ocena?: number;
    recenzja?: string;
    data_rozpoczecia?: string;
    data_zakonczenia?: string;
    postep?: number;
    srednia_ocena?: string;
    liczba_ocen?: number;
    notatki?: any[];
    statystyki?: {
        liczba_notatek: number;
        ostatnia_strona_z_notatka: number;
    };
    source?: 'google' | 'local';
    existingBookId?: number | null;
    googleBooksId?: string | null;
    isInUserLibrary?: boolean;
    readingStatus?: {
        status: string;
        ocena: number | null;
        aktualna_strona: number;
        postep: number;
        data_rozpoczecia: string | null;
        data_zakonczenia: string | null;
    };
}

export interface ReadingStatus {
    status: 'chce_przeczytac' | 'aktualnie_czytam' | 'przeczytana' | 'wstrzymana' | 'porzucona';
    aktualna_strona: number;
    data_rozpoczecia?: string;
    data_zakonczenia?: string;
    ocena?: number;
    recenzja?: string;
}
export interface UserStats {
    booksRead: number;
    currentlyReading: number;
    totalPages: number;
    averageRating: string;
    notesCount: number;
    registrationYear: string;
}