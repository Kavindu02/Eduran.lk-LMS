import { useEffect, useState } from 'react';
export function HydrationWrapper({ children, className = '' }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    return (<div className={mounted ? className : ''}>
      {children}
    </div>);
}
