import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../services/api';
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

const Label = styled.label`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
`;

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

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};

  ${props => props.$variant === 'primary' ? `
    background: ${props.theme.colors.primary};
    color: white;
    
    &:hover:not(:disabled) {
      background: ${props.theme.colors.primaryDark};
    }
  ` : props.$variant === 'danger' ? `
    background: ${props.theme.colors.error};
    color: white;
    
    &:hover:not(:disabled) {
      background: #d32f2f;
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

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textSecondary};
`;

interface EditNoteFormProps {
    noteId: string;
    bookTitle: string;
    onCancel: () => void;
    onSuccess: () => void;
}

const EditNoteForm: React.FC<EditNoteFormProps> = ({ noteId, bookTitle, onCancel, onSuccess }) => {
    const [formData, setFormData] = useState({
        numer_strony: '',
        notatka: '',
        tekst_cytatu: '',
        czy_publiczna: false
    });
    const [loading, setLoading] = useState(false);
    const [loadingNote, setLoadingNote] = useState(true);
    const [error, setError] = useState('');

    // Załaduj dane notatki
    useEffect(() => {
        const fetchNote = async () => {
            try {
                const response = await api.get(`/books/notes/single/${noteId}`);
                const note = response.data.note;

                setFormData({
                    numer_strony: note.numer_strony?.toString() || '',
                    notatka: note.notatka || '',
                    tekst_cytatu: note.tekst_cytatu || '',
                    czy_publiczna: note.czy_publiczna || false
                });
            } catch (err: any) {
                console.error('Error fetching note:', err);
                setError('Nie udało się załadować notatki');
            } finally {
                setLoadingNote(false);
            }
        };

        fetchNote();
    }, [noteId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.numer_strony || !formData.notatka.trim()) {
            setError('Numer strony i notatka są wymagane');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.put(`/books/notes/${noteId}`, {
                ...formData,
                numer_strony: parseInt(formData.numer_strony)
            });

            onSuccess();
        } catch (err: any) {
            console.error('Error updating note:', err);
            setError(err.response?.data?.message || 'Wystąpił błąd podczas aktualizacji notatki');
        } finally {
            setLoading(false);
        }
    };

    if (loadingNote) {
        return (
            <FormOverlay onClick={onCancel}>
                <FormContainer onClick={e => e.stopPropagation()}>
                    <LoadingMessage>
                        <Icon name="FiLoader" size={24} />
                        <div style={{ marginTop: '1rem' }}>Ładowanie notatki...</div>
                    </LoadingMessage>
                </FormContainer>
            </FormOverlay>
        );
    }

    return (
        <FormOverlay onClick={onCancel}>
            <FormContainer onClick={e => e.stopPropagation()}>
                <FormTitle>
                    <Icon name="FiEdit" />
                    Edytuj notatkę
                </FormTitle>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                    Książka: <strong>{bookTitle}</strong>
                </p>

                <Form onSubmit={handleSubmit}>
                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    <FormGroup>
                        <Label htmlFor="numer_strony">Numer strony *</Label>
                        <Input
                            type="number"
                            id="numer_strony"
                            name="numer_strony"
                            value={formData.numer_strony}
                            onChange={handleChange}
                            placeholder="Na której stronie dodajesz notatkę?"
                            min="1"
                            required
                            disabled={loading}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="tekst_cytatu">Cytat (opcjonalnie)</Label>
                        <TextArea
                            id="tekst_cytatu"
                            name="tekst_cytatu"
                            value={formData.tekst_cytatu}
                            onChange={handleChange}
                            placeholder="Wklej interesujący cytat z książki..."
                            rows={3}
                            disabled={loading}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="notatka">Twoja notatka *</Label>
                        <TextArea
                            id="notatka"
                            name="notatka"
                            value={formData.notatka}
                            onChange={handleChange}
                            placeholder="Co myślisz o tej części książki? Co Cię zainteresowało?"
                            rows={4}
                            required
                            disabled={loading}
                        />
                    </FormGroup>

                    <CheckboxGroup>
                        <Checkbox
                            type="checkbox"
                            id="czy_publiczna"
                            name="czy_publiczna"
                            checked={formData.czy_publiczna}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <Label htmlFor="czy_publiczna">
                            Publiczna notatka (będzie widoczna dla innych użytkowników)
                        </Label>
                    </CheckboxGroup>

                    <ButtonGroup>
                        <Button
                            type="button"
                            $variant="secondary"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Anuluj
                        </Button>
                        <Button
                            type="submit"
                            $variant="primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Icon name="FiLoader" />
                                    Zapisywanie...
                                </>
                            ) : (
                                <>
                                    <Icon name="FiSave" />
                                    Zapisz zmiany
                                </>
                            )}
                        </Button>
                    </ButtonGroup>
                </Form>
            </FormContainer>
        </FormOverlay>
    );
};

export default EditNoteForm;