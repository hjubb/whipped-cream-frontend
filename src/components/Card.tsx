import React from 'react';

interface CardProps {
    title?: string;
    body?: string;
}

function Card(props: CardProps) {
    return(<>
        <p>
            {'================= '+props.title+' ================='}<br/>
            {props.body}<br/>
        </p>
    </>);
}

export default Card;