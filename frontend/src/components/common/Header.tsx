import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import Icon, { IconName } from './Icon';

interface NavLinkProps {
    $isActive: boolean;
    $hideTextOnMobile?: boolean;
}

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
  justify-content: space-between; /* Przywracamy */
  padding: ${props => props.theme.spacing.md} 0;
  position: relative;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  text-decoration: none;
  z-index: 1002;
  flex-shrink: 0; /* Zapobiega zmniejszaniu logo */

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1.25rem;

    span {
      display: block;
    }
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  z-index: 1002;
  flex-shrink: 0;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// DesktopNavLinks - widoczne tylko na desktopie
const DesktopNavLinks = styled.div`
  display: flex;
  align-items: center;
  justify-content: center; /* Wyśrodkowanie */
  gap: ${props => props.theme.spacing.xl};
  flex: 1; /* Zajmuje dostępną przestrzeń */
  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

// Alternatywa: jeśli wolisz bez position absolute
const DesktopNavLinksAlt = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xl};
  flex: 1;
  margin: 0 ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

// MobileNavLinks - widoczne tylko na mobile/tablet
const MobileNavLinks = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  right: ${props => props.$isOpen ? '0' : '-100%'};
  width: 280px;
  height: 100vh;
  background: ${props => props.theme.colors.surface};
  border-left: 1px solid ${props => props.theme.colors.border};
  flex-direction: column;
  align-items: flex-start;
  padding: 80px ${props => props.theme.spacing.xl} ${props => props.theme.spacing.xl};
  gap: ${props => props.theme.spacing.lg};
  transition: right 0.3s ease;
  z-index: 1001;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.2);

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: flex;
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 250px;
    padding: 70px ${props => props.theme.spacing.lg} ${props => props.theme.spacing.lg};
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
  white-space: nowrap; /* Zapobiega zawijaniu tekstu */

  &:hover {
    color: ${props => props.theme.colors.primary};
  }

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    font-size: 1.1rem;
    width: 100%;
    padding: ${props => props.theme.spacing.sm} 0;
    
    span {
      display: block !important;
    }
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1rem;
  }
`;

const UserMenu = styled.div`
  position: relative;
  z-index: 1002;
  flex-shrink: 0; /* Zapobiega zmniejszaniu */

  &:hover > div {
    display: block;
  }

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
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
  white-space: nowrap;

  &:hover {
    background: ${props => props.theme.colors.surfaceLight};
  }
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

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm};
  min-width: 200px;
  display: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1001;
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
  }
`;

const Header: React.FC = () => {
    const { user, logout, loading } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const protectedNavItems: Array<{ path: string; icon: IconName; label: string }> = [
        { path: '/', icon: 'FiHome', label: 'Strona główna' },
        { path: '/books', icon: 'FiBook', label: 'Książki' },
        { path: '/search', icon: 'FiSearch', label: 'Szukaj' },
        { path: '/stats', icon: 'FiBarChart2', label: 'Statystyki' }
    ];

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
                    {/* Logo po lewej */}
                    <Logo to={user ? '/' : '/login'} onClick={closeMobileMenu}>
                        <Icon name="FiBook" />
                        <span>BookTracker</span>
                    </Logo>

                    {user ? (
                        <>
                            {/* Desktop Navigation - na środku */}
                            <DesktopNavLinks>
                                {protectedNavItems.map(item => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        $isActive={location.pathname === item.path}
                                        $hideTextOnMobile={false}
                                    >
                                        <Icon name={item.icon} />
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}
                            </DesktopNavLinks>

                            {/* User Menu for Desktop - po prawej */}
                            <UserMenu>
                                <UserButton>
                                    <Icon name="FiUser" />
                                    <span>{user?.nazwa_wyswietlana || user?.nazwa_uzytkownika}</span>
                                    <Icon name="FiChevronDown" />
                                </UserButton>

                                <DropdownMenu>
                                    <DropdownItem as={Link} to="/profile">
                                        <Icon name="FiUser" />
                                        <span>Mój profil</span>
                                    </DropdownItem>
                                    <DropdownItem onClick={logout}>
                                        <Icon name="FiLogOut" />
                                        <span>Wyloguj się</span>
                                    </DropdownItem>
                                </DropdownMenu>
                            </UserMenu>

                            {/* Mobile Menu Button - po prawej (zastępuje UserMenu na mobile) */}
                            <MobileMenuButton onClick={toggleMobileMenu}>
                                {isMobileMenuOpen ? (
                                    <Icon name="FiX" size={24} />
                                ) : (
                                    <Icon name="FiMenu" size={24} />
                                )}
                            </MobileMenuButton>

                            {/* Mobile Navigation */}
                            <Overlay $isOpen={isMobileMenuOpen} onClick={closeMobileMenu} />
                            <MobileNavLinks $isOpen={isMobileMenuOpen}>
                                {protectedNavItems.map(item => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        $isActive={location.pathname === item.path}
                                        $hideTextOnMobile={false}
                                        onClick={closeMobileMenu}
                                    >
                                        <Icon name={item.icon} />
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}

                                {/* User Menu for Mobile */}
                                <NavLink
                                    to="/profile"
                                    $isActive={location.pathname === '/profile'}
                                    $hideTextOnMobile={false}
                                    onClick={closeMobileMenu}
                                >
                                    <Icon name="FiUser" />
                                    <span>Mój profil</span>
                                </NavLink>

                                <NavLink
                                    to="#"
                                    $isActive={false}
                                    $hideTextOnMobile={false}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        closeMobileMenu();
                                        logout();
                                    }}
                                >
                                    <Icon name="FiLogOut" />
                                    <span>Wyloguj się</span>
                                </NavLink>
                            </MobileNavLinks>
                        </>
                    ) : (
                        // Guest Navigation - na środku
                        <DesktopNavLinks>
                            <NavLink
                                to="/login"
                                $isActive={location.pathname === '/login'}
                                $hideTextOnMobile={false}
                            >
                                <Icon name="FiLogIn" />
                                <span>Zaloguj</span>
                            </NavLink>
                            <NavLink
                                to="/register"
                                $isActive={location.pathname === '/register'}
                                $hideTextOnMobile={false}
                            >
                                <Icon name="FiUserPlus" />
                                <span>Zarejestruj</span>
                            </NavLink>
                        </DesktopNavLinks>
                    )}
                </Nav>
            </div>
        </HeaderContainer>
    );
};

export default Header;