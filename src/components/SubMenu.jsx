import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import styled from 'styled-components'

const SidebarLink = styled(Link)`
    display: flex;
    color: var(--text-primary);
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-4) var(--spacing-5);
    list-style: none;
    height: auto;
    min-height: 56px;
    text-decoration: none;
    font-size: var(--font-size-base);
    font-weight: ${({ isActive }) => (isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)')};
    background: ${({ isActive }) => (isActive ? 'var(--bg-active)' : 'transparent')};
    color: ${({ isActive }) => (isActive ? 'var(--color-primary-700)' : 'var(--text-primary)')};
    border-left: ${({ isActive }) => (isActive ? '4px solid var(--color-primary-600)' : '4px solid transparent')};
    transition: all var(--transition-base);

    &:hover {
        background: ${({ isActive }) => (isActive ? 'var(--bg-active)' : 'var(--bg-hover)')};
        border-left: 4px solid ${({ isActive }) => (isActive ? 'var(--color-primary-600)' : 'var(--color-primary-300)')};
        cursor: pointer;
    }
`;

const SidebarLabel = styled.span`
    margin-left: var(--spacing-3);
`;

const DropdownLink = styled(Link)`
    background: ${({ isActive }) => (isActive ? 'var(--bg-active)' : 'var(--bg-secondary)')};
    color: ${({ isActive }) => (isActive ? 'var(--color-primary-700)' : 'var(--text-primary)')};
    height: auto;
    min-height: 48px;
    padding: var(--spacing-3) var(--spacing-5);
    padding-left: var(--spacing-12);
    display: flex;
    align-items: center;
    font-size: var(--font-size-sm);
    font-weight: ${({ isActive }) => (isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)')};
    text-decoration: none;
    border-left: ${({ isActive }) => (isActive ? '4px solid var(--color-primary-600)' : '4px solid transparent')};
    transition: all var(--transition-base);

    &:hover {
        background: ${({ isActive }) => (isActive ? 'var(--bg-active)' : 'var(--bg-hover)')};
        cursor: pointer;
    }
`;

const SubMenu = ({item, currentPath}) => {

    const [subnav, setSubnav] = useState(false);

    const showSubnav = () => setSubnav(!subnav);

    // Verifica se algum subitem está ativo
    const hasActiveSubItem = item.subNav && item.subNav.some(subItem => subItem.path === currentPath);
    
    // Abre automaticamente o submenu se houver um item ativo
    useEffect(() => {
        if (hasActiveSubItem) {
            setSubnav(true);
        }
    }, [hasActiveSubItem]);

    // Verifica se o item principal está ativo (para itens sem submenu)
    const isMainItemActive = item.path === currentPath;

    return(
        <>
            <SidebarLink 
                to={item.path || '#'} 
                onClick={item.subNav && showSubnav}
                isActive={isMainItemActive}
            >
                <div>
                    {item.icon}
                    <SidebarLabel>{item.title}</SidebarLabel>
                </div>
                <div>
                    {item.subNav && subnav ? item.iconOpened : item.subNav ? item.iconClosed : null}
                </div>
            </SidebarLink>
            {subnav && item.subNav && item.subNav.map((subItem, index) => {
                const isSubItemActive = subItem.path === currentPath;
                return (
                    <DropdownLink 
                        to={subItem.path} 
                        key={index}
                        isActive={isSubItemActive}
                    >
                        {subItem.icon}
                        <SidebarLabel>{subItem.title}</SidebarLabel>
                    </DropdownLink>
                );
            })}
        </>
    );
};

export default SubMenu;