-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Lis 14, 2025 at 01:55 PM
-- Wersja serwera: 10.4.32-MariaDB
-- Wersja PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `booktracker`
--
CREATE DATABASE IF NOT EXISTS `booktracker` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `booktracker`;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `autorzy`
--

CREATE TABLE `autorzy` (
  `id` int(11) NOT NULL,
  `imie_nazwisko` varchar(255) NOT NULL,
  `biogram` text DEFAULT NULL,
  `data_urodzenia` date DEFAULT NULL,
  `data_smierci` date DEFAULT NULL,
  `narodowosc` varchar(100) DEFAULT NULL,
  `url_zdjecia` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `autorzy`
--

INSERT INTO `autorzy` (`id`, `imie_nazwisko`, `biogram`, `data_urodzenia`, `data_smierci`, `narodowosc`, `url_zdjecia`) VALUES
(1, 'Andrzej Sapkowski', 'Polski pisarz fantasy, twórca sagi o Wiedźminie', '1948-06-21', NULL, 'polska', 'https://example.com/authors/sapkowski.jpg'),
(2, 'J.K. Rowling', 'Brytyjska pisarka, autorka serii o Harrym Potterze', '1965-07-31', NULL, 'brytyjska', 'https://example.com/authors/rowling.jpg'),
(3, 'J.R.R. Tolkien', 'Brytyjski pisarz, filolog, profesor Uniwersytetu Oksfordzkiego', '1892-01-03', '1973-09-02', 'brytyjska', 'https://example.com/authors/tolkien.jpg'),
(4, 'Remigiusz Mróz', 'Polski pisarz, autor powieści sensacyjnych i kryminalnych', '1987-01-15', NULL, 'polska', 'https://example.com/authors/mroz.jpg'),
(5, 'Stephen King', 'Amerykański pisarz, autor horrorów i thrillerów', '1947-09-21', NULL, 'amerykańska', 'https://example.com/authors/king.jpg'),
(6, 'Olga Tokarczuk', 'Polska pisarka, eseistka, autorka scenariuszy, poetka', '1962-01-29', NULL, 'polska', 'https://example.com/authors/tokarczuk.jpg');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `ksiazka_autorzy`
--

CREATE TABLE `ksiazka_autorzy` (
  `ksiazka_id` int(11) NOT NULL,
  `autor_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ksiazka_autorzy`
--

INSERT INTO `ksiazka_autorzy` (`ksiazka_id`, `autor_id`) VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 2),
(5, 3),
(6, 5),
(7, 6),
(8, 4);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `ksiazki`
--

CREATE TABLE `ksiazki` (
  `id` int(11) NOT NULL,
  `tytul` varchar(500) NOT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `opis` text DEFAULT NULL,
  `url_okladki` varchar(500) DEFAULT NULL,
  `liczba_stron` int(11) DEFAULT NULL,
  `data_wydania` date DEFAULT NULL,
  `wydawnictwo_id` int(11) DEFAULT NULL,
  `seria_id` int(11) DEFAULT NULL,
  `numer_w_serii` int(11) DEFAULT NULL,
  `gatunek` varchar(100) DEFAULT NULL,
  `jezyk` varchar(50) DEFAULT 'polski'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ksiazki`
--

INSERT INTO `ksiazki` (`id`, `tytul`, `isbn`, `opis`, `url_okladki`, `liczba_stron`, `data_wydania`, `wydawnictwo_id`, `seria_id`, `numer_w_serii`, `gatunek`, `jezyk`) VALUES
(1, 'Ostatnie życzenie', '9788375780635', 'Pierwszy tom przygód Geralta z Rivii', 'https://example.com/covers/wiedzmin1.jpg', 288, '1993-01-01', 1, 1, 1, 'fantasy', 'polski'),
(2, 'Miecz przeznaczenia', '9788375780642', 'Drugi tom sagi o Wiedźminie', 'https://example.com/covers/wiedzmin2.jpg', 352, '1993-01-01', 1, 1, 2, 'fantasy', 'polski'),
(3, 'Harry Potter i Kamień Filozoficzny', '9788380084410', 'Pierwsza część serii o Harrym Potterze', 'https://example.com/covers/hp1.jpg', 328, '1997-06-26', 3, 2, 1, 'fantasy', 'polski'),
(4, 'Harry Potter i Komnata Tajemnic', '9788380084427', 'Druga część serii o Harrym Potterze', 'https://example.com/covers/hp2.jpg', 357, '1998-07-02', 3, 2, 2, 'fantasy', 'polski'),
(5, 'Drużyna Pierścienia', '9788324144689', 'Pierwszy tom trylogii Władca Pierścieni', 'https://example.com/covers/lotr1.jpg', 432, '1954-07-29', 2, 3, 1, 'fantasy', 'polski'),
(6, 'To', '9788373194737', 'Horror opowiadający o tajemniczym klaunie', 'https://example.com/covers/it.jpg', 1136, '1986-09-15', 4, NULL, NULL, 'horror', 'polski'),
(7, 'Księgi Jakubowe', '9788328700866', 'Epicka powieść historyczna', 'https://example.com/covers/ksiegi.jpg', 912, '2014-10-23', 1, NULL, NULL, 'powieść historyczna', 'polski'),
(8, 'Kasacja', '9788328707643', 'Pierwszy tom serii z Joanną Chyłką', 'https://example.com/covers/kasacja.jpg', 384, '2015-01-01', 4, NULL, NULL, 'kryminał', 'polski');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `ksiazki_na_polkach`
--

CREATE TABLE `ksiazki_na_polkach` (
  `polka_id` int(11) NOT NULL,
  `ksiazka_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ksiazki_na_polkach`
--

INSERT INTO `ksiazki_na_polkach` (`polka_id`, `ksiazka_id`) VALUES
(1, 1),
(1, 3),
(1, 7),
(2, 2),
(2, 4),
(2, 6),
(3, 8),
(4, 1),
(4, 2),
(4, 3),
(4, 4),
(4, 5);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `polki`
--

CREATE TABLE `polki` (
  `id` int(11) NOT NULL,
  `uzytkownik_id` int(11) DEFAULT NULL,
  `nazwa` varchar(100) NOT NULL,
  `opis` text DEFAULT NULL,
  `czy_publiczna` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `polki`
--

INSERT INTO `polki` (`id`, `uzytkownik_id`, `nazwa`, `opis`, `czy_publiczna`) VALUES
(1, 1, 'Ulubione', 'Moje ulubione książki', 1),
(2, 1, 'Do przeczytania', 'Książki, które planuję przeczytać', 0),
(3, 2, 'Kryminały', 'Moja kolekcja kryminałów', 1),
(4, 3, 'Fantasy', 'Książki fantasy', 1);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `postepy_czytania`
--

CREATE TABLE `postepy_czytania` (
  `uzytkownik_id` int(11) NOT NULL,
  `ksiazka_id` int(11) NOT NULL,
  `numer_strony` int(11) NOT NULL,
  `procent` decimal(5,2) DEFAULT NULL,
  `notatki` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `postepy_czytania`
--

INSERT INTO `postepy_czytania` (`uzytkownik_id`, `ksiazka_id`, `numer_strony`, `procent`, `notatki`) VALUES
(1, 7, 450, 49.34, 'Ciekawy wątek Jakuba Franka'),
(3, 2, 150, 42.61, 'Geralt spotyka Jaskra - świetny dialog');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `serie`
--

CREATE TABLE `serie` (
  `id` int(11) NOT NULL,
  `nazwa` varchar(255) NOT NULL,
  `opis` text DEFAULT NULL,
  `laczna_liczba_ksiazek` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `serie`
--

INSERT INTO `serie` (`id`, `nazwa`, `opis`, `laczna_liczba_ksiazek`) VALUES
(1, 'Wiedźmin', 'Seria fantasy opowiadająca o przygodach Geralta z Rivii', 8),
(2, 'Harry Potter', 'Seria o młody czarodzieju Harrym Potterze', 7),
(3, 'Władca Pierścieni', 'Epicka trylogia fantasy', 3),
(4, 'Millennium', 'Szwedzka seria kryminalna', 6);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `statusy_czytania`
--

CREATE TABLE `statusy_czytania` (
  `uzytkownik_id` int(11) NOT NULL,
  `ksiazka_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL CHECK (`status` in ('chce_przeczytac','aktualnie_czytam','przeczytana','wstrzymana','porzucona')),
  `aktualna_strona` int(11) DEFAULT 0,
  `data_rozpoczecia` date DEFAULT NULL,
  `data_zakonczenia` date DEFAULT NULL,
  `ocena` decimal(2,1) DEFAULT NULL CHECK (`ocena` >= 0 and `ocena` <= 5),
  `recenzja` text DEFAULT NULL,
  `czy_prywatna` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `statusy_czytania`
--

INSERT INTO `statusy_czytania` (`uzytkownik_id`, `ksiazka_id`, `status`, `aktualna_strona`, `data_rozpoczecia`, `data_zakonczenia`, `ocena`, `recenzja`, `czy_prywatna`) VALUES
(1, 1, 'przeczytana', 288, '2024-01-15', '2024-01-20', 5.0, 'Fantastyczna książka! Geralt to niesamowity bohater.', 0),
(1, 3, 'przeczytana', 328, '2024-02-01', '2024-02-05', 4.5, 'Doskonały początek serii, czyta się jednym tchem.', 0),
(1, 7, 'aktualnie_czytam', 450, '2024-03-10', NULL, NULL, NULL, 0),
(2, 6, 'chce_przeczytac', 0, NULL, NULL, NULL, NULL, 0),
(2, 8, 'przeczytana', 384, '2024-01-20', '2024-01-25', 4.0, 'Dobry kryminał, wciągająca fabuła.', 0),
(3, 1, 'przeczytana', 288, '2024-01-10', '2024-01-18', 5.0, 'Arcydzieło polskiej fantasy!', 0),
(3, 2, 'aktualnie_czytam', 150, '2024-03-01', NULL, NULL, NULL, 0),
(3, 5, 'chce_przeczytac', 0, NULL, NULL, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `uzytkownicy`
--

CREATE TABLE `uzytkownicy` (
  `id` int(11) NOT NULL,
  `nazwa_uzytkownika` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `hash_hasla` varchar(255) NOT NULL,
  `nazwa_wyswietlana` varchar(100) DEFAULT NULL,
  `url_avatara` varchar(500) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `cel_czytania` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `uzytkownicy`
--

INSERT INTO `uzytkownicy` (`id`, `nazwa_uzytkownika`, `email`, `hash_hasla`, `nazwa_wyswietlana`, `url_avatara`, `bio`, `cel_czytania`) VALUES
(1, 'anna_nowak', 'anna.nowak@email.com', '$2y$10$rQd6J7X8Y9Z0A1B2C3D4EeF5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U', 'Anna Nowak', 'https://example.com/avatars/anna.jpg', 'Miłośniczka literatury fantasy i science fiction', 52),
(2, 'jan_kowalski', 'jan.kowalski@email.com', '$2y$10$A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z', 'Jan Kowalski', 'https://example.com/avatars/jan.jpg', 'Czytam głównie kryminały i thrillery', 24),
(3, 'kasia_wisniewska', 'kasia.wisniewska@email.com', '$2y$10$Z1Y2X3W4V5U6T7S8R9Q0P1O2N3M4L5K6J7I8H9G0F1E2D3C4B5A', 'Kasia Wiśniewska', NULL, 'Studentka filologii polskiej', 100);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `wydawnictwa`
--

CREATE TABLE `wydawnictwa` (
  `id` int(11) NOT NULL,
  `nazwa` varchar(255) NOT NULL,
  `url_strony` varchar(500) DEFAULT NULL,
  `rok_zalozenia` int(11) DEFAULT NULL,
  `kraj` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wydawnictwa`
--

INSERT INTO `wydawnictwa` (`id`, `nazwa`, `url_strony`, `rok_zalozenia`, `kraj`) VALUES
(1, 'Wydawnictwo Literackie', 'https://www.wydawnictwoliterackie.pl', 1953, 'Polska'),
(2, 'Znak', 'https://www.znak.com.pl', 1959, 'Polska'),
(3, 'HarperCollins', 'https://www.harpercollins.com', 1817, 'USA'),
(4, 'Albatros', 'https://www.albatros.com.pl', 1990, 'Polska');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `wyzwania_czytelnicze`
--

CREATE TABLE `wyzwania_czytelnicze` (
  `id` int(11) NOT NULL,
  `uzytkownik_id` int(11) DEFAULT NULL,
  `rok` int(11) NOT NULL,
  `cel_ksiazek` int(11) NOT NULL,
  `cel_stron` int(11) DEFAULT NULL,
  `przeczytane_ksiazki` int(11) DEFAULT 0,
  `przeczytane_strony` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wyzwania_czytelnicze`
--

INSERT INTO `wyzwania_czytelnicze` (`id`, `uzytkownik_id`, `rok`, `cel_ksiazek`, `cel_stron`, `przeczytane_ksiazki`, `przeczytane_strony`) VALUES
(1, 1, 2024, 52, 15000, 8, 2450),
(2, 2, 2024, 24, 8000, 5, 1200),
(3, 3, 2024, 100, 30000, 15, 4800);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `zakladki`
--

CREATE TABLE `zakladki` (
  `id` int(11) NOT NULL,
  `uzytkownik_id` int(11) DEFAULT NULL,
  `ksiazka_id` int(11) DEFAULT NULL,
  `numer_strony` int(11) DEFAULT NULL,
  `notatka` text DEFAULT NULL,
  `tekst_cytatu` text DEFAULT NULL,
  `czy_publiczna` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `zakladki`
--

INSERT INTO `zakladki` (`id`, `uzytkownik_id`, `ksiazka_id`, `numer_strony`, `notatka`, `tekst_cytatu`, `czy_publiczna`) VALUES
(1, 1, 7, 123, 'Ważny fragment o historii', '„Evviva! Niech żyje wolność!”', 1),
(2, 1, 1, 45, 'Pierwsze spotkanie z Geraltem', '„Wiedźmin? Tu? Do diabła!”', 0),
(3, 3, 2, 89, 'Świetny opis walki', '„Miecz świsnął, przeciągając powietrze.”', 1);

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `autorzy`
--
ALTER TABLE `autorzy`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `ksiazka_autorzy`
--
ALTER TABLE `ksiazka_autorzy`
  ADD PRIMARY KEY (`ksiazka_id`,`autor_id`);

--
-- Indeksy dla tabeli `ksiazki`
--
ALTER TABLE `ksiazki`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `isbn` (`isbn`),
  ADD KEY `wydawnictwo_id` (`wydawnictwo_id`),
  ADD KEY `seria_id` (`seria_id`);

--
-- Indeksy dla tabeli `ksiazki_na_polkach`
--
ALTER TABLE `ksiazki_na_polkach`
  ADD PRIMARY KEY (`polka_id`,`ksiazka_id`);

--
-- Indeksy dla tabeli `polki`
--
ALTER TABLE `polki`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uzytkownik_id` (`uzytkownik_id`) USING BTREE;

--
-- Indeksy dla tabeli `postepy_czytania`
--
ALTER TABLE `postepy_czytania`
  ADD PRIMARY KEY (`uzytkownik_id`,`ksiazka_id`);

--
-- Indeksy dla tabeli `serie`
--
ALTER TABLE `serie`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `statusy_czytania`
--
ALTER TABLE `statusy_czytania`
  ADD PRIMARY KEY (`uzytkownik_id`,`ksiazka_id`);

--
-- Indeksy dla tabeli `uzytkownicy`
--
ALTER TABLE `uzytkownicy`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nazwa_uzytkownika` (`nazwa_uzytkownika`);

--
-- Indeksy dla tabeli `wydawnictwa`
--
ALTER TABLE `wydawnictwa`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `wyzwania_czytelnicze`
--
ALTER TABLE `wyzwania_czytelnicze`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uzytkownik_id` (`uzytkownik_id`) USING BTREE;

--
-- Indeksy dla tabeli `zakladki`
--
ALTER TABLE `zakladki`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uzytkownik_id` (`uzytkownik_id`),
  ADD KEY `ksiazka_id` (`ksiazka_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `autorzy`
--
ALTER TABLE `autorzy`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `ksiazki`
--
ALTER TABLE `ksiazki`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `polki`
--
ALTER TABLE `polki`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `serie`
--
ALTER TABLE `serie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `uzytkownicy`
--
ALTER TABLE `uzytkownicy`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `wydawnictwa`
--
ALTER TABLE `wydawnictwa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `wyzwania_czytelnicze`
--
ALTER TABLE `wyzwania_czytelnicze`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `zakladki`
--
ALTER TABLE `zakladki`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ksiazka_autorzy`
--
ALTER TABLE `ksiazka_autorzy`
  ADD CONSTRAINT `ksiazka_autorzy_ibfk_1` FOREIGN KEY (`ksiazka_id`) REFERENCES `ksiazki` (`id`),
  ADD CONSTRAINT `ksiazka_autorzy_ibfk_2` FOREIGN KEY (`autor_id`) REFERENCES `autorzy` (`id`);

--
-- Constraints for table `ksiazki`
--
ALTER TABLE `ksiazki`
  ADD CONSTRAINT `ksiazki_ibfk_1` FOREIGN KEY (`wydawnictwo_id`) REFERENCES `wydawnictwa` (`id`),
  ADD CONSTRAINT `ksiazki_ibfk_2` FOREIGN KEY (`seria_id`) REFERENCES `serie` (`id`);

--
-- Constraints for table `ksiazki_na_polkach`
--
ALTER TABLE `ksiazki_na_polkach`
  ADD CONSTRAINT `ksiazki_na_polkach_ibfk_1` FOREIGN KEY (`ksiazka_id`) REFERENCES `ksiazki` (`id`),
  ADD CONSTRAINT `ksiazki_na_polkach_ibfk_2` FOREIGN KEY (`polka_id`) REFERENCES `polki` (`id`);

--
-- Constraints for table `polki`
--
ALTER TABLE `polki`
  ADD CONSTRAINT `polki_ibfk_1` FOREIGN KEY (`uzytkownik_id`) REFERENCES `uzytkownicy` (`id`);

--
-- Constraints for table `postepy_czytania`
--
ALTER TABLE `postepy_czytania`
  ADD CONSTRAINT `postepy_czytania_ibfk_1` FOREIGN KEY (`uzytkownik_id`) REFERENCES `uzytkownicy` (`id`),
  ADD CONSTRAINT `postepy_czytania_ibfk_2` FOREIGN KEY (`ksiazka_id`) REFERENCES `ksiazki` (`id`);

--
-- Constraints for table `statusy_czytania`
--
ALTER TABLE `statusy_czytania`
  ADD CONSTRAINT `statusy_czytania_ibfk_1` FOREIGN KEY (`ksiazka_id`) REFERENCES `ksiazki` (`id`),
  ADD CONSTRAINT `statusy_czytania_ibfk_2` FOREIGN KEY (`uzytkownik_id`) REFERENCES `uzytkownicy` (`id`);

--
-- Constraints for table `wyzwania_czytelnicze`
--
ALTER TABLE `wyzwania_czytelnicze`
  ADD CONSTRAINT `wyzwania_czytelnicze_ibfk_1` FOREIGN KEY (`uzytkownik_id`) REFERENCES `uzytkownicy` (`id`);

--
-- Constraints for table `zakladki`
--
ALTER TABLE `zakladki`
  ADD CONSTRAINT `zakladki_ibfk_1` FOREIGN KEY (`ksiazka_id`) REFERENCES `ksiazki` (`id`),
  ADD CONSTRAINT `zakladki_ibfk_2` FOREIGN KEY (`uzytkownik_id`) REFERENCES `uzytkownicy` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
