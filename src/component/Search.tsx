import * as React from "react";
import styled, { keyframes } from "styled-components";

interface SearchStyle {
    bgColor: string;
    textColor: string;
    cursorColor: string;
    promptColor: string;
}

const pcStyle: SearchStyle = {
    bgColor: "#464d5c",
    cursorColor: "#c7c7c7",
    textColor: "#c7c7c7",
    promptColor: "#bee178"
};

const Container = styled.div`
    padding: 16px 10px;
    height: 20px;
    background-color: ${pcStyle.bgColor};
    display: flex;
    align-items: center;
    &:hover {
        cursor: text;
    }

    @media screen and (max-width: 770px) {
        display: none;
    }
`;

const blink = keyframes`
  50% {
    opacity: 0.0;
  }
`;

const Cursor = styled.span`
    display: inline-block;
    height: 100%;
    border-left: 3px solid ${pcStyle.cursorColor};
    animation: ${blink} 1s step-start 0s infinite;
`;

const Input = styled.input`
    position: absolute;
    left: -1000px;
`;

const Content = styled.span`
    color: ${pcStyle.textColor};
`;

const Prompt = styled.span`
    display: inline-block;
    font-size: 20px;
    color: ${pcStyle.promptColor};
    margin-right: 5px;
`;

interface SearchState {
    cursorVisible: boolean;
    inputValue: string;
}
interface SearchProps {
    onChange: (val: string) => void;
}

export default class Search extends React.PureComponent<
    SearchProps,
    SearchState
> {
    // input: HTMLInputElement;

    constructor(props) {
        super(props);

        this.state = {
            inputValue: "",
            cursorVisible: true
        };

        this.onInputValueChange = this.onInputValueChange.bind(this);
        this.hideCursor = this.hideCursor.bind(this);
        this.showCursor = this.showCursor.bind(this);
    }

    onInputValueChange(e) {
        const inputValue = e.target.value;

        this.setState({
            inputValue
        });

        this.props.onChange(inputValue);
    }

    hideCursor() {
        this.setState({
            cursorVisible: false
        });
    }

    showCursor() {
        this.setState({
            cursorVisible: true
        });

        this.input.focus();
    }

    render() {
        const { inputValue, cursorVisible } = this.state;

        return (
            <Container onClick={this.showCursor}>
                <Input
                    value={inputValue}
                    onChange={this.onInputValueChange}
                    innerRef={i => (this.input = i)}
                    autoFocus
                    onBlur={this.hideCursor}
                />
                <Prompt>></Prompt>
                <Content>{inputValue}</Content>
                {cursorVisible && <Cursor />}
            </Container>
        );
    }
}
