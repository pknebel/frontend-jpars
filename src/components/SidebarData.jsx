import React from 'react'
import * as FaIcons from 'react-icons/fa'
import * as HiIcons from 'react-icons/hi'
import * as AiIcons from 'react-icons/ai'
import * as BsIcons from "react-icons/bs"
import * as BiIcons from "react-icons/bi"
import * as TbIcons from "react-icons/tb"

export const SidebarData = [
    {
        title: 'Gramática',
        icon: <BsIcons.Bs1CircleFill />,
        iconClosed: <FaIcons.FaAngleDown />,
        iconOpened: <FaIcons.FaAngleUp />,
        subNav:[
            {
                title: 'Seleção da Gramática',
                path: '/selecao-gramatica',
                icon: <FaIcons.FaScroll />,
            }
        ]
    },
    {
        title: 'Transformações - Gramática LL(1)',
        icon: <BsIcons.Bs2CircleFill />,
        iconClosed: <FaIcons.FaAngleDown />,
        iconOpened: <FaIcons.FaAngleUp />,
        subNav:[
            {
                title: 'Remoção de Recursão à Esquerda',
                path: '/remocao-recursao-esquerda',
                icon: <BiIcons.BiGitCompare />,
            },
            {
                title: 'Fatoração à Esquerda',
                path: '/fatoracao-esquerda',
                icon: <BiIcons.BiGitCompare />,
            }
        ]
    },
    {
        title: 'First e Follow',
        icon: <BsIcons.Bs3CircleFill />,
        iconClosed: <FaIcons.FaAngleDown />,
        iconOpened: <FaIcons.FaAngleUp />,
        subNav:[
            {
                title: 'Calcular Conjuntos',
                path: '/calculo-first-follow',
                icon: <TbIcons.TbArrowAutofitRight />,
            }
        ]
    },
    {
        title: 'Tabela Sintática LL(1)',
        icon: <BsIcons.Bs4CircleFill />,
        iconClosed: <FaIcons.FaAngleDown />,
        iconOpened: <FaIcons.FaAngleUp />,
        subNav:[
            {
                title: 'Geração da Tabela Sintática',
                path: '/geracao-tabela',
                icon: <AiIcons.AiOutlineTable />,
            },
            {
                title: 'Recuperação de Erros',
                path: '/adicao-recuperacao-erros',
                icon: <HiIcons.HiOutlineShieldCheck />,
            }
        ]
    },
    {
        title: 'Validação de Sentenças',
        path: '/validacao-sentenca',
        icon: <FaIcons.FaCogs />,
    },
    {
        title: 'Outros',
        icon: <BsIcons.BsThreeDots />,
        iconClosed: <FaIcons.FaAngleDown />,
        iconOpened: <FaIcons.FaAngleUp />,
        subNav:[
            {
                title: 'Manual do Usuário',
                path: '/manual',
                icon: <HiIcons.HiOutlineClipboardList />,
            }
        ]
    }

]