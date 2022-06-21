import Route from 'Common/Types/API/Route';
import URL from 'Common/Types/API/URL';
import React, { FunctionComponent, ReactElement } from 'react';
import Navigation from '../../Utils/Navigation';

export interface ComponentProps {
    children: ReactElement | Array<ReactElement> | string;
    className?: string;
    to: Route | URL | null;
}

const Link: FunctionComponent<ComponentProps> = (
    props: ComponentProps
): ReactElement => {
    let children: ReactElement | Array<ReactElement>;

    if (typeof props.children === 'string') {
        children = <p>{props.children}</p>;
    } else {
        children = props.children;
    }

    return (
        <a
            className={props.className || ''}
            onClick={() => {
                if (props.to) {
                    Navigation.navigate(props.to);
                }
            }}
        >
            {children}
        </a>
    );
};

export default Link;
