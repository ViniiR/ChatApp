/// <reference types="vite/client" />

type Message = {
    content: string;
    owner: string;
    sentTo: string;
    currentTime?: string;
};

type UserMessages = {
    content: string;
    isOwner: boolean;
    currentTime: string
};
