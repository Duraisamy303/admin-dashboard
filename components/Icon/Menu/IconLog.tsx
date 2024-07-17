import { FC } from 'react';

interface IconLogProps {
    className?: string;
}

const IconLog: FC<IconLogProps> = ({ className }) => {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                fill="currentColor"
            />
            <path
                d="M15.07 11.25c-.39-.39-1.02-.39-1.41 0L13 11.91V6c0-.55-.45-1-1-1s-1 .45-1 1v5.91l-.66-.66c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41l2.12 2.12c.39.39 1.02.39 1.41 0l2.12-2.12c.38-.39.38-1.02 0-1.41z"
                fill="currentColor"
            />
        </svg>
    );
};

export default IconLog;
