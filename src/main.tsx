import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import '@ant-design/v5-patch-for-react-19';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import ThemeRuntime from './components/ThemeRuntime.tsx'

createRoot(document.getElementById('root')!).render(
    <ThemeRuntime>
        <DndProvider backend={HTML5Backend}>
            <App />
        </DndProvider>
    </ThemeRuntime>
)
