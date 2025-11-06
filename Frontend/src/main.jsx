import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Auth from './pages/Auth.jsx'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { Provider } from "react-redux";
import { store } from "./redux/store";
import ThankYouPage from './components/ThankYouPage.jsx'

const appRouter=createBrowserRouter([
  {
    path:"/",
    element:
    <>
        <Provider store={store}>

    <Auth />
    <Toaster />
    </Provider>

    </>
  },
  {
    path:"/page",
    element:

    <>
    <Provider store={store}>
    <App />
    <Toaster />
    </Provider>
    </>
  },{
    path:"/tankyouPage",
    element:
    <>
    <Provider store={store}>
    <ThankYouPage />
    <Toaster />
    </Provider>
    </>
  }
])
ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={appRouter} />
)