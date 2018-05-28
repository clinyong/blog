import * as React from "react";
import styled from "styled-components";
import debounce from "lodash/debounce";
import Search from "./Search";

const Wrapper = styled.div`
    @media screen and (min-width: 770px) {
        width: 650px;
        margin: 0 auto;
    }
`;

const Container = styled.ul`
    padding: 0;
    margin: 0;
    font-size: 16px;
    list-style-type: none;
    background-color: #fff;
    @media screen and (min-width: 770px) {
        margin: 0;
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
    showSearch?: boolean;
}

interface ListState {
    list: Article[];
    loadFromProps: boolean;
}

export default class List extends React.PureComponent<ListProps, ListState> {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            loadFromProps: false
        };

        this.onSearch = debounce(this.onSearch.bind(this), 100);
    }

    static getDerivedStateFromProps(
        props: ListProps,
        state: ListState
    ): ListState | null {
        if (!state.loadFromProps) {
            return {
                list: props.list,
                loadFromProps: true
            };
        }

        return null;
    }

    onSearch(val: string) {
        const { list } = this.props;

        this.setState({
            list: val
                ? list.filter(item =>
                      item.title
                          .toLocaleLowerCase()
                          .includes(val.toLocaleLowerCase())
                  )
                : list
        });
    }

    render() {
        const { showSearch } = this.props;
        const { list } = this.state;

        return (
            <Wrapper>
                {showSearch && <Search onChange={this.onSearch} />}
                <Container>
                    {list.map(item => (
                        <Title key={item.link}>
                            <a href={item.link}>{item.title}</a>
                        </Title>
                    ))}
                </Container>
            </Wrapper>
        );
    }
}
