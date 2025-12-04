-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 03, 2025 at 11:34 PM
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
                                                                                                                            (6, 'Olga Tokarczuk', 'Polska pisarka, eseistka, autorka scenariuszy, poetka', '1962-01-29', NULL, 'polska', 'https://example.com/authors/tokarczuk.jpg'),
                                                                                                                            (7, 'Joanna Tekieli', NULL, NULL, NULL, NULL, NULL),
                                                                                                                            (8, 'Aleksandra Negrońska', NULL, NULL, NULL, NULL, NULL),
                                                                                                                            (17, 'Patrick Homa', NULL, NULL, NULL, NULL, NULL),
                                                                                                                            (18, 'Borys Zajączkowski', NULL, NULL, NULL, NULL, NULL),
                                                                                                                            (19, 'Artur Justyński', NULL, NULL, NULL, NULL, NULL);

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
                                                             (8, 4),
                                                             (9, 3),
                                                             (10, 7),
                                                             (11, 8),
                                                             (20, 17),
                                                             (21, 18),
                                                             (22, 19),
                                                             (23, 1);

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
                           `jezyk` varchar(50) DEFAULT 'polski',
                           `google_books_id` varchar(100) DEFAULT NULL,
                           `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
                           `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ksiazki`
--

INSERT INTO `ksiazki` (`id`, `tytul`, `isbn`, `opis`, `url_okladki`, `liczba_stron`, `data_wydania`, `wydawnictwo_id`, `seria_id`, `numer_w_serii`, `gatunek`, `jezyk`, `google_books_id`, `created_at`, `updated_at`) VALUES
                                                                                                                                                                                                                           (1, 'Ostatnie życzenie', '9788375780635', 'Pierwszy tom przygód Geralta z Rivii', 'https://s.lubimyczytac.pl/upload/books/240000/240310/1313778-170x243.jpg', 288, '1993-01-01', 1, 1, 1, 'fantasy', 'polski', NULL, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                                           (2, 'Miecz przeznaczenia', '9788375780642', 'Drugi tom sagi o Wiedźminie', 'https://s.lubimyczytac.pl/upload/books/240000/240312/1313877-352x500.jpg', 352, '1993-01-01', 1, 1, 2, 'fantasy', 'polski', NULL, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                                           (3, 'Harry Potter i Kamień Filozoficzny', '9788380084410', 'Pierwsza część serii o Harrym Potterze', 'https://s.lubimyczytac.pl/upload/books/5201000/5201943/1313324-352x500.jpg', 328, '1997-06-26', 3, 2, 1, 'fantasy', 'polski', NULL, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                                           (4, 'Harry Potter i Komnata Tajemnic', '9788380084427', 'Druga część serii o Harrym Potterze', 'https://s.lubimyczytac.pl/upload/books/5186000/5186478/1265570-352x500.jpg', 357, '1998-07-02', 3, 2, 2, 'fantasy', 'polski', NULL, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                                           (5, 'Drużyna Pierścienia', '9788324144689', 'Pierwszy tom trylogii Władca Pierścieni', 'https://s.lubimyczytac.pl/upload/books/159000/159957/352x500.jpg', 432, '1954-07-29', 2, 3, 1, 'fantasy', 'polski', NULL, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                                           (6, 'To', '9788373194737', 'orośli uznają miejscowość Derry za swojskie i porządne miasto, idealne do wychowywania dzieci. Ale to dzieci widzą – i czują – co tak strrrasznie różni Derry od innych miejsc. Tylko one potrafią dostrzec \"TO\", ukryte w kanałach, przybierające najróżniejsze postacie, prosto z dziecięcych koszmarów. \"TO\" zna ich największe lęki, ale tylko dzieci mogą stanąć do walki z potworem. Po zaginięciu George’a Denbrough dzieci decydują się zmierzyć z TO. Będzie to ich pierwsze, ale nie ostatnie starcie z TO, które, ukryte w zakamarkach pamięci, zamieni dawne dziecięce koszmary w przerażającą rzeczywistość dorosłych… Czy odważycie się sięgnąć po TO?', 'https://s.lubimyczytac.pl/upload/books/5076000/5076344/1102999-352x500.jpg', 1136, '1986-09-15', 4, NULL, NULL, 'horror', 'polski', NULL, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                                           (7, 'Księgi Jakubowe', '9788328700866', 'Epicka powieść historyczna', 'https://s.lubimyczytac.pl/upload/books/5120000/5120708/1163760-352x500.jpg', 912, '2014-10-23', 1, NULL, NULL, 'powieść historyczna', 'polski', NULL, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                                           (8, 'Kasacja', '9788328707643', 'Pierwszy tom serii z Joanną Chyłką', 'https://s.lubimyczytac.pl/upload/books/245000/245373/414083-352x500.jpg', 384, '2015-01-01', 4, NULL, NULL, 'kryminał', 'polski', NULL, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                                           (9, 'Hobbit, czyli tam i z powrotem', '9788324411641', 'Arcydzieło literatury fantasy. Baśniowy, przemyślany w najdrobniejszych szczegółach fantastyczny świat oraz barwne postaci i ich wspaniałe przygody. Bohaterem jest tytułowy hobbit, „istota większa od liliputa, mniejsza jednak od krasnala”, pełen życzliwości dla świata, dobroci, nieskory do męstwa, a przecież odważny, poczciwy, a przecież sprytny.\r\nAutor szuka w swej powieści odpowiedzi na podstawowe pytania o źródła dobra i zła. To także wstęp i zaproszenie do najgłośniejszego dzieła Tolkiena Władcy Pierścieni.', 'https://s.lubimyczytac.pl/upload/books/5121000/5121473/1164463-352x500.jpg', 310, NULL, 5, NULL, NULL, 'fantasy', 'polski', NULL, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                                           (10, 'Tam, gdzie rodzi się magia', '9788384027141', 'W pięknym hotelu, w starym domu, w górskim schronisku czy małym mieszkaniu – Boże Narodzenie zawsze może być pełne wzruszeń i radości, jeśli tylko są obok bliskie osoby, bo to my tworzymy tę słynną, świąteczną magię.\n\nBoże Narodzenie w wiosce Zapomna nie zapowiada się spokojnie. Wręcz przeciwnie: już od końca listopada synoptycy przewidują nadejście śnieżycy stulecia i radzą mieszkańcom regionu dobrze się przygotować. Na dodatek Daniel i Iga mają zupełnie różne wizje spędzenia tego wyjątkowego czasu.\n\nW Dębowym Uroczysku także daleko do spokoju, bo Eryk, zajmujący się na co dzień i od święta kuchnią w domu na polanie, musi niespodziewanie wyjechać i całe świąteczne przygotowania spadną na Alinę i Przemka, których antytalent kulinarny osiągnął poziom mistrzowski.\n\nZa to w pensjonacie Leśna Ostoja szykuje się wielki bal i świąteczny jarmark, na którym zamierza pojawić się wyjątkowy gość.', 'https://bigimg.taniaksiazka.pl/images/popups/2BE/9788384027141.jpg', 392, NULL, NULL, NULL, NULL, 'obyczajowy', 'polski', NULL, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                                           (11, 'Clone', '9788383202402', 'Dziewiętnastoletnia Rosanna Denise przeprowadza się ze Stanów Zjednoczonych do Wielkiej Brytanii, gdzie rozpoczyna studia prawnicze na uniwersytecie w Leeds. Jednak zmiana miejsca zamieszkania to niejedyny wielki krok dla Rosanny. Teraz zamieszka ze swoją siostrą bliźniaczką, której nie widziała od ośmiu lat, i przybranym bratem Alexandrem White’em.\n\nPonieważ rodzeństwo Rosanny jest bardzo popularne na kampusie, dziewczyna, chcąc nie chcąc, trafia do środowiska ich znajomych. Okazuje się – iż mimo że są to w większości ludzie zupełnie nie z jej bajki, pragnący być zawsze w centrum uwagi i z lekkością wydający pieniądze zarobione przez wpływowych rodziców – zaczyna darzyć ich sympatią.\n\nZ wyjątkiem jednej osoby: Zaydena Williamsa, który także studiuje prawo. Chłopak jest bezczelny i arogancki, więc Rosanna natychmiast nabiera wobec niego dystansu. Nie ukrywa, jakie ma o nim zdanie, a on nie pozostaje jej dłużny. Pierwszy raz ktoś tak otwarcie mówi mu, co o nim myśli. Zayden zdecydowanie nie jest do tego przyzwyczajony.\n\nMimo ciągłego napięcia pojawia się między nimi coś jeszcze – bardzo silne przyciąganie. Problem w tym, że Zayden ma dziewczynę, a w dodatku jest nią siostra bliźniaczka Rosanny.', 'https://s.lubimyczytac.pl/upload/books/5034000/5034548/1031532-352x500.jpg', 576, '2022-12-21', 6, NULL, NULL, 'Obyczajowa', 'polski', NULL, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                                           (20, 'Wiedźmin 3: Serca z Kamienia', '5042736778', 'Wiedźmin 3: Serca z Kamienia to pierwszy obszerny dodatek do gry Wiedźmin 3: Dziki Gon. Niniejszy poradnik przygotowany został z myślą o weteranach podstawowej wersji gry, mimo to zawiera szczegółowy opis zadań głównych i pobocznych. Znajdziesz w nim informacje o kolejnych celach zadań, ilości przec', 'http://books.google.com/books/publisher/content?id=WSUREAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE71kXYsZ4MllyokLoQSyO0JjbGre8K5er9JbvcBftZ7RUKDmpoxfb-XOwxmW9aGbLMhy3nq_MyGaPa5QobwYiiRTptrwUP3ki-vHNqhdeR_wKeaDyXLql1xCD5Jawv6DvISinZrY&source=gbs_api', 142, NULL, NULL, NULL, NULL, 'Computers / Reference', 'pl', NULL, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                                           (21, 'Wiedźmin', '9785042737015', 'Szczegółowy opis przejścia, dokładne mapy, wyszczególnione zadania poboczne, lista recept alchemicznych. Poradnik jest na bieżąco aktualizowany oraz dodawane są do niego kolejne części. Wiedźmin – poradnik do gry zawiera poszukiwane przez graczy tematy i lokacje jak m.in. *** Wybory i ich konsekwencje Zadania główne (1) (Rozdział 1) Zadania poboczne (1) (Rozdział 1) SPIS ZADAŃ M5: Obrzeża Wyzimy (Mapa) Zadania poboczne (2) (Rozdział 3) *** Zestaw porad ogólnych Zadania główne (2) (Rozdział 1) Za', 'http://books.google.com/books/publisher/content?id=nyUREAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE72rC2dPUZ6loxW7Kqj-xuiQeydL65k1Q8qyUmXJhTCM7XKN8ndce-aXDRMl19UEc7t3RW8x9ffYIJNRm7OA07O80yMXY8D9b6ABs_HNyIV0CGs2zhcPKAy4Yl6ZwKxHuWd3y7dE&source=gbs_api', 283, '2020-08-04', NULL, NULL, NULL, 'Computers / Reference', 'pl', NULL, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                                           (22, 'Wiedźmin 2: Zabójcy Królów', '9785042736520', 'Poradnik do gry Wiedźmin 2: Zabójcy Królów zawiera bogato ilustrowana solucja wszystkich dostępnych w grze zadań fabularnych jak i pobocznych. Każde z zadań składa się z opisu podzielonego na kolejne kroki z uwzględnieniem możliwych wariantów przejścia. Wiedźmin 2: Zabójcy Królów – poradnik, opis przejścia, questy zawiera poszukiwane przez graczy tematy i lokacje jak m.in. Koszmar Baltimore\'a (Akt 2 – Iorweth – zadania poboczne) Zlecenie na harpie (Akt 2 – Iorweth – zadania poboczne) Kłopoty z t', 'http://books.google.com/books/publisher/content?id=NSUREAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE719Z6gc4mzmzx_Af-7fJ8ap65ZrFGV1UGyKvk0HJLQwryqBq-I8wNmUrpuhHH8Xp4N37RIzqT5c59FcuxfLw1kwPaOThdp8Utx9issOWh3WTd0f5-IXU8WYCkQPdfBYbcaNNZCj&source=gbs_api', 426, '2020-08-04', NULL, NULL, NULL, 'Computers / Reference', 'pl', NULL, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
(23, 'Czas pogardy', '9788370540913', 'Podsumowanie z innego polskiego wydania: \"Swiat Ciri i wiedzmina ogarniaja plomienie. Nastal zapowiadany przez Ithlinne czas miecza i topora. Czas pogardy. A w czasach pogardy na powierzchnie wypelzaja Szczury. Szczury atakujace po szczurzemu, cicho, zdradziecko i okrutnie. Szczury uwielbiajace dobra zabawe i zabijanie. To maruderzy z rozbitych armii, zablakane dzieciaki, zgwalcone dziewczyny, wiesniacy, ktorych obejscia spalono, a rodziny wymordowano. Wyrzutki, dziwna zbieranina stworzona przez', 'http://books.google.com/books/content?id=N2AYAQAAIAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE71-KiZ38BNVwWADbb54hNSft5Tu40qTs2u5wBsRBpFQmlI9DZD_6XChZTK4U3y-pEkSTXtZH0xnC7inwqnPlC35TmyYorzbWuK-Zgsw9UoiveGITOFcSVb5ebpqLoefPD-1SLcv&source=gbs_api', 318, '0000-00-00', NULL, NULL, NULL, 'Inne', 'pl', NULL, '2025-12-03 22:27:14', '2025-12-03 22:27:14');

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
                                    `czy_prywatna` tinyint(1) DEFAULT 0,
                                    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
                                    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `statusy_czytania`
--

INSERT INTO `statusy_czytania` (`uzytkownik_id`, `ksiazka_id`, `status`, `aktualna_strona`, `data_rozpoczecia`, `data_zakonczenia`, `ocena`, `recenzja`, `czy_prywatna`, `created_at`, `updated_at`) VALUES
                                                                                                                                                                                                         (1, 1, 'przeczytana', 288, '2024-01-15', '2024-01-20', 5.0, 'Fantastyczna książka! Geralt to niesamowity bohater.', 0, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                         (1, 3, 'przeczytana', 328, '2024-02-01', '2024-02-05', 4.5, 'Doskonały początek serii, czyta się jednym tchem.', 0, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                         (1, 7, 'aktualnie_czytam', 450, '2024-03-10', NULL, NULL, NULL, 0, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                         (2, 6, 'chce_przeczytac', 0, NULL, NULL, NULL, NULL, 0, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                         (2, 8, 'przeczytana', 384, '2024-01-20', '2024-01-25', 4.0, 'Dobry kryminał, wciągająca fabuła.', 0, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                         (3, 1, 'przeczytana', 288, '2024-01-10', '2024-01-18', 5.0, 'Arcydzieło polskiej fantasy!', 0, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                         (3, 2, 'aktualnie_czytam', 150, '2024-03-01', NULL, NULL, NULL, 0, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                         (3, 5, 'chce_przeczytac', 0, NULL, NULL, NULL, NULL, 1, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                         (4, 7, 'przeczytana', 912, '2025-12-03', '2025-12-03', NULL, NULL, 0, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                         (4, 8, 'chce_przeczytac', 192, '2025-11-14', NULL, NULL, NULL, 0, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                         (4, 9, 'aktualnie_czytam', 0, '2025-11-17', NULL, NULL, NULL, 0, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                         (4, 10, 'chce_przeczytac', 98, '2025-12-03', NULL, NULL, NULL, 0, '2025-12-03 22:27:14', '2025-12-03 22:27:14'),
                                                                                                                                                                                                         (4, 11, 'aktualnie_czytam', 288, '2025-12-03', NULL, NULL, NULL, 0, '2025-12-03 22:27:14', '2025-12-03 22:27:14');

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
                               `cel_czytania` int(11) DEFAULT 0,
                               `data_rejestracji` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `uzytkownicy`
--

INSERT INTO `uzytkownicy` (`id`, `nazwa_uzytkownika`, `email`, `hash_hasla`, `nazwa_wyswietlana`, `url_avatara`, `bio`, `cel_czytania`, `data_rejestracji`) VALUES
                                                                                                                                                                (1, 'anna_nowak', 'anna.nowak@email.com', '$2y$10$rQd6J7X8Y9Z0A1B2C3D4EeF5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U', 'Anna Nowak', 'https://example.com/avatars/anna.jpg', 'Miłośniczka literatury fantasy i science fiction', 52, '2025-12-03 17:27:55'),
                                                                                                                                                                (2, 'jan_kowalski', 'jan.kowalski@email.com', '$2y$10$A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z', 'Jan Kowalski', 'https://example.com/avatars/jan.jpg', 'Czytam głównie kryminały i thrillery', 24, '2025-12-03 17:27:55'),
                                                                                                                                                                (3, 'kasia_wisniewska', 'kasia.wisniewska@email.com', '$2y$10$Z1Y2X3W4V5U6T7S8R9Q0P1O2N3M4L5K6J7I8H9G0F1E2D3C4B5A', 'Kasia Wiśniewska', NULL, 'Studentka filologii polskiej', 100, '2025-12-03 17:27:55'),
                                                                                                                                                                (4, 'evelosik', 'npotrzebne99@gmail.com', '$2b$12$kuL4iBBZWkWqooe1xN2j0uGtJ9PfIIa6l4UTT6P4DqEFiVrVbw8Pi', 'Ewelinka', 'https://malowanieponumerach.com/wp-content/uploads/2022/09/slodki-kotek.jpg', 'Jestem Książkoholikiem', 0, '2025-12-03 17:27:55'),
                                                                                                                                                                (5, 'Ew', 'test@example.com', '$2a$12$l8h.BfTprBFkRqsp5kOn8uvwIL.dt43fz0MQCbQDSPF/bF6FUattO', 'ew', NULL, NULL, 0, '2025-12-03 17:27:55'),
                                                                                                                                                                (7, 'ewi', 'ewelina.wyroba11@gmail.com', '$2a$12$FRmORLgAWvka2M2s3hCptOnNHi80h1Ce20cdQIJtYp4Iy9Q4CourG', 'ew', NULL, NULL, 0, '2025-12-03 21:40:39');

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
                                                                                     (4, 'Albatros', 'https://www.albatros.com.pl', 1990, 'Polska'),
                                                                                     (5, 'Iskry', NULL, NULL, NULL),
                                                                                     (6, 'NieZwykłe', NULL, NULL, NULL);

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
                            `czy_publiczna` tinyint(1) DEFAULT 0,
                            `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `zakladki`
--

INSERT INTO `zakladki` (`id`, `uzytkownik_id`, `ksiazka_id`, `numer_strony`, `notatka`, `tekst_cytatu`, `czy_publiczna`, `created_at`) VALUES
                                                                                                                                           (1, 1, 7, 123, 'Ważny fragment o historii', '„Evviva! Niech żyje wolność!”', 1, '2025-11-14 18:39:46'),
                                                                                                                                           (2, 1, 1, 45, 'Pierwsze spotkanie z Geraltem', '„Wiedźmin? Tu? Do diabła!”', 0, '2025-11-14 18:39:46'),
                                                                                                                                           (3, 3, 2, 89, 'Świetny opis walki', '„Miecz świsnął, przeciągając powietrze.”', 1, '2025-11-14 18:39:46'),
                                                                                                                                           (4, 4, 10, 102, 'Suuuperrrr', '', 0, '2025-11-14 18:39:46'),
                                                                                                                                           (6, 4, 10, 123, 'abcd', 'defafca', 1, '2025-11-14 18:39:46'),
                                                                                                                                           (8, 4, 11, 56, 'qwertyuikjbvcxdfghkijhb', 'asdfghjkl;', 0, '2025-11-24 08:59:53');

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
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `ksiazki`
--
ALTER TABLE `ksiazki`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

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
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `wydawnictwa`
--
ALTER TABLE `wydawnictwa`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `wyzwania_czytelnicze`
--
ALTER TABLE `wyzwania_czytelnicze`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `zakladki`
--
ALTER TABLE `zakladki`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
