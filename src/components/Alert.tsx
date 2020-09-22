import React from 'react';

interface AlertProps {
    title: string;
}

function Alert(props: AlertProps) {
    return(<p className="alert">{props.title}</p>);
}

export default Alert;