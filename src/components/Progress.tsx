import React, {useEffect, useState} from 'react';
import * as rxjs from 'rxjs';

const _defaultCharList = "⣾⣽⣻⢿⡿⣟⣯⣷";

interface ProgressProps {
    charList?: string
}

function Progress(chars: ProgressProps) {

    const defaultChars = chars.charList ? chars.charList : _defaultCharList;


    const [currentChar, setCurrentChar] = useState(0)

    useEffect(() => {
        const sub = rxjs.interval(50, rxjs.animationFrameScheduler).subscribe(
            n => {
                let toSet = n % defaultChars.length;
                setCurrentChar(toSet)
            }
        );
        return () => sub.unsubscribe();
    }, [defaultChars]);

    return (
        <>{defaultChars[currentChar]}</>
    )

}

export default Progress;