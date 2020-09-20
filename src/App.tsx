import React, {useContext} from 'react';
import Title from "./components/Title";
import {useWeb3React} from "@web3-react/core";
import {injectedConnector} from "./index";
import Button from "./components/Button";
import MainComponent from "./components/MainComponent";

function App() {

    const {activate, active} = useWeb3React();

    const clickActivate = () => {
        activate(injectedConnector)
    }

    let bodyElement: JSX.Element = active ? <MainComponent /> :
        <Button enabled={true} clickFunction={clickActivate} title={"Connect"}/>;

    return (
        <div>
            <header>
                <Title/>
                {bodyElement}
            </header>
        </div>
    );
}

export default App;
