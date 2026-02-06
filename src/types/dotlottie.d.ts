import React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'dotlottie-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                src?: string;
                background?: string;
                speed?: string | number;
                loop?: boolean;
                autoplay?: boolean;
                mode?: string;
                controls?: boolean;
                style?: React.CSSProperties;
                [key: string]: any;
            };
        }
    }
}
