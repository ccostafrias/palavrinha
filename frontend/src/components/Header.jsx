import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { IoMdMoon } from 'react-icons/io';
import { MdWbSunny } from 'react-icons/md';

export default function Header({ title }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light"
  })

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")

    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // preferencia do navegador
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
    }

    // adiciona classe ao body com delay
    const timer = setTimeout(() => {
      document.body.classList.add('transitions-activated')
    }, 50)

    // função de limpeza
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // html.light ou html.dark
    document.documentElement.className = theme
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  }

  return (
    <header className="p-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      <nav>
        <ul className='flex gap-4'>
          <NavLink to="/" className={({isActive}) => isActive ? 'opacity-60' : ''}>Solinho</NavLink>
          <NavLink to="/dupla" className={({isActive}) => isActive ? 'opacity-60' : ''}>Duplinha</NavLink>
        </ul>
      </nav>
      <h1 className='text-3xl'>{title}</h1>
      <div className='justify-self-end'>
        <ThemeChanger theme={theme} toggleTheme={toggleTheme} />
      </div>
    </header>
  )
}

const Themes = {
  LIGHT: 'light',
  DARK: 'dark',
}

function ThemeChanger({ theme , toggleTheme }) {

  if (theme === Themes.LIGHT) {
    return (
      <button
        onClick={toggleTheme} 
        aria-label="Mudar para tema escuro" 
        className="theme-toggle cursor-pointer"
        tabIndex={0}
      >
        <IoMdMoon size="30"/>
      </button>
    )
  }

  return (
    <button 
      onClick={toggleTheme} 
      aria-label="Mudar para tema claro" 
      className="theme-toggle cursor-pointer"
      tabIndex={0}
    >
      <MdWbSunny size="30"/>
    </button>
  )

}
