import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import styled from 'styled-components'

const SidebarLink = styled(Link)`
    display: flex;
    color: #000000ff;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    list-style: none;
    height: 60px;
    text-decoration: none;
    font-size: 18px;
    background: ${({ isActive }) => (isActive ? '#004aad' : 'transparent')};
    color: ${({ isActive }) => (isActive ? '#ffffff' : '#000000ff')};
    border-left: ${({ isActive }) => (isActive ? '4px solid #002d6b' : '4px solid transparent')};

    &:hover {
        background: ${({ isActive }) => (isActive ? '#004aad' : '#e6e6e6ff')};
        border-left: 4px solid ${({ isActive }) => (isActive ? '#002d6b' : '#004aad')};
        cursor: pointer;
    }
`;

const SidebarLabel = styled.span`
    margin-left: 16px;
`;

const DropdownLink = styled(Link)`
    background: ${({ isActive }) => (isActive ? '#004aad' : '#e6e6e6ff')};
    color: ${({ isActive }) => (isActive ? '#ffffff' : '#000000ff')};
    height: 60px;
    padding-left: 3rem;
    display: flex;
    align-items: center;
    font-size: 18px;
    text-decoration: none;
    border-left: ${({ isActive }) => (isActive ? '4px solid #002d6b' : '4px solid transparent')};

    &:hover {
        background: ${({ isActive }) => (isActive ? '#004aad' : '#d0d0d0')};
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