import React from 'react'
import styled from 'styled-components'
import { Link, useLocation } from 'react-router-dom'
import {SidebarData} from './SidebarData'
import SubMenu from './SubMenu'
import { IconContext } from 'react-icons'

const Nav = styled.div`
    background: #c7c7c9ff;
    height: 80px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 11;
    padding-left: 2rem;
  `;

const SidebarNav = styled.nav`
    background: #c7c7c9ff;
    width: 400px;
    height: calc(100vh - 80px);
    display: flex;
    justify-content: center;
    position: fixed;
    top: 80px;
    left: 0;
    z-index: 10;
`;

const SidebarWrap = styled.div`
    width: 100%;
    padding-top: 20px;
`;

const JparsLogo = styled(Link)`
    color: #004aad;
    font-size: 3rem;
    font-weight: bold;
    letter-spacing: 2px;
    text-decoration: none;
`;

const Sidebar = () => {
    const location = useLocation();

  return <>
    <IconContext.Provider value={{ color: '#000000ff' }}>
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
