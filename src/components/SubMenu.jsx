import React, {useState} from 'react'
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

    &:hover {
        background: #e6e6e6ff;
        border-left: 4px solid #004aad;
        cursor: pointer;
`;

const SidebarLabel = styled.span`
    margin-left: 16px;
`;

const DropdownLink = styled(Link)`
    background: #e6e6e6ff;
    height: 60px;
    padding-left: 3rem;
    display: flex;
    align-items: center;
    color: #000000ff;
    font-size: 18px;
    text-decoration: none;

    &:hover {
        background: #e6e6e6ff;
        cursor: pointer;
`;

const SubMenu = ({item}) => {

    const [subnav, setSubnav] = useState(false);

    const showSubnav = () => setSubnav(!subnav);

    return(
        <>
            <SidebarLink to={item.path} onClick={item.subNav && showSubnav}>
                <div>
                    {item.icon}
                    <SidebarLabel>{item.title}</SidebarLabel>
                </div>
                <div>
                    {item.subNav && subnav ? item.iconOpened : item.subNav ? item.iconClosed : null}
                </div>
            </SidebarLink>
            {subnav && item.subNav.map((item, index) => {
                return (
                    <DropdownLink to={item.path} key={index}>
                        {item.icon}
                        <SidebarLabel>{item.title}</SidebarLabel>
                    </DropdownLink>
                );
            })}
        </>
    );
};

export default SubMenu;