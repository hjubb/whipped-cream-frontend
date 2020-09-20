import React from 'react';
import Progress from "./Progress";
import Button from "./Button";

interface DataProps {
    isLoading: boolean;
    title: string;
    content?: string;
    link?: ()=>void;
}

function Data(props: DataProps) {
    return (
        <>
            <p>{props.title}: {props.isLoading || !props.content
                ? <Progress />
                : <b>{props.link
                    ? <Button title={props.content} enabled={true} clickFunction={props.link} />
                    : props.content
                }</b>
            }</p>
        </>
    );
}

export default Data;