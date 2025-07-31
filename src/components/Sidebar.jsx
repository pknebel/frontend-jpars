import React, { useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import * as FaIcons from 'react-icons/fa'
import * as AiIcons from 'react-icons/ai'
import {SidebarData} from './SidebarData'
import SubMenu from './SubMenu'
import { IconContext } from 'react-icons'

const Nav = styled.div`
    background: #c7c7c9ff;
    height: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

const NavIcon = styled(Link)`
    margin-left: 2rem;
    font-size: 2rem;
    height: 80px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
`;

const SidebarNav = styled.nav`
    background: #c7c7c9ff;
    width: 400px;
    height: 100vh;
    display: flex;
    justify-content: center;
    position: fixed;
    top: 0;
    left: ${({ sidebar}) => (sidebar ? '0' : '-100%')};
    transition: 250ms;
    z-index: 10;

`;

const SidebarWrap = styled.div`
    width: 100%;
`;

const JparsLogo = styled(Link)`
    color: #004aad;
    font-size: 3rem;
    font-weight: bold;
    letter-spacing: 2px;
    padding: 0 2rem;
    text-decoration: none;
`;

const Sidebar = () => {

    const [sidebar, setSidebar] = useState(false);

    const showSidebar = () => setSidebar(!sidebar);

  return <>
    <IconContext.Provider value={{ color: '#000000ff' }}>
        <Nav>
            <NavIcon to="#">
                <FaIcons.FaBars onClick={showSidebar}/>
            </NavIcon>
            <JparsLogo to="/">JPARS</JparsLogo>
        </Nav>
        <SidebarNav sidebar={sidebar}>
            <SidebarWrap>
                <NavIcon to="#">
                    <AiIcons.AiOutlineClose onClick={showSidebar}/>
                </NavIcon>
                {SidebarData.map((item, index) => {
                    return <SubMenu item={item} key={index} />;
        })}
            </SidebarWrap>
        </SidebarNav>
    </IconContext.Provider>
  </>
}

export default Sidebar
