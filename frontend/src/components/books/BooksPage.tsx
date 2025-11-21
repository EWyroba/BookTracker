import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { booksAPI } from '../../services/api';
import BookCard from './BookCard';
import AddBookForm from './AddBookForm';
import { Book } from '../../types';

const BooksContainer = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const AddButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-2px);
  }
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};

  h3 {
    margin-bottom: ${props => props.theme.spacing.md};
    color: ${props => props.theme.colors.text};
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const BooksPage: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchBooks = async () => {
        try {
            const response = await booksAPI.get('/books');
            setBooks(response.data.books);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleBookAdded = () => {
        setShowAddForm(false);
        fetchBooks();
    };

    if (loading) {
        return (
            <BooksContainer>
                <div className="container">
                    <LoadingState>Ładowanie książek...</LoadingState>
                </div>
            </BooksContainer>
        );
    }

    return (
        <BooksContainer>
            <div className="container">
                <PageHeader>
                    <PageTitle>Moje Książki</PageTitle>
                    <AddButton onClick={() => setShowAddForm(true)}>
                        + Dodaj książkę
                    </AddButton>
                </PageHeader>

                {showAddForm && (
                    <AddBookForm
                        onCancel={() => setShowAddForm(false)}
                        onSuccess={handleBookAdded}
                    />
                )}

                {books.length === 0 ? (
                    <EmptyState>
                        <h3>Brak książek w bibliotece</h3>
                        <p>Dodaj swoją pierwszą książkę aby rozpocząć!</p>
                    </EmptyState>
                ) : (
                    <BooksGrid>
                        {books.map(book => (
                            <BookCard
                                key={book.id}
                                book={book}
                                onStatusChange={fetchBooks}
                            />
                        ))}
                    </BooksGrid>
                )}
            </div>
        </BooksContainer>
    );
};

export default BooksPage;