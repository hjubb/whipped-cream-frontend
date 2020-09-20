import React, {useContext} from 'react';
import Title from "./components/Title";
import Card from "./components/Card";
import Progress from "./components/Progress";
import {Web3Provider} from "@ethersproject/providers";
import {useWeb3React} from "@web3-react/core";
import {injectedConnector} from "./index";
import {Profiler} from "inspector";
import Button from "./components/Button";
import MainComponent from "./components/MainComponent";

function App() {

    const {account, activate, active} = useWeb3React();

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
