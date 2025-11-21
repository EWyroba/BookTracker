import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { booksAPI } from '../../services/api';
import Icon from '../common/Icon';

const FormOverlay = styled.div`
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

const FormContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const FormTitle = styled.h2`
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Label = styled.label<{ $required?: boolean }>`
  color: ${props => props.theme.colors.text};
  font-weight: 500;

  &::after {
    content: ${props => props.$required ? '" *"' : '""'};
    color: ${props => props.theme.colors.error};
  }
`;

// Użycie:
<Label htmlFor="tytul" $required>Tytuł</Label>

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s ease;

  ${props => props.$variant === 'primary' ? `
    background: ${props.theme.colors.primary};
    color: white;
    
    &:hover:not(:disabled) {
      background: ${props.theme.colors.primaryDark};
    }
  ` : `
    background: ${props.theme.colors.surfaceLight};
    color: ${props.theme.colors.text};
    
    &:hover:not(:disabled) {
      background: ${props.theme.colors.border};
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.error}20;
  border: 1px solid ${props => props.theme.colors.error};
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  text-align: center;
`;

interface AddBookFormProps {
    onCancel: () => void;
    onSuccess: () => void;
}

const AddBookForm: React.FC<AddBookFormProps> = ({ onCancel, onSuccess }) => {
    const [formData, setFormData] = useState({
        tytul: '',
        autor: '',
        wydawnictwo: '',
        isbn: '',
        liczba_stron: '',
        opis: '',
        data_wydania: '',
        gatunek: '',
        url_okladki: '',
        jezyk: 'polski'
    });

    const [genres, setGenres] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Pobierz dostępne gatunki przy załadowaniu komponentu
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await booksAPI.get('/books/genres/available');
                setGenres(response.data.genres);
            } catch (error) {
                console.error('Błąd podczas pobierania gatunków:', error);
            }
        };

        fetchGenres();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Walidacja pól wymaganych
        if (!formData.tytul.trim()) {
            setError('Tytuł jest wymagany');
            return;
        }

        if (!formData.autor.trim()) {
            setError('Autor jest wymagany');
            return;
        }

        if (!formData.wydawnictwo.trim()) {
            setError('Wydawnictwo jest wymagane');
            return;
        }

        if (!formData.isbn.trim()) {
            setError('ISBN jest wymagany');
            return;
        }

        if (!formData.liczba_stron || parseInt(formData.liczba_stron) <= 0) {
            setError('Liczba stron jest wymagana i musi być większa niż 0');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await booksAPI.post('/books', {
                ...formData,
                liczba_stron: parseInt(formData.liczba_stron),
                data_wydania: formData.data_wydania || null
            });

            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas dodawania książki');
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormOverlay onClick={onCancel}>
            <FormContainer onClick={e => e.stopPropagation()}>
                <FormTitle>
                    <Icon name="FiPlus" />
                    Dodaj nową książkę
                </FormTitle>

                <Form onSubmit={handleSubmit}>
                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    <FormGroup>
                        <Label htmlFor="tytul" data-required>Tytuł</Label>
                        <Input
                            type="text"
                            id="tytul"
                            name="tytul"
                            value={formData.tytul}
                            onChange={handleChange}
                            placeholder="Wprowadź tytuł książki"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="autor" data-required>Autor</Label>
                        <Input
                            type="text"
                            id="autor"
                            name="autor"
                            value={formData.autor}
                            onChange={handleChange}
                            placeholder="Wprowadź autora"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="wydawnictwo" data-required>Wydawnictwo</Label>
                        <Input
                            type="text"
                            id="wydawnictwo"
                            name="wydawnictwo"
                            value={formData.wydawnictwo}
                            onChange={handleChange}
                            placeholder="Wprowadź nazwę wydawnictwa"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="isbn" data-required>ISBN</Label>
                        <Input
                            type="text"
                            id="isbn"
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleChange}
                            placeholder="Numer ISBN"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="liczba_stron" data-required>Liczba stron</Label>
                        <Input
                            type="number"
                            id="liczba_stron"
                            name="liczba_stron"
                            value={formData.liczba_stron}
                            onChange={handleChange}
                            placeholder="Ilość stron"
                            min="1"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="data_wydania">Data wydania</Label>
                        <Input
                            type="date"
                            id="data_wydania"
                            name="data_wydania"
                            value={formData.data_wydania}
                            onChange={handleChange}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="gatunek">Gatunek</Label>
                        <Select
                            id="gatunek"
                            name="gatunek"
                            value={formData.gatunek}
                            onChange={handleChange}
                        >
                            <option value="">Wybierz gatunek</option>
                            {genres.map(genre => (
                                <option key={genre} value={genre}>{genre}</option>
                            ))}
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="jezyk">Język</Label>
                        <Select
                            id="jezyk"
                            name="jezyk"
                            value={formData.jezyk}
                            onChange={handleChange}
                        >
                            <option value="polski">Polski</option>
                            <option value="angielski">Angielski</option>
                            <option value="niemiecki">Niemiecki</option>
                            <option value="francuski">Francuski</option>
                            <option value="hiszpański">Hiszpański</option>
                            <option value="włoski">Włoski</option>
                            <option value="inny">Inny</option>
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="opis">Opis</Label>
                        <TextArea
                            id="opis"
                            name="opis"
                            value={formData.opis}
                            onChange={handleChange}
                            placeholder="Opis książki"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="url_okladki">URL okładki</Label>
                        <Input
                            type="url"
                            id="url_okladki"
                            name="url_okladki"
                            value={formData.url_okladki}
                            onChange={handleChange}
                            placeholder="https://example.com/okladka.jpg"
                        />
                    </FormGroup>

                    <ButtonGroup>
                        <Button type="button" $variant="secondary" onClick={onCancel} disabled={loading}>
                            Anuluj
                        </Button>
                        <Button type="submit" $variant="primary" disabled={loading}>
                            {loading ? 'Dodawanie...' : 'Dodaj książkę'}
                        </Button>
                    </ButtonGroup>
                </Form>
            </FormContainer>
        </FormOverlay>
    );
};

export default AddBookForm;