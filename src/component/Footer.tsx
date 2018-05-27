import * as React from "react";
import styled from "styled-components";

const Container = styled.div`
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 12px;
`;

const Coding = styled.span`
    color: #999;

    & > a {
        color: #bee178 !important;
        text-decoration: none;

        @media screen and (min-width: 770px) {
            color: #108ee9 !important;
            text-decoration: underline;
        }
    }
`;

export default class Footer extends React.PureComponent<{}, {}> {
    render() {
        return (
            <Container>
                <Coding>
                    Powered by&nbsp;
                    <a href="https://github.com/clinyong/cubi">Cubi</a>, &nbsp;
                </Coding>
                <Coding>
                    Hosted by&nbsp;
                    <a href="https://pages.coding.me">Coding Pages</a>
                </Coding>
            </Container>
        );
    }
}
