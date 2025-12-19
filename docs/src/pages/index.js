import React from 'react';
import {Redirect, useLocation} from '@docusaurus/router';

export default function Home() {
  const location = useLocation();
  const pathname = location.pathname || '/';
  
  // Detectar idioma desde la URL
  const isEnglish = pathname.startsWith('/en') || pathname === '/en';
  const introPath = isEnglish ? '/en/intro' : '/intro';
  
  return <Redirect to={introPath} />;
}

