import * as React from "react";
import styled from "styled-components";
import Layout from "../component/Layout";

const Container = styled.div`
    width: 650px;
    margin: 0 auto;
    background-color: #fff;
    padding: 20px;
    height: 600px;
    box-sizing: border-box;
`;

export default class About extends React.PureComponent<{}, {}> {
    render() {
        return (
            <Layout>
                <Container>Todo...</Container>
            </Layout>
        );
    }
}
