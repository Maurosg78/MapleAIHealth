import { Link } from 'react-router-dom';;;;;

export function NotFound(): void {
    return (
        <div className="min-h-screen bg-gray-100 px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
            <div className="mx-auto max-w-max">
                <main className="sm:flex">
                    <p className="text-4xl font-bold tracking-tight text-primary-600 sm:text-5xl">
                        404
                    </p>
                    <div className="sm:ml-6">
                        <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                                Página no encontrada
                            </h1>
                            <p className="mt-1 text-base text-gray-500">
                                Por favor, verifica la URL e intenta nuevamente.
                            </p>
                        </div>
                        <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                            <Link
                                to="/"
                                className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                            >
                                Volver al inicio
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
