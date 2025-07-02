import { createBrowserRouter } from "react-router-dom";
import path from "../utils/path";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PersonalPage from "../pages/PersonalPage"
import RecipeDetail from "../pages/RecipeDetail";
import CreateRecipe from "../pages/CreateRecipe";
import App from '../App'

export const router = createBrowserRouter([
    {
        element: <App />,
        children: [
            {
                path: path.HOME, element: <HomePage />
            },


        ]
    },
    {
        path: path.LOGIN,
        element: <Login />
    },
    {
        path: path.REGISTER,
        element: <Register />
    },

    {
        path: path.PERSONAL,
        element: <PersonalPage />
    },
    {
        path: path.RECIPEDETAIL,
        element: <RecipeDetail />
    },
    {
        path: path.CREATERECIPE,
        element: <CreateRecipe />
    }
])