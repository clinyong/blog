import * as React from "react";
import styled from "styled-components";

const Container = styled.ul`
    padding: 0;
    margin: 0;
    margin-top: 20px;
    font-size: 16px;
    list-style-type: none;
    background-color: #fff;
    @media screen and (min-width: 770px) {
        margin-top: 0;
        box-shadow: 0px 30px 60px 0px #d3dde2;
    }
`;

const Title = styled.li`
    & > a {
        display: block;
        border-bottom: 1px solid #ddd;
        padding: 30px 20px;
        &,
        &:visited,
        &:hover,
        &:active {
            color: #222;
            text-decoration: none;
        }
        @media screen and (min-width: 770px) {
            display: block;
            border-bottom: 1px solid #ddd;
            padding: 20px;
            &:hover {
                cursor: pointer;
                background-color: #eee;
            }
        }
    }
`;

export interface Article {
    link: string;
    title: string;
}

interface ListProps {
    list: Article[];
}

export default class List extends React.PureComponent<ListProps, {}> {
    render() {
        const { list } = this.props;

        return (
            <Container>
                {list.map(item => (
                    <Title key={item.link}>
                        <a href={item.link}>{item.title}</a>
                    </Title>
                ))}
            </Container>
        );
    }
}
