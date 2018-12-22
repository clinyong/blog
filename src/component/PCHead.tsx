import * as React from "react";
import styled from "styled-components";

const Container = styled.ul`
    display: block;
    text-align: center;
    padding: 0;
    margin: 0;
    padding-top: 30px;
    list-style: none;
    height: 55px;
    margin-left: calc(100vw - 100%); /* 避免滚动条晃动 */

    @media screen and (max-width: 770px) {
        display: none;
    }
`;

const ListItem: any = styled.li`
    text-align: center;
    font-size: 18px;
    margin: 0 25px;
    display: inline-block;

    &:hover {
        border-bottom: 2px solid #222;
    }

    & > a {
        text-decoration: none;
        color: #222;
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
                    <ListItem key={item.title}>
                        <a href={item.link}>{item.title}</a>
                    </ListItem>
                ))}
            </Container>
        );
    }
}
