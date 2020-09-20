import React from 'react';

interface ButtonProps {
    enabled?: boolean;
    title: string;
    clickFunction?: ()=>void;
}

function Button(props: ButtonProps) {
    return(
        <>
            <a href={props.enabled? '#' : undefined} onClick={(e)=>{
                e.preventDefault();
                if (props.enabled && props.clickFunction) {
                    props.clickFunction();
                }
            }}>{props.title}</a>
        </>
    )
}

export default Button;