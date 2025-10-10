import React from 'react'
import styled from 'styled-components'
import { Link, useLocation } from 'react-router-dom'
import {SidebarData} from './SidebarData'
import SubMenu from './SubMenu'
import { IconContext } from 'react-icons'

const Nav = styled.div`
    background: var(--surface-elevated);
    height: var(--navbar-height);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: var(--z-index-fixed);
    padding-left: var(--spacing-8);
    box-shadow: var(--shadow-md);
    border-bottom: var(--border-width-thin) solid var(--border-light);
  `;

const SidebarNav = styled.nav`
    background: var(--surface-elevated);
    width: var(--sidebar-width);
    height: calc(100vh - var(--navbar-height));
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    position: fixed;
    top: var(--navbar-height);
    left: 0;
    z-index: var(--z-index-sticky);
    box-shadow: var(--shadow-lg);
    border-right: var(--border-width-thin) solid var(--border-light);
    overflow-y: auto;
`;

const SidebarWrap = styled.div`
    width: 100%;
    padding: var(--spacing-4) 0;
`;

const JparsLogo = styled(Link)`
    color: var(--color-primary-600);
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-extrabold);
    letter-spacing: var(--letter-spacing-wider);
    text-decoration: none;
    transition: color var(--transition-base);
    
    &:hover {
      color: var(--color-primary-700);
    }
`;

const Sidebar = () => {
    const location = useLocation();

  return <>
    <IconContext.Provider value={{ color: 'var(--text-secondary)', size: '1.25rem' }}>
        <Nav>
            <JparsLogo to="/">JPARS</JparsLogo>
        </Nav>
        <SidebarNav>
            <SidebarWrap>
                {SidebarData.map((item, index) => {
                    return <SubMenu item={item} key={index} currentPath={location.pathname} />;
        })}
            </SidebarWrap>
        </SidebarNav>
    </IconContext.Provider>
  </>
}

export default Sidebar
