import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api';
import Icon from '../common/Icon';
import EditBookForm from './EditBookForm';
import EditNoteForm from './EditNoteForm';

// ===== STYLED COMPONENTS =====
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

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
`;

const UserRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

const UserRatingLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const UserRatingValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.warning};
`;

const AverageRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

const AverageRatingLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const AverageRatingValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.success};
`;

const RatingCount = styled.span`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-left: ${props => props.theme.spacing.xs};
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

interface ActionButtonProps {
    variant?: 'primary' | 'secondary' | 'danger';
}

const ActionButton = styled.button<ActionButtonProps>`
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
    switch (props.variant) {
        case 'primary':
            return `
          background: ${props.theme.colors.primary};
          color: white;
          &:hover { 
            background: ${props.theme.colors.primaryDark}; 
            transform: translateY(-2px);
          }
        `;
        case 'danger':
            return `
          background: ${props.theme.colors.error};
          color: white;
          &:hover { 
            background: ${'#bd2130'}; 
            transform: translateY(-2px);
          }
        `;
        default:
            return `
          background: ${props.theme.colors.surfaceLight};
          color: ${props.theme.colors.text};
          border: 1px solid ${props.theme.colors.border};
          &:hover { 
            background: ${props.theme.colors.border}; 
            transform: translateY(-2px);
          }
        `;
    }
}}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const RatingStars = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  align-items: center;
  margin-top: ${props => props.theme.spacing.sm};
`;

interface StarButtonProps {
    active: boolean;
}

const StarButton = styled.button<StarButtonProps>`
  background: none;
  border: none;
  color: ${props => props.active ? props.theme.colors.warning : props.theme.colors.textMuted};
  cursor: pointer;
  font-size: 1.2rem;
  padding: ${props => props.theme.spacing.xs};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.warning};
    transform: scale(1.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  margin-bottom: ${props => props.theme.spacing.xl};
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

interface TabProps {
    active: boolean;
}

const Tab = styled.button<TabProps>`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: none;
  border: none;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  font-weight: ${props => props.active ? '600' : '400'};
  border-bottom: 2px solid ${props => props.active ? props.theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

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
  width: 120px;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
    transform: translateY(-2px);
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
  align-items: center;
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
  white-space: pre-line;
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
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

interface ProgressFillProps {
    progress: number;
}

const ProgressFill = styled.div<ProgressFillProps>`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  width: ${props => props.progress}%;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: ${props => props.theme.spacing.sm};
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
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary}40;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const NoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const NotePage = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  font-size: 0.9rem;
  background: ${props => props.theme.colors.primary}15;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 1px solid ${props => props.theme.colors.primary}30;
`;

const NoteDate = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const NoteActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const NoteText = styled.p`
  color: ${props => props.theme.colors.text};
  line-height: 1.5;
  margin-bottom: ${props => props.theme.spacing.sm};
  white-space: pre-line;
`;

const QuoteText = styled.blockquote`
  border-left: 3px solid ${props => props.theme.colors.primary};
  padding-left: ${props => props.theme.spacing.md};
  margin: ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.textSecondary};
  font-style: italic;
  background: ${props => props.theme.colors.surfaceLight}50;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.95rem;
`;

const NoteActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.error};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
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
  backdrop-filter: blur(2px);
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h2`
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.xl};
`;

const RatingsSection = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
`;

const RatingDistribution = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
`;

const RatingBar = styled.div`
  height: 20px;
  background: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: width 0.3s ease;
  min-width: 0;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const RatingLabel = styled.div`
  width: 50px;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  flex-shrink: 0;
`;

const RatingBarContainer = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  overflow: hidden;
  height: 20px;
  min-width: 0;
`;

const RatingCountText = styled.div`
  width: 40px;
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  text-align: right;
  flex-shrink: 0;
`;

// Form related styled components
const SimpleNoteFormContent = styled(ModalContent)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const RatingFormContent = styled(ModalContent)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  max-width: 500px;
  width: 90%;
`;

const FormTitle = styled(ModalTitle)`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const FormDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.lg};
  font-size: 0.95rem;
  
  strong {
    color: ${props => props.theme.colors.text};
  }
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: ${props => props.theme.spacing.xs};
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  font-size: 0.9rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.error}15;
  border: 1px solid ${props => props.theme.colors.error}40;
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  font-size: 0.9rem;
`;

const StarRatingContainer = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const StarRatingLabel = styled.div`
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.95rem;
`;

const StarsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

interface StarButtonStyledProps {
    active: boolean;
}

const StarButtonStyled = styled.button<StarButtonStyledProps>`
  background: none;
  border: none;
  font-size: 2rem;
  color: ${props => props.active ? props.theme.colors.warning : props.theme.colors.textMuted};
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.warning};
    transform: scale(1.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SelectedRatingText = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: ${props => props.theme.spacing.xs};
  
  strong {
    color: ${props => props.theme.colors.warning};
  }
`;

// Reviews section styled components
const ReviewsSection = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
`;

const ReviewCard = styled.div`
  background: ${props => props.theme.colors.surfaceLight};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.md};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary}40;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const ReviewUser = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primary};
  font-weight: bold;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const UserAvatarImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  font-size: 0.95rem;
`;

const ReviewDate = styled.span`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ReviewRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.warning};
  font-weight: 600;
  font-size: 0.95rem;
  flex-shrink: 0;
`;

const ReviewContent = styled.div`
  color: ${props => props.theme.colors.text};
  line-height: 1.6;
  margin-top: ${props => props.theme.spacing.md};
  font-size: 0.95rem;
  white-space: pre-line;
  
  p {
    margin: 0;
  }
`;

const NoReviewsText = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  padding: ${props => props.theme.spacing.xl} 0;
  font-style: italic;
  font-size: 0.95rem;
`;

const RatingInstructions = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: ${props => props.theme.spacing.xs};
  text-align: center;
`;

// ===== INTERFACES =====
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
    srednia_ocena?: string;
    liczba_ocen?: number;
    notatki?: any[];
    statystyki?: {
        liczba_notatek: number;
        ostatnia_strona_z_notatka: number;
    };
}

interface Rating {
    ocena: number;
    recenzja: string;
    updated_at: string;
    nazwa_wyswietlana: string;
    url_avatara: string;
}

interface RatingStats {
    srednia_ocena: string;
    liczba_ocen: number;
    distribution: {
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
    };
}

// ===== COMPONENTS =====

// SimpleNoteForm component
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

        const pageNumber = parseInt(formData.numer_strony);
        if (isNaN(pageNumber) || pageNumber <= 0) {
            setError('Podaj prawidłowy numer strony');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post(`/books/${bookId}/notes`, {
                ...formData,
                numer_strony: pageNumber
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
            <SimpleNoteFormContent onClick={e => e.stopPropagation()}>
                <FormTitle>
                    <Icon name="FiPlus" />
                    Dodaj notatkę
                </FormTitle>
                <FormDescription>
                    Książka: <strong>{bookTitle}</strong>
                </FormDescription>

                <form onSubmit={handleSubmit}>
                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    <FormGroup>
                        <FormLabel htmlFor="numer_strony">
                            Numer strony *
                        </FormLabel>
                        <FormInput
                            type="number"
                            id="numer_strony"
                            value={formData.numer_strony}
                            onChange={(e) => setFormData(prev => ({ ...prev, numer_strony: e.target.value }))}
                            placeholder="Na której stronie dodajesz notatkę?"
                            min="1"
                            required
                            disabled={loading}
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="tekst_cytatu">
                            Cytat (opcjonalnie)
                        </FormLabel>
                        <FormTextarea
                            id="tekst_cytatu"
                            value={formData.tekst_cytatu}
                            onChange={(e) => setFormData(prev => ({ ...prev, tekst_cytatu: e.target.value }))}
                            placeholder="Wklej interesujący cytat z książki..."
                            rows={3}
                            disabled={loading}
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="notatka">
                            Twoja notatka *
                        </FormLabel>
                        <FormTextarea
                            id="notatka"
                            value={formData.notatka}
                            onChange={(e) => setFormData(prev => ({ ...prev, notatka: e.target.value }))}
                            placeholder="Co myślisz o tej części książki? Co Cię zainteresowało?"
                            rows={4}
                            required
                            disabled={loading}
                        />
                    </FormGroup>

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
                            variant="primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Icon name="FiLoader" />
                                    Dodawanie...
                                </>
                            ) : (
                                'Dodaj notatkę'
                            )}
                        </ActionButton>
                    </ModalActions>
                </form>
            </SimpleNoteFormContent>
        </ModalOverlay>
    );
};

// RatingForm component
const RatingForm: React.FC<{
    bookId: string;
    currentRating: number | null;
    onCancel: () => void;
    onSuccess: () => void;
}> = ({ bookId, currentRating, onCancel, onSuccess }) => {
    const [rating, setRating] = useState<number | null>(currentRating);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!rating) {
            setError('Wybierz ocenę od 1 do 5 gwiazdek');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post(`/books/${bookId}/rating`, {
                ocena: rating,
                recenzja: review.trim()
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas zapisywania oceny');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalOverlay onClick={onCancel}>
            <RatingFormContent onClick={e => e.stopPropagation()}>
                <FormTitle>
                    <Icon name="FiStar" />
                    Oceń książkę
                </FormTitle>

                <form onSubmit={handleSubmit}>
                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    <StarRatingContainer>
                        <StarRatingLabel>Twoja ocena:</StarRatingLabel>
                        <StarsContainer>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarButtonStyled
                                    key={star}
                                    type="button"
                                    active={(hoverRating || rating || 0) >= star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(null)}
                                    disabled={loading}
                                    title={`${star} ${star === 1 ? 'gwiazdka' : 'gwiazdki'}`}
                                >
                                    <Icon name="FiStar" />
                                </StarButtonStyled>
                            ))}
                        </StarsContainer>
                        <SelectedRatingText>
                            {rating ? (
                                <>
                                    Wybrana ocena: <strong>{rating}/5</strong>
                                </>
                            ) : (
                                'Wybierz ocenę klikając na gwiazdkę'
                            )}
                        </SelectedRatingText>
                    </StarRatingContainer>

                    <FormGroup>
                        <FormLabel htmlFor="review">
                            Recenzja (opcjonalnie)
                        </FormLabel>
                        <FormTextarea
                            id="review"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Napisz swoją opinię o książce... Co Ci się podobało, a co nie? Jaki masz ogólny odbiór?"
                            rows={4}
                            disabled={loading}
                        />
                        <RatingInstructions>
                            Twoja recenzja będzie widoczna dla innych użytkowników
                        </RatingInstructions>
                    </FormGroup>

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
                            variant="primary"
                            disabled={loading || !rating}
                        >
                            {loading ? (
                                <>
                                    <Icon name="FiLoader" />
                                    Zapisywanie...
                                </>
                            ) : (
                                'Zapisz ocenę'
                            )}
                        </ActionButton>
                    </ModalActions>
                </form>
            </RatingFormContent>
        </ModalOverlay>
    );
};

// Main BookDetailsPage component
const BookDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<BookDetails | null>(null);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [ratingStats, setRatingStats] = useState<RatingStats>({
        srednia_ocena: '0.0',
        liczba_ocen: 0,
        distribution: {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('description');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showAddNoteForm, setShowAddNoteForm] = useState(false);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [editingNote, setEditingNote] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deletingNote, setDeletingNote] = useState<string | null>(null);
    const [ratingBook, setRatingBook] = useState(false);
    const [quickRating, setQuickRating] = useState<number | null>(null);
    const [hoverQuickRating, setHoverQuickRating] = useState<number | null>(null);

    const fetchBookDetails = async () => {
        try {
            const response = await api.get(`/books/${id}`);
            setBook(response.data.book);
            setQuickRating(response.data.book?.ocena || null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas ładowania książki');
        } finally {
            setLoading(false);
        }
    };

    const fetchRatings = async () => {
        try {
            const response = await api.get(`/books/${id}/ratings`);
            setRatings(response.data.ratings);
            setRatingStats(response.data.stats);
        } catch (err) {
            console.error('Error fetching ratings:', err);
        }
    };

    useEffect(() => {
        if (id) {
            fetchBookDetails();
            fetchRatings();
        }
    }, [id]);

    const handleUpdateRating = async (newRating: number) => {
        setRatingBook(true);
        try {
            await api.post(`/books/${id}/rating`, {
                ocena: newRating,
                recenzja: book?.recenzja || ''
            });
            setQuickRating(newRating);
            fetchBookDetails();
            fetchRatings();
        } catch (err: any) {
            console.error('Error updating rating:', err);
            alert('Wystąpił błąd podczas aktualizacji oceny');
        } finally {
            setRatingBook(false);
        }
    };

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
                                padding: '0.75rem 1.5rem',
                                background: 'var(--primary, #00b4db)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                display: 'inline-block',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
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
                                padding: '0.75rem 1.5rem',
                                background: 'var(--primary, #00b4db)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                display: 'inline-block',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
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

                        <RatingSection>
                            {book.ocena ? (
                                <UserRating>
                                    <UserRatingLabel>Twoja ocena:</UserRatingLabel>
                                    <UserRatingValue>
                                        <Icon name="FiStar" />
                                        <span>{book.ocena}/5</span>
                                    </UserRatingValue>
                                </UserRating>
                            ) : (
                                <UserRating>
                                    <UserRatingLabel>Twoja ocena:</UserRatingLabel>
                                    <UserRatingValue style={{ color: 'var(--text-secondary, #666)' }}>
                                        <Icon name="FiStar" />
                                        <span>Nie ocenione</span>
                                    </UserRatingValue>
                                </UserRating>
                            )}

                            {(book.srednia_ocena && parseFloat(book.srednia_ocena) > 0) && (
                                <AverageRating>
                                    <AverageRatingLabel>Średnia ocen:</AverageRatingLabel>
                                    <AverageRatingValue>
                                        <Icon name="FiTrendingUp" />
                                        <span>{book.srednia_ocena}/5</span>
                                        <RatingCount>({book.liczba_ocen || 0} ocen)</RatingCount>
                                    </AverageRatingValue>
                                </AverageRating>
                            )}

                            {book.status === 'przeczytana' && (
                                <ActionButton
                                    onClick={() => setShowRatingForm(true)}
                                    style={{ alignSelf: 'center' }}
                                >
                                    <Icon name="FiStar" />
                                    {book.ocena ? 'Zmień ocenę' : 'Oceń książkę'}
                                </ActionButton>
                            )}
                        </RatingSection>

                        {book.status === 'przeczytana' && !book.ocena && (
                            <div style={{
                                marginBottom: '1rem',
                                padding: '1rem',
                                background: 'var(--surface-light, #f5f5f5)',
                                borderRadius: '8px',
                                border: '1px solid var(--border, #ddd)'
                            }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #666)', marginBottom: '0.5rem' }}>
                                    <Icon name="FiStar"/>
                                    Oceń książkę:
                                </div>
                                <RatingStars>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <StarButton
                                            key={star}
                                            active={(hoverQuickRating || quickRating || 0) >= star}
                                            onClick={() => handleUpdateRating(star)}
                                            onMouseEnter={() => setHoverQuickRating(star)}
                                            onMouseLeave={() => setHoverQuickRating(null)}
                                            disabled={ratingBook}
                                            title={`Oceń na ${star} ${star === 1 ? 'gwiazdkę' : 'gwiazdki'}`}
                                        >
                                            <Icon name="FiStar" />
                                        </StarButton>
                                    ))}
                                </RatingStars>
                                {ratingBook && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #666)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Icon name="FiLoader" size={12}/>
                                        Zapisuję ocenę...
                                    </div>
                                )}
                            </div>
                        )}

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
                                    <ProgressFill progress={safeProgress} />
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <label htmlFor="currentPage" style={{ color: 'var(--text-secondary, #666)', fontSize: '0.9rem' }}>
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
                                        <span style={{ color: 'var(--text-secondary, #666)', fontSize: '0.9rem' }}>
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
                                    <span style={{ color: 'var(--text-secondary, #666)', fontSize: '0.8rem' }}>Szybkie ustawienia:</span>
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
                                        <ProgressFill progress={safeProgress} />
                                    </ProgressBar>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--text-secondary, #666)',
                                        textAlign: 'center',
                                        marginTop: '0.25rem'
                                    }}>
                                        Kliknij na pasek aby ustawić postęp
                                    </div>
                                </div>

                                {book.status === 'przeczytana' && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border, #ddd)' }}>
                                        <ActionButton
                                            onClick={async () => {
                                                await handleStatusChange('aktualnie_czytam', safeCurrentPage);
                                            }}
                                            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                                        >
                                            <Icon name="FiRotateCcw" />
                                            Wznów czytanie
                                        </ActionButton>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #666)', marginTop: '0.5rem' }}>
                                            Kliknij aby zmienić status z "przeczytana" na "w trakcie czytania"
                                        </div>
                                    </div>
                                )}
                            </PageUpdateForm>
                        )}

                        <Actions>
                            <ActionButton
                                variant="primary"
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
                                variant="primary"
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
                                variant="danger"
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
                        active={activeTab === 'description'}
                        onClick={() => setActiveTab('description')}
                    >
                        Opis
                    </Tab>
                    <Tab
                        active={activeTab === 'ratings'}
                        onClick={() => setActiveTab('ratings')}
                    >
                        Oceny ({book.liczba_ocen || 0})
                    </Tab>
                    <Tab
                        active={activeTab === 'notes'}
                        onClick={() => setActiveTab('notes')}
                    >
                        Notatki ({safeStats.liczba_notatek})
                    </Tab>
                    <Tab
                        active={activeTab === 'details'}
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

                    {activeTab === 'ratings' && (
                        <RatingsSection>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2rem',
                                marginBottom: '2rem',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                                    <div style={{
                                        fontSize: '3rem',
                                        fontWeight: 'bold',
                                        color: 'var(--text, #212529)',
                                        lineHeight: 1
                                    }}>
                                        {ratingStats.srednia_ocena}
                                    </div>
                                    <div style={{
                                        fontSize: '1rem',
                                        color: 'var(--text-secondary, #666)',
                                        marginTop: '0.5rem'
                                    }}>
                                        średnia z {ratingStats.liczba_ocen} ocen
                                    </div>
                                </div>

                                <div style={{ flex: 1, minWidth: '300px' }}>
                                    <RatingDistribution>
                                        {([5, 4, 3, 2, 1] as const).map((star) => {
                                            const count = ratingStats.distribution[star] || 0;
                                            const percentage = ratingStats.liczba_ocen > 0 ? (count / ratingStats.liczba_ocen) * 100 : 0;

                                            return (
                                                <RatingRow key={star}>
                                                    <RatingLabel>
                                                        {star} <Icon name="FiStar" size={12} />
                                                    </RatingLabel>
                                                    <RatingBarContainer>
                                                        <RatingBar style={{ width: `${percentage}%` }} />
                                                    </RatingBarContainer>
                                                    <RatingCountText>
                                                        {count}
                                                    </RatingCountText>
                                                </RatingRow>
                                            );
                                        })}
                                    </RatingDistribution>
                                </div>
                            </div>

                            {ratings.length === 0 ? (
                                <NoReviewsText>
                                    Ta książka nie ma jeszcze żadnych ocen. Bądź pierwszy!
                                </NoReviewsText>
                            ) : (
                                <ReviewsSection>
                                    <h3 style={{
                                        marginBottom: '1.5rem',
                                        color: 'var(--text, #212529)',
                                        fontSize: '1.5rem',
                                        fontWeight: '600'
                                    }}>
                                        Recenzje użytkowników
                                    </h3>
                                    <div>
                                        {ratings.map((rating, index) => (
                                            <ReviewCard key={`${rating.nazwa_wyswietlana}-${rating.updated_at}-${index}`}>
                                                <ReviewHeader>
                                                    <ReviewUser>
                                                        {rating.url_avatara ? (
                                                            <UserAvatarImage
                                                                src={rating.url_avatara}
                                                                alt={rating.nazwa_wyswietlana}
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : null}
                                                        {!rating.url_avatara && (
                                                            <UserAvatar>
                                                                {rating.nazwa_wyswietlana.charAt(0).toUpperCase()}
                                                            </UserAvatar>
                                                        )}
                                                        <UserInfo>
                                                            <UserName>{rating.nazwa_wyswietlana}</UserName>
                                                            <ReviewDate>
                                                                {new Date(rating.updated_at).toLocaleDateString('pl-PL', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </ReviewDate>
                                                        </UserInfo>
                                                    </ReviewUser>
                                                    <ReviewRating>
                                                        {[...Array(5)].map((_, i) => (
                                                            <Icon
                                                                key={i}
                                                                name="FiStar"
                                                                size={16}
                                                                color={i < rating.ocena ? 'var(--warning, #ffc107)' : 'var(--text-muted, #adb5bd)'}
                                                            />
                                                        ))}
                                                        <span style={{ marginLeft: '4px' }}>{rating.ocena}/5</span>
                                                    </ReviewRating>
                                                </ReviewHeader>
                                                {rating.recenzja && (
                                                    <ReviewContent>
                                                        <p>{rating.recenzja}</p>
                                                    </ReviewContent>
                                                )}
                                            </ReviewCard>
                                        ))}
                                    </div>
                                </ReviewsSection>
                            )}
                        </RatingsSection>
                    )}

                    {activeTab === 'notes' && (
                        <NotesSection>
                            {safeNotes.length === 0 ? (
                                <NoReviewsText>
                                    Nie masz jeszcze notatek do tej książki. Dodaj pierwszą notatkę!
                                </NoReviewsText>
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
                                    background: 'var(--surface-light, #f5f5f5)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginTop: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    border: '1px solid var(--border, #ddd)'
                                }}>
                                    <Icon name="FiStar" color="var(--warning, #ffc107)" />
                                    <span style={{ fontWeight: '600', color: 'var(--text, #212529)' }}>
                    Twoja ocena: {book.ocena}/5
                  </span>
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
                        <p style={{
                            color: 'var(--text-secondary, #666)',
                            lineHeight: '1.5',
                            marginBottom: '1.5rem'
                        }}>
                            Czy na pewno chcesz usunąć książkę "<strong style={{ color: 'var(--text, #212529)' }}>{book.tytul}</strong>" ze swojej biblioteki?
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
                                variant="danger"
                                onClick={handleDeleteBook}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <Icon name="FiLoader" />
                                        Usuwanie...
                                    </>
                                ) : (
                                    'Usuń książkę'
                                )}
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

            {showRatingForm && book && (
                <RatingForm
                    bookId={book.id}
                    currentRating={book.ocena || null}
                    onCancel={() => setShowRatingForm(false)}
                    onSuccess={() => {
                        setShowRatingForm(false);
                        fetchBookDetails();
                        fetchRatings();
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