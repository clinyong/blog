import * as React from "react";
import styled from "styled-components";

const Container = styled.ul`
    display: none;
    @media screen and (min-width: 770px) {
        display: block;
        text-align: center;
        margin-right: 50px;
        margin-bottom: 30px;
        margin-top: 0px;
        padding-top: 30px;

        & > a {
            color: #222;
            text-align: center;
            text-decoration: none;
            font-size: 18px;
            margin: 0 25px;

            &:hover {
                border-bottom: 2px solid #222;
            }
        }
    }
`;

export interface Menu {
    link: string;
    title: string;
}

export interface MenuProps {
    list: Menu[];
}

export default class PCHead extends React.PureComponent<MenuProps, {}> {
    render() {
        return (
            <Container>
                {this.props.list.map(item => (
                    <a href={item.link} key={item.title}>
                        {item.title}
                    </a>
                ))}
            </Container>
        );
    }
}
