// Declaraciones de módulos para archivos estáticos
declare module '*.svg' {
    import type { FC, SVGProps } from 'react';
    export const ReactComponent: FC<SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
}

declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.jpg' {
    const content: string;
    export default content;
}

// Tipos globales de la aplicación
type Status = 'idle' | 'loading' | 'success' | 'error';

// Tipos para respuestas de API
interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}
