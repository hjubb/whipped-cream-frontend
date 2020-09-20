import React, {useEffect, useState} from 'react';
import {Web3Provider} from "@ethersproject/providers";
import {useWeb3React} from "@web3-react/core";
import {WhipperFactory} from "../contracts/WhipperFactory";
import * as rxjs from 'rxjs';
import {catchError, map, mergeMap} from "rxjs/operators";
import {Whipper} from "../contracts/Whipper";
import Data from "./Data";
import {StakingRewardsLock} from "../contracts/StakingRewardsLock";
import {BigNumber} from "ethers";
import {StakingRewardsLockFactory} from "../contracts/StakingRewardsLockFactory";
import {formatUnits} from "@ethersproject/units";
import Button from "./Button";
import {Erc20Factory} from "../contracts/Erc20Factory";
import {Erc20} from "../contracts/Erc20";

function resolvePendingReward(address: string, rewards: StakingRewardsLock): Promise<BigNumber> {
    return rewards.earned(address)
}

function getPendingRewardsObservable(whipper: Whipper, library: Web3Provider) {
    return rxjs.scheduled(whipper.creamPool(), rxjs.asyncScheduler).pipe(
        mergeMap(poolAddress =>
            resolvePendingReward(whipper.address, StakingRewardsLockFactory.connect(poolAddress, library!))
        )
    );
}

function getCreamBalance(whipper: Whipper, address: string | null | undefined, library: Web3Provider) {
    return rxjs.scheduled(whipper.cream(), rxjs.asyncScheduler).pipe(
        mergeMap(creamAddress =>
            getTokenBalance(creamAddress, address!, library)
        ),
        catchError(() => rxjs.of(BigNumber.from(0)))
    );
}

function getWCreamBalance(whipper: Whipper, address: string | null | undefined, library: Web3Provider) {
    return rxjs.scheduled(whipper.wCream(), rxjs.asyncScheduler).pipe(
        mergeMap(creamAddress =>
            getTokenBalance(creamAddress, address!, library)
        ),
        catchError(() => rxjs.of(BigNumber.from(0)))
    );
}

function getCreamAllowance(whipper: Whipper, address: string | null | undefined, library: Web3Provider) {
    return rxjs.scheduled(whipper.cream(), rxjs.asyncScheduler).pipe(
        mergeMap(creamAddress =>
            getTokenAllowance(creamAddress, address!, whipper.address, library)
        ),
        catchError(() => rxjs.of(BigNumber.from(0)))
    )
}

function getWCreamAllowance(whipper: Whipper, address: string | null | undefined, library: Web3Provider) {
    return rxjs.scheduled(whipper.wCream(), rxjs.asyncScheduler).pipe(
        mergeMap(creamAddress =>
            getTokenAllowance(creamAddress, address!, whipper.address, library)
        ),
        catchError(() => rxjs.of(BigNumber.from(0)))
    )
}

function getTokenBalance(tokenAddress: string, address: string, library: Web3Provider) {
    return rxjs.scheduled(Erc20Factory.connect(tokenAddress, library).balanceOf(address!), rxjs.asyncScheduler)
}

function getTokenAllowance(tokenAddress: string, address: string, spender: string, library: Web3Provider) {
    return rxjs.scheduled(Erc20Factory.connect(tokenAddress, library).allowance(spender, address), rxjs.asyncScheduler);
}

function MainComponent() {

    const address = "0xE08f9A099Bc74522613CF7Dc18d07892CA09Bb1D";

    const {account, library} = useWeb3React<Web3Provider>();
    const blockSubject = new rxjs.Subject<number>();
    const whipper = WhipperFactory.connect(address, library!);

    const [deployedWhipper, setDeployedWhipper] = useState<Whipper | undefined>(undefined);
    const [pendingReward, setPendingReward] = useState<BigNumber | undefined>(undefined);

    const [userCream, setUserCream] = useState<BigNumber | undefined>(undefined);
    const [userWCream, setUserWCream] = useState<BigNumber | undefined>(undefined);

    const [allowanceCream, setAllowanceCream] = useState<BigNumber>(BigNumber.from(0));
    const [allowanceWCream, setAllowanceWCream] = useState<BigNumber>(BigNumber.from(0));

    const [creamContract, setCreamContract] = useState<Erc20 | undefined>(undefined);
    const [wCreamContract, setWCreamContract] = useState<Erc20 | undefined>(undefined);

    const canHarvest = pendingReward ? pendingReward.gt(BigNumber.from(0)) : false;

    const clickHarvest = () => {
        console.log("this where you harvest lol");
    };

    useEffect(() => {
        const listener = (block: number) => {
            blockSubject.next(block)
        };
        library!.on("block", listener);
        return () => {
            library!.removeListener("block", listener)
        };
    }, [blockSubject, library]);

    useEffect(() => {
        const subscription = blockSubject.asObservable().pipe(
            mergeMap(() => rxjs.scheduled(whipper.deployed(), rxjs.asyncScheduler)),
            mergeMap(whipper => {
                return rxjs.combineLatest([
                    rxjs.of(whipper),
                    getPendingRewardsObservable(whipper, library!),
                    getCreamBalance(whipper, account, library!),
                    getWCreamBalance(whipper, account, library!),
                    getCreamAllowance(whipper, account, library!),
                    getWCreamAllowance(whipper, account, library!),
                    rxjs.scheduled(whipper.cream(), rxjs.asyncScheduler).pipe<Erc20>(
                        map((address) => Erc20Factory.connect(address, library!))
                    ),
                    rxjs.scheduled(whipper.wCream(), rxjs.asyncScheduler).pipe<Erc20>(
                        map((address) => Erc20Factory.connect(address, library!))
                    )
                ]);
            })
        ).subscribe(([whipper,pendingReward,cream,wCream,creamAllowance,wCreamAllowance,creamContract,wCreamContract]) => {
            setDeployedWhipper(whipper);
            setPendingReward(pendingReward);
            setUserCream(cream);
            setUserWCream(wCream);
            setAllowanceCream(creamAllowance);
            setAllowanceWCream(wCreamAllowance);
            setCreamContract(creamContract);
            setWCreamContract(wCreamContract);
        });

        return () => {
            subscription.unsubscribe()
        };
    }, [account, whipper, library, blockSubject])

    const checkDepositAmount = (value: number | undefined) => {

    };

    const checkWithdrawAmount = (value: number | undefined) => {

    };

    const openAddress = (address: string) => {
        window.open("https://www.etherscan.io/address/" + address);
    };

    const approveCream = () => {
        if (!creamContract || !userCream) {
            console.log("trying to approve cream in a bad way thinking emoji?")
            return;
        }
        creamContract["approve(address,uint256)"](whipper.address, userCream);
    };

    const approveWCream = () => {
        if (!wCreamContract || !userWCream) {
            return;
        }
        wCreamContract["approve(address,uint256)"](whipper.address, userWCream);
    };

    return (
        <>
            <Data isLoading={!deployedWhipper}
                  title={"Deployed whipper contract"}
                  content={deployedWhipper?.address}
                  link={() => openAddress(deployedWhipper!.address)}
            />
            <Data isLoading={!pendingReward}
                  title={"Pending CREAM to whip"}
                  content={pendingReward ? "[" + formatUnits(pendingReward).toString() + "] (caller gets 5% [" + formatUnits(pendingReward.mul(5).div(100)).toString() + "])" : ""}
            />
            <Button enabled={canHarvest} title={"WHIP"} clickFunction={clickHarvest}/>
            <Data isLoading={!userCream}
                  title={"Your CREAM balance available"}
                  content={userCream ? "[" + formatUnits(userCream).toString() + "]" : ""}
            />
            {userCream && allowanceCream.lt(userCream) &&
            <>
                <Button enabled={true} title={"APPROVE CREAM SPENDING"} clickFunction={() => approveCream()}/>
                <br/>
            </>
            }
            <input type="number"
                   placeholder="Deposit amount"
                   name="deposit"
                   onChange={(e) => checkDepositAmount(e.target.valueAsNumber)}
            />
            <Button title="DEPOSIT"/>
            <br/>
            <br/>
            <Button title="DEPOSIT ALL"/>
            <Data isLoading={!pendingReward}
                  title={"Your whipped cream balance (wCREAM)"}
                  content={userWCream ? "[" + formatUnits(userWCream).toString() + "]" : ""}
            />
            {userWCream && allowanceWCream.lt(userWCream) &&
            <>
                <Button enabled={true} title={"APPROVE wCREAM SPENDING"} clickFunction={() => approveWCream()}/>
                <br/>
            </>
            }
            <input type="number"
                   placeholder="Withdraw amount"
                   name="withdraw"
                   onChange={(e) => checkWithdrawAmount(e.target.valueAsNumber)}
            />
            <Button title="WITHDRAW"/>
            <br/>
            <br/>
            <Button title="WITHDRAW ALL"/>
        </>
    );
}

export default MainComponent;