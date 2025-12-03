
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api';
import Icon from '../common/Icon';
import EditBookForm from './EditBookForm';
import EditNoteForm from './EditNoteForm';

const BookDetailsContainer = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xxl};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const BookCover = styled.img`
  width: 300px;
  height: 450px;
  object-fit: cover;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.surfaceLight};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    width: 100%;
    max-width: 300px;
    height: 400px;
  }
`;

const BookInfo = styled.div`
  flex: 1;
`;

const BookTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text};
`;

const BookAuthors = styled.div`
  font-size: 1.2rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const BookMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const MetaItem = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

const MetaLabel = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xs};
  text-transform: uppercase;
  font-weight: 600;
`;

const MetaValue = styled.div`
  font-size: 1.1rem;
  color: ${props => props.theme.colors.text};
  font-weight: 600;
`;

const Actions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: ${props.theme.colors.primary};
          color: white;
          &:hover { background: ${props.theme.colors.primaryDark}; }
        `;
      case 'danger':
        return `
          background: ${props.theme.colors.error};
          color: white;
          &:hover { background: #d32f2f; }
        `;
      default:
        return `
          background: ${props.theme.colors.surfaceLight};
          color: ${props.theme.colors.text};
          border: 1px solid ${props.theme.colors.border};
          &:hover { background: ${props.theme.colors.border}; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: none;
  border: none;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  font-weight: ${props => props.$active ? '600' : '400'};
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const TabContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
`;

const PageUpdateForm = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const PageUpdateTitle = styled.h3`
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const PageUpdateFormGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

const PageInput = styled.input`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  width: 100px;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const PageUpdateButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const QuickPages = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
`;

const QuickPageButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.surfaceLight};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  color: ${props => props.theme.colors.text};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Description = styled.p`
  line-height: 1.6;
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
`;

const ReadingProgress = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ProgressBar = styled.div`
  height: 8px;
  background: ${props => props.theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  width: ${props => props.$progress}%;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const NotesSection = styled.div``;

const NotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const NoteCard = styled.div`
  background: ${props => props.theme.colors.surfaceLight};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  position: relative;
`;

const NoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const NotePage = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
`;

const NoteDate = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-right: ${props => props.theme.spacing.xl};
`;

const NoteActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const NoteText = styled.p`
  color: ${props => props.theme.colors.text};
  line-height: 1.5;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const QuoteText = styled.blockquote`
  border-left: 3px solid ${props => props.theme.colors.primary};
  padding-left: ${props => props.theme.spacing.md};
  margin: ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.textSecondary};
  font-style: italic;
`;

const NoteActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.border};
  }

  &:hover:first-child {
    color: ${props => props.theme.colors.primary};
  }

  &:hover:last-child {
    color: ${props => props.theme.colors.error};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.error};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.xl};
`;

interface BookDetails {
    id: string;
    tytul: string;
    autorzy?: string[];
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
    notatki?: any[];
    statystyki?: {
        liczba_notatek: number;
        ostatnia_strona_z_notatka: number;
    };
}

const SimpleNoteForm: React.FC<{
    bookId: string;
    bookTitle: string;
    onCancel: () => void;
    onSuccess: () => void;
}> = ({ bookId, bookTitle, onCancel, onSuccess }) => {
    const [formData, setFormData] = useState({
        numer_strony: '',
        notatka: '',
        tekst_cytatu: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.numer_strony || !formData.notatka.trim()) {
            setError('Numer strony i notatka są wymagane');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post(`/books/${bookId}/notes`, {
                ...formData,
                numer_strony: parseInt(formData.numer_strony)
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas dodawania notatki');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalOverlay onClick={onCancel}>
            <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <ModalTitle>
                    <Icon name="FiPlus" />
                    Dodaj notatkę
                </ModalTitle>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                    Książka: <strong>{bookTitle}</strong>
                </p>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            background: '#f8d7da',
                            border: '1px solid #f5c6cb',
                            color: '#721c24',
                            padding: '0.75rem',
                            borderRadius: '0.375rem',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Numer strony *
                        </label>
                        <input
                            type="number"
                            value={formData.numer_strony}
                            onChange={(e) => setFormData(prev => ({ ...prev, numer_strony: e.target.value }))}
                            placeholder="Na której stronie dodajesz notatkę?"
                            min="1"
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '0.375rem',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Cytat (opcjonalnie)
                        </label>
                        <textarea
                            value={formData.tekst_cytatu}
                            onChange={(e) => setFormData(prev => ({ ...prev, tekst_cytatu: e.target.value }))}
                            placeholder="Wklej interesujący cytat z książki..."
                            rows={3}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '0.375rem',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Twoja notatka *
                        </label>
                        <textarea
                            value={formData.notatka}
                            onChange={(e) => setFormData(prev => ({ ...prev, notatka: e.target.value }))}
                            placeholder="Co myślisz o tej części książki? Co Cię zainteresowało?"
                            rows={4}
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '0.375rem',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <ModalActions>
                        <ActionButton
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Anuluj
                        </ActionButton>
                        <ActionButton
                            type="submit"
                            $variant="primary"
                            disabled={loading}
                        >
                            {loading ? 'Dodawanie...' : 'Dodaj notatkę'}
                        </ActionButton>
                    </ModalActions>
                </form>
            </ModalContent>
        </ModalOverlay>
    );
};

const BookDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<BookDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('description');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showAddNoteForm, setShowAddNoteForm] = useState(false);
    const [editingNote, setEditingNote] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deletingNote, setDeletingNote] = useState<string | null>(null);

    const fetchBookDetails = async () => {
        try {
            const response = await api.get(`/books/${id}`);
            setBook(response.data.book);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas ładowania książki');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchBookDetails();
        }
    }, [id]);

    const handleDeleteBook = async () => {
        setDeleting(true);
        try {
            await api.delete(`/books/${id}`);
            navigate('/books');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Wystąpił błąd podczas usuwania książki');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        setDeletingNote(noteId);
        try {
            await api.delete(`/books/notes/${noteId}`);
            fetchBookDetails();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Wystąpił błąd podczas usuwania notatki');
        } finally {
            setDeletingNote(null);
        }
    };

    const handleStatusChange = async (newStatus: string, pageNumber?: number) => {
        try {
            const pageToUpdate = pageNumber !== undefined ? pageNumber : book?.aktualna_strona || 0;
            await api.post(`/books/${id}/status`, {
                status: newStatus,
                aktualna_strona: pageToUpdate
            });
            fetchBookDetails();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Wystąpił błąd podczas aktualizacji statusu');
        }
    };

    const safeAuthors = book?.autorzy || [];
    const safeNotes = book?.notatki || [];
    const safeStats = book?.statystyki || { liczba_notatek: 0, ostatnia_strona_z_notatka: 0 };
    const safeDescription = book?.opis || 'Brak opisu dla tej książki.';
    const safePageCount = book?.liczba_stron || 0;
    const safeCurrentPage = book?.aktualna_strona || 0;
    const safeProgress = book?.postep || 0;

    if (loading) {
        return (
            <BookDetailsContainer>
                <div className="container">
                    <LoadingState>
                        <Icon name="FiLoader" size={48} />
                        <div style={{ marginTop: '1rem' }}>Ładowanie szczegółów książki...</div>
                    </LoadingState>
                </div>
            </BookDetailsContainer>
        );
    }

    if (error) {
        return (
            <BookDetailsContainer>
                <div className="container">
                    <ErrorState>
                        <Icon name="FiAlertTriangle" size={48} />
                        <div style={{ marginTop: '1rem' }}>{error}</div>
                        <Link
                            to="/books"
                            style={{
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                background: '#00b4db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            ← Powrót do biblioteki
                        </Link>
                    </ErrorState>
                </div>
            </BookDetailsContainer>
        );
    }

    if (!book) {
        return (
            <BookDetailsContainer>
                <div className="container">
                    <ErrorState>
                        <Icon name="FiBook" size={48} />
                        <div style={{ marginTop: '1rem' }}>Książka nie znaleziona</div>
                        <Link
                            to="/books"
                            style={{
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                background: '#00b4db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            ← Powrót do biblioteki
                        </Link>
                    </ErrorState>
                </div>
            </BookDetailsContainer>
        );
    }

    return (
        <BookDetailsContainer>
            <div className="container">
                <Header>
                    <BookCover
                        src={book.url_okladki || 'https://via.placeholder.com/300x450/1a1a1a/666666?text=Brak+okładki'}
                        alt={book.tytul}
                        onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/300x450/1a1a1a/666666?text=Brak+okładki';
                        }}
                    />

                    <BookInfo>
                        <BookTitle>{book.tytul}</BookTitle>
                        <BookAuthors>
                            {safeAuthors.length > 0
                                ? safeAuthors.join(', ')
                                : 'Autor nieznany'
                            }
                        </BookAuthors>

                        <BookMeta>
                            <MetaItem>
                                <MetaLabel>Strony</MetaLabel>
                                <MetaValue>{safePageCount || 'Nieznana'}</MetaValue>
                            </MetaItem>

                            <MetaItem>
                                <MetaLabel>Gatunek</MetaLabel>
                                <MetaValue>{book.gatunek || 'Nieokreślony'}</MetaValue>
                            </MetaItem>

                            <MetaItem>
                                <MetaLabel>Data wydania</MetaLabel>
                                <MetaValue>
                                    {book.data_wydania
                                        ? new Date(book.data_wydania).toLocaleDateString('pl-PL')
                                        : 'Nieznana'
                                    }
                                </MetaValue>
                            </MetaItem>

                            <MetaItem>
                                <MetaLabel>Wydawnictwo</MetaLabel>
                                <MetaValue>{book.wydawnictwo || 'Nieznane'}</MetaValue>
                            </MetaItem>

                            <MetaItem>
                                <MetaLabel>Status</MetaLabel>
                                <MetaValue>
                                    {book.status === 'przeczytana' && 'Przeczytana'}
                                    {book.status === 'aktualnie_czytam' && 'W trakcie czytania'}
                                    {book.status === 'chce_przeczytac' && 'Chcę przeczytać'}
                                    {!book.status && 'Nie rozpoczęta'}
                                </MetaValue>
                            </MetaItem>
                        </BookMeta>

                        {book.status === 'aktualnie_czytam' && safePageCount > 0 && (
                            <ReadingProgress>
                                <ProgressText>
                                    <span>Postęp czytania</span>
                                    <span>{safeCurrentPage} / {safePageCount} stron</span>
                                </ProgressText>
                                <ProgressBar>
                                    <ProgressFill $progress={safeProgress} />
                                </ProgressBar>
                            </ReadingProgress>
                        )}
                        {(book.status === 'aktualnie_czytam' || book.status === 'przeczytana') && safePageCount > 0 && (
                            <PageUpdateForm>
                                <PageUpdateTitle>
                                    <Icon name="FiBookOpen" />
                                    {book.status === 'przeczytana' ? 'Książka przeczytana - możesz zmienić postęp' : 'Aktualizuj postęp czytania'}
                                </PageUpdateTitle>

                                <PageUpdateFormGroup>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <label htmlFor="currentPage" style={{ color: '#666', fontSize: '0.9rem' }}>
                                            Aktualna strona:
                                        </label>
                                        <PageInput
                                            type="number"
                                            id="currentPage"
                                            min="0"
                                            max={safePageCount}
                                            value={safeCurrentPage}
                                            onChange={(e) => {
                                                let newPage = parseInt(e.target.value) || 0;
                                                if (newPage > safePageCount) newPage = safePageCount;
                                                if (newPage < 0) newPage = 0;
                                                setBook(prev => prev ? { ...prev, aktualna_strona: newPage } : null);
                                            }}
                                            onBlur={() => {
                                                if (safeCurrentPage !== book?.aktualna_strona) {
                                                    handleStatusChange(book?.status || 'aktualnie_czytam', safeCurrentPage);
                                                }
                                            }}
                                        />
                                        <span style={{ color: '#666', fontSize: '0.9rem' }}>
                                            / {safePageCount}
                                        </span>
                                    </div>

                                    <PageUpdateButton
                                        onClick={async () => {
                                            const newPage = safeCurrentPage;
                                            await handleStatusChange(book?.status || 'aktualnie_czytam', newPage);
                                        }}
                                    >
                                        {book.status === 'przeczytana' ? 'Zaktualizuj stronę' : 'Zapisz stronę'}
                                    </PageUpdateButton>
                                </PageUpdateFormGroup>

                                <QuickPages>
                                    <span style={{ color: '#666', fontSize: '0.8rem' }}>Szybkie ustawienia:</span>
                                    {[25, 50, 75, 100].map(percent => {
                                        const page = Math.floor((percent / 100) * safePageCount);
                                        return (
                                            <QuickPageButton
                                                key={percent}
                                                onClick={async () => {
                                                    const page = Math.floor((percent / 100) * safePageCount);
                                                    await handleStatusChange(book?.status || 'aktualnie_czytam', page);
                                                }}
                                            >
                                                {percent}% ({page} str.)
                                            </QuickPageButton>
                                        );
                                    })}
                                </QuickPages>

                                <div style={{ marginTop: '1rem' }}>
                                    <ProgressBar
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const clickX = e.clientX - rect.left;
                                            const percentage = (clickX / rect.width) * 100;
                                            const newPage = Math.floor((percentage / 100) * safePageCount);

                                            if (newPage >= 0 && newPage <= safePageCount) {
                                                handleStatusChange(book?.status || 'aktualnie_czytam', newPage);
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <ProgressFill $progress={safeProgress} />
                                    </ProgressBar>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: '#666',
                                        textAlign: 'center',
                                        marginTop: '0.25rem'
                                    }}>
                                        Kliknij na pasek aby ustawić postęp
                                    </div>
                                </div>

                                {book.status === 'przeczytana' && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333' }}>
                                        <ActionButton
                                            onClick={async () => {
                                                await handleStatusChange('aktualnie_czytam', safeCurrentPage);
                                            }}
                                            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                                        >
                                            <Icon name="FiRotateCcw" />
                                            Wznów czytanie
                                        </ActionButton>
                                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                                            Kliknij aby zmienić status z "przeczytana" na "w trakcie czytania"
                                        </div>
                                    </div>
                                )}
                            </PageUpdateForm>
                        )}

                        <Actions>
                            <ActionButton
                                $variant="primary"
                                onClick={() => handleStatusChange('aktualnie_czytam')}
                                disabled={book.status === 'aktualnie_czytam'}
                            >
                                <Icon name="FiBookOpen" />
                                Czytam
                            </ActionButton>

                            <ActionButton
                                onClick={() => handleStatusChange('przeczytana')}
                                disabled={book.status === 'przeczytana'}
                            >
                                <Icon name="FiBook" />
                                Przeczytana
                            </ActionButton>

                            <ActionButton
                                onClick={() => setShowAddNoteForm(true)}
                                $variant="primary"
                            >
                                <Icon name="FiPlus" />
                                Dodaj notatkę
                            </ActionButton>

                            <ActionButton
                                onClick={() => setShowEditForm(true)}
                            >
                                <Icon name="FiEdit" />
                                Edytuj
                            </ActionButton>

                            <ActionButton
                                onClick={() => setShowDeleteModal(true)}
                                $variant="danger"
                            >
                                <Icon name="FiTrash2" />
                                Usuń z biblioteki
                            </ActionButton>

                            <Link
                                to="/books"
                                style={{ textDecoration: 'none' }}
                            >
                                <ActionButton>
                                    <Icon name="FiArrowLeft" />
                                    Powrót
                                </ActionButton>
                            </Link>
                        </Actions>
                    </BookInfo>
                </Header>

                <Tabs>
                    <Tab
                        $active={activeTab === 'description'}
                        onClick={() => setActiveTab('description')}
                    >
                        Opis
                    </Tab>
                    <Tab
                        $active={activeTab === 'notes'}
                        onClick={() => setActiveTab('notes')}
                    >
                        Notatki ({safeStats.liczba_notatek})
                    </Tab>
                    <Tab
                        $active={activeTab === 'details'}
                        onClick={() => setActiveTab('details')}
                    >
                        Szczegóły
                    </Tab>
                </Tabs>

                <TabContent>
                    {activeTab === 'description' && (
                        <Description>
                            {safeDescription}
                        </Description>
                    )}

                    {activeTab === 'notes' && (
                        <NotesSection>
                            {safeNotes.length === 0 ? (
                                <p style={{ color: '#666', textAlign: 'center' }}>
                                    Nie masz jeszcze notatek do tej książki.
                                </p>
                            ) : (
                                <NotesList>
                                    {safeNotes.map((note) => (
                                        <NoteCard key={note.id}>
                                            <NoteHeader>
                                                <NotePage>Strona {note.numer_strony}</NotePage>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <NoteDate>
                                                        {note.created_at ? new Date(note.created_at).toLocaleDateString('pl-PL') : 'Brak daty'}
                                                    </NoteDate>
                                                    <NoteActions>
                                                        <NoteActionButton
                                                            onClick={() => setEditingNote(note.id)}
                                                            disabled={deletingNote === note.id}
                                                            title="Edytuj notatkę"
                                                        >
                                                            <Icon name="FiEdit" size={16} />
                                                        </NoteActionButton>
                                                        <NoteActionButton
                                                            onClick={() => handleDeleteNote(note.id)}
                                                            disabled={deletingNote === note.id}
                                                            title="Usuń notatkę"
                                                        >
                                                            <Icon name="FiTrash2" size={16} />
                                                        </NoteActionButton>
                                                    </NoteActions>
                                                </div>
                                            </NoteHeader>
                                            {note.tekst_cytatu && (
                                                <QuoteText>"{note.tekst_cytatu}"</QuoteText>
                                            )}
                                            <NoteText>{note.notatka}</NoteText>
                                        </NoteCard>
                                    ))}
                                </NotesList>
                            )}
                        </NotesSection>
                    )}

                    {activeTab === 'details' && (
                        <div>
                            <BookMeta>
                                <MetaItem>
                                    <MetaLabel>ISBN</MetaLabel>
                                    <MetaValue>{book.isbn || 'Brak'}</MetaValue>
                                </MetaItem>

                                <MetaItem>
                                    <MetaLabel>Język</MetaLabel>
                                    <MetaValue>{book.jezyk || 'Nieznany'}</MetaValue>
                                </MetaItem>

                                <MetaItem>
                                    <MetaLabel>Wydawnictwo</MetaLabel>
                                    <MetaValue>{book.wydawnictwo || 'Nieznane'}</MetaValue>
                                </MetaItem>

                                <MetaItem>
                                    <MetaLabel>Data rozpoczęcia</MetaLabel>
                                    <MetaValue>
                                        {book.data_rozpoczecia
                                            ? new Date(book.data_rozpoczecia).toLocaleDateString('pl-PL')
                                            : 'Nie rozpoczęto'
                                        }
                                    </MetaValue>
                                </MetaItem>

                                <MetaItem>
                                    <MetaLabel>Data zakończenia</MetaLabel>
                                    <MetaValue>
                                        {book.data_zakonczenia
                                            ? new Date(book.data_zakonczenia).toLocaleDateString('pl-PL')
                                            : 'Nie ukończono'
                                        }
                                    </MetaValue>
                                </MetaItem>
                            </BookMeta>

                            {book.ocena && (
                                <div style={{
                                    background: '#1a1a1a',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginTop: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <Icon name="FiStar" color="#ffd700" />
                                    <span style={{ fontWeight: '600' }}>Twoja ocena: {book.ocena}/5</span>
                                </div>
                            )}
                        </div>
                    )}
                </TabContent>
            </div>

            {showDeleteModal && (
                <ModalOverlay onClick={() => setShowDeleteModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalTitle>Usunięcie książki</ModalTitle>
                        <p style={{ color: '#666', lineHeight: '1.5' }}>
                            Czy na pewno chcesz usunąć książkę "<strong>{book.tytul}</strong>" ze swojej biblioteki?
                            Twoje notatki i postępy czytania zostaną utracone.
                        </p>

                        <ModalActions>
                            <ActionButton
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleting}
                            >
                                Anuluj
                            </ActionButton>

                            <ActionButton
                                $variant="danger"
                                onClick={handleDeleteBook}
                                disabled={deleting}
                            >
                                {deleting ? 'Usuwanie...' : 'Usuń książkę'}
                            </ActionButton>
                        </ModalActions>
                    </ModalContent>
                </ModalOverlay>
            )}

            {showEditForm && book && (
                <EditBookForm
                    book={book}
                    onCancel={() => setShowEditForm(false)}
                    onSuccess={() => {
                        setShowEditForm(false);
                        fetchBookDetails();
                    }}
                />
            )}

            {showAddNoteForm && book && (
                <SimpleNoteForm
                    bookId={book.id}
                    bookTitle={book.tytul}
                    onCancel={() => setShowAddNoteForm(false)}
                    onSuccess={() => {
                        setShowAddNoteForm(false);
                        fetchBookDetails();
                    }}
                />
            )}

            {editingNote && book && (
                <EditNoteForm
                    noteId={editingNote}
                    bookTitle={book.tytul}
                    onCancel={() => setEditingNote(null)}
                    onSuccess={() => {
                        setEditingNote(null);
                        fetchBookDetails();
                    }}
                />
            )}
        </BookDetailsContainer>
    );
};

export default BookDetailsPage;