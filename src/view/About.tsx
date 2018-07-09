import * as React from "react";
import styled from "styled-components";
import Layout from "../component/Layout";
import showdown from "showdown";

const converter = new showdown.Converter();

const Container = styled.div`
    width: 650px;
    margin: 0 auto;
    background-color: #fff;
    padding: 20px 40px;
    height: 600px;
    box-sizing: border-box;

    & p {
        line-height: 1.8;
    }
`;

interface AboutProps {
    content: string;
}

export default class About extends React.PureComponent<AboutProps, {}> {
    render() {
        let content = converter.makeHtml(this.props.content);

        return (
            <Layout>
                <Container dangerouslySetInnerHTML={{ __html: content }} />
            </Layout>
        );
    }
}
