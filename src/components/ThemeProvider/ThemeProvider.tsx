'use client';

import { useEffect, useState } from "react";

import ThemeContext from "@/context/themeContext"; 

const ThemeProvider = ({ children }: { children:React.ReactNode }) => {
    const [darkTheme, setDarkTheme] = useState<boolean>(true);
    const [renderComponent, setRenderComponent] = useState(false);

    useEffect(() => {
        const themeFromStorage = 
            typeof window !== "undefined" && localStorage.getItem('hotel-theme')
            ? JSON.parse(localStorage.getItem('hotel-theme')!)
            : false;
        setDarkTheme(themeFromStorage);
        setRenderComponent(true);
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem('hotel-theme', JSON.stringify(darkTheme));
        }
    }, [darkTheme]);

    if (!renderComponent) return <></>;

    return(
    <ThemeContext.Provider value={{darkTheme, setDarkTheme}}>
        <div className={`${darkTheme ? 'dark' : ''} min-h-screen flex flex-col`}>
            <div className='dark:text-white dark:bg-black text-[#1e1e1e] bg-white flex flex-col flex-1 transition-colors duration-200'>
                {children}
            </div>
        </div>
    </ThemeContext.Provider>
    );
}
export default ThemeProvider;