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
    id: number;
    tytul: string;
    autor?: string;
    isbn?: string;
    opis?: string;
    url_okladki?: string;
    liczba_stron?: number;
    data_wydania?: string;
    wydawnictwo_id?: number;
    seria_id?: number;
    numer_w_serii?: number;
    gatunek?: string;
    jezyk?: string;
    autorzy?: string[];
    status?: string;
    aktualna_strona?: number;
    ocena?: number;
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