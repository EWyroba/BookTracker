import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import Icon, { IconName } from './Icon';

interface NavLinkProps {
    $isActive: boolean;
}

// Usuń interfejs DropdownMenuProps, ponieważ nie będzie już potrzebny

const HeaderContainer = styled.header`
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md} 0;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  text-decoration: none;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    gap: ${props => props.theme.spacing.lg};
  }
`;

const NavLink = styled(Link)<NavLinkProps>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.textSecondary};
  font-weight: ${props => props.$isActive ? '600' : '400'};
  transition: color 0.2s ease;
  text-decoration: none;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const UserMenu = styled.div`
  position: relative;

  /* Rozwijanie menu po hover */
  &:hover > div {
    display: block;
  }
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  background: none;
  color: ${props => props.theme.colors.text};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: background-color 0.2s ease;
  border: none;
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.surfaceLight};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm};
  min-width: 200px;
  display: none; /* Domyślnie ukryte */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1001; /* Wyżej niż header */
`;

const DropdownItem = styled.button`
  width: 100%;
  text-align: left;
  background: none;
  color: ${props => props.theme.colors.text};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  transition: background-color 0.2s ease;
  border: none;
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.surfaceLight};
  }
`;

const Header: React.FC = () => {
    const { user, logout, loading } = useAuth();
    const location = useLocation();
    // Usuwamy stan isDropdownOpen, ponieważ teraz sterujemy przez hover

    // Linki które mają być widoczne TYLKO dla zalogowanych
    const protectedNavItems: Array<{ path: string; icon: IconName; label: string }> = [
        { path: '/', icon: 'FiHome', label: 'Strona główna' },
        { path: '/books', icon: 'FiBook', label: 'Książki' },
        { path: '/search', icon: 'FiSearch', label: 'Szukaj' },
        { path: '/stats', icon: 'FiBarChart2', label: 'Statystyki' }
    ];

    // Jeśli jeszcze ładuje, pokaż pusty header
    if (loading) {
        return (
            <HeaderContainer>
                <div className="container">
                    <Nav>
                        <Logo to="/">
                            <Icon name="FiBook" />
                            BookTracker
                        </Logo>
                        <div style={{ color: '#666' }}>Ładowanie...</div>
                    </Nav>
                </div>
            </HeaderContainer>
        );
    }

    return (
        <HeaderContainer>
            <div className="container">
                <Nav>
                    <Logo to={user ? '/' : '/login'}>
                        <Icon name="FiBook" />
                        BookTracker
                    </Logo>

                    {/* Linki tylko dla zalogowanych */}
                    {user && (
                        <NavLinks>
                            {protectedNavItems.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    $isActive={location.pathname === item.path}
                                >
                                    <Icon name={item.icon} />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </NavLinks>
                    )}

                    {/* Menu użytkownika */}
                    {user ? (
                        <UserMenu>
                            <UserButton>
                                <Icon name="FiUser" />
                                <span>{user?.nazwa_wyswietlana || user?.nazwa_uzytkownika}</span>
                                <Icon name="FiChevronDown" />
                            </UserButton>

                            <DropdownMenu>
                                <DropdownItem as={Link} to="/profile">
                                    <Icon name="FiUser" />
                                    Mój profil
                                </DropdownItem>
                                <DropdownItem onClick={logout}>
                                    <Icon name="FiLogOut" />
                                    Wyloguj się
                                </DropdownItem>
                            </DropdownMenu>
                        </UserMenu>
                    ) : (
                        // Jeśli NIE zalogowany, pokaż przyciski logowania/rejestracji
                        <NavLinks>
                            <NavLink to="/login" $isActive={location.pathname === '/login'}>
                                <Icon name="FiLogIn" />
                                <span>Zaloguj</span>
                            </NavLink>
                            <NavLink to="/register" $isActive={location.pathname === '/register'}>
                                <Icon name="FiUserPlus" />
                                <span>Zarejestruj</span>
                            </NavLink>
                        </NavLinks>
                    )}
                </Nav>
            </div>
        </HeaderContainer>
    );
};

export default Header;