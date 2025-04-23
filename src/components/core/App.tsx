import './App.css';
import AppRouter from './AppRouter';
import { AuthProvider } from './contexts/AuthContext';;;;;

function App(): void {
    return (
        <AuthProvider>
            <div className="App">
                <AppRouter />
            </div>
        </AuthProvider>
    );
}

export default App;
